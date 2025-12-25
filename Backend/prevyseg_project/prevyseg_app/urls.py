from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    RegistroView, LoginView,
    UsuarioViewSet, RolViewSet, CursoViewSet,
    DocumentosUsuarioView, DocumentosPendientesView,
    AprobarDocumentoView, RechazarDocumentoView,
    CursosDisponiblesView, CursoInscripcionDetailView,
    VerificarInscripcionView, InscribirseCursoView,
    MisInscripcionesView, TipoDocumentoListView,
    SubirDocumentoCursoView, DocumentosCursoView,
    InscripcionesUsuarioAdminView,
    AsistenciaViewSet, # Added AsistenciaViewSet
)
from .webpay_views import IniciarPagoView, ConfirmarPagoView
from .reporting_views import export_asistencia_sence, export_nomina_curso, export_nomina_json, dashboard_compliance_stats

router = DefaultRouter()
router.register(r'usuarios', UsuarioViewSet, basename='usuarios')
router.register(r'roles', RolViewSet, basename='roles')
router.register(r'cursos', CursoViewSet, basename='cursos') # Kept original style for consistency
router.register(r'asistencia', AsistenciaViewSet, basename='asistencia') # Corrected syntax and basename

urlpatterns = [
    #Auth
    path('auth/register/', RegistroView.as_view(), name='auth-register'),
    path('auth/login/', LoginView.as_view(), name='auth-login'),

    #Documentos (admin + usuario)
    path('documentos/', DocumentosUsuarioView.as_view(), name='documentos-usuario'),
    path('documentos/pendientes/', DocumentosPendientesView.as_view(), name='documentos-pendientes'),
    path('documentos/<int:pk>/aprobar/', AprobarDocumentoView.as_view(), name='documento-aprobar'),
    path('documentos/<int:pk>/rechazar/', RechazarDocumentoView.as_view(), name='documento-rechazar'),

    #Tipos de documento (para armar el checklist del curso)
    path('cursos/tipos-documento/', TipoDocumentoListView.as_view(), name='tipos-documento'),

    #Cliente: cursos disponibles + inscripción
    path('cursos/cursos-disponibles/', CursosDisponiblesView.as_view(), name='cursos-disponibles'),
    path('cursos/<int:curso_id>/inscripcion-detalle/', CursoInscripcionDetailView.as_view(), name='inscripcion-detalle'),
    path('cursos/<int:curso_id>/verificar-inscripcion/', VerificarInscripcionView.as_view(), name='verificar-inscripcion'),
    path('cursos/<int:curso_id>/finalizar-inscripcion/', InscribirseCursoView.as_view(), name='finalizar-inscripcion'),
    path('cursos/mis-inscripciones/', MisInscripcionesView.as_view(), name='mis-inscripciones'),

    #Documentos por curso (cliente sube / lista)
    path('cursos/<int:curso_id>/documentos/', DocumentosCursoView.as_view(), name='documentos-curso'),
    path('cursos/<int:curso_id>/documentos/subir/', SubirDocumentoCursoView.as_view(), name='subir-documento-curso'),

    #Inscripcion para visualizacion del Administrador
    path("cursos/usuarios/<int:usuario_id>/inscripciones/", InscripcionesUsuarioAdminView.as_view(), name="inscripciones-user-admin"),

    # Webpay
    path('webpay/iniciar/<int:curso_id>/', IniciarPagoView.as_view(), name='webpay-iniciar'),
    path('webpay/confirmar/', ConfirmarPagoView.as_view(), name='webpay-confirmar'),

    # SENCE Reporting
    path('reporting/asistencia/<int:curso_id>/', export_asistencia_sence, name='export-asistencia-sence'),
    path('reporting/nomina/<int:curso_id>/', export_nomina_curso, name='export-nomina-curso'),
    path('reporting/nomina-json/<int:curso_id>/', export_nomina_json, name='export-nomina-json'),
    path('reporting/dashboard-stats/', dashboard_compliance_stats, name='dashboard-compliance-stats'),

    #CRUD admin (router)
    path('', include(router.urls)),
]
