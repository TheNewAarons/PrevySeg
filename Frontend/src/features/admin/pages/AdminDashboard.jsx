import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';
import '../styles/AdminDashboard.css';
import { useAuth } from '../../../services/authContext';
import authService from '../../../services/authService';
import courseService from '../../../services/courseService';
import documentoService from '../../../services/documentoService';
const AdminDashboard = () => {
    const navigate = useNavigate();
    const { user, logout: authLogout } = useAuth();
    const [documentCount, setDocumentCount] = useState(0);
    const [enRevisionCount, setEnRevisionCount] = useState(0)
    const [userName, setUserName] = useState('Administrador');
    const [courseCount, setCourseCount] = useState(0);
    const [inProgressCount, setInProgressCount] = useState(0);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        // Verificar que hay usuario
        if (!user) {
            console.log('⚠️ No hay usuario, redirigiendo...');
            navigate('/login');
            return;
        }

        // Cargar nombre de usuario
        const storedUser = JSON.parse(localStorage.getItem('user') || '{}');
        if (storedUser.nombre) {
            setUserName(storedUser.nombre);
        } else if (user.nombre) {
            setUserName(user.nombre);
        }

        // Cargar estadísticas de cursos
        fetchCourseStats();
        fetchDocumentsStats()
    }, [user, navigate]);

    const fetchCourseStats = async () => {
        try {
            setLoading(true);
            setError(null);

            const courses = await courseService.getCourses();
            setCourseCount(courses?.length || 0);

            // Contar cursos en curso
            const inProgress = courses?.filter(c => c.estado === 'en_curso').length || 0;
            setInProgressCount(inProgress);

        } catch (err) {
            console.error('Error al cargar cursos:', err);
            setError(err.message);

            // Si el error es de sesión expirada, hacer logout
            if (err.message.includes('Sesión expirada') || err.message.includes('No hay sesión') || err.message.includes('token not valid') || err.message.includes('Given token not valid')) {
                authLogout();
            }
        } finally {
            setLoading(false);
        }
    };

    const fetchDocumentsStats = async () => {
        try {
            setLoading(true)
            setError(null)

            const documents = await documentoService.getDocumentos()
            setDocumentCount(documents?.length || 0)

            const enRevision = documents?.filter(d => d.estado_revision == 'EN_REVISION').length || 0
            setEnRevisionCount(enRevision)


        } catch (error) {
            console.error('Error al cargar documentos:', error)
            setError(error.message)
            if (error.message.includes('Sesión expirada') || error.message.includes('No hay sesión') || error.message.includes('token not valid') || error.message.includes('Given token not valid')) {
                authLogout();
            }
        } finally {
            setLoading(false)
        }
    }
    const handleLogout = () => {
        if (window.confirm('¿Estás seguro de que deseas cerrar sesión?')) {
            authService.logout();
            authLogout();
            navigate('/login', { replace: true });
        }
    };

    const navegarModulo = (modulo) => {
        console.log('Navegando a módulo:', modulo);
        if (modulo === 'agregar-curso') {
            navigate('/administrador/cursos/crear');
        } else if (modulo === 'cursos') {
            navigate('/administrador/cursos');
        } else if (modulo === 'ingresar-clientes') {
            navigate('/administrador/crear-user');
        } else if (modulo === 'list-users') {
            navigate('/administrador/list-users');
        } else if (modulo === 'aprobar-papeles') {
            navigate('/administrador/aprobar-papeles');
        } else if (modulo === 'horarios') {
            navigate('/administrador/horarios');
        } else if (modulo === 'reportes') {
            navigate('/administrador/reportes');
        } else {
            alert(`Módulo: ${modulo}\nEsta funcionalidad se implementará próximamente.`);
        }
    };

    if (!user) {
        return (
            <div className="d-flex justify-content-center align-items-center" style={{ height: '100vh' }}>
                <div className="spinner-border" role="status">
                    <span className="visually-hidden">Cargando...</span>
                </div>
            </div>
        );
    }

    return (
        <div className="administrador-dashboard">
            <nav className="navbar navbar-expand-lg navbar-light">
                <div className="container-fluid px-4">
                    <a className="navbar-brand" href="/administrador/dashboard">
                        <img src="/images/logos/logo.png" alt="PrevySeg Logo" />
                    </a>

                    <div className="d-flex align-items-center gap-3 ms-auto">
                        <div className="user-profile">
                            <div className="user-info text-end d-none d-md-block">
                                <p className="user-name">{userName}</p>
                                <p className="user-role">Panel de Control</p>
                            </div>
                            <img src="/placeholder.svg?height=40&width=40" alt="Perfil" className="user-avatar" />
                        </div>
                        {/* Cambiar onClick a handleLogout */}
                        <button className="btn btn-logout" onClick={handleLogout}>
                            <i className="bi bi-box-arrow-right me-1"></i>
                            <span className="d-none d-sm-inline">Cerrar Sesión</span>
                        </button>
                    </div>
                </div>
            </nav>

            <div className="main-container">
                {/* Mostrar error si existe */}
                {error && (
                    <div className="alert alert-danger mt-3 mb-3" role="alert">
                        <strong>Error:</strong> {error}
                    </div>
                )}

                {/* Mostrar loading si está cargando */}
                {loading ? (
                    <div className="d-flex justify-content-center align-items-center" style={{ height: '200px' }}>
                        <div className="spinner-border" role="status">
                            <span className="visually-hidden">Cargando estadísticas...</span>
                        </div>
                    </div>
                ) : (
                    <>
                        <div className="page-header">
                            <h1 className="page-title">Panel de Administración</h1>
                            <p className="page-subtitle">Gestiona todos los aspectos de PrevySeg OTEC</p>
                        </div>

                        <div className="stats-row">
                            <div className="stat-card">
                                <div className="stat-value">156</div>
                                <div className="stat-label">Clientes Activos</div>
                            </div>
                            <div className="stat-card" onClick={() => navegarModulo('cursos')} style={{ cursor: 'pointer' }}>
                                <div className="stat-value">{courseCount}</div>
                                <div className="stat-label">Cursos Disponibles</div>
                            </div>
                            <div className="stat-card" onClick={() => navegarModulo('aprobar-papeles')} style={{ cursor: 'pointer' }}>
                                <div className="stat-value">{enRevisionCount}</div>
                                <div className="stat-label">Pendientes Aprobación</div>
                            </div>
                            <div className="stat-card" onClick={() => navigate('/administrador/cursos/en-curso')} style={{ cursor: 'pointer' }}>
                                <div className="stat-value">{inProgressCount}</div>
                                <div className="stat-label">Cursos en Curso</div>
                            </div>
                        </div>

                        <div className="modules-grid">
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

                            <div className="module-card" onClick={() => navegarModulo('cursos')}>
                                <div className="module-icon">
                                    <i className="bi bi-book-fill"></i>
                                </div>
                                <h3 className="module-title">Gestionar Cursos</h3>
                                <p className="module-description">
                                    Visualiza, edita y elimina cursos existentes. Gestiona toda la información de los cursos disponibles.
                                </p>
                                <span className="module-badge">Catálogo</span>
                            </div>

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
                    </>
                )}
            </div>
        </div>
    );
};

export default AdminDashboard;