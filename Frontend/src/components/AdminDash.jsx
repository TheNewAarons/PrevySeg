import React from 'react';
import { useNavigate } from 'react-router-dom';
import authService from '../services/authService';

const AdminDashboard = () => {
    const navigate = useNavigate();

    const handleLogout = () => {
        authService.logout(); // Borra el token
        navigate('/login');   // Devuelve al login
    };

    return (
        <div style={{ padding: "20px" }}>

            {/* Encabezado */}
            <div style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: "30px"
            }}>
                <h2>Panel de Administración - PrevySeg</h2>

                <button
                    onClick={handleLogout}
                    style={{
                        background: "#dc3545",
                        color: "white",
                        padding: "10px 15px",
                        border: "none",
                        borderRadius: "5px",
                        cursor: "pointer"
                    }}>
                    Cerrar Sesión
                </button>
            </div>

            {/* Contenido */}
            <p style={{ marginBottom: "20px" }}>
                Bienvenido Administrador. Seleccione una opción para gestionar el sistema:
            </p>

            {/* GRID DE OPCIONES */}
            <div style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
                gap: "20px"
            }}>

                {/* Card 1 */}
                <div
                    onClick={() => navigate("/administrador/list-users")}
                    style={{
                        border: "1px solid #ddd",
                        padding: "20px",
                        borderRadius: "10px",
                        cursor: "pointer",
                        background: "#fff",
                        transition: "0.2s"
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.boxShadow = "0 4px 10px rgba(0,0,0,0.15)"}
                    onMouseLeave={(e) => e.currentTarget.style.boxShadow = "none"}
                >
                    <h3>Gestión de Usuarios</h3>
                    <p>Ver, editar y administrar usuarios registrados.</p>
                </div>

                {/* Card 2 */}
                <div
                    onClick={() => navigate("/administrador/create-user")}
                    style={{
                        border: "1px solid #ddd",
                        padding: "20px",
                        borderRadius: "10px",
                        cursor: "pointer",
                        background: "#fff",
                        transition: "0.2s"
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.boxShadow = "0 4px 10px rgba(0,0,0,0.15)"}
                    onMouseLeave={(e) => e.currentTarget.style.boxShadow = "none"}
                >
                    <h3>Crear Usuario</h3>
                    <p>Registrar un nuevo usuario en el sistema.</p>
                </div>

                {/* Card 3 */}
                <div
                    onClick={() => navigate("/administrador/roles")}
                    style={{
                        border: "1px solid #ddd",
                        padding: "20px",
                        borderRadius: "10px",
                        cursor: "pointer",
                        background: "#fff",
                        transition: "0.2s"
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.boxShadow = "0 4px 10px rgba(0,0,0,0.15)"}
                    onMouseLeave={(e) => e.currentTarget.style.boxShadow = "none"}
                >
                    <h3>Roles del Sistema</h3>
                    <p>Ver y administrar roles y permisos.</p>
                </div>

                {/* Card 4 */}
                <div
                    onClick={() => navigate("/administrador/reportes")}
                    style={{
                        border: "1px solid #ddd",
                        padding: "20px",
                        borderRadius: "10px",
                        cursor: "pointer",
                        background: "#fff",
                        transition: "0.2s"
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.boxShadow = "0 4px 10px rgba(0,0,0,0.15)"}
                    onMouseLeave={(e) => e.currentTarget.style.boxShadow = "none"}
                >
                    <h3>Reportes</h3>
                    <p>Métricas, estadísticas y actividad del sistema.</p>
                </div>

            </div>
        </div>
    );
};

export default AdminDashboard;