import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';
import '../styles/AdminDashboard.css';
import { useAuth } from '../../../services/authContext';
import authService from '../../../services/authService';
import courseService from '../../../services/courseService';

const AdminDashboard = () => {
    const navigate = useNavigate();
    const { user, logout } = useAuth();
    
    const [courseCount, setCourseCount] = useState(0);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchCourseCount = async () => {
            //verificar que hay usuario antes de hacer peticiones
            if (!user) {
                console.log('⚠️ No hay usuario, redirigiendo a login');
                navigate('/login');
                return;
            }

            try {
                setLoading(true);
                setError(null);
                
                const courses = await courseService.getCourses();
                setCourseCount(courses.length);
            } catch (err) {
                console.error('Error al cargar cursos:', err);
                setError(err.message);
                
                //si el error es de sesión expirada, hacer logout
                if (err.message.includes('Sesión expirada') || err.message.includes('No hay sesión')) {
                    logout();
                }
            } finally {
                setLoading(false);
            }
        };

        fetchCourseCount();
    }, [user, navigate, logout]);

    if (!user) {
        return null; //o un spinner mientras redirige
    }

    return (
        <div className="container mt-5">
            <div className="d-flex justify-content-between align-items-center mb-4">
                <h1>Dashboard Administrador</h1>
                <button className="btn btn-danger" onClick={logout}>
                    Cerrar Sesión
                </button>
            </div>

            {/* Información del usuario */}
            <div className="card mb-4">
                <div className="card-body">
                    <h5>Bienvenido, {user.nombre || 'Administrador'}</h5>
                    <p className="text-muted mb-0">
                        Rol: {user.rol_nombre || user.rol}
                    </p>
                </div>
            </div>

            {/* Estadísticas */}
            <div className="row">
                <div className="col-md-4 mb-3">
                    <div className="card text-white bg-primary">
                        <div className="card-body">
                            <h5 className="card-title">Cursos</h5>
                            {loading ? (
                                <p className="card-text">Cargando...</p>
                            ) : error ? (
                                <p className="card-text text-warning">Error al cargar</p>
                            ) : (
                                <h2>{courseCount}</h2>
                            )}
                        </div>
                    </div>
                </div>

                <div className="col-md-4 mb-3">
                    <div className="card text-white bg-success">
                        <div className="card-body">
                            <h5 className="card-title">Usuarios</h5>
                            <h2>-</h2>
                        </div>
                    </div>
                </div>

                <div className="col-md-4 mb-3">
                    <div className="card text-white bg-info">
                        <div className="card-body">
                            <h5 className="card-title">Documentos</h5>
                            <h2>-</h2>
                        </div>
                    </div>
                </div>
            </div>

            {/* Acciones rápidas */}
            <div className="card">
                <div className="card-header">
                    <h5>Acciones Rápidas</h5>
                </div>
                <div className="card-body">
                    <div className="row">
                        <div className="col-md-3 mb-2">
                            <button 
                                className="btn btn-outline-primary w-100"
                                onClick={() => navigate('/administrador/cursos')}
                            >
                                📚 Gestionar Cursos
                            </button>
                        </div>
                        <div className="col-md-3 mb-2">
                            <button 
                                className="btn btn-outline-success w-100"
                                onClick={() => navigate('/administrador/list-users')}
                            >
                                👥 Gestionar Usuarios
                            </button>
                        </div>
                        <div className="col-md-3 mb-2">
                            <button 
                                className="btn btn-outline-info w-100"
                                onClick={() => navigate('/administrador/aprobar-papeles')}
                            >
                                📄 Aprobar Documentos
                            </button>
                        </div>
                        <div className="col-md-3 mb-2">
                            <button 
                                className="btn btn-outline-warning w-100"
                                onClick={() => navigate('/administrador/reportes')}
                            >
                                📊 Ver Reportes
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Mostrar error si existe */}
            {error && (
                <div className="alert alert-danger mt-3" role="alert">
                    {error}
                </div>
            )}
        </div>
    );
};

export default AdminDashboard;