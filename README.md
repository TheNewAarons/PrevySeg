# PrevySeg

PrevySeg es una plataforma integral para la gestión de seguridad, cursos de prevención y documentación técnica. Este sistema permite a administradores, empresas y clientes gestionar trabajadores, inscripciones a cursos y documentación reglamentaria de manera eficiente.

## 🚀 Tecnologías Utilizadas

El proyecto está dividido en dos partes principales:

### Frontend
- **React**: Biblioteca principal para la interfaz de usuario.
- **Vite**: Entorno de desarrollo rápido y herramienta de construcción.
- **TypeScript**: Superset de JavaScript con tipado estático.
- **Bootstrap / React-Bootstrap**: Framework de estilos para diseño responsivo.
- **React Router DOM**: Manejo de rutas y navegación.

### Backend
- **Django**: Framework web de alto nivel en Python.
- **Django REST Framework (DRF)**: Para la creación de APIs RESTful.
- **SQLite**: Base de datos por defecto (fácilmente escalable a PostgreSQL/MySQL).

---

## 🛠️ Instalación y Configuración

Sigue estos pasos para poner en marcha el proyecto en tu entorno local.

### Prerrequisitos
Asegúrate de tener instalado:
- [Node.js](https://nodejs.org/) (v18 o superior recomendado)
- [Python](https://www.python.org/) (v3.10 o superior recomendado)
- [Git](https://git-scm.com/)

### 1. Configuración del Backend (Django)

1. **Navega a la carpeta del Backend:**
   ```bash
   cd Backend
   ```

2. **Crea un entorno virtual:**
   ```bash
   # En Mac/Linux
   python3 -m venv venv
   
   # En Windows
   python -m venv venv
   ```

3. **Activa el entorno virtual:**
   ```bash
   # En Mac/Linux
   source venv/bin/activate
   
   # En Windows
   .\venv\Scripts\activate
   ```

4. **Instala las dependencias:**
   ```bash
   pip install -r requirements.txt
   ```

5. **Realiza las migraciones de la base de datos:**
   ```bash
   python manage.py migrate
   ```

6. **Inicia el servidor de desarrollo:**
   ```bash
   python manage.py runserver
   ```
   El backend estará corriendo en `http://127.0.0.1:8000/`.

### 2. Configuración del Frontend (React + Vite)

1. **Abre una nueva terminal y navega a la carpeta Frontend:**
   ```bash
   cd Frontend
   ```

2. **Instala las dependencias de Node:**
   ```bash
   npm install
   ```

3. **Inicia el servidor de desarrollo:**
   ```bash
   npm run dev
   ```
   El frontend estará disponible generalmente en `http://localhost:5173/`.

---

## 🔍 Detalle de Vistas y Módulos

El sistema cuenta con dashboards personalizados para cada rol, con módulos específicos para sus tareas:

### 👑 Dashboard Administrador
El panel central para la gestión completa de la OTEC.

*   **Estadísticas Generales**:
    *   **Clientes Activos**: Total de usuarios registrados con el rol de cliente.
    *   **Cursos Disponibles**: Cantidad total de cursos listados en el catálogo.
    *   **Pendientes Aprobación**: Número de documentos y solicitudes que requieren revisión urgente.
    *   **Cursos en Curso**: Cursos activos impartiéndose actualmente.

*   **Módulos de Gestión**:
    1.  **Ingresar Clientes / Gestión de Usuarios**:
        *   Permite registrar nuevos usuarios manualmente, asignándoles credenciales y roles.
    2.  **Aprobar Papeles / Documentación**:
        *   Interfaz para revisar archivos subidos por trabajadores y empresas. Permite validar o rechazar documentos oficiales.
    3.  **Gestión de Horarios**:
        *   Calendario administrativo para asignar bloques horarios a los cursos y gestionar la disponibilidad de recursos.
    4.  **Buscar y Listar Usuarios**:
        *   Herramienta de consulta para encontrar usuarios específicos, ver sus perfiles completos y editar su información.
    5.  **Catálogo de Cursos**:
        *   **Gestionar Cursos**: Vista para editar contenidos, asignar relatores y modificar el estado de los cursos existentes.
        *   **Agregar Curso**: Formulario completo para la creación de nuevos programas de capacitación.

### 🏢 Dashboard Empresa
Diseñado para que las organizaciones gestionen a su personal de forma autónoma.

*   **Resumen**:
    *   Visualización rápida de **Trabajadores Activos**, **Documentos Pendientes** de revisión y **Certificaciones Activas** de su equipo.

*   **Módulos Principales**:
    1.  **Agregar Trabajador**:
        *   Formulario simplificado para registrar empleados bajo la cuenta de la empresa y pre-inscribirlos en capacitaciones.
    2.  **Revisión de Documentos**:
        *   Control interno del estado de cumplimiento documental de sus empleados (certificados vigentes, licencias, etc.).
    3.  **Lista de Trabajadores**:
        *   Inventario completo del personal asociado a la empresa con accesos directos a sus perfiles.

### 👤 Dashboard Cliente / Trabajador
Panel personal para el alumno o trabajador individual.

*   **Módulos de Acceso**:
    1.  **Buscar Cursos**:
        *   Catálogo público donde el usuario puede explorar la oferta académica e inscribirse en nuevos programas.
    2.  **Mis Cursos**:
        *   Área personal donde se visualizan los cursos activos, el progreso de las lecciones y el estado de la documentación requerida para cada uno.
    3.  **Calendario de Cursos**:
        *   Vista de agenda personalizada con las fechas y horas de las clases que le corresponden al usuario.

---

## 📂 Estructura del Proyecto

```
PrevySeg/
├── Backend/                # Código fuente del servidor Django
│   ├── prevyseg_project/   # Configuración principal del proyecto Django
│   ├── prevyseg_app/       # Aplicación principal con modelos y vistas
│   ├── requirements.txt    # Dependencias de Python
│   └── manage.py           # Script de gestión de Django
│
├── Frontend/               # Código fuente del cliente React
│   ├── src/
│   │   ├── features/       # Módulos funcionales (Auth, Admin, Courses, etc.)
│   │   ├── components/     # Componentes reutilizables
│   │   ├── pages/          # Páginas principales
│   │   ├── services/       # Conexiones a la API
│   │   └── App.tsx         # Componente raíz y rutas
│   ├── package.json        # Dependencias de Node
│   └── vite.config.ts      # Configuración de Vite
│
└── README.md               # Documentación del proyecto
```
