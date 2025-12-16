from rest_framework import serializers
from .models import InscripcionCurso, Rol, Usuario, Curso, DocumentoSubido, TipoDocumento, HorarioCurso
from django.contrib.auth import authenticate
from django.utils import timezone
import re

# --- Serializers ---
class RolSerializer(serializers.ModelSerializer):
    class Meta:
        model = Rol
        fields = ["id_rol", "nombre_rol"]
class UserSerializer(serializers.ModelSerializer):
    #Se implementa id_rol para identificar nombre de rol al momento de listar
    
    datos_rol = RolSerializer(source='id_rol', read_only=True)

    # 2. ESCRITURA: Para seleccionar el rol enviando solo el ID (int)
    id_rol = serializers.PrimaryKeyRelatedField(queryset=Rol.objects.all())

    # 3. PASSWORD: Campo solo escritura para crear usuarios
    password = serializers.CharField(write_only=True, required=False)
    class Meta:
        model = Usuario
        fields = (
            'id_usuario',
            'rut',
            'nombre',
            'fecha_nacimiento',
            'telefono',
            'domicilio',
            'email',
            'lugar_trabajo',
            'id_rol',
            'datos_rol',
            'password',
        )
        read_only_fields = ('id_usuario',)

    def validate_password(self, value):
        if len(value) < 8:
            raise serializers.ValidationError("La clave debe tener al menos 8 caracteres.")
        if not re.search('[A-Z]', value):
            raise serializers.ValidationError("La clave debe contener al menos una mayúscula.")
        if not re.search('[0-9]', value):
            raise serializers.ValidationError("La clave debe contener al menos un número.")
        return value

    def validate_rut(self, value):
        # Valida unicidad y formato del RUT #
        # Asumimos que tienes el método normalize_rut en tu Manager
        rut_limpio = Usuario.objects.normalize_rut(value)
        
        # Verificamos si existe otro usuario con este RUT
        queryset = Usuario.objects.filter(rut=rut_limpio)
        
        # Si estamos editando (instance existe), excluimos al usuario actual de la busqueda
        if self.instance:
            queryset = queryset.exclude(pk=self.instance.pk)
            
        if queryset.exists():
            raise serializers.ValidationError("Ya existe un usuario con este RUT.")
        return rut_limpio

    # --- CREACIÓN (Con encriptación) ---

    def create(self, validated_data):
        # Sacamos la password para tratarla aparte
        password = validated_data.pop('password', None)
        
        # Creamos la instancia con los datos restantes (incluido el id_rol que ya viene validado)
        instance = self.Meta.model(**validated_data)
        
        if password:
            instance.set_password(password) # Encriptamos (Hash)
        
        instance.save()
        return instance


class RegistroSerializer(serializers.ModelSerializer):
    password = serializers.CharField(
        write_only=True, 
        required=True,
        style={'input_type': 'password'}
    )
    
    class Meta:
        model = Usuario
        # Campos requeridos por HU-1
        fields = ('rut', 'password', 'nombre', 'fecha_nacimiento', 'telefono', 'domicilio', 'email', 'lugar_trabajo')

    # Validación de Seguridad de Contraseña (HU-2)
    def validate_password(self, value):
        if len(value) < 8:
            raise serializers.ValidationError("La clave debe tener al menos 8 caracteres.")
        if not re.search('[A-Z]', value):
            raise serializers.ValidationError("La clave debe contener al menos una mayúscula.")
        if not re.search('[0-9]', value):
            raise serializers.ValidationError("La clave debe contener al menos un número.")
        # Se puede añadir validación de carácter especial aquí.
        return value

    # Validación de RUT (HU-1)
    def validate_rut(self, value):
        # Llamar a la función de normalización del Manager
        rut_limpio = Usuario.objects.normalize_rut(value)
        
        if Usuario.objects.filter(rut=rut_limpio).exists():
            raise serializers.ValidationError("Ya existe un usuario con este RUT.")
        return rut_limpio

    # Creación de Usuario (HU-1)
    def create(self, validated_data):
        # Aseguramos que el rol sea 'Cliente' para el registro público
        cliente_rol, created = Rol.objects.get_or_create(nombre_rol='Cliente', defaults={'id_rol': 1})
        
        user = Usuario.objects.create_user(
            rut=validated_data['rut'],
            password=validated_data['password'],
            nombre=validated_data.get('nombre'),
            fecha_nacimiento=validated_data.get('fecha_nacimiento'),
            telefono=validated_data.get('telefono'),
            domicilio=validated_data.get('domicilio'),
            email=validated_data.get('email'),
            lugar_trabajo=validated_data.get('lugar_trabajo'),
            id_rol=cliente_rol 
        )
        return user

