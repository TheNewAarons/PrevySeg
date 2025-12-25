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

class TipoDocumento(models.Model):
    id_tipo_doc = models.AutoField(primary_key=True)
    nombre = models.CharField(max_length=100, unique=True)

    def __str__(self):
        return self.nombre

class Curso(models.Model):
    MODALIDAD_CHOICES = [
        ("Presencial", "Presencial"),
        ("Online", "Online"),
        ("Mixto", "Mixto"),  
    ]
    AREAS = [
        ('seguridad', 'Seguridad Privada'),
        ('administracion', 'Administración y Finanzas'),
        ('tecnologia', 'Tecnología y Sistemas'),
        ('oficios', 'Oficios Técnicos'),
        ('alimentos', 'Alimentos y Manipulación'),
        ('estetica', 'Belleza y Estética'),
    ]
    nombre = models.CharField(max_length=200)
    descripcion = models.TextField()
    horas = models.PositiveIntegerField()
    profesor = models.CharField(max_length=150)
    valor = models.PositiveIntegerField()
    tipo_certificado = models.CharField(max_length=100)
    fecha_inicio = models.DateField()
    cupos_disponibles = models.PositiveIntegerField()
    documentos_requeridos = models.ManyToManyField(TipoDocumento, related_name ='cursos',blank=True, help_text = "Documentos requeridos para inscribirse ")
    created_at = models.DateTimeField(auto_now_add=True)
    modalidad = models.CharField(
        max_length=20,
        choices=MODALIDAD_CHOICES,
        default="Presencial"
    )
    area = models.CharField(
        max_length=20,
        choices=AREAS,
        default='seguridad'
    )
    
    # Campos SENCE (Phase 1 Integration)
    codigo_sence = models.CharField(max_length=20, unique=True, null=True, blank=True, help_text="Código SENCE oficial del curso")
    horas_sence = models.PositiveIntegerField(null=True, blank=True, help_text="Horas cronológicas reconocidas por SENCE")
    valor_hora_sence = models.PositiveIntegerField(null=True, blank=True, help_text="Valor hora SENCE para franquicia tributaria")
    
    # Campos de horario
    # Campos de horario eliminados en favor de modelo HorarioCurso
    
    # Estado del curso
    ESTADO_CHOICES = [
        ('por_empezar', 'Por Empezar'),
        ('en_curso', 'En Curso'),
        ('finalizado', 'Finalizado'),
    ]
    estado = models.CharField(
        max_length=20,
        choices=ESTADO_CHOICES,
        default='por_empezar',
        help_text="Estado actual del curso"
    )
    
    def __str__(self):
        return self.nombre


class HorarioCurso(models.Model):
    DIAS_SEMANA_CHOICES = [
        ('Lunes', 'Lunes'),
        ('Martes', 'Martes'),
        ('Miercoles', 'Miércoles'),
        ('Jueves', 'Jueves'),
        ('Viernes', 'Viernes'),
        ('Sabado', 'Sábado'),
        ('Domingo', 'Domingo'),
    ]

    curso = models.ForeignKey(Curso, on_delete=models.CASCADE, related_name='horarios')
    dia_semana = models.CharField(max_length=20, choices=DIAS_SEMANA_CHOICES)
    hora_inicio = models.TimeField()
    hora_fin = models.TimeField()

    def __str__(self):
        return f"{self.curso.nombre} - {self.dia_semana} ({self.hora_inicio} - {self.hora_fin})"


class DocumentoSubido(models.Model):
    ESTADOS = [
        ('APROBADO', 'Aprobado'),
        ('EN_REVISION', 'En revisión'),
        ('RECHAZADO', 'Rechazado'),
    ]

    id_doc_subido = models.AutoField(primary_key=True)
    usuario = models.ForeignKey(Usuario, on_delete=models.CASCADE)
    curso = models.ForeignKey(Curso, on_delete=models.CASCADE)
    tipo_documento = models.ForeignKey(TipoDocumento, on_delete=models.CASCADE)
    url_archivo = models.FileField(upload_to="documentos/")
    estado_revision = models.CharField(max_length=20, choices=ESTADOS, default='EN_REVISION')
    observaciones_rechazo = models.TextField(blank=True, null=True)
    fecha_subida = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.usuario.rut} - {self.tipo_documento.nombre}" 
# Complemento a RF-10
class InscripcionCurso(models.Model):
    ESTADOS = [
        ('PENDIENTE_PAGO', 'Pendiente de pago'),
        ('INSCRITO', 'Inscrito'),
        ('EN_CURSO', 'En curso'),
        ('FINALIZADO', 'FINALIZADO'),
    ]
    usuario = models.ForeignKey(Usuario, on_delete=models.CASCADE)
    curso = models.ForeignKey(Curso, on_delete=models.CASCADE)
    estado = models.CharField(max_length=20, choices=ESTADOS, default='INSCRITO')
    fecha_inscripcion = models.DateTimeField(auto_now_add=True)
    
    # Campos para Webpay
    pagado = models.BooleanField(default=False)
    token_ws = models.CharField(max_length=100, unique=True, null=True, blank=True)
    monto = models.IntegerField(null=True, blank=True)
    fecha_pago = models.DateTimeField(null=True, blank=True)

    class Meta:
        # Verificamos que el usuario no se inscriba mas de 1 vez al mismo curso
        unique_together = ('usuario', 'curso')

    def __str__(self):
        return f"{self.usuario.rut} - {self.curso.nombre} - {'Pagado' if self.pagado else 'Pendiente'}"

class Asistencia(models.Model):
    METODOS = [
        ('Manual', 'Manual'),
        ('Biometrico', 'Biometrico'),
    ]
    
    id_asistencia = models.AutoField(primary_key=True)
    usuario = models.ForeignKey(Usuario, on_delete=models.CASCADE)
    curso = models.ForeignKey(Curso, on_delete=models.CASCADE)
    fecha = models.DateField()
    hora_entrada = models.TimeField()
    hora_salida = models.TimeField(null=True, blank=True)
    metodo = models.CharField(max_length=20, choices=METODOS, default='Manual')
    observaciones = models.TextField(blank=True, null=True)
    
    class Meta:
        unique_together = ('usuario', 'curso', 'fecha') # Un registro por alumno por día y curso
        ordering = ['-fecha', 'hora_entrada']

    def __str__(self):
        return f"{self.fecha} - {self.usuario.rut} - {self.curso.nombre}"
