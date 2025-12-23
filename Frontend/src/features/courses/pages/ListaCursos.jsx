import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';
import courseService from '../../../services/courseService';
import authService from '../../../services/authService';
import '../../admin/styles/AdminDashboard.css';
import Navbar from '../../../components/layout/Navbar';
import { formatPriceCLP } from '../../../utils/formatters';

const ListaCursos = () => {
    const navigate = useNavigate();
    const [courses, setCourses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const [estadoFilter, setEstadoFilter] = useState('');

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

    const handleDelete = async (courseId, courseName) => {
        if (window.confirm(`¿Estás seguro de que deseas eliminar el curso "${courseName}"?`)) {
            try {
                await courseService.deleteCourse(courseId);
                alert('Curso eliminado exitosamente.');
                fetchCourses(); // Recargar la lista
            } catch (err) {
                console.error('Error al eliminar curso:', err);
                alert('Error al eliminar el curso. Por favor intenta nuevamente.');
            }
        }
    };

    const getEstadoBadge = (estado) => {
        const badges = {
            'por_empezar': { class: 'bg-info', text: 'Por Empezar' },
            'en_curso': { class: 'bg-success', text: 'En Curso' },
            'finalizado': { class: 'bg-secondary', text: 'Finalizado' }
        };
        const badge = badges[estado] || { class: 'bg-secondary', text: 'Desconocido' };
        return <span className={`badge ${badge.class}`}>{badge.text}</span>;
    };

    const filteredCourses = courses.filter(course => {
        const matchesSearch = course.nombre?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            course.area?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            course.profesor?.toLowerCase().includes(searchTerm.toLowerCase());

        const matchesEstado = !estadoFilter || course.estado === estadoFilter;

        return matchesSearch && matchesEstado;
    });

    return (
        <div className="administrador-dashboard">
            <Navbar />

            <div className="main-container">
                <div className="d-flex justify-content-between align-items-center mb-4">
                    <div>
                        <h1 className="page-title">Gestión de Cursos</h1>
                        <p className="page-subtitle">Administra todos los cursos disponibles en la plataforma</p>
                    </div>
                    <button className="btn btn-outline-secondary" onClick={() => navigate('/administrador/dashboard')}>
                        <i className="bi bi-arrow-left me-2"></i>Volver al Panel
                    </button>
                </div>

                <div className="card shadow-sm mb-4">
                    <div className="card-body">
                        <div className="row align-items-center mb-3">
                            <div className="col-md-4">
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
                            <div className="col-md-3">
                                <select
                                    className="form-select"
                                    value={estadoFilter}
                                    onChange={(e) => setEstadoFilter(e.target.value)}
                                >
                                    <option value="">Todos los estados</option>
                                    <option value="por_empezar">Por Empezar</option>
                                    <option value="en_curso">En Curso</option>
                                    <option value="finalizado">Finalizado</option>
                                </select>
                            </div>
                            <div className="col-md-5 text-end">
                                <button
                                    className="btn btn-primary"
                                    onClick={() => navigate('/administrador/cursos/crear')}
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
                                        onClick={() => navigate('/administrador/cursos/crear')}
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
                                            <th>Estado</th>
                                            <th>Horas</th>
                                            <th>Profesor</th>
                                            <th>Valor</th>
                                            <th>Cupos</th>
                                            <th>Fecha Inicio</th>
                                            <th className="text-center">Acciones</th>
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
                                                <td>{getEstadoBadge(course.estado)}</td>
                                                <td>{course.horas || '—'}</td>
                                                <td>{course.profesor || '—'}</td>
                                                <td>
                                                    {course.valor ? (
                                                        <strong className="text-success">{formatPriceCLP(course.valor)}</strong>
                                                    ) : '—'}
                                                </td>
                                                <td>
                                                    <span className={`badge ${course.cupos_disponibles > 0 ? 'bg-success' : 'bg-danger'}`}>
                                                        {course.cupos_disponibles || 0}
                                                    </span>
                                                </td>
                                                <td>{course.fecha_inicio || '—'}</td>
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
                                                        <button
                                                            className="btn btn-sm btn-danger"
                                                            onClick={() => handleDelete(course.id, course.nombre)}
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
