import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import BotonVolver from "../components/ButtonBack";

const UserDetailPage = () => {
    const { id } = useParams();
    const [usuario, setUsuario] = useState(null);

    useEffect(() => {
        const fetchUser = async () => {
            try {
                const localUser = JSON.parse(localStorage.getItem("user"));
                const token = localUser?.token;

                const response = await fetch(`http://localhost:8000/api/usuarios/${id}/`, {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                });
                // Comprobacion de sesion y lo que pasara si es que no tiene permisos o caduca la sesion
                if (!response.ok) {
                    if (response.status === 401) {
                        alert("Sesión caducada. Inicia sesión nuevamente.");
                        localStorage.removeItem("user");
                        navigate("/login");
                        return;
                    }
                    if (response.status === 403) {
                        throw new Error("No tienes permisos para acceder.");
                    }
                    throw new Error("Error al obtener usuarios del servidor.");
                }
                const data = await response.json();
                setUsuario(data);
            } catch (error) {
                console.error("Error cargando detalle:", error);
            }
        };

        fetchUser();
    }, [id]);

    if (!usuario) return <p>Cargando...</p>;

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

                {/* Panel derecha con secciones */}
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "15px" }}>
                    <div style={{ border: "1px solid #ddd", padding: "15px", borderRadius: "10px" }}>
                        <h4>Curso 1</h4>
                        <p>Asistencia: ...</p>
                        <p>Nota: ...</p>
                        <p>Observaciones: ...</p>
                    </div>

                    <div style={{ border: "1px solid #ddd", padding: "15px", borderRadius: "10px" }}>
                        <h4>Curso 2</h4>
                        <p>Asistencia: ...</p>
                        <p>Nota: ...</p>
                        <p>Observaciones: ...</p>
                    </div>

                    <div style={{ border: "1px solid #ddd", padding: "15px", borderRadius: "10px" }}>
                        <h4>Papeles por firmar</h4>
                        <p>- Documento 1</p>
                        <p>- Documento 2</p>
                    </div>

                    <div style={{ border: "1px solid #ddd", padding: "15px", borderRadius: "10px" }}>
                        <h4>Empresas</h4>
                        <p>- Empresa A</p>
                        <p>- Empresa B</p>
                    </div>
                </div>
            </div>
        </div>
    );
}
export default UserDetailPage