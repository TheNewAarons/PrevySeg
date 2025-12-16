import os
from django.db.models import Q
from django.shortcuts import get_object_or_404, render
from django.utils import timezone
from rest_framework import generics, permissions, status, viewsets, filters, parsers
from rest_framework.response import Response
from rest_framework_simplejwt.tokens import RefreshToken
from .serializers import (
    RegistroSerializer, LoginSerializer, UserSerializer, RolSerializer, CursoSerializer, DocumentoSubidoSerializer, 
    CursoDetailSerializer, InscripcionCursoSerializer, DocumentoSubidoDetailSerializer, TipoDeDocumentoSerializers  )
from .models import InscripcionCurso, Usuario, Rol, Curso, DocumentoSubido, TipoDocumento
from rest_framework.views import APIView
from django.db import IntegrityError
from .permissions import IsSelforAdmin

# --- Vistas de Autenticación (HU-1, HU-3, HU-ADM-1) ---
class RolViewSet(viewsets.ReadOnlyModelViewSet):  
    queryset = Rol.objects.all()
    serializer_class = RolSerializer

class RegistroView(generics.CreateAPIView):
    """
    API para el registro de nuevos usuarios (Clientes). (HU-1)
    """
    queryset = Usuario.objects.all()
    permission_classes = (permissions.AllowAny,)
    serializer_class = RegistroSerializer

    def post(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        try:
            serializer.is_valid(raise_exception=True)
            user = serializer.save()
            
            # Generar tokens para iniciar sesión automáticamente tras el registro
            refresh = RefreshToken.for_user(user)
            
            return Response({
                "message": "Registro exitoso. Bienvenido a PrevySeg.",
                "user_id": user.id_usuario,
                "nombre": user.nombre, 
                "rut": user.rut,
                "email": user.email,
                "rol": user.id_rol.nombre_rol,
                "token": str(refresh.access_token),
                "refresh": str(refresh),
            }, status=status.HTTP_201_CREATED)
            
        except Exception as e:
            # Captura errores de validación de serializador o base de datos
            errors = serializer.errors if serializer.errors else {'error': str(e)}
            return Response(errors, status=status.HTTP_400_BAD_REQUEST)


#Visualizacion del crud restante al registro(POST) 
class UsuarioViewSet(viewsets.ModelViewSet):
    queryset = Usuario.objects.all()
    serializer_class = UserSerializer
    permission_classes = [permissions.IsAuthenticated, IsSelforAdmin]

    lookup_field = 'id_usuario' #Permitimos el URL de tipo /usuario/0/

    def get_queryset(self):
        user = self.request.user
        if user.id_rol.nombre_rol == 'Administrador':
            # Filtro opcional por nombre de rol
            rol_nombre = self.request.query_params.get('rol_nombre')
            queryset = Usuario.objects.all()
            if rol_nombre:
                queryset = queryset.filter(id_rol__nombre_rol=rol_nombre)
            return queryset
        
        if user.id_rol.nombre_rol == 'Empresa':
            # Si solicita candidatos (para vincular)
            if self.request.query_params.get('candidates') == 'true':
                return Usuario.objects.filter(
                    id_rol__nombre_rol='Cliente'
                ).filter(
                    Q(lugar_trabajo__isnull=True) | Q(lugar_trabajo__exact='')
                )
            
            # Por defecto: devuelve SOLO sus propios trabajadores
            return Usuario.objects.filter(lugar_trabajo=user.nombre)

        return Usuario.objects.filter(id_usuario=user.id_usuario)
            

class LoginView(APIView):
    """
    API para el inicio de sesión de usuarios (Clientes, Admin, Empresa). (HU-3, HU-ADM-1)
    Genera tokens JWT.
    """
    permission_classes = (permissions.AllowAny,)

    def post(self, request, format=None):
        serializer = LoginSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        user = serializer.validated_data['user']
        
        # Generar tokens
        refresh = RefreshToken.for_user(user)
        
        # Incluir el rol del usuario en la respuesta (HU-ADM-1)
        rol_nombre = user.id_rol.nombre_rol if user.id_rol else 'Sin Rol'
        
        return Response({
            "token": str(refresh.access_token),
            "refresh": str(refresh),
            "user_id": user.id_usuario,
            "nombre": user.nombre,
            "rol": rol_nombre
        }, status=status.HTTP_200_OK)



#Views de Curso
class CursoViewSet(viewsets.ModelViewSet):
    """
    ViewSet para CRUD completo de cursos.
    """
    permission_classes = [permissions.IsAuthenticated]
    queryset = Curso.objects.all().order_by('-created_at')
    serializer_class = CursoSerializer
    
    # Habilitar búsqueda y filtros
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    
    # Buscar por nombre, profesor, área
    search_fields = ['nombre', 'profesor', 'area']
    
    def get_queryset(self):
        queryset = super().get_queryset()
        
        # Filtros manuales
        area = self.request.query_params.get('area')
        modalidad = self.request.query_params.get('modalidad')
        min_horas = self.request.query_params.get('min_horas')
        max_valor = self.request.query_params.get('max_valor')
        
        if area:
            queryset = queryset.filter(area=area)
        
        if modalidad:
            queryset = queryset.filter(modalidad=modalidad)
        
        if min_horas:
            queryset = queryset.filter(horas__gte=min_horas)
        
        if max_valor:
            queryset = queryset.filter(valor__lte=max_valor)
        
        return queryset

#Views para Inscripcion

class CursosDisponiblesView(generics.ListAPIView):
    serializer_class = CursoDetailSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        queryset = Curso.objects.filter(
            estado='por_empezar',
            # fecha_inicio__gte=timezone.now().date(),
            cupos_disponibles__gt=0,
        ).prefetch_related('documentos_requeridos')
        #excluiremos cursos donde el usuario ya esta inscrito
        user = self.request.user
        cursos_inscritos = InscripcionCurso.objects.filter(
            usuario = user
        ).values_list('curso_id', flat=True)
        queryset = queryset.exclude(id__in = cursos_inscritos)
        area = self.request.query_params.get('area')
        modalidad = self.request.query_params.get('modalidad')
        if area :
            queryset = queryset.filter(area = area)
        if modalidad:
            queryset = queryset.filter(modalidad = modalidad)
        return queryset
    
    def get_serializer_context(self):
        context = super().get_serializer_context()
        context['request'] = self.request
        return context

class CursoInscripcionDetailView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request, curso_id):
        try:
            curso = Curso.objects.get(id= curso_id)
        except Curso.DoesNotExist:
            return Response(
                {'error' : 'Curso no encontrado'},
                status=status.HTTP_404_NOT_FOUND
            )
        user = request.user

        try:
            inscripcion = InscripcionCurso.objects.get(usuario = user, curso = curso)
            ya_inscrito = True
            estado_inscripcion = inscripcion.estado
        except InscripcionCurso.DoesNotExist:
            ya_inscrito = False
            estado_inscripcion = None
        #verificacion de que el curso este disponible
        disponible = (
            curso.estado == 'por_empezar' and
            curso.cupos_disponibles > 0 
            # and curso.fecha_inicio >= timezone.now().date()
        )
        #obtenemos documentos requeridos
        documentos_requeridos = curso.documentos_requeridos.all()

        #obtenemos documentos subidos por el usuario
        documentos_subidos = DocumentoSubido.objects.filter(
            usuario = user,
            curso = curso
        )

        #prepararemos la informacion para el documento
        documentos_info = []

        for doc_requeridos in documentos_requeridos:
            doc_subidos = documentos_subidos.filter(tipo_documento =doc_requeridos).first()
            documentos_info.append({
                'id_tipo_doc': doc_requeridos.id_tipo_doc,
                'nombre': doc_requeridos.nombre,
                'subido': doc_subidos is not None,
                'estado': doc_subidos.estado_revision if doc_subidos else 'NO_SUBIDO',
                'observaciones': doc_subidos.observaciones_rechazo if doc_subidos else None,
                'fecha_subida': doc_subidos.fecha_subida if doc_subidos else None,
                'documento_id': doc_subidos.id_doc_subido if doc_subidos else None,
                'url_archivo': request.build_absolute_uri(doc_subidos.url_archivo.url) if doc_subidos and doc_subidos.url_archivo else None
            })
        
        #contaremos el estado del documento
        total_documentos = len(documentos_requeridos)
        documentos_aprobados = len([d for d in documentos_info if d['estado'] == 'APROBADO'])
        documentos_pendientes = len([d for d in documentos_info if d['estado'] in ['EN_REVISION', 'NO_SUBIDO']])
        documentos_rechazados = len([d for d in documentos_info if d['estado'] == 'RECHAZADO'])
        
        #verificar si puede inscribirse (todos los documentos aprobados)
        puede_inscribirse = (
            disponible and 
            not ya_inscrito and 
            total_documentos > 0 and 
            documentos_aprobados == total_documentos
        )       
        
        #serializar curso
        curso_serializer = CursoDetailSerializer(curso, context={'request': request})
        
        return Response({
            'curso': curso_serializer.data,
            'disponible': disponible,
            'ya_inscrito': ya_inscrito,
            'estado_inscripcion': estado_inscripcion,
            'documentos': documentos_info,
            'puede_inscribirse': puede_inscribirse,
            'resumen': {
                'total_documentos': total_documentos,
                'documentos_subidos': total_documentos - len([d for d in documentos_info if not d['subido']]),
                'documentos_aprobados': documentos_aprobados,
                'documentos_pendientes': documentos_pendientes,
                'documentos_rechazados': documentos_rechazados,
                'documentos_faltantes': [d for d in documentos_info if not d['subido']],
                'documentos_rechazados_lista': [d for d in documentos_info if d['estado'] == 'RECHAZADO']
            }
        })

