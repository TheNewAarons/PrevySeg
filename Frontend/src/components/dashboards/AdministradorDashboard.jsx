import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';
import './StylesDashboards/AdministradorDashboard.css';

const AdministradorDashboard = () => {
    const navigate = useNavigate();
    const [userName, setUserName] = useState('Administrador');

    useEffect(() => {
        // Cargar nombre de usuario desde localStorage si existe
        const storedUser = JSON.parse(localStorage.getItem('user') || '{}');
        if (storedUser.nombre) {
            setUserName(storedUser.nombre);
        }
    }, []);

    const logout = () => {
        if (window.confirm('¿Estás seguro de que deseas cerrar sesión?')) {
            localStorage.removeItem('user');
            sessionStorage.clear();
            navigate('/login', { replace: true });
        }
    };

    const navegarModulo = (modulo) => {
        console.log('Navegando a módulo:', modulo);
        if (modulo === 'agregar-curso') {
            navigate('/administrador/agregar-curso');
        } else if (modulo === 'ingresar-clientes') {
            navigate('/administrador/crear-user');
        } else if (modulo === 'list-users') {
            navigate('/administrador/list-users');
        } else {
            alert(`Módulo: ${modulo}\nEsta funcionalidad se implementará próximamente.`);
        }
    };

    return (
        <div className="administrador-dashboard">
            {/* Navigation Bar */}
            <nav className="navbar navbar-expand-lg navbar-light">
                <div className="container-fluid px-4">
                    <a className="navbar-brand" href="/">
                        <img src="/images/logo.png" alt="PrevySeg Logo" />
                    </a>

                    <div className="d-flex align-items-center gap-3 ms-auto">
                        <div className="user-profile">
                            <div className="user-info text-end d-none d-md-block">
                                <p className="user-name">{userName}</p>
                                <p className="user-role">Panel de Control</p>
                            </div>
                            <img src="/placeholder.svg?height=40&width=40" alt="Perfil" className="user-avatar" />
                        </div>
                        <button className="btn btn-logout" onClick={logout}>
                            <i className="bi bi-box-arrow-right me-1"></i>
                            <span className="d-none d-sm-inline">Cerrar Sesión</span>
                        </button>
                    </div>
                </div>
            </nav>

            {/* Main Content */}
            <div className="main-container">
                {/* Page Header */}
                <div className="page-header">
                    <h1 className="page-title">Panel de Administración</h1>
                    <p className="page-subtitle">Gestiona todos los aspectos de PrevySeg OTEC</p>
                </div>

                {/* Stats Row */}
                <div className="stats-row">
                    <div className="stat-card">
                        <div className="stat-value">156</div>
                        <div className="stat-label">Clientes Activos</div>
                    </div>
                    <div className="stat-card">
                        <div className="stat-value">12</div>
                        <div className="stat-label">Cursos Disponibles</div>
                    </div>
                    <div className="stat-card">
                        <div className="stat-value">23</div>
                        <div className="stat-label">Pendientes Aprobación</div>
                    </div>
                    <div className="stat-card">
                        <div className="stat-value">8</div>
                        <div className="stat-label">Cursos en Curso</div>
                    </div>
                </div>

                {/* Modules Grid */}
                <div className="modules-grid">
                    {/* Ingresar Clientes */}
                    <div className="module-card" onClick={() => navegarModulo('ingresar-clientes')}>
                        <div className="module-icon">
                            <i className="bi bi-person-plus-fill"></i>
                        </div>
                        <h3 className="module-title">Ingresar Clientes</h3>
                        <p className="module-description">
                            Registra nuevos clientes en el sistema, gestiona sus datos personales y asigna permisos de acceso.
                        </p>
                        <span className="module-badge">Gestión de Usuarios</span>
                    </div>

                    {/* Aprobar Papeles */}
                    <div className="module-card" onClick={() => navegarModulo('aprobar-papeles')}>
                        <div className="module-icon">
                            <i className="bi bi-file-earmark-check-fill"></i>
                        </div>
                        <h3 className="module-title">Aprobar Papeles</h3>
                        <p className="module-description">
                            Revisa y aprueba documentación de estudiantes, certificados y requisitos de inscripción a cursos.
                        </p>
                        <span className="module-badge">Documentación</span>
                    </div>

                    {/* Horarios */}
                    <div className="module-card" onClick={() => navegarModulo('horarios')}>
                        <div className="module-icon">
                            <i className="bi bi-calendar-week-fill"></i>
                        </div>
                        <h3 className="module-title">Horarios</h3>
                        <p className="module-description">
                            Gestiona y programa horarios de cursos, asigna instructores y administra la disponibilidad de aulas.
                        </p>
                        <span className="module-badge">Planificación</span>
                    </div>

                    {/* Buscar Usuario */}
                    <div className="module-card" onClick={() => navegarModulo('list-users')}>
                        <div className="module-icon">
                            <i className="bi bi-search"></i>
                        </div>
                        <h3 className="module-title">Buscar Usuario</h3>
                        <p className="module-description">
                            Busca y filtra usuarios por diferentes criterios, visualiza perfiles completos y edita información.
                        </p>
                        <span className="module-badge">Consultas</span>
                    </div>

                    {/* Agregar Curso */}
                    <div className="module-card" onClick={() => navegarModulo('agregar-curso')}>
                        <div className="module-icon">
                            <i className="bi bi-plus-circle-fill"></i>
                        </div>
                        <h3 className="module-title">Agregar Curso</h3>
                        <p className="module-description">
                            Crea nuevos cursos, define contenido, asigna instructores, establece precios y requisitos.
                        </p>
                        <span className="module-badge">Catálogo</span>
                    </div>

                    {/* Reportes */}
                    <div className="module-card" onClick={() => navegarModulo('reportes')}>
                        <div className="module-icon">
                            <i className="bi bi-graph-up"></i>
                        </div>
                        <h3 className="module-title">Reportes</h3>
                        <p className="module-description">
                            Genera reportes estadísticos, visualiza métricas de desempeño y exporta información del sistema.
                        </p>
                        <span className="module-badge">Análisis</span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdministradorDashboard;
