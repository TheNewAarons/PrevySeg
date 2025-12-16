import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';
import '../styles/EmpresaDashboard.css';
import { useAuth } from '../../../services/authContext';
import userService from '../../../services/userService';
import Navbar from '../../../components/layout/Navbar';

const ListaTrabajadores = () => {
    const navigate = useNavigate();
    const { user } = useAuth();
    const [workers, setWorkers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        if (!user) {
            navigate('/login');
            return;
        }
        loadWorkers();
    }, [user, navigate]);

    const loadWorkers = async () => {
        try {
            setLoading(true);
            // Al llamar a getUsers sin params con rol Empresa, el backend retorna mis trabajadores
            const data = await userService.getUsers();
            setWorkers(data);
        } catch (error) {
            console.error("Error cargando trabajadores:", error);
            alert("Error al cargar la lista de trabajadores.");
        } finally {
            setLoading(false);
        }
    };

    const filteredWorkers = workers.filter(w =>
        w.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
        w.rut.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="empresa-dashboard">
            <Navbar />

            <div className="main-container">
                <div className="d-flex justify-content-between align-items-center mb-4">
                    <div>
                        <h1 className="page-title">Mis Trabajadores</h1>
                        <p className="page-subtitle">Personal registrado bajo {user?.nombre}</p>
                    </div>
                    <div>
                        <button className="btn btn-primary me-2" onClick={() => navigate('/empresa/agregar-trabajador')}>
                            <i className="bi bi-plus-lg me-2"></i>Agregar Nuevo
                        </button>
                        <button className="btn btn-secondary" onClick={() => navigate('/empresa/dashboard')}>
                            <i className="bi bi-arrow-left me-2"></i>Volver
                        </button>
                    </div>
                </div>

                <div className="card shadow-sm border-0">
                    <div className="card-header bg-white py-3">
                        <div className="row align-items-center">
                            <div className="col-md-6">
                                <div className="input-group">
                                    <span className="input-group-text bg-light border-end-0">
                                        <i className="bi bi-search text-muted"></i>
                                    </span>
                                    <input
                                        type="text"
                                        className="form-control border-start-0 ps-0"
                                        placeholder="Buscar por nombre o RUT..."
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                    />
                                </div>
                            </div>
                            <div className="col-md-6 text-end text-muted small">
                                Total: <strong>{filteredWorkers.length}</strong> trabajadores
                            </div>
                        </div>
                    </div>
                    <div className="card-body p-0">
                        {loading ? (
                            <div className="text-center py-5">
                                <div className="spinner-border text-primary" role="status">
                                    <span className="visually-hidden">Cargando...</span>
                                </div>
                            </div>
                        ) : filteredWorkers.length > 0 ? (
                            <div className="table-responsive">
                                <table className="table table-hover align-middle mb-0">
                                    <thead className="table-light">
                                        <tr>
                                            <th className="ps-4">Nombre</th>
                                            <th>RUT</th>
                                            <th>Contacto</th>
                                            <th>Estado</th>
                                            {/* <th>Acciones</th> */}
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {filteredWorkers.map(worker => (
                                            <tr key={worker.id_usuario}>
                                                <td className="ps-4 fw-bold">{worker.nombre}</td>
                                                <td>{worker.rut}</td>
                                                <td>
                                                    <div className="d-flex flex-column small">
                                                        <span><i className="bi bi-envelope me-2 text-muted"></i>{worker.email}</span>
                                                        <span><i className="bi bi-telephone me-2 text-muted"></i>{worker.telefono || '--'}</span>
                                                    </div>
                                                </td>
                                                <td>
                                                    <span className="badge bg-success bg-opacity-10 text-success border border-success">Activo</span>
                                                </td>
                                                {/* 
                                                <td>
                                                    <button className="btn btn-sm btn-light border" title="Ver Detalles">
                                                        <i className="bi bi-eye"></i>
                                                    </button>
                                                </td>
                                                */}
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        ) : (
                            <div className="text-center py-5">
                                <div className="mb-3 text-muted">
                                    <i className="bi bi-people fs-1"></i>
                                </div>
                                <h5>No se encontraron trabajadores</h5>
                                <p className="text-muted">No tienes trabajadores registrados o no coinciden con la búsqueda.</p>
                                <button className="btn btn-outline-primary btn-sm" onClick={() => navigate('/empresa/agregar-trabajador')}>
                                    Registrar Trabajador
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ListaTrabajadores;
