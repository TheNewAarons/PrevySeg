from django.urls import path
from .views import RegistroView, LoginView

urlpatterns = [
    # Endpoints de Autenticación (HU-1, HU-3, HU-ADM-1)
    path('auth/register/', RegistroView.as_view(), name='auth-register'),
    path('auth/login/', LoginView.as_view(), name='auth-login'),
]