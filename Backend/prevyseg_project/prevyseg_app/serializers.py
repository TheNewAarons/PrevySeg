from rest_framework import serializers
from .models import Rol, Usuario
from django.contrib.auth import authenticate
import re

# --- Serializers ---
class UserSerializer(serializers.ModelSerializer):
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
            'id_rol'
        )
        read_only_fields = ('rut', 'id_usuario')


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