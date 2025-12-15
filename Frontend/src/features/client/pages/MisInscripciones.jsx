import React, { useEffect, useState } from "react";
import courseService from "../../../services/courseService";
import { useNavigate } from "react-router-dom";

const MisInscripciones = () => {
    const [inscripciones, setInscripciones] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

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
        return <div className="text-center py-5">Cargando...</div>;
    }

    return (
        <div className="container py-4">
        <div className="d-flex justify-content-between align-items-center mb-4">
            <h2>Mis Cursos Inscritos</h2>
            <button
            className="btn btn-secondary"
            onClick={() => navigate("/cliente/dashboard")}
            >
            Volver
            </button>
        </div>

        {inscripciones.length === 0 ? (
            <p className="text-muted">No tienes cursos inscritos aún.</p>
        ) : (
            <div className="row g-4">
            {inscripciones.map((ins) => (
                <div key={ins.inscripcion_id} className="col-md-6 col-lg-4">
                <div className="card shadow-sm h-100">
                    <div className="card-body d-flex flex-column">
                    <h5 className="card-title">{ins.curso_nombre}</h5>

                    <p className="mb-1">
                        <strong>Inicio:</strong> {ins.curso_fecha_inicio}
                    </p>
                    <p className="mb-1">
                        <strong>Modalidad:</strong> {ins.curso_modalidad}
                    </p>
                    <p className="mb-2">
                        <strong>Horas:</strong> {ins.curso_horas}
                    </p>

                    <span className="badge bg-success align-self-start">
                        {ins.estado_inscripcion}
                    </span>

                    <div className="mt-auto pt-3">
                        <button
                        className="btn btn-outline-primary btn-sm w-100"
                        onClick={() =>
                            navigate(`/cliente/cursos/${ins.curso_id}/inscripcion`)
                        }
                        >
                        Ver Documentos
                        </button>
                    </div>
                    </div>
                </div>
                </div>
            ))}
            </div>
        )}
        </div>
    );
};

export default MisInscripciones;
