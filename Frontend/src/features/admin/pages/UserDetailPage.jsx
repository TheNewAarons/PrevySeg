import React, { useEffect, useMemo, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import BotonVolver from "../../../components/common/ButtonBack";
import courseService from "../../../services/courseService.jsx"; // <-- usa tu service
import { authenticatedFetch } from "../../../utils/apiHelpers";      // <-- para headers

const UserDetailPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();

    const [usuario, setUsuario] = useState(null);
    const [inscripciones, setInscripciones] = useState([]);
    const [loading, setLoading] = useState(true);
    const [errorMsg, setErrorMsg] = useState("");

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

                // 1) Perfil usuario (mantengo tu flujo y URL)
                const resUser = await authenticatedFetch(`http://localhost:8000/api/usuarios/${id}/`, {
                    method: "GET"
                });

                // Manejo de errores
                if (!resUser.ok) {
                    if (resUser.status === 403) {
                        throw new Error("No tienes permisos para acceder.");
                    }
                    throw new Error("Error al obtener usuario del servidor.");
                }

                const userData = await resUser.json();
                if (mounted) setUsuario(userData);

                // 2) Inscripciones del usuario (ADMIN) - nuevo endpoint
                //    IMPORTANTE: evita el error HTML->JSON porque courseService ya valida content-type
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

    // ---- UI helpers (mantener orden Curso 1 / Curso 2) ----
    const cursosSlots = useMemo(() => {
        const c1 = inscripciones?.[0] || null;
        const c2 = inscripciones?.[1] || null;
        return [c1, c2];
    }, [inscripciones]);

    // Documentos "por firmar" (placeholder realista):
    // Aquí puedes mapear otra API cuando la tengas.
    // Por ahora: si el usuario tiene documentos RECHAZADOS/EN_REVISION, los mostramos como pendientes.
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

    // Empresas (si aún no existe relación en modelo, mostramos mensaje)
    const empresas = useMemo(() => {
        // Ajusta esto cuando tengas campo real (ej: usuario.empresa, usuario.empresas, etc.)
        // Ejemplo si fuera usuario.empresa_nombre:
        // return usuario?.empresa_nombre ? [usuario.empresa_nombre] : [];
        return [];
    }, [usuario]);

    if (loading) return <p style={{ padding: 20 }}>Cargando...</p>;

    if (errorMsg) {
        return (
            <div style={{ padding: 20 }}>
                <h2>Perfil del Usuario</h2>
                <BotonVolver />
                <div className="alert alert-danger mt-3">{errorMsg}</div>
            </div>
        );
    }

    if (!usuario) return <p style={{ padding: 20 }}>No se encontró el usuario.</p>;

    const renderCursoCard = (inscripcion, index) => {
        const titulo = `Curso ${index + 1}`;

        if (!inscripcion) {
            return (
                <div style={{ border: "1px solid #ddd", padding: "15px", borderRadius: "10px" }}>
                    <h4>{titulo}</h4>
                    <p className="text-muted mb-0">Todavía no está inscrito.</p>
                </div>
            );
        }

        return (
            <div style={{ border: "1px solid #ddd", padding: "15px", borderRadius: "10px" }}>
                <h4>{titulo}</h4>
                <p className="mb-1"><strong>Nombre:</strong> {inscripcion.curso_nombre}</p>
                <p className="mb-1"><strong>Modalidad:</strong> {inscripcion.curso_modalidad || "—"}</p>
                <p className="mb-1"><strong>Horas:</strong> {inscripcion.curso_horas ?? "—"}</p>
                <p className="mb-1">
                    <strong>Estado:</strong>{" "}
                    <span className="badge bg-secondary">{inscripcion.estado_inscripcion}</span>
                </p>

                {/* Si quieres mostrar docs del curso */}
                <div className="mt-2">
                    <small className="text-muted d-block mb-1">Documentos:</small>
                    {(inscripcion.documentos && inscripcion.documentos.length > 0) ? (
                        <ul className="mb-0">
                            {inscripcion.documentos.map((d, i) => (
                                <li key={i}>
                                    {d.nombre} — <strong>{d.estado}</strong>
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <p className="text-muted mb-0">Sin documentos asociados.</p>
                    )}
                </div>
            </div>
        );
    };

    return (
        <div style={{ padding: "20px" }}>
            <h2>Perfil del Usuario</h2>

            <BotonVolver />

            <div
                style={{
                    border: "1px solid #ddd",
                    borderRadius: "10px",
                    padding: "20px",
                    display: "grid",
                    gridTemplateColumns: "250px 1fr",
                    gap: "20px",
                }}
            >
                {/* Panel lateral izquierda */}
                <div style={{ borderRight: "1px solid #eee", paddingRight: "20px" }}>
                    <div
                        style={{
                            width: "120px",
                            height: "120px",
                            borderRadius: "100%",
                            background: "#ccc",
                            margin: "0 auto 20px",
                        }}
                    ></div>

                    <h3 style={{ textAlign: "center" }}>{usuario.nombre}</h3>

                    <p><strong>RUT:</strong> {usuario.rut}</p>
                    <p><strong>Email:</strong> {usuario.email}</p>
                    <p><strong>Teléfono:</strong> {usuario.telefono}</p>
                    <p><strong>Domicilio:</strong> {usuario.domicilio}</p>
                    <p><strong>Rol:</strong> {usuario.datos_rol?.nombre_rol}</p>
                </div>

                {/* Panel derecha con secciones (mantengo el layout original) */}
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "15px" }}>
                    {renderCursoCard(cursosSlots[0], 0)}
                    {renderCursoCard(cursosSlots[1], 1)}

                    <div style={{ border: "1px solid #ddd", padding: "15px", borderRadius: "10px" }}>
                        <h4>Papeles por firmar</h4>
                        {documentosPendientes.length === 0 ? (
                            <p className="text-muted mb-0">No hay documentos pendientes.</p>
                        ) : (
                            <ul className="mb-0">
                                {documentosPendientes.map((d, idx) => (
                                    <li key={idx}>
                                        {d.nombre} ({d.curso}) — <strong>{d.estado}</strong>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>

                    <div style={{ border: "1px solid #ddd", padding: "15px", borderRadius: "10px" }}>
                        <h4>Empresas</h4>
                        {empresas.length === 0 ? (
                            <p className="text-muted mb-0">No está vinculado a una empresa.</p>
                        ) : (
                            <ul className="mb-0">
                                {empresas.map((e, idx) => <li key={idx}>{e}</li>)}
                            </ul>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default UserDetailPage;