class LoginSerializer(serializers.Serializer):
    rut = serializers.CharField(write_only=True)
    password = serializers.CharField(
        style={'input_type': 'password'},
        write_only=True
    )

    # Lógica de Autenticación (HU-3, HU-ADM-1)
    def validate(self, attrs):
        rut = attrs.get('rut')
        password = attrs.get('password')

        if rut and password:
            # Normalizar el RUT antes de autenticar
            rut_limpio = Usuario.objects.normalize_rut(rut)
            
            # Usar la función de autenticación de Django
            user = authenticate(request=self.context.get('request'), rut=rut_limpio, password=password)

            if not user:
                # Mensaje de error genérico por seguridad (HU-3)
                raise serializers.ValidationError('Credenciales no válidas. Intente de nuevo.')
        else:
            raise serializers.ValidationError('Debe incluir RUT y password.')

        attrs['user'] = user
        return attrs


class TipoDeDocumentoSerializers(serializers.ModelSerializer):
    class Meta:
        model = TipoDocumento
        fields = ['id_tipo_doc', 'nombre']

class HorarioCursoSerializer(serializers.ModelSerializer):
    class Meta:
        model = HorarioCurso
        fields = ['dia_semana', 'hora_inicio', 'hora_fin']

class CursoSerializer(serializers.ModelSerializer):
    documentos_requeridos = TipoDeDocumentoSerializers(many=True, read_only=True)
    documentos_requeridos_ids = serializers.PrimaryKeyRelatedField(
        queryset = TipoDocumento.objects.all(),
        source = 'documentos_requeridos',
        many = True,
        write_only = True,
        required = False    
    )
    horarios = HorarioCursoSerializer(many=True, required=False)

    class Meta:
        model = Curso
        # Removemos campos antiguos si estaban explicitamente listados, pero estaban __all__
        # Como quitamos los campos del modelo, __all__ ya no los incluira.
        fields = '__all__'
    
    def validate(self, data):
        # Validacion se mueve a nivel de HorarioCurso individual o se itera aqui
        if 'horarios' in data:
            for horario in data['horarios']:
                if horario['hora_fin'] <= horario['hora_inicio']:
                    raise serializers.ValidationError({
                        'horarios': f"En {horario['dia_semana']}, la hora de fin debe ser superior a la de inicio."
                    })
        return data

    def create(self, validated_data):
        horarios_data = validated_data.pop('horarios', [])
        documentos_ids = validated_data.pop('documentos_requeridos', []) # Handle M2M separately if needed, but PrimaryKeyRelatedField handles it mostly?
        # Actually PrimaryKeyRelatedField with source='documentos_requeridos' for write_only handles it via set?
        # Default create w/ M2M needs check. DRF default create handles M2M if they are not nested serializers but PKs.
        # But here documents_requeridos_ids is PK field.
        
        curso = Curso.objects.create(**validated_data)
        
        # DRF ModelSerializer handles M2M from documents_requeridos_ids automatically? 
        # No, because we popped them? No wait, standard create handles it if we don't pop it manually 
        # or if we passed it to create.
        # Let's verify standard DRF behavior for M2M with custom create.
        # documents_requeridos_ids source is documents_requeridos.
        # validated_data will contain 'documentos_requeridos' as list of objects because of source mapping?
        # Let's look at previous code. It was not overriding create before.
        # Wait, previous code DID NOT override create. So standard behavior applied.
        # Standard behavior: saves instance, then sets M2M.
        
        # We need to manually set M2M because we are overriding create.
        if 'documentos_requeridos' in validated_data:
             # This might be already popped or not?
             # validated_data contains the Python objects.
             # documents_requeridos_ids (write_only) -> mapped to documents_requeridos (model field)
             pass
        
        # Re-fetch docs from the popped/cleared logic if needed. 
        # Actually, let's just use the super().create() logic pattern or manually do it.
        # But since we popped horarios, we can just call super if we hadn't popped horarios?
        # No, Curso model doesn't have horarios field, so super().create will fail if horarios is in validated_data.
        # So popping horarios is correct.
        
        # Create course
        # curso = Curso.objects.create(**validated_data) 
        # (Issues might arise if other M2M exist, but here it's just docs)
        
        # Set documents
        course_docs_field = getattr(curso, 'documentos_requeridos')
        course_docs_field.set(documentos_ids)

        # Create horarios
        for horario_data in horarios_data:
            HorarioCurso.objects.create(curso=curso, **horario_data)
        
        return curso

    def update(self, instance, validated_data):
        horarios_data = validated_data.pop('horarios', None)
        documentos_ids = validated_data.pop('documentos_requeridos', None)
        
        # Actualizar campos simples
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()
        
        # Actualizar Documentos Requeridos (M2M)
        if documentos_ids is not None:
            # documentos_ids ya es una lista de objetos TipoDocumento gracias a source='documentos_requeridos'
            instance.documentos_requeridos.set(documentos_ids)
            
        # Actualizar Horarios (Borrar y Recrear para simplificar)
        if horarios_data is not None:
            # Borrar horarios antiguos
            instance.horarios.all().delete()
            # Crear nuevos
            # Si horarios_data esta vacio, esto efectivamente borra todos los horarios sin crear nuevos, lo cual es correcto.
            for horario_data in horarios_data:
                HorarioCurso.objects.create(curso=instance, **horario_data)
                
        return instance

