import React, { useEffect, useState } from "react";
import documentoService from "../../../services/documentoService.jsx";
import BotonVolver from '../../../components/common/ButtonBack';

const DetalleDocumento = () => {
  const [documentos, setDocumentos] = useState([]);

  useEffect(() => {
    const fetchDocs = async () => {
      try {
        const data = await documentoService.getDocumentos();
        setDocumentos(data);
      } catch (error) {
        console.error("Error cargando documentos:", error);
      }
    };
    fetchDocs();
  }, []);

  // Estilos según estado con clases Bootstrap
  const getEstadoClass = (estado) => {
    if (!estado) return "badge bg-secondary";

    switch (estado.toUpperCase()) {
      case "APROBADO":
        return "badge bg-success"; // Verde
      case "RECHAZADO":
        return "badge bg-danger";  // Rojo
      case "EN REVISION":
        return "badge bg-warning text-dark"; // Amarillo
      default:
        return "badge bg-warning text-dark";
    }
  };

  return (
    <div className="container mt-4">

      {/* Botón volver */}
      <div className="mb-3">
        <BotonVolver />
      </div>

      <h3 className="fw-bold mb-4 text-center">Detalle de Documentos</h3>

      {documentos.map((doc, index) => (
        <div key={index} className="card shadow-sm mb-3 p-2">
          <div className="card-body d-flex justify-content-between align-items-center">

            {/* IZQUIERDA: información del documento */}
            <div>
              <h5 className="card-title mb-1">
                Tipo de documento: {doc.tipo_documento_nombre}
              </h5>
              <p className="text-muted mb-0">
                ID documento: {doc.id_doc_subido}
              </p>

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
          </div>

            {/* DERECHA: estado */}
            <div className="text-end">
              <span className={getEstadoClass(doc.estado_revision)}>
                {doc.estado_revision}
              </span>

              {/* Observación si está RECHAZADO */}
              {doc.estado_revision?.toUpperCase() === "RECHAZADO" &&
                doc.observaciones_rechazo && (
                  <p className="text-danger mt-2 mb-0 small fw-semibold">
                    Observación: {doc.observaciones_rechazo}
                  </p>
                )}
            </div>

          </div>
        </div>
      ))}
    </div>
  );
};

export default DetalleDocumento;

