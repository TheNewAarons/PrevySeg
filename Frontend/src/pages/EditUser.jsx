import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import BotonVolver from "../components/ButtonBack";

const EditUser = () => {
    const { id } = useParams();
    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        rut: '',
        nombre: '',
        email: '',
        telefono: '',
        domicilio: '',
        fecha_nacimiento: '',
        lugar_trabajo: '',
        id_rol: '',
    });

    const [cargando, setCargando] = useState(true)

    useEffect(() => {
        const fetchUser = async () => {
            try {
                const userStorage = localStorage.getItem('user');
                const token = JSON.parse(userStorage).token;
                const response = await fetch(`http://localhost:8000/api/usuarios/${id}/`, {
                    headers: { Authorization: `Bearer ${token}` },
                })
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


                const data = await response.json()
                setFormData(data)
            } catch (err) {
                alert('Error cargando usuario')
            } finally {
                setCargando(false)
            }
        }
        fetchUser()
    }, [id])
    const handleChange = async (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value })
    };
    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            const userStorage = localStorage.getItem("user")
            const token = JSON.parse(userStorage).token

            const response = await fetch(`http://localhost:8000/api/usuarios/${id}/`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify(formData),
            });

            if (!response.ok) throw new Error("Error al actualizar");

            alert("Usuario actualizado");
            navigate("/administrador/list-users");
        } catch (err) {
            alert("Error : " + err.message)
        }
    }
    if (cargando) return <p>Cargando Datos...</p>

    return (
        <div style={{ padding: "20px" }}>
            <h2>Editar Usuario</h2>

            <form onSubmit={handleSubmit} style={{ display: "grid", gap: "10px", gridTemplateColumns: "1fr 1fr" }}>

                <input name="rut" placeholder="RUT" value={formData.rut} onChange={handleChange} />
                <input name="nombre" placeholder="Nombre" value={formData.nombre} onChange={handleChange} />
                <input name="email" type="email" placeholder="Correo" value={formData.email} onChange={handleChange} />

                <input name="telefono" placeholder="Teléfono" value={formData.telefono} onChange={handleChange} />
                <input name="domicilio" placeholder="Domicilio" value={formData.domicilio} onChange={handleChange} />

                <input name="fecha_nacimiento" type="date" value={formData.fecha_nacimiento || ""} onChange={handleChange} />
                <input name="lugar_trabajo" placeholder="Lugar de Trabajo" value={formData.lugar_trabajo} onChange={handleChange} />

                <div style={{ gridColumn: "span 2" }}>
                    <label>Rol:</label>
                    <select name="id_rol" value={formData.id_rol} onChange={handleChange}>
                        <option value="1">Administrador</option>
                        <option value="2">Cliente</option>
                        <option value="3">Empresa</option>
                    </select>
                </div>

                <button type="submit" style={{ gridColumn: "span 2", padding: "10px", background: "#28a745", color: "white", border: "none" }}>
                    Guardar Cambios
                </button>
            </form>
            <BotonVolver />
        </div>
    );
};

export default EditUser
