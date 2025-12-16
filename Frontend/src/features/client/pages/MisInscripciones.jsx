import React, { useEffect, useState } from "react";
import courseService from "../../../services/courseService";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../../services/authContext";
import '../styles/ClienteDashboard.css'; // Updated CSS import
import Navbar from '../../../components/layout/Navbar';

const MisInscripciones = () => {
    const [inscripciones, setInscripciones] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();
    const { user } = useAuth();

    useEffect(() => {
        const fetchData = async () => {
            try {
                const data = await courseService.getMisInscripciones();
                setInscripciones(data.inscripciones || []);
            } catch (error) {
                console.error(error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    if (loading) {
        return (
            <div className="d-flex justify-content-center align-items-center vh-100">
                <div className="spinner-border text-primary" role="status">
                    <span className="visually-hidden">Cargando...</span>
                </div>
            </div>
        );
    }

    return (
        <div className="cliente-dashboard">
            <Navbar />

            <div className="container mt-4">
                {/* Header Section */}
                <div className="d-flex flex-column flex-md-row justify-content-between align-items-center mb-5 animate-fade-in">
                    <div className="mb-3 mb-md-0">
                        <h1 className="page-title">Mis Inscripciones</h1>
                        <p className="page-subtitle">Gestiona tu progreso académico y documentos.</p>
                    </div>
                    <button className="btn btn-outline-secondary" onClick={() => navigate('/cliente/dashboard')}>
                        <i className="bi bi-arrow-left me-2"></i>Volver al Panel
                    </button>
                </div>

                {/* Content */}
                {inscripciones.length === 0 ? (
                    <div className="text-center py-5 bg-white rounded-3 shadow-sm">
                        <div className="mb-4">
                            <i className="bi bi-journal-x text-muted" style={{ fontSize: '4rem', opacity: 0.5 }}></i>
                        </div>
                        <h3 className="text-secondary mb-3">No tienes cursos inscritos aún</h3>
                        <p className="text-muted mb-4">Explora nuestro catálogo y comienza tu aprendizaje hoy mismo.</p>
                        <button className="btn btn-primary btn-lg rounded-pill px-5" onClick={() => navigate('/cliente/cursos/buscar')}>
                            Buscar Cursos Disponibles
                        </button>
                    </div>
                ) : (
                    <div className="row g-4">
                        {inscripciones.map((ins) => (
                            <div key={ins.inscripcion_id} className="col-md-6 col-lg-4 d-flex">
                                <div className="course-card w-100 animate-slide-up">
                                    {/* Optional: Add a subtle colored bar at top based on status */}
                                    <div className={`h-1 w-100 ${ins.estado_inscripcion === 'CONFIRMADA' ? 'bg-success' : 'bg-secondary'}`} style={{ height: '6px' }}></div>

                                    <div className="course-body">
                                        <div className="d-flex justify-content-between align-items-start mb-3">
                                            <span className={`badge rounded-pill ${ins.estado_inscripcion === 'CONFIRMADA' ? 'bg-success bg-opacity-10 text-success' : 'bg-secondary bg-opacity-10 text-secondary'}`}>
                                                {ins.estado_inscripcion}
                                            </span>
                                            <small className="text-muted"><i className="bi bi-hash me-1"></i>{ins.inscripcion_id}</small>
                                        </div>

                                        <h3 className="course-title text-truncate-2" title={ins.curso_nombre}>
                                            {ins.curso_nombre}
                                        </h3>

                                        <div className="course-info mt-3">
                                            <div className="info-item">
                                                <i className="bi bi-calendar-event"></i>
                                                <div>
                                                    <span className="info-label d-block text-muted small">Fecha Inicio</span>
                                                    <span>{ins.curso_fecha_inicio}</span>
                                                </div>
                                            </div>
                                            <div className="info-item">
                                                <i className="bi bi-laptop"></i>
                                                <div>
                                                    <span className="info-label d-block text-muted small">Modalidad</span>
                                                    <span>{ins.curso_modalidad}</span>
                                                </div>
                                            </div>

                                            {/* New: Status Bar if course is active */}
                                            {ins.curso_estado === 'en_curso' && (
                                                <div className="mt-3 p-2 bg-light rounded text-center">
                                                    <span className="text-primary fw-bold small"><i className="bi bi-play-circle-fill me-2"></i>En Curso</span>
                                                </div>
                                            )}
                                        </div>

                                        <div className="mt-4 pt-3 border-top">
                                            <button
                                                className="btn btn-inscribirse w-100"
                                                onClick={() => navigate(`/cliente/cursos/${ins.curso_id}/inscripcion`)}
                                            >
                                                Gestionar Inscripción
                                                <i className="bi bi-arrow-right ms-2"></i>
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default MisInscripciones;
