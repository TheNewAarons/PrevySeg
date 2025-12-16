import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';
import courseService from '../../../services/courseService';
import authService from '../../../services/authService';
import '../../admin/styles/AdminDashboard.css';
import Navbar from '../../../components/layout/Navbar';

const DetalleCurso = () => {
    const navigate = useNavigate();
    const { id } = useParams();
    const [course, setCourse] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        fetchCourse();
    }, [id]);

    const handleAuthExpired = () => {
        alert("Tu sesión ha expirado. Por favor inicia sesión nuevamente.");
        authService.logout();
        navigate('/login');
    };
    const fetchCourse = async () => {
        try {
            setLoading(true);
            const data = await courseService.getCourseById(id);
            setCourse(data);
            setError('');
        } catch (err) {
            console.error('Error al cargar curso:', err);
            if (err.status === 401 || err.message.includes("token_not_valid") || err.message.includes("Given token not valid")) {
                handleAuthExpired();
                return;
            }
            setError('Error al cargar el curso. Por favor intenta nuevamente.');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async () => {

        if (window.confirm(`¿Estás seguro de que deseas eliminar el curso "${course.nombre}"?`)) {
            try {
                await courseService.deleteCourse(id);
                alert('Curso eliminado exitosamente.');
                navigate('/administrador/cursos');
            } catch (err) {
                console.error('Error al eliminar curso:', err);
                alert('Error al eliminar el curso. Por favor intenta nuevamente.');
            }
            if (err?.status === 401 || String(err?.message || '').includes("token_not_valid")) {
                handleAuthExpired();
                return;
            }
        }
    };
    const formatMoneyCLP = (value) => {
        if (value === null || value === undefined) return '—';
        try {
            return new Intl.NumberFormat('es-CL').format(Number(value));
        } catch {
            return String(value);
        }
    };

    const formatTime = (time) => {
        if (!time) return '—';
        return String(time).substring(0, 5);
    };

    const renderEstado = (estado) => {
        if (estado === 'por_empezar') return <span className="badge bg-info">Por Empezar</span>;
        if (estado === 'en_curso') return <span className="badge bg-success">En Curso</span>;
        if (estado === 'finalizado') return <span className="badge bg-secondary">Finalizado</span>;
        return <span className="badge bg-secondary">Desconocido</span>;
    };

    const requiredDocs = Array.isArray(course?.documentos_requeridos)
        ? course.documentos_requeridos
        : []; //como ya no es string se convierte en lista

    if (loading) {
        return (
            <div className="administrador-dashboard">
                <Navbar />
                <div className="main-container">
                    <div className="text-center py-5">
                        <div className="spinner-border text-primary" role="status">
                            <span className="visually-hidden">Cargando...</span>
                        </div>
                        <p className="mt-3">Cargando curso...</p>
                    </div>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="administrador-dashboard">
                <Navbar />
                <div className="main-container">
                    <div className="container mt-4">
                        <div className="alert alert-danger">
                            <i className="bi bi-exclamation-triangle me-2"></i>
                            {error}
                        </div>
                    </div>
                </div>
            </div>
        );
    }


    return (
        <div className="administrador-dashboard">
            <Navbar />

            <div className="main-container">
                <div className="container px-4">
                    <div className="d-flex justify-content-end mb-4">
                        <button className="btn btn-secondary" onClick={() => navigate('/administrador/cursos')}>
                            <i className="bi bi-arrow-left me-2"></i>Volver a Lista
                        </button>
                    </div>
                    <div className="row g-4 mb-5">
                        {/* Header Section */}
                        <div className="col-12">
                            <div className="card border-0 shadow-sm overflow-hidden">
                                <div className="card-body p-4 p-md-5 bg-white text-center">
                                    <div className="mb-3">
                                        <div className="d-inline-flex align-items-center justify-content-center p-3 bg-primary bg-opacity-10 text-primary rounded-circle mb-3">
                                            <i className="bi bi-journal-bookmark-fill fs-1"></i>
                                        </div>
                                    </div>
                                    <h1 className="fw-bold mb-2 text-dark">{course.nombre}</h1>
                                    <div className="d-flex flex-wrap justify-content-center gap-2 mb-4">
                                        <span className={`badge ${course.estado === 'en_curso' ? 'bg-success' : 'bg-secondary'}`}>
                                            {course.estado === 'por_empezar' ? 'Por Empezar' : course.estado === 'en_curso' ? 'En Curso' : 'Finalizado'}
                                        </span>
                                        <span className="badge bg-light text-dark border">
                                            <i className="bi bi-grid-fill me-1"></i>{course.area}
                                        </span>
                                        <span className="badge bg-light text-dark border">
                                            <i className="bi bi-laptop me-1"></i>{course.modalidad}
                                        </span>
                                    </div>
                                    <div className="d-flex justify-content-center gap-2">
                                        <button className="btn btn-outline-primary btn-sm px-4" onClick={() => navigate(`/administrador/cursos/${id}/editar`)}>
                                            <i className="bi bi-pencil me-2"></i>Editar
                                        </button>
                                        <button className="btn btn-outline-danger btn-sm px-4" onClick={handleDelete}>
                                            <i className="bi bi-trash me-2"></i>Eliminar
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Content Grid */}
                        <div className="col-lg-8">
                            <div className="card border-0 shadow-sm h-100">
                                <div className="card-header bg-white border-bottom-0 pt-4 px-4">
                                    <h5 className="fw-bold mb-0"><i className="bi bi-info-circle text-primary me-2"></i>Información del Curso</h5>
                                </div>
                                <div className="card-body p-4">
                                    <p className="text-secondary mb-4">{course.descripcion}</p>

                                    <h6 className="fw-bold text-dark border-bottom pb-2 mb-3">Detalles Académicos</h6>
                                    <div className="row g-3">
                                        <div className="col-sm-6">
                                            <div className="p-3 bg-light rounded text-center h-100">
                                                <small className="text-muted d-block mb-1">Total Horas</small>
                                                <h5 className="fw-bold text-dark mb-0">{course.horas} hrs</h5>
                                            </div>
                                        </div>
                                        <div className="col-sm-6">
                                            <div className="p-3 bg-light rounded text-center h-100">
                                                <small className="text-muted d-block mb-1">Valor</small>
                                                <h5 className="fw-bold text-success mb-0">${formatMoneyCLP(course.valor)}</h5>
                                            </div>
                                        </div>
                                        <div className="col-sm-6">
                                            <div className="p-3 bg-light rounded text-center h-100">
                                                <small className="text-muted d-block mb-1">Vacantes</small>
                                                <strong className={course.cupos_disponibles > 0 ? "text-success" : "text-danger"}>
                                                    {course.cupos_disponibles} cupos
                                                </strong>
                                            </div>
                                        </div>
                                        <div className="col-sm-6">
                                            <div className="p-3 bg-light rounded text-center h-100">
                                                <small className="text-muted d-block mb-1">Inicio</small>
                                                <strong className="text-dark">{course.fecha_inicio}</strong>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="mt-4">
                                        <h6 className="fw-bold text-dark border-bottom pb-2 mb-3">Profesor</h6>
                                        <div className="d-flex align-items-center gap-3">
                                            <div className="bg-secondary bg-opacity-10 p-2 rounded-circle">
                                                <i className="bi bi-person-video3 fs-4 text-secondary"></i>
                                            </div>
                                            <div>
                                                <div className="fw-bold">{course.profesor}</div>
                                                <small className="text-muted">Instructor Principal</small>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Sidebar: Horarios & Requirements */}
                        <div className="col-lg-4">
                            <div className="row g-4">
                                <div className="col-12">
                                    <div className="card border-0 shadow-sm">
                                        <div className="card-header bg-white border-bottom-0 pt-4 px-4">
                                            <h5 className="fw-bold mb-0"><i className="bi bi-clock text-warning me-2"></i>Horarios</h5>
                                        </div>
                                        <div className="card-body p-4">
                                            {course.horarios && course.horarios.length > 0 ? (
                                                <div className="d-flex flex-col gap-3">
                                                    {course.horarios.map((h, i) => (
                                                        <div key={i} className="d-flex justify-content-between align-items-center border-bottom pb-2">
                                                            <span className="fw-medium text-dark">{h.dia_semana}</span>
                                                            <span className="badge bg-light text-dark border">{formatTime(h.hora_inicio)} - {formatTime(h.hora_fin)}</span>
                                                        </div>
                                                    ))}
                                                </div>
                                            ) : (
                                                <p className="text-muted small mb-0">No se han definido horarios.</p>
                                            )}
                                        </div>
                                    </div>
                                </div>
                                <div className="col-12">
                                    <div className="card border-0 shadow-sm">
                                        <div className="card-header bg-white border-bottom-0 pt-4 px-4">
                                            <h5 className="fw-bold mb-0"><i className="bi bi-file-earmark-check text-success me-2"></i>Requisitos</h5>
                                        </div>
                                        <div className="card-body p-4">
                                            {requiredDocs.length > 0 ? (
                                                <ul className="list-group list-group-flush small">
                                                    {requiredDocs.map((doc, idx) => (
                                                        <li key={idx} className="list-group-item px-0 d-flex align-items-start gap-2 bg-transparent text-secondary">
                                                            <i className="bi bi-check-circle-fill text-success mt-1"></i>
                                                            {doc.nombre}
                                                        </li>
                                                    ))}
                                                </ul>
                                            ) : (
                                                <p className="text-muted small mb-0">Sin documentos requeridos.</p>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DetalleCurso;
