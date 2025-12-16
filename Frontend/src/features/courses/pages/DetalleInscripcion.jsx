import React, { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap-icons/font/bootstrap-icons.css";

import courseService from "../../../services/courseService";
import documentoService from "../../../services/documentoService";
import { useAuth } from "../../../services/authContext"; // Switched to context
import '../../client/styles/ClienteDashboard.css'; // Import premium styles

const DetalleInscripcion = () => {
    const { id } = useParams(); // curso_id
    const navigate = useNavigate();
    const { user, logout } = useAuth(); // Use context for navbar

    const [loading, setLoading] = useState(true);
    const [subiendoIdTipo, setSubiendoIdTipo] = useState(null);
    const [finalizando, setFinalizando] = useState(false);
    const [error, setError] = useState("");

    const [detalle, setDetalle] = useState(null);
    const [docsSubidos, setDocsSubidos] = useState([]);
    const [filesByTipo, setFilesByTipo] = useState({});

    const handleLogout = () => {
        if (window.confirm("¿Estás seguro que deseas cerrar sesión?")) {
            logout();
        }
    };

    const cargar = async () => {
        if (!user) return;
        try {
            setLoading(true);
            setError("");
            const det = await courseService.getInscripcionDetalle(id);
            setDetalle(det);
            const docs = await documentoService.getDocumentosCurso(id);
            setDocsSubidos(Array.isArray(docs) ? docs : []);
        } catch (err) {
            console.error("Error cargando detalle inscripción:", err);
            const msg = String(err?.message || "");
            if (err?.status === 401 || msg.includes("token_not_valid") || msg.includes("expir")) {
                // Auth context handles logout usually, but we can force it
                logout();
            }
            setError(err?.message || "Error cargando detalle de inscripción.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (!user) {
            navigate("/login");
            return;
        }
        cargar();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [id, user]);

    const curso = detalle?.curso || detalle;
    const requeridos = useMemo(() => {
        return curso?.documentos_requeridos || detalle?.documentos_requeridos || [];
    }, [curso, detalle]);

    const mapSubidosPorTipo = useMemo(() => {
        const map = {};
        for (const d of docsSubidos) {
            const tipoId = d?.tipo_documento;
            if (tipoId != null) map[tipoId] = d;
        }
        return map;
    }, [docsSubidos]);

    const allApproved = useMemo(() => {
        if (!requeridos?.length) return true;
        return requeridos.every((t) => {
            const doc = mapSubidosPorTipo[t.id_tipo_doc];
            return doc && doc.estado_revision === "APROBADO";
        });
    }, [requeridos, mapSubidosPorTipo]);

    const puedeFinalizar = useMemo(() => {
        if (typeof detalle?.puede_inscribirse === "boolean") return detalle.puede_inscribirse;
        return allApproved;
    }, [detalle, allApproved]);

    const pickFile = (tipoId, file) => {
        setFilesByTipo((prev) => ({ ...prev, [tipoId]: file }));
    };

    const limpiarFile = (tipoId) => {
        setFilesByTipo((prev) => {
            const copy = { ...prev };
            delete copy[tipoId];
            return copy;
        });
    };

    const uploadOne = async (tipoId) => {
        const file = filesByTipo[tipoId];
        if (!file) {
            alert("Selecciona un archivo antes de subir.");
            return;
        }

        try {
            setSubiendoIdTipo(tipoId);
            setError("");
            await documentoService.subirDocumentoCurso(id, tipoId, file, "inscripcion");
            limpiarFile(tipoId);
            await cargar();
        } catch (err) {
            console.error("Error subiendo documento:", err);
            alert(err?.message || "Error al subir documento.");
        } finally {
            setSubiendoIdTipo(null);
        }
    };

    const finalizar = async () => {
        try {
            setFinalizando(true);
            setError("");
            const res = await courseService.finalizarInscripcion(id);
            alert(res?.mensaje || "Inscripción finalizada");
            navigate("/cliente/cursos/mis-inscripciones");
        } catch (err) {
            console.error("Error finalizando inscripción:", err);
            alert(err?.message || "No se pudo finalizar la inscripción.");
        } finally {
            setFinalizando(false);
        }
    };

    if (loading && !detalle) {
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

            <div className="container mt-4 pb-5">
                <div className="d-flex flex-column flex-md-row justify-content-between align-items-center mb-5 animate-fade-in">
                    <div>
                        <h1 className="page-title">Finalizar Inscripción</h1>
                        <p className="page-subtitle">Sube tus documentos para completar el proceso.</p>
                    </div>
                    <button className="btn btn-outline-secondary" onClick={() => navigate(-1)}>
                        <i className="bi bi-arrow-left me-2"></i>Volver
                    </button>
                </div>

                {error && (
                    <div className="alert alert-danger mb-4 shadow-sm border-0">
                        <i className="bi bi-exclamation-triangle me-2"></i> {error}
                    </div>
                )}

                {/* Resumen del Curso */}
                <div className="bg-white p-4 rounded-3 shadow-sm mb-5 animate-slide-up" style={{ border: '1px solid rgba(0,0,0,0.05)' }}>
                    <div className="row align-items-center g-4">
                        <div className="col-md-8">
                            <h4 className="fw-bold text-dark mb-1">{curso?.nombre || "Nombre del Curso"}</h4>
                            <p className="text-muted mb-3">
                                <i className="bi bi-person-video3 me-2"></i>Profesor: {curso?.profesor || "PrevySeg"}
                                <span className="mx-2">|</span>
                                <i className="bi bi-laptop me-2"></i>{curso?.modalidad || "Mixto"}
                            </p>
                            <div className="d-flex gap-4">
                                <div>
                                    <small className="d-block text-muted fw-bold" style={{ fontSize: '0.75rem' }}>INICIO</small>
                                    <span className="fw-semibold">{curso?.fecha_inicio || "Por definir"}</span>
                                </div>
                                <div>
                                    <small className="d-block text-muted fw-bold" style={{ fontSize: '0.75rem' }}>CUPOS</small>
                                    <span className="fw-semibold">{curso?.cupos_disponibles ?? "—"}</span>
                                </div>
                                <div className="d-flex flex-column">
                                    <small className="d-block text-muted fw-bold" style={{ fontSize: '0.75rem' }}>COSTO</small>
                                    <span className="text-success fw-bold">{curso?.valor != null ? `$${parseInt(curso.valor).toLocaleString('es-CL')}` : "Gratis"}</span>
                                </div>
                            </div>
                        </div>
                        <div className="col-md-4 text-center text-md-end">
                            <div className="p-3 bg-light rounded-3 d-inline-block text-start" style={{ minWidth: '200px' }}>
                                <small className="text-muted d-block mb-2">Estado de inscripción</small>
                                {puedeFinalizar ?
                                    <span className="badge bg-success w-100 py-2">Listo para finalizar</span> :
                                    <span className="badge bg-warning text-dark w-100 py-2">Documentos pendientes</span>
                                }
                            </div>
                        </div>
                    </div>
                </div>

                {/* Sección de Documentos */}
                <div className="bg-white rounded-3 shadow-sm animate-slide-up" style={{ animationDelay: '0.1s' }}>
                    <div className="p-4 border-bottom">
                        <h5 className="fw-bold mb-1" style={{ color: 'var(--prevy-navy)' }}>Documentación Requerida</h5>
                        <p className="text-muted small mb-0">
                            Sube los archivos solicitados. Una vez aprobados por la administración, podrás confirmar tu inscripción.
                        </p>
                    </div>

                    <div className="p-4">
                        {requeridos.length === 0 ? (
                            <div className="alert alert-info border-0 bg-info bg-opacity-10 text-info">
                                <i className="bi bi-info-circle me-2"></i>
                                Este curso no requiere subir documentos adicionales. ¡Puedes finalizar tu inscripción ahora!
                            </div>
                        ) : (
                            <div className="table-responsive">
                                <table className="table table-hover align-middle">
                                    <thead className="bg-light text-muted small text-uppercase">
                                        <tr>
                                            <th className="border-0 ps-3 py-3">Documento</th>
                                            <th className="border-0 py-3">Estado</th>
                                            <th className="border-0 py-3">Archivo</th>
                                            <th className="border-0 py-3 text-end pe-3">Acciones</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {requeridos.map((t) => {
                                            const doc = mapSubidosPorTipo[t.id_tipo_doc];
                                            const estado = doc?.estado_revision || "NO_SUBIDO";
                                            const bloqueado = estado === "EN_REVISION" || estado === "APROBADO";
                                            const puedeReemplazar = estado === "RECHAZADO" || estado === "NO_SUBIDO";

                                            return (
                                                <tr key={t.id_tipo_doc}>
                                                    <td className="ps-3 fw-medium text-dark">{t.nombre}</td>
                                                    <td>
                                                        {estado === "NO_SUBIDO" && <span className="badge bg-light text-secondary border">Pendiente</span>}
                                                        {estado === "EN_REVISION" && <span className="badge bg-warning bg-opacity-10 text-warning border border-warning">En revisión</span>}
                                                        {estado === "APROBADO" && <span className="badge bg-success bg-opacity-10 text-success border border-success">Aprobado</span>}
                                                        {estado === "RECHAZADO" && (
                                                            <div>
                                                                <span className="badge bg-danger bg-opacity-10 text-danger border border-danger mb-1">Rechazado</span>
                                                                {doc?.observaciones_rechazo && (
                                                                    <div className="text-danger small fst-italic" style={{ fontSize: '0.75rem' }}>
                                                                        "{doc.observaciones_rechazo}"
                                                                    </div>
                                                                )}
                                                            </div>
                                                        )}
                                                    </td>
                                                    <td>
                                                        {doc?.url_archivo ? (
                                                            <a href={doc.url_archivo} target="_blank" rel="noreferrer" className="text-decoration-none small fw-bold text-primary">
                                                                <i className="bi bi-file-earmark-pdf me-1"></i>Ver archivo
                                                            </a>
                                                        ) : (
                                                            <span className="text-muted small">—</span>
                                                        )}
                                                    </td>
                                                    <td className="text-end pe-3">
                                                        {puedeReemplazar && (
                                                            <div className="d-flex justify-content-end align-items-center gap-2">
                                                                <input
                                                                    type="file"
                                                                    className="form-control form-control-sm"
                                                                    style={{ maxWidth: '200px' }}
                                                                    disabled={subiendoIdTipo === t.id_tipo_doc}
                                                                    onChange={(e) => pickFile(t.id_tipo_doc, e.target.files?.[0] || null)}
                                                                />
                                                                <button
                                                                    className="btn btn-inscribirse btn-sm py-1 px-3"
                                                                    style={{ width: 'auto', fontSize: '0.85rem' }}
                                                                    disabled={subiendoIdTipo === t.id_tipo_doc || !filesByTipo[t.id_tipo_doc]}
                                                                    onClick={() => uploadOne(t.id_tipo_doc)}
                                                                >
                                                                    {subiendoIdTipo === t.id_tipo_doc ? "..." : <i className="bi bi-upload"></i>}
                                                                </button>
                                                            </div>
                                                        )}
                                                        {bloqueado && (
                                                            <span className="text-muted small fst-italic">
                                                                {estado === "APROBADO" ? <i className="bi bi-check-circle-fill text-success"></i> : "Esperando revisión..."}
                                                            </span>
                                                        )}
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>

                    <div className="p-4 bg-light border-top d-flex justify-content-between align-items-center rounded-bottom-3">
                        <div className="d-none d-md-block text-muted small">
                            {requeridos.length > 0 && (
                                <span>
                                    <i className="bi bi-check-all me-1"></i>
                                    Has completado {requeridos.filter((t) => mapSubidosPorTipo[t.id_tipo_doc]?.estado_revision === "APROBADO").length} de {requeridos.length} requisitos.
                                </span>
                            )}
                        </div>
                        <button
                            className={`btn btn-lg px-5 ${puedeFinalizar ? 'btn-inscribirse' : 'btn-secondary disabled'}`}
                            disabled={!puedeFinalizar || finalizando}
                            onClick={finalizar}
                        >
                            {finalizando ? (
                                <span><span className="spinner-border spinner-border-sm me-2"></span>Procesando...</span>
                            ) : (
                                <span>Finalizar e Inscribirse <i className="bi bi-arrow-right ms-2"></i></span>
                            )}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DetalleInscripcion;