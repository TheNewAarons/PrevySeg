
import csv
from django.http import HttpResponse, JsonResponse
from .models import Asistencia, InscripcionCurso, Curso
from django.views.decorators.http import require_GET
from django.utils import timezone
from django.contrib.auth.decorators import login_required, user_passes_test as user_passes_test_decorator
# Use user_passes_test_decorator to avoid conflict with potential class-based standard

def is_admin(user):
    return user.is_authenticated and (user.is_superuser or user.is_staff or (user.id_rol and user.id_rol.nombre_rol == 'Administrador'))

@login_required
def export_asistencia_sence(request, curso_id):
    """
    Exporta la asistencia de un curso en formato CSV compatible con estándares SENCE.
    Columnas usuales: RUN, FECHA, HORA_ENTRADA, HORA_SALIDA
    """
    if not is_admin(request.user):
        return HttpResponse("No autorizado", status=403)
        
    response = HttpResponse(content_type='text/csv')
    timestamp = timezone.now().strftime("%Y%m%d_%H%M")
    response['Content-Disposition'] = f'attachment; filename="asistencia_sence_{curso_id}_{timestamp}.csv"'

    writer = csv.writer(response)
    # Header format SENCE (Approximate based on standards)
    writer.writerow(['RUN_PARTICIPANTE', 'CODIGO_SENCE_CURSO', 'FECHA_CLASE', 'HORA_ENTRADA', 'HORA_SALIDA'])

    # Get records
    asistencias = Asistencia.objects.filter(curso_id=curso_id).select_related('usuario', 'curso')

    for a in asistencias:
        writer.writerow([
            a.usuario.rut,
            a.curso.codigo_sence if a.curso.codigo_sence else "SIN_CODIGO",
            a.fecha.strftime("%d-%m-%Y"),
            a.hora_entrada.strftime("%H:%M:%S"),
            a.hora_salida.strftime("%H:%M:%S") if a.hora_salida else ""
        ])

    return response

from django.http import HttpResponse, JsonResponse

@login_required
def export_nomina_curso(request, curso_id):
    """
    Exporta la nómina de alumnos inscritos (para carga masiva en Solicurso/LCE).
    """
    if not is_admin(request.user):
        return HttpResponse("No autorizado", status=403)

    response = HttpResponse(content_type='text/csv')
    timestamp = timezone.now().strftime("%Y%m%d_%H%M")
    response['Content-Disposition'] = f'attachment; filename="nomina_alumnos_{curso_id}_{timestamp}.csv"'

    writer = csv.writer(response)
    writer.writerow(['RUN', 'NOMBRES', 'APELLIDO_PATERNO', 'APELLIDO_MATERNO', 'EMAIL', 'TELEFONO'])

    inscripciones = InscripcionCurso.objects.filter(curso_id=curso_id, estado='INSCRITO').select_related('usuario')

    for i in inscripciones:
        # Simple name splitting logic (naive)
        parts = i.usuario.nombre.split(' ')
        nombres = parts[0]
        paterno = parts[1] if len(parts) > 1 else ""
        materno = parts[2] if len(parts) > 2 else ""
        
        writer.writerow([
            i.usuario.rut,
            nombres,
            paterno,
            materno,
            i.usuario.email,
            i.usuario.telefono
        ])

    return response

@login_required
def export_nomina_json(request, curso_id):
    """
    Retorna la lista de inscritos en JSON para la vista de Asistencia.
    """
    if not is_admin(request.user):
        return JsonResponse({"error": "No autorizado"}, status=403)
        
    inscripciones = InscripcionCurso.objects.filter(curso_id=curso_id).select_related('usuario')
    # Regresamos todos (incluyendo pendientes) o solo inscritos? 
    # Para asistencia SENCE, deben estar inscritos. Filtramos 'INSCRITO'.
    inscripciones = inscripciones.filter(estado='INSCRITO')
    
    data = []
    for i in inscripciones:
        data.append({
            "usuario_id": i.usuario.id_usuario,
            "rut": i.usuario.rut,
            "nombre": i.usuario.nombre,
            "email": i.usuario.email,
            "estado_inscripcion": i.estado
        })
        
    return JsonResponse(data, safe=False)

@login_required
def dashboard_compliance_stats(request):
    """
    Retorna estadisticas de cumplimiento para el dashboard.
    """
    if not is_admin(request.user):
        return JsonResponse({"error": "No autorizado"}, status=403)
    
    # 1. Cursos sin código SENCE
    cursos_total = Curso.objects.count()
    cursos_sin_sence = Curso.objects.filter(codigo_sence__isnull=True).count()
    cursos_sin_sence_names = list(Curso.objects.filter(codigo_sence__isnull=True).values_list('nombre', flat=True)[:5])
    
    # 2. Documentos pendientes de revisión
    docs_pendientes = DocumentoSubido.objects.filter(estado_revision='EN_REVISION').count()
    
    # 3. Alumnos sin inscripción finalizada (pero con documentos aprobados? Complejo calcular en SQL, simplificamos)
    # Inscripciones PENDIENTE_PAGO
    pagos_pendientes = InscripcionCurso.objects.filter(estado='PENDIENTE_PAGO').count()
    
    # 4. Asistencia
    # (Opcional: Cursos en curso sin asistencia registrada hoy)
    
    return JsonResponse({
        "cursos": {
            "total": cursos_total,
            "sin_codigo_sence": cursos_sin_sence,
            "ratio_cumplimiento": round(((cursos_total - cursos_sin_sence) / cursos_total * 100), 1) if cursos_total > 0 else 0,
            "alertas": cursos_sin_sence_names
        },
        "documentos": {
            "pendientes_revision": docs_pendientes
        },
        "financiero": {
            "pagos_pendientes": pagos_pendientes
        }
    })
