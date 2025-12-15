import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';
import courseService from '../../../services/courseService';
import authService from '../../../services/authService';
import '../../admin/styles/AdminDashboard.css';

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
            if (err.status === 401 || err.message.includes("token_not_valid")) {
                alert("Tu sesión ha expirado. Por favor inicia sesión nuevamente.");
                authService.logout();
                navigate('/login');
                return;
            }
            if (err?.status === 401 || String(err?.message || '').includes("token_not_valid")) {
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
                <nav className="navbar navbar-expand-lg navbar-light">
                    <div className="container-fluid px-4">
                        <a className="navbar-brand" href="/">
                            <img src="/images/logos/logo.png" alt="PrevySeg Logo" />
                        </a>
                    </div>
                </nav>
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
                <nav className="navbar navbar-expand-lg navbar-light">
                    <div className="container-fluid px-4">
                        <a className="navbar-brand" href="/">
                            <img src="/images/logos/logo.png" alt="PrevySeg Logo" />
                        </a>
                        <div className="d-flex align-items-center gap-3 ms-auto">
                            <button className="btn btn-secondary" onClick={() => navigate('/administrador/cursos')}>
                                <i className="bi bi-arrow-left me-2"></i>Volver a Lista
                            </button>
                        </div>
                    </div>
                </nav>
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
            <nav className="navbar navbar-expand-lg navbar-light">
                <div className="container-fluid px-4">
                    <a className="navbar-brand" href="/">
                        <img src="/images/logos/logo.png" alt="PrevySeg Logo" />
                    </a>
                    <div className="d-flex align-items-center gap-3 ms-auto">
                        <button className="btn btn-secondary" onClick={() => navigate('/administrador/cursos')}>
                            <i className="bi bi-arrow-left me-2"></i>Volver a Lista
                        </button>
                    </div>
                </div>
            </nav>

            <div className="main-container">
                <div className="container mt-4">
                    <div className="d-flex justify-content-between align-items-center mb-4">
                        <h1 className="page-title">{course.nombre}</h1>
                        <div className="btn-group">
                            <button
                                className="btn btn-warning"
                                onClick={() => navigate(`/administrador/cursos/${id}/editar`)}
                            >
                                <i className="bi bi-pencil me-2"></i>Editar
                            </button>
                            <button
                                className="btn btn-danger"
                                onClick={handleDelete}
                            >
                                <i className="bi bi-trash me-2"></i>Eliminar
                            </button>
                        </div>
                    </div>

                    <div className="row">
                        {/* Información General */}
                        <div className="col-md-6 mb-4">
                            <div className="card shadow-sm h-100">
                                <div className="card-header bg-primary text-white">
                                    <h5 className="mb-0"><i className="bi bi-info-circle me-2"></i>Información General</h5>
                                </div>
                                <div className="card-body">
                                    <div className="mb-3">
                                        <strong>Descripción:</strong>
                                        <p className="mt-1">{course.descripcion || '—'}</p>
                                    </div>
                                    <div className="mb-3">
                                        <strong>Área:</strong>
                                        <p className="mt-1">
                                            <span className="badge bg-info text-dark">{course.area || 'General'}</span>
                                        </p>
                                    </div>
                                    <div className="mb-3">
                                        <strong>Modalidad:</strong>
                                        <p className="mt-1">{course.modalidad || '—'}</p>
                                    </div>
                                    <div className="mb-3">
                                        <strong>Estado:</strong>
                                        <p className="mt-1">
                                            {renderEstado(course.estado)}
                                        </p>
                                    </div>
                                    <div className="mb-3">
                                        <strong>Profesor:</strong>
                                        <p className="mt-1">{course.profesor || '—'}</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Detalles Académicos */}
                        <div className="col-md-6 mb-4">
                            <div className="card shadow-sm h-100">
                                <div className="card-header bg-success text-white">
                                    <h5 className="mb-0"><i className="bi bi-book me-2"></i>Detalles Académicos</h5>
                                </div>
                                <div className="card-body">
                                    <div className="mb-3">
                                        <strong>Horas Totales:</strong>
                                        <p className="mt-1">{course.horas ?? '—'} horas</p>
                                    </div>
                                    <div className="mb-3">
                                        <strong>Tipo de Certificado:</strong>
                                        <p className="mt-1">
                                            <i className="bi bi-award me-1"></i>
                                            {course.tipo_certificado || 'Certificado'}
                                        </p>
                                    </div>
                                    <div className="mb-3">
                                        <strong>Valor:</strong>
                                        <p className="mt-1">
                                            <strong className="text-success">${formatMoneyCLP(course.valor)}</strong>
                                        </p>
                                    </div>
                                    <div className="mb-3">
                                        <strong>Cupos Disponibles:</strong>
                                        <p className="mt-1">
                                            <span className={`badge ${course.cupos_disponibles > 0 ? 'bg-success' : 'bg-danger'}`}>
                                                {course.cupos_disponibles ?? 0} cupos
                                            </span>
                                        </p>
                                    </div>
                                    <div className="mb-3">
                                        <strong>Fecha de Inicio:</strong>
                                        <p className="mt-1">{course.fecha_inicio || '—'}</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Horario */}
                        <div className="col-md-6 mb-4">
                            <div className="card shadow-sm h-100">
                                <div className="card-header bg-warning text-dark">
                                    <h5 className="mb-0"><i className="bi bi-clock me-2"></i>Horario</h5>
                                </div>
                                <div className="card-body">
                                    <div className="mb-3">
                                        <strong>Días de la Semana:</strong>
                                        <p className="mt-1">{course.dias_semana || '—'}</p>
                                    </div>
                                    <div className="mb-3">
                                        <strong>Hora de Inicio:</strong>
                                        <p className="mt-1">{formatTime(course.hora_inicio)}</p>
                                    </div>
                                    <div className="mb-3">
                                        <strong>Hora de Fin:</strong>
                                        <p className="mt-1">{formatTime(course.hora_fin)}</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Requisitos */}
                        <div className="col-md-6 mb-4">
                            <div className="card shadow-sm h-100">
                                <div className="card-header bg-info text-dark">
                                    <h5 className="mb-0"><i className="bi bi-file-text me-2"></i>Requisitos</h5>
                                </div>
                                <div className="card-body">
                                    <div className="mb-3">
                                        <strong>Documentos Requeridos:</strong>
                                        {requiredDocs.length === 0 ? (
                                        <p className="text-muted mb-0">No se configuraron documentos requeridos para este curso.</p>
                                    ) : (
                                        <div className="d-flex flex-wrap gap-2">
                                        {requiredDocs.map((doc) => (
                                            <span key={doc.id_tipo_doc} className="badge bg-dark">
                                            {doc.nombre}
                                            </span>
                                        ))}
                                        </div>
                                    )}
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