class InscribirseCursoView(APIView):
    """
    Finalizar inscripción al curso (solo si todos los documentos están aprobados)
    """
    permission_classes = [permissions.IsAuthenticated]
    
    def post(self, request, curso_id):
        try:
            curso = Curso.objects.get(id=curso_id)
        except Curso.DoesNotExist:
            return Response(
                {"error": "Curso no encontrado"},
                status=status.HTTP_404_NOT_FOUND
            )
        
        user = request.user
        
        #verificamos si ya está inscrito
        if InscripcionCurso.objects.filter(usuario=user, curso=curso).exists():
            return Response(
                {"error": "Ya estás inscrito en este curso"},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        #verificamos cupos
        if curso.cupos_disponibles <= 0:
            return Response(
                {"error": "No hay cupos disponibles"},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        #verificamos que el curso esté disponible
        if curso.estado != 'por_empezar':
            return Response(
                {"error": "El curso no está disponible para inscripción"},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Verificar que todos los documentos estén aprobados
        documentos_requeridos = curso.documentos_requeridos.all()
        documentos_faltantes = []
        documentos_no_aprobados = []
        
        for doc_requerido in documentos_requeridos:
            try:
                documento = DocumentoSubido.objects.get(
                    usuario=user,
                    curso=curso,
                    tipo_documento=doc_requerido
                )
                if documento.estado_revision != 'APROBADO':
                    documentos_no_aprobados.append({
                        'documento': doc_requerido.nombre,
                        'estado': documento.estado_revision
                    })
            except DocumentoSubido.DoesNotExist:
                documentos_faltantes.append(doc_requerido.nombre)
        
        if documentos_faltantes:
            return Response({
                "error": "Faltan documentos por subir",
                "documentos_faltantes": documentos_faltantes
            }, status=status.HTTP_400_BAD_REQUEST)
        
        if documentos_no_aprobados:
            return Response({
                "error": "Hay documentos pendientes de aprobación",
                "documentos_pendientes": documentos_no_aprobados
            }, status=status.HTTP_400_BAD_REQUEST)
        
        try:
            #creamos la inscripción
            inscripcion = InscripcionCurso.objects.create(
                usuario=user,
                curso=curso,
                estado='iNSCRITO'
            )
            
            #reducimos cupos disponibles
            curso.cupos_disponibles -= 1
            curso.save()
            
            return Response({
                "success": True,
                "message": "¡Inscripción completada exitosamente!",
                "inscripcion_id": inscripcion.id,
                "curso": {
                    "id": curso.id,
                    "nombre": curso.nombre,
                    "fecha_inicio": curso.fecha_inicio,
                    "modalidad": curso.modalidad,
                    "horas": curso.horas
                },
                "fecha_inscripcion": inscripcion.fecha_inscripcion,
                "cupos_restantes": curso.cupos_disponibles,
                "nota": "Recordatorio: El proceso de pago se implementará en la siguiente fase del proyecto."
            }, status=status.HTTP_201_CREATED)
            
        except Exception as e:
            return Response(
                {"error": f"Error al completar inscripción: {str(e)}"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
#Inscripcion para la visualizacion del admin al ver detalles de usuario #RF-10
class InscripcionesUsuarioAdminView(APIView):
    permission_classes = [permissions.IsAdminUser]

    def get(self, request, usuario_id):
        inscripciones = InscripcionCurso.objects.filter(
            usuario_id=usuario_id
        ).select_related('curso')

        data = []
        for ins in inscripciones:
            # Obtener documentos requeridos y subidos
            docs_requeridos = ins.curso.documentos_requeridos.all()
            docs_subidos = DocumentoSubido.objects.filter(
                usuario_id=usuario_id,
                curso=ins.curso
            )
            
            # Crear mapa de subidos para búsqueda rápida
            mapa_subidos = {d.tipo_documento.id_tipo_doc: d for d in docs_subidos}
            
            lista_docs = []
            for doc_req in docs_requeridos:
                d_sub = mapa_subidos.get(doc_req.id_tipo_doc)
                if d_sub:
                    lista_docs.append({
                        "nombre": doc_req.nombre,
                        "estado": d_sub.estado_revision,
                        "fecha_subida": d_sub.fecha_subida
                    })
                else:
                    lista_docs.append({
                        "nombre": doc_req.nombre,
                        "estado": "PENDIENTE",
                        "fecha_subida": None
                    })
            
            data.append({
                "inscripcion_id": ins.id,
                "curso_id": ins.curso.id,
                "curso_nombre": ins.curso.nombre,
                "curso_modalidad": ins.curso.modalidad,
                "curso_horas": ins.curso.horas,
                "estado_inscripcion": ins.estado,
                "fecha_inscripcion": ins.fecha_inscripcion,
                "documentos": lista_docs
            })

        # --- Lógica para Cursos en Postulación (Sin Inscripción oficial aún) ---
        inscritos_ids = [ins.curso.id for ins in inscripciones]
        
        # Buscar documentos subidos para cursos donde NO hay inscripción
        docs_postulacion = DocumentoSubido.objects.filter(
            usuario_id=usuario_id
        ).exclude(
            curso_id__in=inscritos_ids
        ).select_related('curso', 'tipo_documento')

        # Agrupar por curso
        from collections import defaultdict
        cursos_postulando = defaultdict(list)
        for doc in docs_postulacion:
            cursos_postulando[doc.curso].append(doc)

        for curso, docs_subidos in cursos_postulando.items():
            # Obtener requisitos
            docs_requeridos = curso.documentos_requeridos.all()
            mapa_subidos = {d.tipo_documento.id_tipo_doc: d for d in docs_subidos}
            
            lista_docs = []
            for doc_req in docs_requeridos:
                d_sub = mapa_subidos.get(doc_req.id_tipo_doc)
                if d_sub:
                    lista_docs.append({
                        "nombre": doc_req.nombre,
                        "estado": d_sub.estado_revision,
                        "fecha_subida": d_sub.fecha_subida
                    })
                else:
                    lista_docs.append({
                        "nombre": doc_req.nombre,
                        "estado": "PENDIENTE",
                        "fecha_subida": None
                    })

            data.append({
                "inscripcion_id": None, # No hay ID de inscripción
                "curso_id": curso.id,
                "curso_nombre": curso.nombre,
                "curso_modalidad": curso.modalidad,
                "curso_horas": curso.horas,
                "estado_inscripcion": "POSTULANDO", # Estado virtual
                "fecha_inscripcion": None, # Aún no inscrito
                "documentos": lista_docs
            })

        return Response({
            "success": True,
            "usuario_id": usuario_id,
            "total": len(data),
            "inscripciones": data
        })
class VerificarInscripcionView(APIView):
    """
    Verificar si el usuario puede inscribirse a un curso
    """
    permission_classes = [permissions.IsAuthenticated]
    
    def get(self, request, curso_id):
        try:
            curso = Curso.objects.get(id=curso_id)
        except Curso.DoesNotExist:
            return Response(
                {"error": "Curso no encontrado"},
                status=status.HTTP_404_NOT_FOUND
            )
        
        user = request.user
        
        #verificamos si ya está inscrito
        if InscripcionCurso.objects.filter(usuario=user, curso=curso).exists():
            return Response({
                "puede_inscribirse": False,
                "mensaje": "Ya estás inscrito en este curso",
                "estado": "YA_INSCRITO",
                "detalle": "Ya tienes una inscripción activa para este curso"
            })
        
        #verificamos disponibilidad del curso
        if curso.estado != 'por_empezar':
            return Response({
                "puede_inscribirse": False,
                "mensaje": "Este curso no está disponible para inscripción",
                "estado": "CURSO_NO_DISPONIBLE",
                "detalle": f"El curso está en estado: {curso.get_estado_display()}"
            })
        
        if curso.cupos_disponibles <= 0:
            return Response({
                "puede_inscribirse": False,
                "mensaje": "No hay cupos disponibles",
                "estado": "SIN_CUPOS",
                "detalle": "Todos los cupos para este curso han sido ocupados"
            })
        
        if curso.fecha_inicio < timezone.now().date():
            return Response({
                "puede_inscribirse": False,
                "mensaje": "El curso ya ha comenzado",
                "estado": "CURSO_INICIADO",
                "detalle": f"El curso comenzó el {curso.fecha_inicio.strftime('%d/%m/%Y')}"
            })
        
        #verificamos documentos
        documentos_requeridos = curso.documentos_requeridos.all()
        documentos_subidos = DocumentoSubido.objects.filter(
            usuario=user,
            curso=curso
        )
        
        #prepararamos información de documentos
        documentos_info = []
        documentos_pendientes = []
        
        for doc_requerido in documentos_requeridos:
            doc_subido = documentos_subidos.filter(tipo_documento=doc_requerido).first()
            estado = doc_subido.estado_revision if doc_subido else 'NO_SUBIDO'
            
            doc_info = {
                'tipo': doc_requerido.nombre,
                'estado': estado,
                'subido': doc_subido is not None
            }
            
            documentos_info.append(doc_info)
            
            if estado != 'APROBADO':
                documentos_pendientes.append(doc_info)
        
        #verificamos si todos están aprobados
        todos_aprobados = all(doc['estado'] == 'APROBADO' for doc in documentos_info)
        
        if todos_aprobados:
            return Response({
                "puede_inscribirse": True,
                "mensaje": "¡Puede proceder con la inscripción!",
                "estado": "LISTO_PARA_INSCRIPCION",
                "detalle": "Todos los documentos han sido aprobados",
                "documentos": documentos_info,
                "resumen": {
                    "total": len(documentos_info),
                    "aprobados": len([d for d in documentos_info if d['estado'] == 'APROBADO']),
                    "pendientes": 0
                }
            })
        else:
            return Response({
                "puede_inscribirse": False,
                "mensaje": "Faltan documentos por aprobar",
                "estado": "DOCUMENTOS_PENDIENTES",
                "detalle": f"{len(documentos_pendientes)} de {len(documentos_info)} documentos pendientes",
                "documentos": documentos_info,
                "documentos_pendientes": documentos_pendientes,
                "resumen": {
                    "total": len(documentos_info),
                    "aprobados": len([d for d in documentos_info if d['estado'] == 'APROBADO']),
                    "pendientes": len(documentos_pendientes),
                    "pendientes_lista": [d['tipo'] for d in documentos_pendientes]
                }
            })


class MisInscripcionesView(generics.ListAPIView):
    """
    Lista las inscripciones del usuario actual
    """
    permission_classes = [permissions.IsAuthenticated]
    
    def get(self, request):
        user = request.user
        
        #obtenemos todas las inscripciones del usuario
        inscripciones = InscripcionCurso.objects.filter(
            usuario=user
        ).select_related('curso').order_by('-fecha_inscripcion')
        
        #preparamos la respuesta
        inscripciones_data = []
        for inscripcion in inscripciones:
            # Obtener documentos del curso
            documentos = DocumentoSubido.objects.filter(
                usuario=user,
                curso=inscripcion.curso
            )
            
            inscripciones_data.append({
                'inscripcion_id': inscripcion.id,
                'curso_id': inscripcion.curso.id,
                'curso_nombre': inscripcion.curso.nombre,
                'curso_fecha_inicio': inscripcion.curso.fecha_inicio,
                'curso_modalidad': inscripcion.curso.modalidad,
                'curso_horas': inscripcion.curso.horas,
                'curso_estado': inscripcion.curso.estado, # Para filtro en frontend
                'curso_horarios': list(inscripcion.curso.horarios.values('dia_semana', 'hora_inicio', 'hora_fin')), # Esquema de horarios
                'estado_inscripcion': inscripcion.estado,
                'fecha_inscripcion': inscripcion.fecha_inscripcion,
                'documentos': [
                    {
                        'nombre': doc.tipo_documento.nombre,
                        'estado': doc.estado_revision,
                        'fecha_subida': doc.fecha_subida
                    }
                    for doc in documentos
                ]
            })
        
        return Response({
            'success': True,
            'total_inscripciones': len(inscripciones_data),
            'inscripciones': inscripciones_data
        })

#Views de Documentos
class DocumentosUsuarioView(generics.ListAPIView):
    serializer_class = DocumentoSubidoSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user

        #si es admin ve todos los documentos
        if user.is_staff or user.is_superuser or (hasattr(user, 'id_rol') and user.id_rol.nombre_rol == 'Administrador'):
            return DocumentoSubido.objects.all()

        #si es empresa ve los documentos de SUS trabajadores
        if hasattr(user, 'id_rol') and user.id_rol.nombre_rol == 'Empresa':
            return DocumentoSubido.objects.filter(usuario__lugar_trabajo=user.nombre)

        #si es cliente solo los suyos
        return DocumentoSubido.objects.filter(usuario=user)

class AprobarDocumentoView(APIView):
    permission_classes = [permissions.IsAdminUser]

    def post(self, request, pk):
        try:
            doc = DocumentoSubido.objects.get(pk=pk)
        except DocumentoSubido.DoesNotExist:
            return Response({"error": "Documento no encontrado"}, status=404)

        doc.estado_revision = "APROBADO"
        doc.observaciones_rechazo = None
        doc.save()

        return Response({"message": "Documento aprobado"})


class RechazarDocumentoView(APIView):
    permission_classes = [permissions.IsAdminUser]

    def post(self, request, pk):
        observacion = request.data.get("observacion")

        if not observacion:
            return Response({"error": "Debe ingresar una observación"}, status=400)

        try:
            doc = DocumentoSubido.objects.get(pk=pk)
        except DocumentoSubido.DoesNotExist:
            return Response({"error": "Documento no encontrado"}, status=404)

        doc.estado_revision = "RECHAZADO"
        doc.observaciones_rechazo = observacion
        doc.save()

        return Response({"message": "Documento rechazado"})
    
class DocumentosPendientesView(generics.ListAPIView):
    
    serializer_class = DocumentoSubidoSerializer
    permission_classes = [permissions.IsAdminUser]

    def get_queryset(self):
        return (
            DocumentoSubido.objects
            .filter(estado_revision="EN_REVISION")
            .order_by("-fecha_subida")
        )
    
class SubirDocumentoCursoView(APIView):
    permission_classes = [permissions.IsAuthenticated]
    parser_classes = [parsers.MultiPartParser, parsers.FormParser]
    def post(self, request, curso_id):
        try:
            curso = Curso.objects.get(id = curso_id)
        except Curso.DoesNotExist:
            return Response(
                {'error' : 'Curso no encontrado'},
                status=status.HTTP_404_NOT_FOUND
            )
        user = request.user
        tipo_doc_id = request.data.get('tipo_documento')
        archivo = request.FILES.get('archivo')
        
        #validaciones básicas
        if not archivo:
            return Response(
                {"error": "No se ha proporcionado ningún archivo"},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        if not tipo_doc_id:
            return Response(
                {"error": "Debe especificar el tipo de documento"},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        try:
            tipo_documento = TipoDocumento.objects.get(id_tipo_doc=tipo_doc_id)
        except TipoDocumento.DoesNotExist:
            return Response(
                {"error": "Tipo de documento no encontrado"},
                status=status.HTTP_404_NOT_FOUND
            )
        
        #validamos tipo de archivo
        allowed_extensions = ['.pdf', '.jpg', '.jpeg', '.png']
        file_extension = os.path.splitext(archivo.name)[1].lower()
        
        if file_extension not in allowed_extensions:
            return Response(
                {"error": f"Formato no permitido. Formatos aceptados: PDF, JPG, JPEG, PNG"},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        #validamos tamaño (5MB máximo)
        if archivo.size > 5 * 1024 * 1024:
            return Response(
                {"error": "El archivo es demasiado grande. Tamaño máximo: 5MB"},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        #determinamos el contexto (inscripción o general)
        contexto = request.data.get('contexto', 'general')  
        
        #se aplican validaciones específicas para inscripción
        if contexto == 'inscripcion':
            #verificamos que el documento sea requerido para este curso
            if not curso.documentos_requeridos.filter(id_tipo_doc=tipo_doc_id).exists():
                return Response({
                    "error": f"Documento no requerido",
                    "detalle": f"'{tipo_documento.nombre}' no es requerido para '{curso.nombre}'",
                    "documentos_requeridos": [
                        {"id": doc.id_tipo_doc, "nombre": doc.nombre}
                        for doc in curso.documentos_requeridos.all()
                    ]
                }, status=status.HTTP_400_BAD_REQUEST)
            
            #verificamos que no esté ya inscrito
            if InscripcionCurso.objects.filter(usuario=user, curso=curso).exists():
                return Response(
                    {"error": "Ya estás inscrito en este curso"},
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            #verificamos que el curso esté disponible
            if curso.cupos_disponibles <= 0:
                return Response(
                    {"error": "No hay cupos disponibles para este curso"},
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            if curso.estado != 'por_empezar':
                return Response(
                    {"error": f"El curso no está disponible. Estado actual: {curso.get_estado_display()}"},
                    status=status.HTTP_400_BAD_REQUEST
                )
        
        try:
            #crear o actualizar documento
            documento, created = DocumentoSubido.objects.update_or_create(
                usuario=user,
                curso=curso,
                tipo_documento=tipo_documento,
                defaults={
                    'url_archivo': archivo,
                    'estado_revision': 'EN_REVISION',
                    'observaciones_rechazo': None 
                }
            )
            
            #preparamos la respuesta base
            respuesta = {
                "success": True,
                "message": f"Documento '{tipo_documento.nombre}' subido correctamente",
                "contexto": contexto,
                "documento": {
                    "id": documento.id_doc_subido,
                    "tipo_documento": tipo_documento.nombre,
                    "estado": documento.estado_revision,
                    "fecha_subida": documento.fecha_subida,
                    "es_nuevo": created
                }
            }
            
            #informacion adicional para inscripción
            if contexto == 'inscripcion':
                #calculamos el progreso de documentos
                documentos_requeridos = curso.documentos_requeridos.all()
                documentos_subidos = DocumentoSubido.objects.filter(
                    usuario=user,
                    curso=curso
                )
                
                total_requeridos = documentos_requeridos.count()
                documentos_info = []
                
                for doc_req in documentos_requeridos:
                    doc_sub = documentos_subidos.filter(tipo_documento=doc_req).first()
                    documentos_info.append({
                        "id": doc_req.id_tipo_doc,
                        "nombre": doc_req.nombre,
                        "subido": doc_sub is not None,
                        "estado": doc_sub.estado_revision if doc_sub else "NO_SUBIDO",
                        "documento_id": doc_sub.id_doc_subido if doc_sub else None
                    })
                
                subidos = len([d for d in documentos_info if d['subido']])
                aprobados = len([d for d in documentos_info if d['estado'] == 'APROBADO'])
                
                respuesta["progreso_inscripcion"] = {
                    "total_requeridos": total_requeridos,
                    "documentos_subidos": subidos,
                    "documentos_aprobados": aprobados,
                    "porcentaje_completado": round((subidos / total_requeridos * 100), 2) if total_requeridos > 0 else 0,
                    "documentos_faltantes": total_requeridos - subidos,
                    "puede_inscribirse": aprobados == total_requeridos,
                    "detalle_documentos": documentos_info
                }
            
            return Response(respuesta, status=status.HTTP_201_CREATED if created else status.HTTP_200_OK)
            
        except Exception as e:
            return Response(
                {"error": f"Error al subir documento: {str(e)}"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

class DocumentosCursoView(generics.ListAPIView):
    """
    Lista documentos subidos para un curso específico
    """
    serializer_class = DocumentoSubidoSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        user = self.request.user
        curso_id = self.kwargs.get('curso_id')
        
        if user.is_staff or user.is_superuser or user.id_rol.nombre_rol == 'Administrador':
            return DocumentoSubido.objects.filter(curso_id=curso_id)
        return DocumentoSubido.objects.filter(usuario=user, curso_id=curso_id)


class TipoDocumentoListView(generics.ListAPIView):
    """
    Lista todos los tipos de documentos disponibles
    """
    permission_classes = [permissions.IsAuthenticated]
    serializer_class = TipoDeDocumentoSerializers
    queryset = TipoDocumento.objects.all()