class CursoDetailSerializer(serializers.ModelSerializer):
    #Serializer para detalle del curso con documentos requeridos
    documentos_requeridos = TipoDeDocumentoSerializers(many=True, read_only=True)
    ya_inscrito = serializers.SerializerMethodField()
    documentos_subidos = serializers.SerializerMethodField()
    
    horarios = HorarioCursoSerializer(many=True, read_only=True)
    
    class Meta:
        model = Curso
        fields = [
            'id', 'nombre', 'descripcion', 'horas', 'profesor', 'valor',
            'tipo_certificado', 'fecha_inicio', 'cupos_disponibles',
            'modalidad', 'area', 'horarios',
            'estado', 'documentos_requeridos', 'ya_inscrito', 'documentos_subidos'
        ]
    
    def get_ya_inscrito(self, obj):
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            return InscripcionCurso.objects.filter(
                usuario=request.user,
                curso=obj
            ).exists()
        return False
    
    def get_documentos_subidos(self, obj):
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            documentos = DocumentoSubido.objects.filter(
                usuario=request.user,
                curso=obj
            )
            return [
                {
                    'id_doc_subido': doc.id_doc_subido,
                    'tipo_documento_id': doc.tipo_documento.id_tipo_doc,
                    'tipo_documento_nombre': doc.tipo_documento.nombre,
                    'estado_revision': doc.estado_revision,
                    'fecha_subida': doc.fecha_subida,
                    'observaciones_rechazo': doc.observaciones_rechazo
                }
                for doc in documentos
            ]
        return []    
