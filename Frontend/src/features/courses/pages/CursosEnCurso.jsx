import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';
import courseService from '../../../services/courseService';
import authService from '../../../services/authService';
import '../../admin/styles/AdminDashboard.css';

const CursosEnCurso = () => {
    const navigate = useNavigate();
    const [courses, setCourses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        fetchInProgressCourses();
    }, []);

    const fetchInProgressCourses = async () => {
        try {
            setLoading(true);
            const data = await courseService.getCourses();
            // Filtrar solo cursos en curso
            const inProgressCourses = data.filter(course => course.estado === 'en_curso');
            setCourses(inProgressCourses || []);
            setError('');
        } catch (err) {
            console.error('Error al cargar cursos:', err);
            if (err.status === 401 || err.message.includes("token_not_valid")) {
                alert("Tu sesión ha expirado. Por favor inicia sesión nuevamente.");
                authService.logout();
                navigate('/login');
                return;
            }
            setError('Error al cargar los cursos. Por favor intenta nuevamente.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="administrador-dashboard">
            <nav className="navbar navbar-expand-lg navbar-light">
                <div className="container-fluid px-4">
                    <a className="navbar-brand" href="/">
                        <img src="/images/logos/logo.png" alt="PrevySeg Logo" />
                    </a>
                    <div className="d-flex align-items-center gap-3 ms-auto">
                        <button className="btn btn-secondary" onClick={() => navigate('/administrador/dashboard')}>
                            <i className="bi bi-arrow-left me-2"></i>Volver al Dashboard
                        </button>
                    </div>
                </div>
            </nav>

            <div className="main-container">
                <div className="page-header">
                    <h1 className="page-title">Cursos en Curso</h1>
                    <p className="page-subtitle">Cursos que están actualmente en desarrollo</p>
                </div>

                <div className="card shadow-sm mb-4">
                    <div className="card-body">
                        {error && (
                            <div className="alert alert-danger" role="alert">
                                <i className="bi bi-exclamation-triangle me-2"></i>
                                {error}
                            </div>
                        )}

                        {loading ? (
                            <div className="text-center py-5">
                                <div className="spinner-border text-primary" role="status">
                                    <span className="visually-hidden">Cargando...</span>
                                </div>
                                <p className="mt-3">Cargando cursos en curso...</p>
                            </div>
                        ) : courses.length === 0 ? (
                            <div className="text-center py-5">
                                <i className="bi bi-inbox" style={{ fontSize: '3rem', color: '#ccc' }}></i>
                                <p className="mt-3 text-muted">
                                    No hay cursos en curso en este momento.
                                </p>
                                <button
                                    className="btn btn-primary mt-2"
                                    onClick={() => navigate('/administrador/cursos')}
                                >
                                    <i className="bi bi-list me-2"></i>Ver Todos los Cursos
                                </button>
                            </div>
                        ) : (
                            <>
                                <div className="table-responsive">
                                    <table className="table table-hover align-middle">
                                        <thead className="table-light">
                                            <tr>
                                                <th>Nombre del Curso</th>
                                                <th>Profesor</th>
                                                <th>Días de la Semana</th>
                                                <th>Horario</th>
                                                <th>Cupos Disponibles</th>
                                                <th className="text-center">Acciones</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {courses.map(course => (
                                                <tr key={course.id}>
                                                    <td>
                                                        <strong>{course.nombre}</strong>
                                                        <br />
                                                        <small className="text-muted">
                                                            <i className="bi bi-tag me-1"></i>
                                                            {course.area || 'General'}
                                                        </small>
                                                    </td>
                                                    <td>{course.profesor || '—'}</td>
                                                    <td>
                                                        {course.dias_semana ? (
                                                            <span className="badge bg-primary">
                                                                {course.dias_semana}
                                                            </span>
                                                        ) : (
                                                            <span className="text-muted">No especificado</span>
                                                        )}
                                                    </td>
                                                    <td>
                                                        {course.hora_inicio && course.hora_fin ? (
                                                            <>
                                                                <i className="bi bi-clock me-1"></i>
                                                                {course.hora_inicio} - {course.hora_fin}
                                                            </>
                                                        ) : (
                                                            <span className="text-muted">No especificado</span>
                                                        )}
                                                    </td>
                                                    <td>
                                                        <span className={`badge ${course.cupos_disponibles > 0 ? 'bg-success' : 'bg-danger'}`}>
                                                            {course.cupos_disponibles || 0} cupos
                                                        </span>
                                                    </td>
                                                    <td>
                                                        <div className="btn-group" role="group">
                                                            <button
                                                                className="btn btn-sm btn-info"
                                                                onClick={() => navigate(`/administrador/cursos/${course.id}`)}
                                                                title="Ver detalles"
                                                            >
                                                                <i className="bi bi-eye"></i>
                                                            </button>
                                                            <button
                                                                className="btn btn-sm btn-warning"
                                                                onClick={() => navigate(`/administrador/cursos/${course.id}/editar`)}
                                                                title="Editar"
                                                            >
                                                                <i className="bi bi-pencil"></i>
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
                                        <i className="bi bi-info-circle me-1"></i>
                                        Mostrando {courses.length} curso(s) en curso
                                    </small>
                                </div>
                            </>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CursosEnCurso;
