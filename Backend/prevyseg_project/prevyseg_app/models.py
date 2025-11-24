# Create your models here.
from django.db import models
from django.contrib.auth.models import AbstractBaseUser, BaseUserManager, PermissionsMixin

# --- 1. Modelos de Gestión de Personas ---

class Rol(models.Model):
    id_rol = models.AutoField(primary_key=True)
    nombre_rol = models.CharField(max_length=50, unique=True)

    def __str__(self):
        return self.nombre_rol

    class Meta:
        verbose_name_plural = "Roles"

# Custom Manager para usar RUT como identificador principal
class UsuarioManager(BaseUserManager):
    def create_user(self, rut, password=None, **extra_fields):
        if not rut:
            raise ValueError('El RUT es un campo obligatorio.')
        
        # Limpiar y normalizar el RUT antes de usarlo
        rut = self.normalize_rut(rut) 
        
        user = self.model(rut=rut, **extra_fields)
        user.set_password(password)
        user.save(using=self._db)
        return user

    def create_superuser(self, rut, password=None, **extra_fields):
        # Configuración por defecto para superusuarios
        extra_fields.setdefault('is_staff', True)
        extra_fields.setdefault('is_superuser', True)
        extra_fields.setdefault('is_active', True)

        # Asignar un rol de 'Administrador' si el modelo Rol está implementado
        admin_rol, created = Rol.objects.get_or_create(nombre_rol='Administrador', defaults={'id_rol': 2})
        extra_fields['id_rol'] = admin_rol
        
        return self.create_user(rut, password, **extra_fields)

    def normalize_rut(self, rut):
        # Función básica para limpiar el RUT (quitar puntos y guiones)
        return rut.upper().replace('.', '').replace('-', '')


class Usuario(AbstractBaseUser, PermissionsMixin):
    id_usuario = models.AutoField(primary_key=True)
    # Asignar 'Cliente' (asumimos id=1) por defecto, para la HU-1
    id_rol = models.ForeignKey(Rol, on_delete=models.SET_NULL, null=True, default=1) 
    
    # Campos de Autenticación
    rut = models.CharField(max_length=12, unique=True)
    # password_hash (heredado de AbstractBaseUser)
    
    # Datos Personales (tomados del Modelo Lógico)
    nombre = models.CharField(max_length=100)
    fecha_nacimiento = models.DateField(null=True, blank=True)
    telefono = models.CharField(max_length=15)
    domicilio = models.CharField(max_length=255)
    email = models.EmailField(max_length=100, unique=True)
    lugar_trabajo = models.CharField(max_length=100, blank=True, null=True)

    # Campos de Django Auth
    is_active = models.BooleanField(default=True)
    is_staff = models.BooleanField(default=False)
    
    # Configuración de Django
    objects = UsuarioManager()
    USERNAME_FIELD = 'rut' # Definimos el RUT como el campo de inicio de sesión
    REQUIRED_FIELDS = ['nombre', 'email', 'telefono', 'domicilio'] # Campos requeridos al crear por manage.py

    def __str__(self):
        return self.rut

    class Meta:
        verbose_name_plural = "Usuarios"