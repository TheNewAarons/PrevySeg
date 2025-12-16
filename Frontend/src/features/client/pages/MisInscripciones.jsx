import React, { useEffect, useState } from "react";
import courseService from "../../../services/courseService";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../../services/authContext";
import '../../admin/styles/AdminDashboard.css';

const MisInscripciones = () => {
    const [inscripciones, setInscripciones] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    const { user, logout } = useAuth();

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

    const handleLogout = () => {
        if (window.confirm("¿Estás seguro que deseas cerrar sesión?")) {
            logout();
        }
    };

    if (loading) {
        return <div className="text-center py-5">Cargando...</div>;
    }

    return (
        <div className="administrador-dashboard">
            <nav className="navbar navbar-expand-lg navbar-light">
                <div className="container-fluid px-4">
                    <a className="navbar-brand" href="/cliente/dashboard">
                        <img src="/images/logos/logo.png" alt="PrevySeg Logo" />
                    </a>

                    <div className="d-flex align-items-center gap-3 ms-auto">
                        <div className="user-profile">
                            <div className="user-info text-end d-none d-md-block">
                                <p className="user-name">{user?.nombre || "Usuario"}</p>
                                <p className="user-role">Cliente</p>
                            </div>
                            <img src="/placeholder.svg?height=40&width=40" alt="Perfil" className="user-avatar" />
                        </div>
                        <button className="btn btn-logout" onClick={handleLogout}>
                            <i className="bi bi-box-arrow-right me-1"></i>
                            <span className="d-none d-sm-inline">Cerrar Sesión</span>
                        </button>
                    </div>
                </div>
            </nav>

            <div className="container mt-4">
                <div className="d-flex justify-content-between align-items-center mb-4">
                    <div>
                        <h1 className="fw-bold text-dark mb-2">Mis Inscripciones</h1>
                        <p className="text-muted mb-0">Revisa el estado de tus cursos actuales</p>
                    </div>
                    <button className="btn btn-outline-secondary" onClick={() => navigate('/cliente/dashboard')}>
                        <i className="bi bi-arrow-left me-2"></i>Volver al Panel
                    </button>
                </div>

                {inscripciones.length === 0 ? (
                    <div className="text-center py-5 bg-light rounded">
                        <i className="bi bi-journal-x text-muted" style={{ fontSize: '3rem' }}></i>
                        <p className="mt-3 text-muted">No tienes cursos inscritos aún.</p>
                        <button className="btn btn-primary mt-3" onClick={() => navigate('/cliente/cursos/buscar')}>
                            Buscar Cursos
                        </button>
                    </div>
                ) : (
                    <div className="row g-4">
                        {inscripciones.map((ins) => (
                            <div key={ins.inscripcion_id} className="col-md-6 col-lg-4">
                                <div className="course-card h-100 shadow-sm border-0 d-flex flex-column" style={{ borderRadius: '16px', overflow: 'hidden' }}>
                                    <div className="card-body p-4 d-flex flex-column">
                                        <div className="d-flex justify-content-between align-items-start mb-3">
                                            <h5 className="h5 fw-bold mb-0 text-truncate-2">{ins.curso_nombre}</h5>
                                            <span className={`badge ${ins.estado_inscripcion === 'CONFIRMADA' ? 'bg-success' : 'bg-warning text-dark'}`}>
                                                {ins.estado_inscripcion}
                                            </span>
                                        </div>

                                        <div className="mb-4 small text-secondary">
                                            <div className="mb-2">
                                                <i className="bi bi-calendar-event me-2"></i>
                                                <strong>Inicio:</strong> {ins.curso_fecha_inicio}
                                            </div>
                                            <div className="mb-2">
                                                <i className="bi bi-laptop me-2"></i>
                                                <strong>Modalidad:</strong> {ins.curso_modalidad}
                                            </div>
                                            <div>
                                                <i className="bi bi-clock me-2"></i>
                                                <strong>Horas:</strong> {ins.curso_horas}
                                            </div>
                                        </div>

                                        <div className="mt-auto">
                                            <button
                                                className="btn btn-primary w-100 rounded-pill"
                                                onClick={() => navigate(`/cliente/cursos/${ins.curso_id}/inscripcion`)}
                                            >
                                                Ver Documentos y Detalles
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
