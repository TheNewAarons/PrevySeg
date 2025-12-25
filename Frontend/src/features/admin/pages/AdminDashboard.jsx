import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';
import '../styles/AdminDashboard.css';
import { useAuth } from '../../../services/authContext';
import authService from '../../../services/authService';
import courseService from '../../../services/courseService';
import documentoService from '../../../services/documentoService';
import userService from '../../../services/userService';
import Navbar from '../../../components/layout/Navbar';

const AdminDashboard = () => {
    const navigate = useNavigate();
    const { user, logout: authLogout } = useAuth();
    const [documentCount, setDocumentCount] = useState(0);
    const [enRevisionCount, setEnRevisionCount] = useState(0)
    const [courseCount, setCourseCount] = useState(0);
    const [inProgressCount, setInProgressCount] = useState(0);
    const [clientCount, setClientCount] = useState(0);

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        // Verificar que hay usuario
        if (!user) {
            console.log('⚠️ No hay usuario, redirigiendo...');
            navigate('/login');
            return;
        }

        // Cargar estadísticas
        fetchCourseStats();
        fetchDocumentsStats();
        fetchUserStats();
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

    const fetchUserStats = async () => {
        try {
            // No seteamos loading global aqui para no bloquear otros stats si falla
            // setError(null); 

            // Pedimos solo usuarios con rol 'Cliente'
            const clients = await userService.getUsers('Cliente');
            setClientCount(clients?.length || 0);

        } catch (error) {
            console.error('Error al cargar clientes:', error);
            // Manejamos logout si aplica
            if (error.message.includes('Sesión expirada') || error.message.includes('token_not_valid') || error.message.includes('Given token not valid')) {
                authLogout();
            }
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
            <Navbar />

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
                        <div className="d-flex justify-content-between align-items-center mb-4">
                            <h1 className="page-title">Panel de Administración</h1>
                            <button className="btn btn-outline-primary" onClick={() => navigate('/administrador/compliance')}>
                                <i className="bi bi-shield-check me-2"></i>Conformidad SENCE
                            </button>
                            <button className="btn-logout" onClick={() => { authService.logout(); navigate('/login'); }}>
                                <i className="bi bi-box-arrow-right me-2"></i> Cerrar Sesión
                            </button>
                        </div>

                        <div className="stats-row">
                            <div className="stat-card" onClick={() => navegarModulo('list-users')} style={{ cursor: 'pointer' }}>
                                <div className="stat-value">{clientCount}</div>
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

                        </div>
                    </>
                )}
            </div>
        </div>
    );
};

export default AdminDashboard;