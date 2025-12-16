import React, { useEffect, useState } from "react";
import documentoService from "../../../services/documentoService.jsx";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../../services/authContext.jsx";
import authService from '../../../services/authService';
import '../styles/AdminDashboard.css';
import Navbar from '../../../components/layout/Navbar';

const AprobarPapeles = () => {
    const [usuarioDetalle, setUsuarioDetalle] = useState({});
    const [documentos, setDocumentos] = useState([]);
    const [rechazoAbierto, setRechazoAbierto] = useState({});
    const [detallesAbiertos, setDetallesAbiertos] = useState({});
    const [observaciones, setObservaciones] = useState({});

    const navigate = useNavigate();
    const { user, logout: authLogout } = useAuth();
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (!user) {
            navigate('/login');
            return;
        }
    }, [user, navigate]);

    const fetchDocumentos = async () => {
        if (!user) return;

        try {
            setLoading(true);
            setError(null);
            const data = await documentoService.getDocumentosPendientes();
            setDocumentos(data);
        } catch (error) {
            console.error("Error cargando documentos pendientes:", error);
            setError(error.message);

            if (error.message === 'NO_TOKEN' || error.status === 401) {
                authLogout();
                navigate('/login');
            }
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchDocumentos();
    }, []); // Run once on mount (user check is handled in other effect)

    const handleVerDetalle = async (doc) => {
        const idDoc = doc.id_doc_subido;
        const idUsuario = doc.usuario;

        setDetallesAbiertos((prev) => ({
            ...prev,
            [idDoc]: !prev[idDoc],
        }));

        // Si se cierra, cerrar también rechazo
        if (detallesAbiertos[idDoc]) {
            setRechazoAbierto((prev) => ({
                ...prev,
                [idDoc]: false,
            }));
        }

        if (usuarioDetalle[idDoc]) return;

        try {
            const data = await documentoService.getUsuarioById(idUsuario);
            setUsuarioDetalle((prev) => ({
                ...prev,
                [idDoc]: data,
            }));
        } catch (error) {
            console.error("Error obteniendo usuario:", error);
        }
    };

    const handleAprobar = async (idDoc) => {
        if (!user) return;

        if (window.confirm("¿Está seguro de aprobar este documento?")) {
            try {
                await documentoService.aprobarDocumento(idDoc);

                setDocumentos((prevDocs) =>
                    prevDocs.filter((doc) => doc.id_doc_subido !== idDoc)
                );

                alert("Documento aprobado correctamente");
                // fetchDocumentos(); // Optional: refresh list
            } catch (error) {
                console.error(error);
                alert("Error al aprobar documento");
            }
        }
    };

    const handleRechazarToggle = (doc) => {
        const idDoc = doc.id_doc_subido;

        setRechazoAbierto((prev) => ({
            ...prev,
            [idDoc]: !prev[idDoc],
        }));

        // Asegurar que detalles estén abiertos
        if (!detallesAbiertos[idDoc]) {
            handleVerDetalle(doc);
        }
    };

    const enviarRechazo = async (idDoc) => {
        const observacion = observaciones[idDoc] || "";
        if (!observacion.trim()) {
            alert("Debe escribir una observación para rechazar el documento.");
            return;
        }

        try {
            await documentoService.rechazarDocumento(idDoc, observacion);

            setDocumentos((prevDocs) =>
                prevDocs.filter((doc) => doc.id_doc_subido !== idDoc)
            );

            alert("Documento rechazado correctamente");
            // fetchDocumentos(); // Optional
        } catch (error) {
            console.error(error);
            alert("Error al rechazar documento");
        }
    };

    // --- Filtros y Agrupación ---
    const [searchTerm, setSearchTerm] = useState("");

    const filteredDocuments = documentos.filter(doc => {
        const term = searchTerm.toLowerCase();
        const userName = (doc.usuario_nombre || "").toLowerCase();
        const docType = (doc.tipo_documento_nombre || "").toLowerCase();
        const courseName = (doc.curso_nombre || "").toLowerCase();

        return userName.includes(term) || docType.includes(term) || courseName.includes(term);
    });

    const groupedDocuments = filteredDocuments.reduce((groups, doc) => {
        const userId = doc.usuario;
        if (!groups[userId]) {
            groups[userId] = [];
        }
        groups[userId].push(doc);
        return groups;
    }, {});

    if (loading && documentos.length === 0) {
        return (
            <div className="d-flex justify-content-center align-items-center vh-100">
                <div className="spinner-border text-primary" role="status">
                    <span className="visually-hidden">Cargando...</span>
                </div>
            </div>
        );
    }

    return (
        <div className="administrador-dashboard">
            <Navbar />

            <div className="main-container">
                <div className="d-flex justify-content-between align-items-center mb-4">
                    <div>
                        <h1 className="page-title">Aprobar Documentos</h1>
                        <p className="page-subtitle">Revisa y gestiona los documentos pendientes de aprobación.</p>
                    </div>
                    <button className="btn btn-outline-secondary" onClick={() => navigate('/administrador/dashboard')}>
                        <i className="bi bi-arrow-left me-2"></i>Volver al Panel
                    </button>
                </div>

                {/* Buscador */}
                <div className="card shadow-sm border-0 mb-4">
                    <div className="card-body">
                        <div className="input-group">
                            <span className="input-group-text bg-white border-end-0"><i className="bi bi-search text-muted"></i></span>
                            <input
                                type="text"
                                className="form-control border-start-0 ps-0"
                                placeholder="Buscar por nombre de usuario o tipo de documento..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                    </div>
                </div>

                <div className="row g-4">
                    {Object.keys(groupedDocuments).length === 0 ? (
                        <div className="col-12">
                            <div className="alert alert-info text-center p-5 shadow-sm border-0 bg-white" role="alert">
                                <i className="bi bi-check-circle fs-1 text-success mb-3 d-block"></i>
                                <h4 className="alert-heading fw-bold">¡Todo al día!</h4>
                                <p className="mb-0 text-muted">No se encontraron documentos pendientes con los filtros actuales.</p>
                            </div>
                        </div>
                    ) : (
                        Object.entries(groupedDocuments).map(([userId, userDocs]) => (
                            <div key={userId} className="col-12">
                                <div className="card border-0 shadow-sm mb-3">
                                    <div className="card-header bg-white border-bottom py-3">
                                        <div className="d-flex align-items-center">
                                            <div className="rounded-circle bg-secondary text-white d-flex align-items-center justify-content-center me-3" style={{ width: '40px', height: '40px' }}>
                                                <i className="bi bi-person-fill"></i>
                                            </div>
                                            <div>
                                                <h5 className="mb-0 fw-bold text-dark">{userDocs[0].usuario_nombre || 'Usuario Desconocido'}</h5>
                                                <small className="text-muted">{userDocs.length} documento(s) pendiente(s)</small>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="card-body bg-light">
                                        <div className="row g-3 align-items-start">
                                            {userDocs.map((doc) => (
                                                <div key={doc.id_doc_subido} className="col-md-6 col-xl-4">
                                                    <div className={`card shadow-sm border-0 document-card ${detallesAbiertos[doc.id_doc_subido] ? 'ring-2 ring-secondary' : ''}`}>
                                                        <div className="card-body p-3">
                                                            <div className="d-flex justify-content-between align-items-start mb-2">
                                                                <div>
                                                                    <div className="d-flex align-items-center gap-2 mb-1">
                                                                        <span className="badge bg-warning bg-opacity-10 text-warning border border-warning rounded-pill px-2 py-1" style={{ fontSize: '0.7rem' }}>
                                                                            <i className="bi bi-clock me-1"></i>Pendiente
                                                                        </span>
                                                                        <small className="text-muted" style={{ fontSize: '0.75rem' }}>ID: {doc.id_doc_subido}</small>
                                                                    </div>
                                                                    <h6 className="card-title fw-bold mb-0 text-dark">{doc.tipo_documento_nombre || "Documento sin Nombre"}</h6>
                                                                    <small className="text-secondary">Curso: {doc.curso_nombre || 'General'}</small>
                                                                </div>

                                                            </div>

                                                            <div className="d-flex gap-2 mt-3">

                                                                <button
                                                                    className="btn btn-approve-custom btn-sm flex-grow-1 shadow-sm"
                                                                    onClick={() => handleAprobar(doc.id_doc_subido)}
                                                                >
                                                                    <i className="bi bi-check-lg me-1"></i>Aprobar
                                                                </button>
                                                                <button
                                                                    className="btn btn-outline-danger btn-sm flex-grow-1"
                                                                    onClick={() => handleRechazarToggle(doc)}
                                                                >
                                                                    <i className="bi bi-x-lg me-1"></i>Rechazar
                                                                </button>
                                                                <button
                                                                    className="btn btn-light border btn-sm"
                                                                    onClick={() => handleVerDetalle(doc)}
                                                                    title="Ver Detalles"
                                                                >
                                                                    <i className="bi bi-eye"></i>
                                                                </button>
                                                            </div>

                                                            {detallesAbiertos[doc.id_doc_subido] && (
                                                                <div className="mt-3 pt-2 border-top fade-in">
                                                                    <div className="row g-2">
                                                                        <div className="col-12">
                                                                            <h6 className="fw-bold text-secondary text-uppercase mb-2" style={{ fontSize: '0.7rem' }}>Información del Usuario</h6>
                                                                            {usuarioDetalle[doc.id_doc_subido] ? (
                                                                                <div className="bg-light p-2 rounded border d-flex justify-content-between align-items-center" style={{ fontSize: '0.8rem' }}>
                                                                                    <div>
                                                                                        <div className="fw-bold">{usuarioDetalle[doc.id_doc_subido].nombre}</div>
                                                                                        <div className="text-muted">{usuarioDetalle[doc.id_doc_subido].rut}</div>
                                                                                    </div>
                                                                                    <div className="text-muted small">{usuarioDetalle[doc.id_doc_subido].email}</div>
                                                                                </div>
                                                                            ) : (
                                                                                <div className="d-flex align-items-center small text-muted">
                                                                                    <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                                                                                    Cargando...
                                                                                </div>
                                                                            )}
                                                                        </div>
                                                                        <div className="col-12 mt-2">
                                                                            {doc.url_archivo ? (
                                                                                <a
                                                                                    href={doc.url_archivo}
                                                                                    target="_blank"
                                                                                    rel="noopener noreferrer"
                                                                                    className="btn btn-outline-secondary btn-sm w-100 d-flex align-items-center justify-content-center gap-2"
                                                                                >
                                                                                    <i className="bi bi-file-earmark-pdf text-danger"></i>
                                                                                    Ver Documento Completo
                                                                                </a>
                                                                            ) : (
                                                                                <span className="text-muted small">No disponible</span>
                                                                            )}
                                                                        </div>
                                                                    </div>

                                                                    {rechazoAbierto[doc.id_doc_subido] && (
                                                                        <div className="mt-3 bg-light p-2 rounded border">
                                                                            <label className="form-label small fw-bold text-danger mb-1">Motivo del Rechazo:</label>
                                                                            <textarea
                                                                                className="form-control form-control-sm mb-2"
                                                                                rows="2"
                                                                                placeholder="Escriba la razón..."
                                                                                value={observaciones[doc.id_doc_subido] || ""}
                                                                                onChange={(e) => setObservaciones(prev => ({ ...prev, [doc.id_doc_subido]: e.target.value }))}
                                                                            ></textarea>
                                                                            <div className="d-grid">
                                                                                <button className="btn btn-danger btn-sm" onClick={() => enviarRechazo(doc.id_doc_subido)}>Confirmar Rechazo</button>
                                                                            </div>
                                                                        </div>
                                                                    )}
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
};

export default AprobarPapeles;
