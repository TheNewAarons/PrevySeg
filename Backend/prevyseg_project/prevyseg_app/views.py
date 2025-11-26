from django.shortcuts import render
from rest_framework import generics, permissions, status, viewsets
from rest_framework.response import Response
from rest_framework_simplejwt.tokens import RefreshToken
from .serializers import RegistroSerializer, LoginSerializer, UserSerializer
from .models import Usuario, Rol
from rest_framework.views import APIView
from django.db import IntegrityError
from .permissions import IsSelforAdmin

# --- Vistas de Autenticación (HU-1, HU-3, HU-ADM-1) ---

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
                "rut": user.rut,
                "email": user.email,
                "rol": user.id_rol.nombre_rol,
                "token": str(refresh.access_token),
                "refresh": str(refresh),
            }, status=status.HTTP_201_CREATED)
            
        except Exception as e:
            # Captura errores de validación de serializador o base de datos
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


#Visualizacion del crud restante al registro(POST) 
class UsuarioViewSet(viewsets.ModelViewSet):
    queryset = Usuario.objects.all()
    serializer_class = UserSerializer
    permission_classes = [permissions.IsAuthenticated, IsSelforAdmin]

    lookup_field = 'id_usuario' #Permitimos el URL de tipo /usuario/0/

    def get_queryset(self):
        user = self.request.user
        if user.id_rol.nombre_rol == 'Administrador':
            return Usuario.objects.all()

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
            "rol": rol_nombre
        }, status=status.HTTP_200_OK)