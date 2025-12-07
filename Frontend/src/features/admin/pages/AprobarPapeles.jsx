import React, { useEffect, useState } from "react";
import BotonVolver from '../../../components/common/ButtonBack';
import documentoService from '../../../services/documentoService.jsx'

const AprobarPapeles = () => {
    const [usuarioDetalle, setUsuarioDetalle] = useState({});
    const [documentos, setDocumentos] = useState([]);
    const [rechazoAbierto, setRechazoAbierto] = useState({});
    const [detallesAbiertos, setDetallesAbiertos] = useState({}); 
    const [observaciones, setObservaciones] = useState({});
    useEffect(() => {
        const fetchDocs = async () => {
            try {
                const data = await documentoService.getDocumentos();
                setDocumentos(data);
              console.log(data)
            } catch (error) {
                console.error("Error cargando documentos:", error);
            }
        };

        fetchDocs();
    }, []);

    const handleVerDetalle = async (doc) => {
        const idDoc = doc.id_doc_subido;
        const idUsuario = doc.usuario;

        // Alterna panel de detalles
        setDetallesAbiertos(prev => ({
            ...prev,
            [idDoc]: !prev[idDoc]
        }));

        // No abrir panel de rechazo si solo se presiona detalle
        setRechazoAbierto(prev => ({
            ...prev,
            [idDoc]: false
        }));

        // Si ya tenemos datos del usuario no pedir de nuevo
        if (usuarioDetalle[idDoc]) return;

        try {
            const data = await documentoService.getUsuarioById(idUsuario);
            setUsuarioDetalle(prev => ({
                ...prev,
                [idDoc]: data
            }));
        } catch (error) {
            console.error("Error obteniendo usuario:", error);
        }
    };

    const handleAprobar = async (idDoc) => {
        try {
            await documentoService.aprobarDocumento(idDoc);

            // Actualiza estado local para reflejar aprobación
            setDocumentos(prevDocs =>
                prevDocs.map(doc =>
                    doc.id_doc_subido === idDoc
                        ? { ...doc, estado_revision: "Aprobado" }
                        : doc
                )
            );

            alert("Documento aprobado correctamente");

        } catch (error) {
            console.error(error);
            alert("Error al aprobar documento");
        }
    };
    const handleRechazar = (doc) => {
        const idDoc = doc.id_doc_subido;

        // Abrir panel de rechazo
        setRechazoAbierto(prev => ({
            ...prev,
            [idDoc]: !prev[idDoc]
        }));

        // También abrir el panel de detalles si está cerrado
        setDetallesAbiertos(prev => ({
            ...prev,
            [idDoc]: true
        }));
    };

    const enviarRechazo = async (idDoc) => {
        const observacion = observaciones[idDoc] || "";
        if (!observacion.trim()) {
            alert("Debe escribir una observación para rechazar el documento.");
            return;
        }

    try {
        await documentoService.rechazarDocumento(idDoc, observacion);

        // Actualizamos estado local
        setDocumentos(prevDocs =>
            prevDocs.map(doc =>
                doc.id_doc_subido === idDoc
                    ? { ...doc, estado_revision: "Rechazado" }
                    : doc
            )
        );

        alert("Documento rechazado correctamente");

    } catch (error) {
        console.error(error);
        alert("Error al rechazar documento");
    }
};


    return (
        <div className="container mt-5">
            <BotonVolver />

            <h2 className="text-center mt-4 mb-4">Bandeja de Entrada</h2>

            <div className="card shadow-sm">
                <div className="card-body">

                    {documentos.length === 0 ? (
                        <p className="text-center text-muted">No hay documentos pendientes.</p>
                    ) : (
                        documentos.map((doc, index) => (
                            <div
                                key={doc.id_doc_subido}
                                className={`border-bottom py-3 ${index % 2 === 0 ? 'bg-white' : 'bg-gray-100'}`}
                            >

                                {/* Fila principal */}
                                <div className="d-flex justify-content-between align-items-center">
                                    <div className="d-flex flex-column">
                                        <span><strong>ID documento:</strong> {doc.id_doc_subido}</span>
                                        <span><strong>Solicitud:</strong> {doc.tipo_documento_nombre}</span>
                                        <span><strong>Estado:</strong> {doc.estado_revision}</span>
                                    </div>

                                    <div className="d-flex gap-2">
                                        <button
                                            className="btn btn-info btn-sm"
                                            onClick={() => handleVerDetalle(doc)}
                                        >
                                            {detallesAbiertos[doc.id_doc_subido] ? "Ocultar" : "Ver detalle"}
                                        </button>

                                        <button
                                            className="btn btn-success btn-sm"
                                            onClick={() => handleAprobar(doc.id_doc_subido)}
                                        >
                                            Aprobar
                                        </button>

                                        <button
                                            className="btn btn-danger btn-sm"
                                            onClick={() => handleRechazar(doc)}
                                        >
                                            Rechazar
                                        </button>
                                    </div>
                                </div>

                                {/* Detalles */}
                                {detallesAbiertos[doc.id_doc_subido] && (
                                    <div className="mt-3 p-3 bg-light rounded">
                                        <h5>📌 Información del Usuario</h5>
                                        {usuarioDetalle[doc.id_doc_subido] ? (
                                            <>
                                                <p><strong>RUT:</strong> {usuarioDetalle[doc.id_doc_subido].rut}</p>
                                                <p><strong>Nombre:</strong> {usuarioDetalle[doc.id_doc_subido].nombre} {usuarioDetalle[doc.id_doc_subido].last_name}</p>
                                                <p><strong>Email:</strong> {usuarioDetalle[doc.id_doc_subido].email}</p>
                                            </>
                                        ) : (
                                            <p>Cargando datos del usuario...</p>
                                        )}

                                        <h5 className="mt-3">📄 Datos del Documento</h5>
                                        {doc.observaciones_rechazo && (
                                            <p><strong>Observaciones:</strong> {doc.observaciones_rechazo}</p>
                                        )}
                                        <p>
                                            <strong>Documento:</strong>{" "}
                                            {doc.url_archivo ? (
                                                <a
                                                    href={doc.url_archivo}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                >
                                                    Abrir documento
                                                </a>
                                            ) : (
                                                "No disponible"
                                            )}
                                        </p>

                                        {doc.archivo && (
                                            <p>
                                                <strong>Archivo:</strong>{" "}
                                                <a href={doc.archivo} target="_blank" rel="noopener noreferrer">
                                                    Ver documento
                                                </a>
                                            </p>
                                        )}

                                        {/* Textarea para rechazo solo si se presionó Rechazar */}
                                        {rechazoAbierto[doc.id_doc_subido] && (
                                            <div className="mt-2">
                                                <textarea
                                                    className="form-control mb-2"
                                                    placeholder="Ingrese observación de rechazo..."
                                                    value={observaciones[doc.id_doc_subido] || ""}
                                                    onChange={(e) =>
                                                        setObservaciones(prev => ({
                                                            ...prev,
                                                            [doc.id_doc_subido]: e.target.value
                                                        }))
                                                    }
                                                />
                                                <button
                                                    className="btn btn-warning btn-sm"
                                                    onClick={() => enviarRechazo(doc.id_doc_subido)}
                                                >
                                                    Enviar Rechazo
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                )}

                            </div>
                        ))
                    )}

                </div>
            </div>
        </div>
    );
};

export default AprobarPapeles;
