import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';
import '../styles/EmpresaDashboard.css';
import { useAuth } from '../../../services/authContext';
import userService from '../../../services/userService';
import Navbar from '../../../components/layout/Navbar';

const AgregarTrabajador = () => {
    const navigate = useNavigate();
    const { user } = useAuth();

    // States
    const [activeTab, setActiveTab] = useState('nuevo'); // 'nuevo' | 'existente'
    const [loading, setLoading] = useState(false);

    // Form States (New User)
    const [formData, setFormData] = useState({
        rut: '',
        nombre: '',
        email: '',
        telefono: '',
        domicilio: '',
        password: '',
        confirmPassword: ''
    });

    // Search States (Existing User)
    const [searchRut, setSearchRut] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [allUsers, setAllUsers] = useState([]);

    useEffect(() => {
        if (!user) {
            navigate('/login');
        } else {
            // Load users for search capability
            loadUsers();
        }
    }, [user, navigate]);

    const loadUsers = async () => {
        try {
            const data = await userService.getCandidates();
            setAllUsers(data);
            setSearchResults(data); // Mostrar todos inicialmente
        } catch (error) {
            console.error("Error loading candidates:", error);
        }
    };

    const handleInputChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    // --- LOGIC: Create New Worker ---
    const handleSubmitNuevo = async (e) => {
        e.preventDefault();
        if (formData.password !== formData.confirmPassword) {
            alert("Las contraseñas no coinciden.");
            return;
        }

        setLoading(true);
        try {
            const newWorkerData = {
                ...formData,
                lugar_trabajo: user.nombre, // 🟢 Asigna nombre de la empresa
                rol: 'Cliente' // Por defecto trabajador es Cliente/Usuario
            };

            // Remove confirmPassword needed for frontend val only
            delete newWorkerData.confirmPassword;

            await userService.createUser(newWorkerData);
            alert("Trabajador registrado y vinculado exitosamente.");
            setFormData({
                rut: '', nombre: '', email: '', telefono: '', domicilio: '', password: '', confirmPassword: ''
            });
        } catch (error) {
            alert("Error al registrar: " + error.message);
        } finally {
            setLoading(false);
        }
    };

    // --- LOGIC: Link Existing User ---
    const handleSearch = (searchTerm) => {
        setSearchRut(searchTerm);

        if (!searchTerm) {
            setSearchResults(allUsers);
            return;
        }

        // Normalizar entrada (quitar puntos y guión) para comparación flexible
        const term = searchTerm.toLowerCase().replace(/\./g, '').replace(/-/g, '');

        const results = allUsers.filter(u => {
            const rutLimpio = u.rut.toLowerCase().replace(/\./g, '').replace(/-/g, '');
            const nombre = u.nombre.toLowerCase();
            return rutLimpio.includes(term) || nombre.includes(searchTerm.toLowerCase());
        });

        setSearchResults(results);
    };

    const handleVincular = async (worker) => {
        if (!window.confirm(`¿Vincular a ${worker.nombre} a su empresa (${user.nombre})?`)) return;

        setLoading(true);
        try {
            await userService.updateUser(worker.id_usuario, {
                lugar_trabajo: user.nombre
            });
            alert("Trabajador vinculado exitosamente.");

            // Update local state to reflect change
            setAllUsers(prev => prev.map(u =>
                u.id_usuario === worker.id_usuario ? { ...u, lugar_trabajo: user.nombre } : u
            ));
            handleSearch(searchRut); // Refresh results with current search term
        } catch (error) {
            alert("Error al vincular: " + error.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="empresa-dashboard">
            <Navbar />

            <div className="main-container">
                <div className="d-flex justify-content-between align-items-center mb-4">
                    <div>
                        <h1 className="page-title">Agregar Trabajador</h1>
                        <p className="page-subtitle">Gestiona el ingreso de personal a tu empresa: {user?.nombre}</p>
                    </div>
                    <button className="btn btn-secondary" onClick={() => navigate('/empresa/dashboard')}>
                        <i className="bi bi-arrow-left me-2"></i>Volver
                    </button>
                </div>

                <div className="card shadow-sm border-0">
                    <div className="card-header bg-white border-bottom-0 pb-0">
                        <ul className="nav nav-tabs card-header-tabs">
                            <li className="nav-item">
                                <button
                                    className={`nav-link ${activeTab === 'nuevo' ? 'active fw-bold text-primary' : 'text-muted'}`}
                                    onClick={() => setActiveTab('nuevo')}
                                >
                                    <i className="bi bi-person-plus-fill me-2"></i>Crear Nuevo
                                </button>
                            </li>
                            <li className="nav-item">
                                <button
                                    className={`nav-link ${activeTab === 'existente' ? 'active fw-bold text-primary' : 'text-muted'}`}
                                    onClick={() => setActiveTab('existente')}
                                >
                                    <i className="bi bi-link-45deg me-2"></i>Vincular Existente
                                </button>
                            </li>
                        </ul>
                    </div>

                    <div className="card-body p-4">
                        {activeTab === 'nuevo' ? (
                            <form onSubmit={handleSubmitNuevo}>
                                <div className="row g-3">
                                    <div className="col-12 mb-3">
                                        <div className="alert alert-info py-2">
                                            <i className="bi bi-info-circle me-2"></i>
                                            El usuario será creado con el lugar de trabajo: <strong>{user?.nombre}</strong>
                                        </div>
                                    </div>

                                    <div className="col-md-6">
                                        <label className="form-label">RUT</label>
                                        <input type="text" className="form-control" name="rut" required value={formData.rut} onChange={handleInputChange} placeholder="12345678-9" />
                                    </div>
                                    <div className="col-md-6">
                                        <label className="form-label">Nombre Completo</label>
                                        <input type="text" className="form-control" name="nombre" required value={formData.nombre} onChange={handleInputChange} />
                                    </div>
                                    <div className="col-md-6">
                                        <label className="form-label">Email</label>
                                        <input type="email" className="form-control" name="email" required value={formData.email} onChange={handleInputChange} />
                                    </div>
                                    <div className="col-md-6">
                                        <label className="form-label">Teléfono</label>
                                        <input type="text" className="form-control" name="telefono" required value={formData.telefono} onChange={handleInputChange} />
                                    </div>
                                    <div className="col-12">
                                        <label className="form-label">Domicilio</label>
                                        <input type="text" className="form-control" name="domicilio" required value={formData.domicilio} onChange={handleInputChange} />
                                    </div>
                                    <div className="col-md-6">
                                        <label className="form-label">Contraseña</label>
                                        <input type="password" className="form-control" name="password" required value={formData.password} onChange={handleInputChange} />
                                    </div>
                                    <div className="col-md-6">
                                        <label className="form-label">Confirmar Contraseña</label>
                                        <input type="password" className="form-control" name="confirmPassword" required value={formData.confirmPassword} onChange={handleInputChange} />
                                    </div>

                                    <div className="col-12 mt-4 text-end">
                                        <button type="submit" className="btn btn-primary px-4" disabled={loading}>
                                            {loading ? 'Procesando...' : 'Registrar Trabajador'}
                                        </button>
                                    </div>
                                </div>
                            </form>
                        ) : (
                            <div>
                                <div className="mb-4">
                                    <label className="form-label text-muted">Buscar candidato disponible:</label>
                                    <div className="input-group">
                                        <span className="input-group-text bg-white"><i className="bi bi-search"></i></span>
                                        <input
                                            type="text"
                                            className="form-control"
                                            placeholder="Escribe RUT o Nombre..."
                                            value={searchRut}
                                            onChange={(e) => handleSearch(e.target.value)}
                                        />
                                    </div>
                                    <small className="text-muted ms-1">
                                        * Solo se muestran usuarios registrados como Clientes que no tienen empresa asignada.
                                    </small>
                                </div>

                                {searchResults.length > 0 ? (
                                    <div className="table-responsive">
                                        <table className="table table-hover align-middle">
                                            <thead className="table-light">
                                                <tr>
                                                    <th>Nombre</th>
                                                    <th>RUT</th>
                                                    <th>Email</th>
                                                    <th>Acción</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {searchResults.map(u => (
                                                    <tr key={u.id_usuario}>
                                                        <td>{u.nombre}</td>
                                                        <td>{u.rut}</td>
                                                        <td>{u.email}</td>
                                                        <td>
                                                            <button
                                                                className="btn btn-sm btn-primary"
                                                                onClick={() => handleVincular(u)}
                                                                disabled={loading || u.lugar_trabajo === user.nombre} // Disable if already linked
                                                            >
                                                                <i className="bi bi-link-45deg me-1"></i>
                                                                {u.lugar_trabajo === user.nombre ? 'Vinculado' : 'Vincular'}
                                                            </button>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                ) : (
                                    <div className="text-center text-muted py-5">
                                        <i className="bi bi-person-x fs-1 mb-2"></i>
                                        <p>No se encontraron trabajadores disponibles.</p>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AgregarTrabajador;