#Serializer para la inscripcion
class InscripcionCursoSerializer(serializers.ModelSerializer):
    curso_nombre = serializers.CharField(source = 'curso.nombre', read_only = True)
    curso_fecha_inicio = serializers.DateField(source = 'curso.fecha_inicio', read_only = True)
    curso_horas = serializers.IntegerField(source = 'curso.horas', read_only = True)
    curso_horarios = HorarioCursoSerializer(source='curso.horarios', many=True, read_only=True)
    curso_profesor = serializers.CharField(source = 'curso.profesor', read_only=True)
    curso_modalidad = serializers.CharField(source = 'curso.modalidad', read_only=True)
    curso_estado = serializers.CharField(source = 'curso.estado', read_only=True)
    class Meta:
        model = InscripcionCurso
        fields = '__all__'
    
    def validate(self, data):
        user = self.context['request'].user
        curso = data['curso']

        if InscripcionCurso.objects.filter(usuario = user, curso = curso).exists():
            raise serializers.ValidationError('Ya esta inscrito al curso')
        
        if curso.cupos_disponibles <= 0:
            raise serializers.ValidationError('No hay cupos disponibles para este curso')
        if curso.fecha_inicio < timezone.now().date():
            raise serializers.ValidationError('El curso ya comenzo')
        documentos_requeridos = curso.documentos_requeridos.all()
        for doc_requerido in documentos_requeridos:
            try:
                documento = DocumentoSubido.objects.get(
                    usuario=user,
                    curso=curso,
                    tipo_documento=doc_requerido
                )
                if documento.estado_revision != 'APROBADO':
                    raise serializers.ValidationError(
                        f"El documento '{doc_requerido.nombre}' no está aprobado"
                    )
            except DocumentoSubido.DoesNotExist:
                raise serializers.ValidationError(
                    f"Falta subir el documento: {doc_requerido.nombre}"
                )
        return data
    def create(self, validated_data):
        user = self.context['request'].user
        curso = validated_data['curso']
        
        #reducir cupos disponibles
        curso.cupos_disponibles -= 1
        curso.save()
        
        #crear inscripción
        inscripcion = InscripcionCurso.objects.create(
            usuario=user,
            curso=curso,
            estado='INSCRITO'
        )
        
        return inscripcion

class DocumentoSubidoSerializer(serializers.ModelSerializer):
    tipo_documento_nombre = serializers.CharField(source="tipo_documento.nombre", read_only=True)
    usuario_nombre = serializers.CharField(source = 'usuario.nombre', read_only = True)
    curso_nombre = serializers.CharField(source = 'curso.nombre', read_only = True)

    class Meta:
        model = DocumentoSubido
        fields = [
            "id_doc_subido",
            "usuario",
            "usuario_nombre",
            "curso_nombre",
            "curso",
            "tipo_documento",
            "tipo_documento_nombre",
            "url_archivo",
            "estado_revision",
            "observaciones_rechazo",
            "fecha_subida",    
        ]
        read_only_fields = ["estado_revision", "observaciones_rechazo", "fecha_subida"]

class DocumentoSubidoDetailSerializer(serializers.ModelSerializer):
    #Serializer para subir documento con validaciones
    tipo_documento_nombre = serializers.CharField(source="tipo_documento.nombre", read_only=True)
    
    class Meta:
        model = DocumentoSubido
        fields = [
            "id_doc_subido",
            "curso",
            "tipo_documento",
            "tipo_documento_nombre",
            "url_archivo",
            "estado_revision",
            "observaciones_rechazo",
            "fecha_subida"
        ]
        read_only_fields = [
            "curso",                 
            "estado_revision",
            "observaciones_rechazo",
            "fecha_subida"
        ]
    
    def validate_url_archivo(self, value):
        # Validar extensión del archivo
        allowed_extensions = ['.pdf', '.jpg', '.jpeg', '.png']
        file_extension = value.name.lower().split('.')[-1]
        
        if f'.{file_extension}' not in allowed_extensions:
            raise serializers.ValidationError(
                f"Formato de archivo no permitido. Formatos aceptados: {', '.join([ext.replace('.', '') for ext in allowed_extensions])}"
            )
        
        # Validar tamaño (5MB máximo)
        max_size = 5 * 1024 * 1024  # 5MB
        if value.size > max_size:
            raise serializers.ValidationError(
                f"El archivo es demasiado grande. Tamaño máximo: 5MB"
            )
        
        return value


