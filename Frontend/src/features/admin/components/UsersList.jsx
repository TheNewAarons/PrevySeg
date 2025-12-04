import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const UsuarioList = () => {
    const [usuarios, setUsuarios] = useState([]);
    const [filtrados, setFiltrados] = useState([]);
    const [busqueda, setBusqueda] = useState("");
    const [selectedUser, setSelectedUser] = useState(null);
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
            u.rut.toLowerCase().includes(valor.toLowerCase()) ||
            u.nombre.toLowerCase().includes(valor.toLowerCase()) ||
            u.email?.toLowerCase().includes(valor.toLowerCase())
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
                alert("Usuario eliminado exitosamente.");
                setSelectedUser(null);
                fetchUsuarios();
            }
        } catch {
            alert("Error al eliminar usuario.");
        }
    };

    if (cargando) {
        return (
            <div className="text-center py-5">
                <div className="spinner-border text-primary" role="status">
                    <span className="visually-hidden">Cargando...</span>
                </div>
                <p className="mt-3">Cargando usuarios...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="alert alert-danger" role="alert">
                <i className="bi bi-exclamation-triangle me-2"></i>
                {error}
            </div>
        );
    }

    return (
        <>
            <div className="card shadow-sm">
                <div className="card-body">
                    <div className="row align-items-center mb-4">
                        <div className="col-md-8">
                            <div className="input-group">
                                <span className="input-group-text">
                                    <i className="bi bi-search"></i>
                                </span>
                                <input
                                    type="text"
                                    className="form-control"
                                    placeholder="Buscar por RUT, nombre o email..."
                                    value={busqueda}
                                    onChange={handleBusqueda}
                                />
                            </div>
                        </div>
                        <div className="col-md-4 text-end mt-3 mt-md-0">
                            <button
                                className="btn btn-primary w-100 w-md-auto"
                                onClick={() => navigate('/administrador/crear-user')}
                            >
                                <i className="bi bi-person-plus me-2"></i>Crear Usuario
                            </button>
                        </div>
                    </div>

                    {filtrados.length === 0 ? (
                        <div className="text-center py-5">
                            <i className="bi bi-people" style={{ fontSize: '3rem', color: '#ccc' }}></i>
                            <p className="mt-3 text-muted">
                                {busqueda ? 'No se encontraron usuarios.' : 'No hay usuarios registrados.'}
                            </p>
                        </div>
                    ) : (
                        <>
                            <div className="table-responsive">
                                <table className="table table-hover align-middle">
                                    <thead className="table-light">
                                        <tr>
                                            <th>Nombre</th>
                                            <th>RUT</th>
                                            <th>Email</th>
                                            <th>Rol</th>
                                            <th className="text-center">Acciones</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {filtrados.map((u) => (
                                            <tr key={u.id_usuario}>
                                                <td>
                                                    <div className="d-flex align-items-center">
                                                        <div className="avatar-circle me-2">
                                                            {u.nombre.charAt(0).toUpperCase()}
                                                        </div>
                                                        <strong>{u.nombre}</strong>
                                                    </div>
                                                </td>
                                                <td>{u.rut}</td>
                                                <td>{u.email || '—'}</td>
                                                <td>
                                                    <span className={`badge ${u.rol === 'administrador' ? 'bg-danger' :
                                                            u.rol === 'empresa' ? 'bg-warning text-dark' :
                                                                'bg-info text-dark'
                                                        }`}>
                                                        {u.rol || 'Cliente'}
                                                    </span>
                                                </td>
                                                <td>
                                                    <div className="d-flex justify-content-center gap-2">
                                                        <button
                                                            className="btn btn-sm btn-outline-primary"
                                                            onClick={() => navigate(`/administrador/usuario/${u.id_usuario}`)}
                                                            title="Ver detalles"
                                                        >
                                                            <i className="bi bi-eye"></i>
                                                        </button>
                                                        <button
                                                            className="btn btn-sm btn-outline-warning"
                                                            onClick={() => navigate(`/administrador/usuario/editar/${u.id_usuario}`)}
                                                            title="Editar"
                                                        >
                                                            <i className="bi bi-pencil"></i>
                                                        </button>
                                                        <button
                                                            className="btn btn-sm btn-outline-danger"
                                                            onClick={() => setSelectedUser(u)}
                                                            title="Eliminar"
                                                        >
                                                            <i className="bi bi-trash"></i>
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                            <div className="mt-3 text-muted">
                                <small>
                                    Mostrando {filtrados.length} de {usuarios.length} usuario(s)
                                </small>
                            </div>
                        </>
                    )}
                </div>
            </div>

            {/* Modal de confirmación */}
            {selectedUser && (
                <div className="modal fade show" style={{ display: 'block', backgroundColor: 'rgba(0,0,0,0.5)' }} tabIndex="-1">
                    <div className="modal-dialog modal-dialog-centered">
                        <div className="modal-content">
                            <div className="modal-header bg-danger text-white">
                                <h5 className="modal-title">
                                    <i className="bi bi-exclamation-triangle me-2"></i>
                                    Confirmar Eliminación
                                </h5>
                                <button type="button" className="btn-close btn-close-white" onClick={() => setSelectedUser(null)}></button>
                            </div>
                            <div className="modal-body">
                                <p className="mb-2">¿Estás seguro de que deseas eliminar este usuario?</p>
                                <div className="alert alert-warning mb-0">
                                    <strong>{selectedUser.nombre}</strong>
                                    <br />
                                    <small>RUT: {selectedUser.rut}</small>
                                </div>
                                <p className="text-muted mt-3 mb-0">
                                    <small>Esta acción no se puede deshacer.</small>
                                </p>
                            </div>
                            <div className="modal-footer">
                                <button type="button" className="btn btn-secondary" onClick={() => setSelectedUser(null)}>
                                    Cancelar
                                </button>
                                <button type="button" className="btn btn-danger" onClick={handleDelete}>
                                    <i className="bi bi-trash me-2"></i>Eliminar Usuario
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}

export default UsuarioList
