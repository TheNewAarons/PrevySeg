import React, { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap-icons/font/bootstrap-icons.css";

import courseService from "../../../services/courseService";
import documentoService from "../../../services/documentoService";
import authService from "../../../services/authService";

const DetalleInscripcion = () => {
    const { id } = useParams(); // curso_id
    const navigate = useNavigate();

    const [loading, setLoading] = useState(true);
    const [subiendoIdTipo, setSubiendoIdTipo] = useState(null); // para bloquear solo una fila
    const [finalizando, setFinalizando] = useState(false);
    const [error, setError] = useState("");

    const [detalle, setDetalle] = useState(null);
    const [docsSubidos, setDocsSubidos] = useState([]);

    // selección de archivos por tipo
    const [filesByTipo, setFilesByTipo] = useState({});

    const handleAuthExpired = () => {
        alert("Tu sesión ha expirado. Por favor inicia sesión nuevamente.");
        authService.logout();
        navigate("/login");
    };

    const cargar = async () => {
        try {
            setLoading(true);
            setError("");

            // 1) Detalle inscripción (debe traer curso + documentos requeridos + resumen/puede_inscribirse si ya lo armaste)
            const det = await courseService.getInscripcionDetalle(id);
            setDetalle(det);

            // 2) Documentos subidos por curso (endpoint GET /api/cursos/<id>/documentos/)
            const docs = await documentoService.getDocumentosCurso(id);
            setDocsSubidos(Array.isArray(docs) ? docs : []);
        } catch (err) {
            console.error("Error cargando detalle inscripción:", err);
            const msg = String(err?.message || "");
            if (err?.status === 401 || msg.includes("token_not_valid") || msg.includes("expir")) {
                handleAuthExpired();
                return;
            }
            setError(err?.message || "Error cargando detalle de inscripción.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        cargar();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [id]);

    // ---- Helpers de datos
    const curso = detalle?.curso || detalle; // por si tu backend devuelve {curso: {...}} o directo
    const requeridos = useMemo(() => {
        // tu CursoDetailSerializer usa documentos_requeridos como lista [{id_tipo_doc, nombre}]
        return curso?.documentos_requeridos || detalle?.documentos_requeridos || [];
    }, [curso, detalle]);

    const mapSubidosPorTipo = useMemo(() => {
        // en tu serializer DocumentoSubidoSerializer: tipo_documento (id) + estado_revision + observaciones_rechazo + url_archivo
        const map = {};
        for (const d of docsSubidos) {
        const tipoId = d?.tipo_documento; // viene como id
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
        //si el backend regresa un booleano se usa, si no, aplica regla local
        if (typeof detalle?.puede_inscribirse === "boolean") return detalle.puede_inscribirse;
        return allApproved; // mínimo: todos aprobados
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

            // En tu view: tipo_documento y archivo, + contexto="inscripcion"
            await documentoService.subirDocumentoCurso(id, tipoId, file, "inscripcion");

            limpiarFile(tipoId);
            await cargar(); // refrescar estados
        } catch (err) {
            console.error("Error subiendo documento:", err);
            const msg = String(err?.message || "");
            if (err?.status === 401 || msg.includes("token_not_valid") || msg.includes("expir")) {
                handleAuthExpired();
                return;
            }
            alert(err?.message || "Error al subir documento.");
        } finally {
            setSubiendoIdTipo(null);
        }
    };

    const finalizar = async () => {
        try {
            setFinalizando(true);
            setError("");

            // Esto NO debe llamarse desde dashboard. Solo desde aquí.
            const res = await courseService.finalizarInscripcion(id);

            alert(res?.mensaje || "Inscripción finalizada");
            navigate("/cliente/mis-inscripciones"); // ajusta a tu ruta
        } catch (err) {
            console.error("Error finalizando inscripción:", err);
            const msg = String(err?.message || "");
        if (err?.status === 401 || msg.includes("token_not_valid") || msg.includes("expir")) {
                handleAuthExpired();
                return;
        }
            alert(err?.message || "No se pudo finalizar la inscripción.");
        } finally {
            setFinalizando(false);
        }
    };

    // ---- UI
    if (loading) {
        return (
            <div className="container py-5 text-center">
                <div className="spinner-border" role="status" />
                <p className="mt-3">Cargando detalle...</p>
            </div>
            );
    }

    if (error) {
        return (
            <div className="container py-4">
                <div className="alert alert-danger">
                <i className="bi bi-exclamation-triangle me-2"></i>
                {error}
                </div>
                <button className="btn btn-secondary" onClick={() => navigate(-1)}>
                Volver
                </button>
            </div>
        );
    }

    return (
        <div className="container py-4">
            <div className="d-flex justify-content-between align-items-center mb-3">
                <div>
                <h2 className="mb-0">{curso?.nombre || "Curso"}</h2>
                <small className="text-muted">
                    Profesor: {curso?.profesor || "—"} · Modalidad: {curso?.modalidad || "—"}
                </small>
                </div>
                <button className="btn btn-outline-secondary" onClick={() => navigate(-1)}>
                <i className="bi bi-arrow-left me-2"></i>Volver
                </button>
            </div>

            {/* Resumen curso */}
            <div className="card shadow-sm mb-3">
                <div className="card-body">
                    <div className="row g-3">
                        <div className="col-md-4">
                        <strong>Valor:</strong> {curso?.valor != null ? `$${curso.valor}` : "—"}
                        </div>
                        <div className="col-md-4">
                        <strong>Fecha inicio:</strong> {curso?.fecha_inicio || "—"}
                        </div>
                        <div className="col-md-4">
                        <strong>Cupos:</strong> {curso?.cupos_disponibles != null ? curso.cupos_disponibles : "—"}
                        </div>
                    </div>
                </div>
            </div>

            {/* Documentos */}
            <div className="card shadow-sm">
                <div className="card-header">
                    <strong>Documentos requeridos</strong>
                    <div className="text-muted small">
                        Sube tus documentos → quedan <b>EN_REVISION</b> → si el admin rechaza, podrás reemplazar → cuando estén todos <b>APROBADOS</b>, podrás finalizar.
                    </div>
                </div>

                <div className="card-body">
                {requeridos.length === 0 ? (
                    <div className="alert alert-info mb-0">
                    Este curso no tiene documentos requeridos configurados.
                    </div>
                ) : (
                    <div className="table-responsive">
                        <table className="table align-middle">
                            <thead>
                            <tr>
                                <th>Documento</th>
                                <th>Estado</th>
                                <th>Motivo rechazo</th>
                                <th>Archivo</th>
                                <th style={{ minWidth: 340 }}>Acción</th>
                            </tr>
                            </thead>
                            <tbody>
                            {requeridos.map((t) => {
                                const doc = mapSubidosPorTipo[t.id_tipo_doc];
                                const estado = doc?.estado_revision || "NO_SUBIDO";

                                // Bloqueos:
                                const bloqueado =
                                estado === "EN_REVISION" || estado === "APROBADO";

                                const puedeReemplazar = estado === "RECHAZADO" || estado === "NO_SUBIDO";

                                return (
                                <tr key={t.id_tipo_doc}>
                                    <td>{t.nombre}</td>

                                    <td>
                                    {estado === "NO_SUBIDO" && <span className="badge bg-secondary">Faltante</span>}
                                    {estado === "EN_REVISION" && <span className="badge bg-warning text-dark">En revisión</span>}
                                    {estado === "APROBADO" && <span className="badge bg-success">Aprobado</span>}
                                    {estado === "RECHAZADO" && <span className="badge bg-danger">Rechazado</span>}
                                    </td>

                                    <td>
                                    {estado === "RECHAZADO" ? (
                                        <span className="text-danger small">
                                        {doc?.observaciones_rechazo || "Sin observación."}
                                        </span>
                                    ) : (
                                        <span className="text-muted">—</span>
                                    )}
                                    </td>

                                    <td>
                                    {doc?.url_archivo ? (
                                        <a href={doc.url_archivo} target="_blank" rel="noreferrer">
                                        Ver archivo
                                        </a>
                                    ) : (
                                        <span className="text-muted">—</span>
                                    )}
                                    </td>

                                    <td>
                                    {/* Mensaje si bloqueado */}
                                    {bloqueado && (
                                        <div className="small text-muted mb-2">
                                        {estado === "EN_REVISION"
                                            ? "Documento en revisión: no puedes cambiarlo hasta que el admin lo apruebe o rechace."
                                            : "Documento aprobado: no requiere cambios."}
                                        </div>
                                    )}

                                    {/* Selección + Botón subir SOLO si puede reemplazar */}
                                    {puedeReemplazar && (
                                        <>
                                        <input
                                            type="file"
                                            className="form-control form-control-sm mb-2"
                                            disabled={subiendoIdTipo === t.id_tipo_doc}
                                            onChange={(e) => pickFile(t.id_tipo_doc, e.target.files?.[0] || null)}
                                        />

                                        <div className="d-flex gap-2">
                                            <button
                                            className="btn btn-primary btn-sm"
                                            disabled={
                                                subiendoIdTipo === t.id_tipo_doc || !filesByTipo[t.id_tipo_doc]
                                            }
                                            onClick={() => uploadOne(t.id_tipo_doc)}
                                            >
                                            {subiendoIdTipo === t.id_tipo_doc ? "Subiendo..." : doc ? "Reemplazar" : "Subir"}
                                            </button>

                                            <button
                                            className="btn btn-outline-secondary btn-sm"
                                            disabled={subiendoIdTipo === t.id_tipo_doc}
                                            onClick={() => limpiarFile(t.id_tipo_doc)}
                                            >
                                            Limpiar
                                            </button>
                                        </div>
                                        </>
                                    )}
                                    </td>
                                </tr>
                                );
                            })}
                            </tbody>
                        </table>
                    </div>
                )}

                <hr />

                <div className="d-flex justify-content-between align-items-center">
                    <div className="small text-muted">
                    {requeridos.length > 0 && (
                        <>
                        Aprobados:{" "}
                        <strong>
                            {requeridos.filter((t) => mapSubidosPorTipo[t.id_tipo_doc]?.estado_revision === "APROBADO").length}
                        </strong>{" "}
                        / {requeridos.length}
                        </>
                    )}
                    </div>

                    <button
                    className="btn btn-success"
                    disabled={!puedeFinalizar || finalizando}
                    onClick={finalizar}
                    title={!puedeFinalizar ? "Aún faltan documentos aprobados." : ""}
                    >
                    <i className="bi bi-check2-circle me-2"></i>
                    {finalizando ? "Finalizando..." : "Finalizar inscripción"}
                    </button>
                </div>

                {!puedeFinalizar && (
                    <div className="alert alert-warning mt-3 mb-0">
                    Aún no puedes finalizar: faltan documentos <b>aprobados</b>.
                    </div>
                )}
                </div>
            </div>
        </div>
    );
};

export default DetalleInscripcion;