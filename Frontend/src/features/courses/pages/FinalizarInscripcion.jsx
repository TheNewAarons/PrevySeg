import React, { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap-icons/font/bootstrap-icons.css";

import courseService from "../../../services/courseService";
import authService from "../../../services/authService";

const FinalizarInscripcionCurso = () => {
    const { id } = useParams(); // id del curso
    const navigate = useNavigate();

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const handleAuthExpired = () => {
        alert("Tu sesión ha expirado. Por favor inicia sesión nuevamente.");
        authService.logout();
        navigate("/login");
    };

    const finalizar = async () => {
        try {
        setLoading(true);
        setError("");
        const res = await courseService.finalizarInscripcion(id);
        alert(res?.message || res?.mensaje || "¡Inscripción completada!");
        navigate("/cliente/dashboard");
        } catch (err) {
        console.error(err);
        if (err?.status === 401 || String(err?.message || "").includes("token_not_valid")) {
            handleAuthExpired();
            return;
        }

        // si backend manda estructura con documentos faltantes / pendientes
        const extra = err?.data?.documentos_faltantes || err?.data?.documentos_pendientes;
        if (extra) {
            setError(`${err.message}\n${JSON.stringify(extra, null, 2)}`);
        } else {
            setError(err?.message || "No se pudo finalizar la inscripción.");
        }
        } finally {
        setLoading(false);
        }
    };

    return (
        <div className="container py-4">
            <div className="d-flex justify-content-between align-items-center mb-3">
                <h2 className="mb-0">Finalizar inscripción</h2>
                <button className="btn btn-outline-secondary" onClick={() => navigate(-1)}>
                <i className="bi bi-arrow-left me-2"></i>Volver
                </button>
            </div>

            {error && (
                <div className="alert alert-danger" style={{ whiteSpace: "pre-wrap" }}>
                <i className="bi bi-exclamation-triangle me-2"></i>
                {error}
                </div>
            )}

            <div className="card shadow-sm">
                <div className="card-body">
                <p className="mb-3">
                    Este paso intentará crear la inscripción <strong>solo si</strong> todos los documentos están aprobados y hay cupos.
                </p>

                <button className="btn btn-success" onClick={finalizar} disabled={loading}>
                    {loading ? "Finalizando..." : "Confirmar y finalizar"}
                </button>
                </div>
            </div>
        </div>
    );
};

export default FinalizarInscripcionCurso;
