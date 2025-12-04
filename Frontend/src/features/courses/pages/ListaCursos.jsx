import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';
import courseService from '../../../services/courseService';
import authService from '../../../services/authService';
import '../../admin/styles/AdminDashboard.css';

const ListaCursos = () => {
    const navigate = useNavigate();
    const [courses, setCourses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        fetchCourses();
    }, []);

    const fetchCourses = async () => {
        try {
            setLoading(true);
            const data = await courseService.getCourses();
            setCourses(data || []);
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

    const filteredCourses = courses.filter(course =>
        course.nombre?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        course.area?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        course.profesor?.toLowerCase().includes(searchTerm.toLowerCase())
    );

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
                    <h1 className="page-title">Gestión de Cursos</h1>
                    <p className="page-subtitle">Administra todos los cursos disponibles en la plataforma</p>
                </div>

                <div className="card shadow-sm mb-4">
                    <div className="card-body">
                        <div className="row align-items-center mb-3">
                            <div className="col-md-6">
                                <div className="input-group">
                                    <span className="input-group-text">
                                        <i className="bi bi-search"></i>
                                    </span>
                                    <input
                                        type="text"
                                        className="form-control"
                                        placeholder="Buscar por nombre, área o profesor..."
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                    />
                                </div>
                            </div>
                            <div className="col-md-6 text-end">
                                <button
                                    className="btn btn-primary"
                                    onClick={() => navigate('/administrador/agregar-curso')}
                                >
                                    <i className="bi bi-plus-circle me-2"></i>Crear Nuevo Curso
                                </button>
                            </div>
                        </div>

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
                                <p className="mt-3">Cargando cursos...</p>
                            </div>
                        ) : filteredCourses.length === 0 ? (
                            <div className="text-center py-5">
                                <i className="bi bi-inbox" style={{ fontSize: '3rem', color: '#ccc' }}></i>
                                <p className="mt-3 text-muted">
                                    {searchTerm ? 'No se encontraron cursos con ese criterio de búsqueda.' : 'No hay cursos disponibles.'}
                                </p>
                                {!searchTerm && (
                                    <button
                                        className="btn btn-primary mt-2"
                                        onClick={() => navigate('/administrador/agregar-curso')}
                                    >
                                        <i className="bi bi-plus-circle me-2"></i>Crear Primer Curso
                                    </button>
                                )}
                            </div>
                        ) : (
                            <div className="table-responsive">
                                <table className="table table-hover align-middle">
                                    <thead className="table-light">
                                        <tr>
                                            <th>Nombre</th>
                                            <th>Área</th>
                                            <th>Modalidad</th>
                                            <th>Horas</th>
                                            <th>Profesor</th>
                                            <th>Valor</th>
                                            <th>Cupos</th>
                                            <th>Fecha Inicio</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {filteredCourses.map(course => (
                                            <tr key={course.id}>
                                                <td>
                                                    <strong>{course.nombre}</strong>
                                                    <br />
                                                    <small className="text-muted">
                                                        <i className="bi bi-award me-1"></i>
                                                        {course.tipo_certificado || 'Certificado'}
                                                    </small>
                                                </td>
                                                <td>
                                                    <span className="badge bg-info text-dark">
                                                        {course.area || 'General'}
                                                    </span>
                                                </td>
                                                <td>{course.modalidad || '—'}</td>
                                                <td>{course.horas || '—'}</td>
                                                <td>{course.profesor || '—'}</td>
                                                <td>
                                                    {course.valor ? (
                                                        <strong className="text-success">${course.valor}</strong>
                                                    ) : '—'}
                                                </td>
                                                <td>
                                                    <span className={`badge ${course.cupos_disponibles > 0 ? 'bg-success' : 'bg-danger'}`}>
                                                        {course.cupos_disponibles || 0}
                                                    </span>
                                                </td>
                                                <td>{course.fecha_inicio || '—'}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}

                        {!loading && filteredCourses.length > 0 && (
                            <div className="mt-3 text-muted">
                                <small>
                                    Mostrando {filteredCourses.length} de {courses.length} curso(s)
                                </small>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ListaCursos;
