import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useAuth } from "../../../services/authContext";
import authService from '../../../services/authService';
import '../styles/AdminDashboard.css';
import Navbar from '../../../components/layout/Navbar';

const EditUser = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user, logout: authLogout } = useAuth();

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

    const [cargando, setCargando] = useState(true);
    const [roles, setRoles] = useState([]);

    useEffect(() => {
        if (!user) {
            navigate('/login');
            return;
        }
    }, [user, navigate]);

    useEffect(() => {
        const fetchRoles = async () => {
            try {
                const userStorage = localStorage.getItem("user");
                const token = userStorage ? JSON.parse(userStorage).token : null;
                const res = await fetch("http://localhost:8000/api/roles/", {
                    headers: token ? { 'Authorization': `Bearer ${token}` } : {}
                });
                if (res.ok) {
                    const data = await res.json();
                    setRoles(data);
                }
            } catch (error) {
                console.error("Error loading roles", error);
            }
        }

        const fetchUser = async () => {
            try {
                const userStorage = localStorage.getItem('user');
                const token = JSON.parse(userStorage).token;
                const response = await fetch(`http://localhost:8000/api/usuarios/${id}/`, {
                    headers: { Authorization: `Bearer ${token}` },
                });

                if (!response.ok) {
                    if (response.status === 401) {
                        alert("Sesión caducada. Inicia sesión nuevamente.");
                        authLogout();
                        navigate("/login");
                        return;
                    }
                    if (response.status === 403) {
                        throw new Error("No tienes permisos para acceder.");
                    }
                    throw new Error("Error al obtener usuarios del servidor.");
                }

                const data = await response.json();
                setFormData(data);
            } catch (err) {
                alert('Error cargando usuario: ' + err.message);
                navigate('/administrador/list-users');
            } finally {
                setCargando(false);
            }
        };

        fetchRoles();
        fetchUser();
    }, [id, authLogout, navigate]);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const userStorage = localStorage.getItem("user");
            const token = JSON.parse(userStorage).token;

            // Preparar datos para enviar
            const dataToSend = { ...formData };

            // Asegurar que id_rol sea int 
            if (dataToSend.id_rol) {
                dataToSend.id_rol = parseInt(dataToSend.id_rol, 10);
            }

            // Eliminar campos que no deberían enviarse o limpiar vacíos
            delete dataToSend.datos_rol; // read_only
            delete dataToSend.password; // no editamos password aquí
            if (!dataToSend.fecha_nacimiento) dataToSend.fecha_nacimiento = null;
            if (!dataToSend.lugar_trabajo) dataToSend.lugar_trabajo = null;

            const response = await fetch(`http://localhost:8000/api/usuarios/${id}/`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify(dataToSend),
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                console.error("Error response:", errorData);

                let errorMsg = "Error al actualizar";
                if (typeof errorData === 'object') {
                    const messages = Object.entries(errorData)
                        .map(([key, value]) => `${key}: ${Array.isArray(value) ? value.join(' ') : value}`)
                        .join(' | ');
                    if (messages) errorMsg = messages;
                }

                throw new Error(errorMsg);
            }

            alert("Usuario actualizado correctamente");
            navigate("/administrador/list-users");
        } catch (err) {
            alert("Error: " + err.message);
        }
    };

    if (cargando) {
        return (
            <div className="d-flex justify-content-center align-items-center vh-100">
                <div className="spinner-border text-primary" role="status">
                    <span className="visually-hidden">Cargando...</span>
                </div>
            </div>
        );
    }

    return (
        <div className="administrador-dashboard">
            <Navbar />

            <div className="main-container">
                <div className="d-flex justify-content-between align-items-center mb-4">
                    <div>
                        <h1 className="page-title">Editar Usuario</h1>
                        <p className="page-subtitle">Modifica la información y permisos del usuario.</p>
                    </div>
                    <button className="btn btn-outline-secondary" onClick={() => navigate('/administrador/list-users')}>
                        <i className="bi bi-arrow-left me-2"></i>Volver al Listado
                    </button>
                </div>

                <div className="bg-white rounded-4 shadow-sm p-4 border" style={{ borderColor: 'var(--border-color)' }}>
                    <form onSubmit={handleSubmit}>
                        <h5 className="mb-4 fw-bold text-secondary">Información Personal</h5>

                        <div className="row g-3 mb-4">
                            <div className="col-md-6">
                                <label className="form-label small fw-bold text-muted">RUT</label>
                                <input
                                    className="form-control bg-light"
                                    name="rut"
                                    value={formData.rut}
                                    onChange={handleChange}
                                    required // RUT usually required
                                />
                            </div>
                            <div className="col-md-6">
                                <label className="form-label small fw-bold text-muted">Nombre Completo</label>
                                <input
                                    className="form-control bg-light"
                                    name="nombre"
                                    value={formData.nombre}
                                    onChange={handleChange}
                                    required
                                />
                            </div>
                            <div className="col-md-6">
                                <label className="form-label small fw-bold text-muted">Correo Electrónico</label>
                                <input
                                    className="form-control bg-light"
                                    type="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    required
                                />
                            </div>
                            <div className="col-md-6">
                                <label className="form-label small fw-bold text-muted">Teléfono</label>
                                <input
                                    className="form-control bg-light"
                                    name="telefono"
                                    value={formData.telefono}
                                    onChange={handleChange}
                                />
                            </div>
                            <div className="col-md-6">
                                <label className="form-label small fw-bold text-muted">Domicilio</label>
                                <input
                                    className="form-control bg-light"
                                    name="domicilio"
                                    value={formData.domicilio}
                                    onChange={handleChange}
                                />
                            </div>
                            <div className="col-md-6">
                                <label className="form-label small fw-bold text-muted">Lugar de Trabajo</label>
                                <input
                                    className="form-control bg-light"
                                    name="lugar_trabajo"
                                    value={formData.lugar_trabajo || ''}
                                    onChange={handleChange}
                                />
                            </div>
                            <div className="col-md-6">
                                <label className="form-label small fw-bold text-muted">Fecha de Nacimiento</label>
                                <input
                                    className="form-control bg-light"
                                    type="date"
                                    name="fecha_nacimiento"
                                    value={formData.fecha_nacimiento || ''}
                                    onChange={handleChange}
                                />
                            </div>
                        </div>

                        <h5 className="mb-3 fw-bold text-secondary">Configuración de Acceso</h5>
                        <div className="row mb-4">
                            <div className="col-md-6">
                                <label className="form-label small fw-bold text-muted">Rol del Usuario</label>
                                <select
                                    className="form-select bg-light"
                                    name="id_rol"
                                    value={formData.id_rol}
                                    onChange={handleChange}
                                >
                                    {roles.length > 0 ? (
                                        roles.map(rol => (
                                            <option key={rol.id_rol} value={rol.id_rol}>{rol.nombre_rol}</option>
                                        ))
                                    ) : (
                                        <>
                                            <option value="1">Administrador</option>
                                            <option value="2">Cliente</option>
                                            <option value="3">Empresa</option>
                                        </>
                                    )}
                                </select>
                            </div>
                        </div>

                        <div className="d-flex justify-content-end pt-3 border-top gap-2">
                            <button type="button" className="btn btn-light border" onClick={() => navigate('/administrador/list-users')}>
                                Cancelar
                            </button>
                            <button type="submit" className="btn btn-success px-4" style={{ backgroundColor: 'var(--primary-dark)', borderColor: 'var(--primary-dark)' }}>
                                <i className="bi bi-save me-2"></i>
                                Guardar Cambios
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default EditUser;
