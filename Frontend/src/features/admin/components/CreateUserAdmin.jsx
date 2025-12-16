import React, { useEffect, useState } from "react";

const CreateUserForm = ({ onUserCreated }) => {
    const [formData, setFormData] = useState({
        rut: '',
        password: '',
        nombre: '',
        email: '',
        telefono: '',
        domicilio: '',
        fecha_nacimiento: '',
        lugar_trabajo: '',
        id_rol: ''
    });

    const [roles, setRoles] = useState([]);
    const [rolesLoading, setRolesLoading] = useState(true);
    const [rolesError, setRolesError] = useState(null);

    useEffect(() => {
        const fetchRoles = async () => {
            try {
                setRolesLoading(true);
                setRolesError(null);

                const userStorage = localStorage.getItem("user");
                const token = userStorage ? JSON.parse(userStorage).token : null;
                const res = await fetch("http://localhost:8000/api/roles/", {
                    headers: token ? { 'Authorization': `Bearer ${token}` } : {}
                });
                if (!res.ok) {
                    throw new Error("No se logro cargar los roles");
                }
                const data = await res.json();
                setRoles(data);

                const clienteRol = data.find(r => r.nombre_rol === 'Cliente');
                if (clienteRol && !formData.id_rol) {
                    setFormData(prev => ({
                        ...prev,
                        id_rol: clienteRol.id_rol
                    }));
                }
            } catch (err) {
                console.error("Error cargando roles:", err);
                setRolesError(err.message);
            } finally {
                setRolesLoading(false);
            }
        };
        fetchRoles();
    }, []);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const userStorage = localStorage.getItem('user');
            if (!userStorage) {
                alert("Tu sesión ha expirado. Por favor, inicia sesión nuevamente.");
                window.location.href = '/login';
                return;
            }

            const userData = JSON.parse(userStorage);
            let token = userData.token;

            const dataToSend = { ...formData };
            if (!dataToSend.fecha_nacimiento) dataToSend.fecha_nacimiento = null;
            if (!dataToSend.lugar_trabajo) dataToSend.lugar_trabajo = null;

            const response = await fetch('http://localhost:8000/api/usuarios/', {
                method: "POST",
                headers: {
                    "Authorization": `Bearer ${token}`,
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(dataToSend)
            });

            if (response.status === 401) {
                alert("Tu sesión ha expirado. Por favor, inicia sesión nuevamente.");
                localStorage.removeItem('user');
                window.location.href = '/login';
                return;
            }

            if (!response.ok) {
                const errorData = await response.json();
                const errorMessages = Object.entries(errorData)
                    .map(([key, value]) => `${key}: ${value}`)
                    .join(' | ');
                throw new Error(errorMessages || "Error desconocido al crear usuario");
            }

            alert("Usuario creado exitosamente");
            onUserCreated();
        } catch (error) {
            console.error(error);
            alert(`No se pudo crear: ${error.message}`);
        }
    };

    return (
        <form onSubmit={handleSubmit}>
            <h5 className="mb-4 fw-bold text-secondary">Información Personal</h5>

            <div className="row g-3 mb-4">
                <div className="col-md-6">
                    <label className="form-label small fw-bold text-muted">RUT</label>
                    <input
                        className="form-control bg-light"
                        name="rut"
                        placeholder="12.345.678-9"
                        onChange={handleChange}
                        value={formData.rut}
                        required
                    />
                </div>
                <div className="col-md-6">
                    <label className="form-label small fw-bold text-muted">Nombre Completo</label>
                    <input
                        className="form-control bg-light"
                        name="nombre"
                        placeholder="Juan Pérez"
                        onChange={handleChange}
                        value={formData.nombre}
                        required
                    />
                </div>
                <div className="col-md-6">
                    <label className="form-label small fw-bold text-muted">Correo Electrónico</label>
                    <input
                        className="form-control bg-light"
                        type="email"
                        name="email"
                        placeholder="juan@ejemplo.com"
                        onChange={handleChange}
                        value={formData.email}
                        required
                    />
                </div>
                <div className="col-md-6">
                    <label className="form-label small fw-bold text-muted">Contraseña</label>
                    <input
                        className="form-control bg-light"
                        type="password"
                        name="password"
                        placeholder="••••••••"
                        onChange={handleChange}
                        value={formData.password}
                        required
                    />
                </div>
                <div className="col-md-6">
                    <label className="form-label small fw-bold text-muted">Teléfono</label>
                    <input
                        className="form-control bg-light"
                        name="telefono"
                        placeholder="+56 9 1234 5678"
                        onChange={handleChange}
                        value={formData.telefono}
                        required
                    />
                </div>
                <div className="col-md-6">
                    <label className="form-label small fw-bold text-muted">Fecha de Nacimiento</label>
                    <input
                        className="form-control bg-light"
                        type="date"
                        name="fecha_nacimiento"
                        onChange={handleChange}
                        value={formData.fecha_nacimiento}
                    />
                </div>
                <div className="col-12">
                    <label className="form-label small fw-bold text-muted">Domicilio</label>
                    <input
                        className="form-control bg-light"
                        name="domicilio"
                        placeholder="Av. Siempre Viva 123"
                        onChange={handleChange}
                        value={formData.domicilio}
                        required
                    />
                </div>
                <div className="col-12">
                    <label className="form-label small fw-bold text-muted">Lugar de Trabajo (Opcional)</label>
                    <input
                        className="form-control bg-light"
                        name="lugar_trabajo"
                        placeholder="Empresa SPA"
                        onChange={handleChange}
                        value={formData.lugar_trabajo}
                    />
                </div>
            </div>

            <h5 className="mb-3 fw-bold text-secondary">Rol y Permisos</h5>
            <div className="mb-4">
                <label className="form-label small fw-bold text-muted">Rol de Usuario</label>
                {rolesLoading && <div className="spinner-border spinner-border-sm ms-2" role="status"></div>}

                {rolesError && <div className="text-danger small">{rolesError}</div>}

                {!rolesLoading && !rolesError && (
                    <select
                        className="form-select bg-light"
                        name="id_rol"
                        value={formData.id_rol}
                        onChange={(e) =>
                            setFormData({
                                ...formData,
                                id_rol: parseInt(e.target.value, 10)
                            })
                        }
                        required
                    >
                        <option value="">Seleccione un rol</option>
                        {roles.map((rol) => (
                            <option key={rol.id_rol} value={rol.id_rol}>
                                {rol.nombre_rol}
                            </option>
                        ))}
                    </select>
                )}
            </div>

            <div className="d-flex justify-content-end pt-3 border-top">
                <button type="submit" className="btn btn-primary px-5 py-2">
                    <i className="bi bi-person-plus-fill me-2"></i>
                    Crear Usuario
                </button>
            </div>
        </form>
    );
};
export default CreateUserForm;
