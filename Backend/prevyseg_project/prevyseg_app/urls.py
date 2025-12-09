from django.urls import path, include
from .views import RegistroView, LoginView, UsuarioViewSet, RolViewSet, CursoViewSet, DocumentosUsuarioView, AprobarDocumentoView, RechazarDocumentoView, DocumentosPendientesView, SubirDocumentoCursoView
from rest_framework.routers import DefaultRouter

router = DefaultRouter()
router.register(r'usuarios', UsuarioViewSet, basename='usuarios')
router.register(r'roles', RolViewSet, basename='roles')
router.register(r'cursos', CursoViewSet, basename='cursos')

urlpatterns = [
    # Endpoints de Autenticación (HU-1, HU-3, HU-ADM-1)
    path('auth/register/', RegistroView.as_view(), name='auth-register'),
    path('auth/login/', LoginView.as_view(), name='auth-login'),
    path('documentos/', DocumentosUsuarioView.as_view(),name="documentos-usuario"),
    path('documentos/<int:pk>/aprobar/', AprobarDocumentoView.as_view(), name='documento-aprobar'),
    path('documentos/<int:pk>/rechazar/', RechazarDocumentoView.as_view(), name='documento-rechazar'),
    path('documentos/pendientes/', DocumentosPendientesView.as_view(), name="documentos-pendientes"),
    path('cursos/<int:curso_id>/documento/subir ', SubirDocumentoCursoView.as_view(), name="subir-documento-curso"),
    path('', include(router.urls) ),
    
]
