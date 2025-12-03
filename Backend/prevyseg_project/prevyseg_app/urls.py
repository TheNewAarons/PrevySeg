from django.urls import path, include
from .views import RegistroView, LoginView, UsuarioViewSet, RolViewSet, CursoListView, DocumentosUsuarioView, AprobarDocumentoView, RechazarDocumentoView

from rest_framework.routers import DefaultRouter

router = DefaultRouter()
router.register(r'usuarios', UsuarioViewSet, basename='usuarios')
router.register(r'roles', RolViewSet, basename='roles')

urlpatterns = [
    # Endpoints de Autenticación (HU-1, HU-3, HU-ADM-1)
    path('auth/register/', RegistroView.as_view(), name='auth-register'),
    path('auth/login/', LoginView.as_view(), name='auth-login'),
    path('cursos/', CursoListView.as_view(), name='cursos-list'),
    path('documentos/', DocumentosUsuarioView.as_view(),name="documentos-usuario"),
    path('documentos/<int:pk>/aprobar/', AprobarDocumentoView.as_view(), name='documento-aprobar'),
    path('documentos/<int:pk>/rechazar/', RechazarDocumentoView.as_view(), name='documento-rechazar'),
    path('', include(router.urls) ),
    
]
