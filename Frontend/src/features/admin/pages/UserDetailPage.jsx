import React, { useEffect, useMemo, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import courseService from "../../../services/courseService.jsx";
import { getAuthHeaders } from "../../../utils/apiHelpers";
import { useAuth } from "../../../services/authContext";
import authService from '../../../services/authService';
import '../styles/AdminDashboard.css';
import Navbar from '../../../components/layout/Navbar';

const UserDetailPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();

    const [usuario, setUsuario] = useState(null);
    const [inscripciones, setInscripciones] = useState([]);
    const [loading, setLoading] = useState(true);
    const [errorMsg, setErrorMsg] = useState("");

    useEffect(() => {
        if (!user) {
            navigate('/login');
            return;
        }
    }, [user, navigate]);

    useEffect(() => {
        let mounted = true;

        const fetchData = async () => {
            try {
                setLoading(true);
                setErrorMsg("");

                const localUser = JSON.parse(localStorage.getItem("user"));
                const token = localUser?.token;

                if (!token) {
                    alert("Sesión caducada. Inicia sesión nuevamente.");
                    localStorage.removeItem("user");
                    navigate("/login");
                    return;
                }

                const resUser = await fetch(`http://localhost:8000/api/usuarios/${id}/`, {
                    method: "GET",
                    headers: {
                        ...getAuthHeaders(),
                    },
                });


                if (!resUser.ok) {
                    if (resUser.status === 401) {
                        alert("Sesión caducada. Inicia sesión nuevamente.");
                        localStorage.removeItem("user");
                        navigate("/login");
                        return;
                    }
                    if (resUser.status === 403) {
                        throw new Error("No tienes permisos para acceder.");
                    }
                    throw new Error("Error al obtener usuario del servidor.");
                }

                const userData = await resUser.json();
                if (mounted) setUsuario(userData);


                const insData = await courseService.getInscripcionesUsuario(id);

                if (mounted) {
                    setInscripciones(insData?.inscripciones || []);
                }
            } catch (err) {
                console.error("Error cargando perfil:", err);
                if (mounted) setErrorMsg(err.message || "Error cargando datos");
            } finally {
                if (mounted) setLoading(false);
            }
        };

        fetchData();
        return () => { mounted = false; };
    }, [id, navigate]);


    const documentosPendientes = useMemo(() => {
        const docs = [];
        for (const ins of inscripciones || []) {
            for (const d of ins.documentos || []) {
                if (d.estado === "RECHAZADO" || d.estado === "EN_REVISION") {
                    docs.push({
                        curso: ins.curso_nombre,
                        nombre: d.nombre,
                        estado: d.estado,
                    });
                }
            }
        }
        return docs;
    }, [inscripciones]);

    const empresas = useMemo(() => {
        if (usuario && usuario.lugar_trabajo) {
            return [usuario.lugar_trabajo];
        }
        return [];
    }, [usuario]);

    if (loading) {
        return (
            <div className="d-flex justify-content-center align-items-center vh-100">
                <div className="spinner-border text-primary" role="status">
                    <span className="visually-hidden">Cargando...</span>
                </div>
            </div>
        );
    }

    if (errorMsg) {
        return (
            <div className="d-flex justify-content-center align-items-center vh-100">
                <div className="alert alert-danger">
                    {errorMsg}
                    <br />
                    <button className="btn btn-outline-danger mt-2" onClick={() => navigate('/administrador/list-users')}>Volver</button>
                </div>
            </div>
        );
    }

    if (!usuario) return <p className="text-center mt-5">No se encontró el usuario.</p>;

    const renderCursoCard = (inscripcion, index) => {
        const titulo = `Curso ${index + 1}`;

        if (!inscripcion) {
            return (
                <div className="card h-100 border-dashed bg-light">
                    <div className="card-body text-center d-flex flex-column justify-content-center py-4">
                        <i className="bi bi-journal-plus fs-1 text-muted mb-2"></i>
                        <h6 className="card-title text-muted">{titulo}</h6>
                        <p className="card-text small text-muted">No inscrito</p>
                    </div>
                </div>
            );
        }

        return (
            <div className="card h-100 shadow-sm border-0">
                <div className="card-header bg-white border-bottom-0 pt-3">
                    <div className="d-flex justify-content-between align-items-start">
                        <h6 className="fw-bold mb-0 text-primary">{titulo}</h6>
                        <span className="badge bg-light text-dark border">{inscripcion.estado_inscripcion}</span>
                    </div>
                </div>
                <div className="card-body">
                    <h5 className="card-title fw-bold mb-3" style={{ fontSize: '1.1rem' }}>{inscripcion.curso_nombre}</h5>

                    <div className="small text-muted mb-3">
                        <div className="d-flex align-items-center mb-1">
                            <i className="bi bi-laptop me-2"></i>{inscripcion.curso_modalidad || "—"}
                        </div>
                        <div className="d-flex align-items-center mb-1">
                            <i className="bi bi-clock me-2"></i>{inscripcion.curso_horas ? `${inscripcion.curso_horas} hrs` : "—"}
                        </div>
                    </div>

                    <div className="border-top pt-2">
                        <p className="small fw-bold mb-2">Documentos:</p>
                        {(inscripcion.documentos && inscripcion.documentos.length > 0) ? (
                            <ul className="list-unstyled small mb-0">
                                {inscripcion.documentos.map((d, i) => (
                                    <li key={i} className="mb-1 d-flex align-items-center justify-content-between">
                                        <span className="text-truncate" style={{ maxWidth: '150px' }} title={d.nombre}>{d.nombre}</span>
                                        <span className={`badge ${d.estado === 'APROBADO' ? 'bg-success' : d.estado === 'RECHAZADO' ? 'bg-danger' : 'bg-warning text-dark'} bg-opacity-75`} style={{ fontSize: '0.65rem' }}>
                                            {d.estado}
                                        </span>
                                    </li>
                                ))}
                            </ul>
                        ) : (
                            <p className="small text-muted fst-italic mb-0">Sin documentos.</p>
                        )}
                    </div>
                </div>
            </div>
        );
    };

    return (
        <div className="administrador-dashboard">
            <Navbar />

            <div className="main-container">
                <div className="d-flex justify-content-between align-items-center mb-4">
                    <div>
                        <h1 className="page-title">Detalle de Usuario</h1>
                        <p className="page-subtitle">Visualiza la información completa y estado actual.</p>
                    </div>
                    <button className="btn btn-outline-secondary" onClick={() => navigate('/administrador/list-users')}>
                        <i className="bi bi-arrow-left me-2"></i>Volver al Listado
                    </button>
                </div>

                <div className="row g-4">
                    {/* Columna Izquierda: Perfil */}
                    <div className="col-lg-4">
                        <div className="card border-0 shadow-sm h-100">
                            <div className="card-body text-center p-4">
                                <div className="mb-3 position-relative d-inline-block">
                                    <div
                                        className="rounded-circle d-flex align-items-center justify-content-center mx-auto text-white fw-bold fs-2"
                                        style={{
                                            width: '100px',
                                            height: '100px',
                                            background: 'linear-gradient(135deg, var(--primary-color) 0%, var(--primary-dark) 100%)'
                                        }}
                                    >
                                        {(usuario.nombre || 'U').charAt(0).toUpperCase()}
                                    </div>
                                    <span className="position-absolute bottom-0 end-0 p-2 bg-success border border-light rounded-circle">
                                        <span className="visually-hidden">Activo</span>
                                    </span>
                                </div>
                                <h4 className="fw-bold mb-1">{usuario.nombre}</h4>
                                <p className="text-muted mb-3">{usuario.datos_rol?.nombre_rol || 'Usuario'}</p>

                                <div className="text-start mt-4 pt-3 border-top">
                                    <div className="mb-3">
                                        <label className="text-muted small fw-bold d-block">RUT</label>
                                        <span>{usuario.rut}</span>
                                    </div>
                                    <div className="mb-3">
                                        <label className="text-muted small fw-bold d-block">Email</label>
                                        <span className="text-break">{usuario.email}</span>
                                    </div>
                                    <div className="mb-3">
                                        <label className="text-muted small fw-bold d-block">Teléfono</label>
                                        <span>{usuario.telefono || "—"}</span>
                                    </div>
                                    <div className="mb-3">
                                        <label className="text-muted small fw-bold d-block">Domicilio</label>
                                        <span>{usuario.domicilio || "—"}</span>
                                    </div>
                                </div>

                                <div className="d-grid mt-4">
                                    <button className="btn btn-outline-primary" onClick={() => navigate(`/administrador/usuario/editar/${usuario.id_usuario}`)}>
                                        <i className="bi bi-pencil me-2"></i>Editar Perfil
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Columna Derecha: Detalles */}
                    <div className="col-lg-8">
                        {/* Cursos */}
                        <h5 className="mb-3 fw-bold text-secondary">Inscripciones Activas</h5>
                        <div className="row g-3 mb-4">
                            {inscripciones.length > 0 ? (
                                inscripciones.map((inscripcion, index) => (
                                    <div className="col-md-6" key={index}>
                                        {renderCursoCard(inscripcion, index)}
                                    </div>
                                ))
                            ) : (
                                <div className="col-12">
                                    <div className="card h-100 border-dashed bg-light">
                                        <div className="card-body text-center d-flex flex-column justify-content-center py-4">
                                            <i className="bi bi-journal-x fs-1 text-muted mb-2"></i>
                                            <h6 className="card-title text-muted">Sin Inscripciones</h6>
                                            <p className="card-text small text-muted">El usuario no está inscrito en ningún curso.</p>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>

                        <div className="row g-3">
                            {/* Papeles Pendientes */}
                            <div className="col-md-6">
                                <div className="card shadow-sm border-0 h-100">
                                    <div className="card-header bg-white border-bottom-0 pt-3">
                                        <h6 className="fw-bold mb-0 text-danger"><i className="bi bi-exclamation-circle me-2"></i>Papeles Pendientes</h6>
                                    </div>
                                    <div className="card-body">
                                        {documentosPendientes.length === 0 ? (
                                            <p className="text-muted small mb-0">No hay documentos pendientes de revisión.</p>
                                        ) : (
                                            <ul className="list-group list-group-flush small">
                                                {documentosPendientes.map((d, idx) => (
                                                    <li key={idx} className="list-group-item px-0 border-bottom-0 d-flex justify-content-between align-items-start">
                                                        <div>
                                                            <div className="fw-bold">{d.nombre}</div>
                                                            <div className="text-muted" style={{ fontSize: '0.75rem' }}>{d.curso}</div>
                                                        </div>
                                                        <span className="badge bg-warning text-dark">{d.estado}</span>
                                                    </li>
                                                ))}
                                            </ul>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Empresas */}
                            <div className="col-md-6">
                                <div className="card shadow-sm border-0 h-100">
                                    <div className="card-header bg-white border-bottom-0 pt-3">
                                        <h6 className="fw-bold mb-0 text-secondary"><i className="bi bi-building me-2"></i>Empresas Vinculadas</h6>
                                    </div>
                                    <div className="card-body">
                                        {empresas.length === 0 ? (
                                            <p className="text-muted small mb-0">No está vinculado a ninguna empresa.</p>
                                        ) : (
                                            <ul className="list-unstyled mb-0">
                                                {empresas.map((e, idx) => <li key={idx}><i className="bi bi-check2 me-2 text-success"></i>{e}</li>)}
                                            </ul>
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

export default UserDetailPage;