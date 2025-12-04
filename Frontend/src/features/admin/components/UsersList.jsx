import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import BotonVolver from "../../../components/common/ButtonBack";

const UsuarioList = () => {
    const [usuarios, setUsuarios] = useState([]);
    const [filtrados, setFiltrados] = useState([]);
    const [busqueda, setBusqueda] = useState("");
    const [selectedUser, setSelectedUser] = useState(null); // Modal
    const [cargando, setCargando] = useState(true);
    const [error, setError] = useState(null);
    const navigate = useNavigate();

    const fetchUsuarios = async () => {
        setCargando(true);
        setError(null);
        try {
            const userStorage = localStorage.getItem("user");
            if (!userStorage) throw new Error("No has iniciado sesión.");

            const token = JSON.parse(userStorage).token;

            const response = await fetch("http://localhost:8000/api/usuarios/", {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            if (response.status === 401) {
                alert("Sesión caducada.");
                localStorage.removeItem("user");
                navigate("/login");
                return;
            }

            if (!response.ok) {
                throw new Error("Error al obtener usuarios.");
            }

            const data = await response.json();
            setUsuarios(data);
            setFiltrados(data);
        } catch (err) {
            setError(err.message);
        } finally {
            setCargando(false);
        }
    };

    useEffect(() => {
        fetchUsuarios();
    }, []);

    const handleBusqueda = (e) => {
        const valor = e.target.value;
        setBusqueda(valor);
        const resultados = usuarios.filter((u) =>
            u.rut.toLowerCase().includes(valor.toLowerCase())
        );
        setFiltrados(resultados);
    }

    const handleDelete = async () => {
        try {
            const userStorage = localStorage.getItem("user");
            const token = JSON.parse(userStorage).token;
            const currentUser = JSON.parse(userStorage);

            if (currentUser.user_id === selectedUser.id_usuario) {
                alert("No puedes eliminar tu propio usuario.");
                setSelectedUser(null);
                return;
            }

            const response = await fetch(
                `http://localhost:8000/api/usuarios/${selectedUser.id_usuario}/`,
                {
                    method: "DELETE",
                    headers: { Authorization: `Bearer ${token}` },
                }
            );

            if (response.status === 204 || response.ok) {
                alert("Usuario eliminado.");
                setSelectedUser(null);
                fetchUsuarios(); //vuelve a cargar la lista
            }
        } catch {
            alert("Error al eliminar usuario.");
        }
    };

    if (cargando) return <p>Cargando usuarios...</p>;
    if (error) return <p>{error}</p>;

    return (
        <>
            <div style={{ padding: "20px" }}>
                <h2>Usuarios Registrados</h2>
                <BotonVolver />
                <input
                    placeholder="Buscar por RUT..."
                    value={busqueda}
                    onChange={handleBusqueda}
                    style={{
                        width: "100%",
                        padding: "10px",
                        marginBottom: "20px",
                        borderRadius: "5px",
                        border: "1px solid #ccc",
                    }}
                />
                <div style={{ display: "grid", gap: "15px" }}></div>
                {filtrados.map((u) => (
                    <div
                        key={u.id_usuario}
                        style={{
                            border: "1px solid #ddd",
                            padding: "15px",
                            borderRadius: "10px",
                            display: "flex",
                            justifyContent: "space-between",
                        }}
                    >
                        <strong>{u.nombre}</strong>
                        <span>{u.rut}</span>

                        <div style={{ display: "flex", gap: "10px" }}>
                            <button
                                style={{ padding: "8px 12px", background: "#007bff", color: "#fff" }}
                                onClick={() =>
                                    navigate(`/administrador/usuario/${u.id_usuario}`)
                                }
                            >
                                Ver
                            </button>

                            <button
                                style={{ padding: "8px 12px", background: "#ffc107", color: "#000" }}
                                onClick={() =>
                                    navigate(`/administrador/usuario/editar/${u.id_usuario}`)
                                }
                            >
                                Editar
                            </button>

                            <button
                                style={{ padding: "8px 12px", background: "#dc3545", color: "#fff" }}
                                onClick={() => setSelectedUser(u)} // Modal aparece
                            >
                                Eliminar
                            </button>
                        </div>
                    </div>
                ))}
            </div >
            {/* Modal */}
            {
                selectedUser && (
                    <div
                        style={{
                            position: "fixed",
                            top: 0,
                            left: 0,
                            width: "100%",
                            height: "100%",
                            background: "rgba(0,0,0,0.6)",
                            display: "flex",
                            justifyContent: "center",
                            alignItems: "center",
                        }}
                    >
                        <div
                            style={{
                                background: "white",
                                padding: "20px",
                                borderRadius: "10px",
                                width: "300px",
                                textAlign: "center",
                            }}
                        >
                            <h3>¿Eliminar Usuario?</h3>
                            <p>
                                {selectedUser.nombre} ({selectedUser.rut})
                            </p>

                            <div style={{ display: "flex", justifyContent: "center", gap: "10px" }}>
                                <button
                                    style={{ background: "#dc3545", color: "white", padding: "8px 12px" }}
                                    onClick={handleDelete}
                                >
                                    Eliminar
                                </button>
                                <button
                                    style={{ background: "#6c757d", color: "white", padding: "8px 12px" }}
                                    onClick={() => setSelectedUser(null)}
                                >
                                    Cancelar
                                </button>
                            </div>
                        </div>
                    </div>
                )
            }
        </>
    );
}

export default UsuarioList
