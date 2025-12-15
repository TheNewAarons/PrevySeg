










































































































































































































































































































import React, { useEffect, useState } from "react";
import BotonVolver from "../../../components/common/ButtonBack";
import documentoService from "../../../services/documentoService.jsx";

const AprobarPapeles = () => {
    const [usuarioDetalle, setUsuarioDetalle] = useState({}); //guardamos informacion del usuario en cada documento
    const [documentos, setDocumentos] = useState([]); //listamos los documentos en revision
    const [rechazoAbierto, setRechazoAbierto] = useState({});//controlamos que documentos tienen la opcion de rechazo abierto
    const [detallesAbiertos, setDetallesAbiertos] = useState({});//controlamos los documentos que tienen los detalles expandidos
    const [observaciones, setObservaciones] = useState({});//guardamos el texto de observacion para cada documento(en caso de ser rechazado)

    useEffect(() => {
        const fetchDocs = async () => {
            try {
                // 🔹 AHORA usamos solo los pendientes (EN_REVISION)
                const data = await documentoService.getDocumentosPendientes();
                setDocumentos(data);
                console.log("Documentos pendientes:", data);
            } catch (error) {
                console.error("Error cargando documentos pendientes:", error);
            }
        };

        fetchDocs();
    }, []);
    //controlamos el boton ver detalles en caso de que se haya abirto, se cierra y biseversa 
    const handleVerDetalle = async (doc) => {
        const idDoc = doc.id_doc_subido;
        const idUsuario = doc.usuario;


        setDetallesAbiertos((prev) => ({
            ...prev,
            [idDoc]: !prev[idDoc],
        }));


        setRechazoAbierto((prev) => ({
            ...prev,
            [idDoc]: false,
        }));

        //Si ya tenemos datos del usuario, no pedir de nuevo
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
        try {
            await documentoService.aprobarDocumento(idDoc);

            //Actualiza estado local
            setDocumentos((prevDocs) =>
                prevDocs.map((doc) =>
                    doc.id_doc_subido === idDoc
                        ? { ...doc, estado_revision: "APROBADO" } //dejarlo igual que en backend
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

        //Abrir/cerrar panel de rechazo
        setRechazoAbierto((prev) => ({
            ...prev,
            [idDoc]: !prev[idDoc],
        }));

        //Asegurar que los detalles estén abiertos
        setDetallesAbiertos((prev) => ({
            ...prev,
            [idDoc]: true,
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
            setDocumentos((prevDocs) =>
                prevDocs.map((doc) =>
                    doc.id_doc_subido === idDoc
                        ? { ...doc, estado_revision: "RECHAZADO" }
                        : doc
                )
            );

            alert("Documento rechazado correctamente");
        } catch (error) {
            console.error(error);
            alert("Error al rechazar documento");
        }
    };

    const formatearEstado = (estado) => {
        switch (estado) {
            case "EN_REVISION":
                return "En revisión";
            case "APROBADO":
                return "Aprobado";
            case "RECHAZADO":
                return "Rechazado";
            default:
                return estado;
        }
    };

    return (
        <div className="container mt-5">
            <BotonVolver />

            <h2 className="text-center mt-4 mb-4">Bandeja de Entrada</h2>

            <div className="card shadow-sm">
                <div className="card-body">
                    {documentos.length === 0 ? (
                        <p className="text-center text-muted">
                            No hay documentos pendientes.
                        </p>
                    ) : (
                        documentos.map((doc, index) => (
                            <div
                                key={doc.id_doc_subido}
                                className={`border-bottom py-3 ${index % 2 === 0 ? "bg-white" : "bg-gray-100"
                                    }`}
                            >
                                {/* Fila principal */}
                                <div className="d-flex justify-content-between align-items-center">
                                    <div className="d-flex flex-column">
                                        <span>
                                            <strong>ID documento:</strong> {doc.id_doc_subido}
                                        </span>
                                        <span>
                                            <strong>Solicitud:</strong>{" "}
                                            {doc.tipo_documento_nombre || "Sin nombre"}
                                        </span>
                                        <span>
                                            <strong>Estado:</strong>{" "}
                                            {formatearEstado(doc.estado_revision)}
                                        </span>
                                    </div>

                                    <div className="d-flex gap-2">
                                        <button
                                            className="btn btn-info btn-sm"
                                            onClick={() => handleVerDetalle(doc)}
                                        >
                                            {detallesAbiertos[doc.id_doc_subido]
                                                ? "Ocultar"
                                                : "Ver detalle"}
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
                                                <p>
                                                    <strong>RUT:</strong>{" "}
                                                    {usuarioDetalle[doc.id_doc_subido].rut}
                                                </p>
                                                <p>
                                                    <strong>Nombre:</strong>{" "}
                                                    {usuarioDetalle[doc.id_doc_subido].nombre}
                                                </p>
                                                <p>
                                                    <strong>Email:</strong>{" "}
                                                    {usuarioDetalle[doc.id_doc_subido].email}
                                                </p>
                                            </>
                                        ) : (
                                            <p>Cargando datos del usuario...</p>
                                        )}

                                        <h5 className="mt-3">📄 Datos del Documento</h5>
                                        {doc.observaciones_rechazo && (
                                            <p>
                                                <strong>Observaciones:</strong>{" "}
                                                {doc.observaciones_rechazo}
                                            </p>
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

                                        {/* Textarea para rechazo */}
                                        {rechazoAbierto[doc.id_doc_subido] && (
                                            <div className="mt-2">
                                                <textarea
                                                    className="form-control mb-2"
                                                    placeholder="Ingrese observación de rechazo..."
                                                    value={observaciones[doc.id_doc_subido] || ""}
                                                    onChange={(e) =>
                                                        setObservaciones((prev) => ({
                                                            ...prev,
                                                            [doc.id_doc_subido]: e.target.value,
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
