import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';
import '../styles/AdminDashboard.css';
import courseService from '../../../services/courseService';
import authService from '../../../services/authService';

const Horarios = () => {
    const navigate = useNavigate();
    const [courses, setCourses] = useState([]);
    const [filteredCourses, setFilteredCourses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [filterDay, setFilterDay] = useState('');
    const [searchTerm, setSearchTerm] = useState('');

    const diasSemana = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];

    useEffect(() => {
        fetchCourses();
    }, []);

    useEffect(() => {
        applyFilters();
    }, [filterDay, searchTerm, courses]);

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
            setError('Error al cargar los horarios. Por favor intenta nuevamente.');
        } finally {
            setLoading(false);
        }
    };

    const applyFilters = () => {
        let filtered = courses;

        // Filtrar por día de la semana
        if (filterDay) {
            filtered = filtered.filter(course =>
                course.dias_semana && course.dias_semana.toLowerCase().includes(filterDay.toLowerCase())
            );
        }

        // Filtrar por búsqueda
        if (searchTerm) {
            filtered = filtered.filter(course =>
                course.nombre?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                course.profesor?.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }

        setFilteredCourses(filtered);
    };

    const formatTime = (time) => {
        if (!time) return '—';
        return time.substring(0, 5); // Format HH:MM
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
                    <h1 className="page-title">Horarios de Cursos</h1>
                    <p className="page-subtitle">Visualiza y gestiona los horarios de todos los cursos</p>
                </div>

                <div className="card shadow-sm mb-4">
                    <div className="card-body">
                        <div className="row align-items-center mb-4">
                            <div className="col-md-4">
                                <div className="input-group">
                                    <span className="input-group-text">
                                        <i className="bi bi-search"></i>
                                    </span>
                                    <input
                                        type="text"
                                        className="form-control"
                                        placeholder="Buscar por curso o profesor..."
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                    />
                                </div>
                            </div>
                            <div className="col-md-4">
                                <select
                                    className="form-select"
                                    value={filterDay}
                                    onChange={(e) => setFilterDay(e.target.value)}
                                >
                                    <option value="">Todos los días</option>
                                    {diasSemana.map(dia => (
                                        <option key={dia} value={dia}>{dia}</option>
                                    ))}
                                </select>
                            </div>
                            <div className="col-md-4 text-end">
                                <button
                                    className="btn btn-primary"
                                    onClick={() => navigate('/administrador/agregar-curso')}
                                >
                                    <i className="bi bi-plus-circle me-2"></i>Crear Curso
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
                                <p className="mt-3">Cargando horarios...</p>
                            </div>
                        ) : filteredCourses.length === 0 ? (
                            <div className="text-center py-5">
                                <i className="bi bi-calendar-x" style={{ fontSize: '3rem', color: '#ccc' }}></i>
                                <p className="mt-3 text-muted">
                                    {searchTerm || filterDay
                                        ? 'No se encontraron cursos con ese criterio.'
                                        : 'No hay cursos con horarios asignados.'}
                                </p>
                            </div>
                        ) : (
                            <>
                                <div className="table-responsive">
                                    <table className="table table-hover align-middle">
                                        <thead className="table-light">
                                            <tr>
                                                <th>Curso</th>
                                                <th>Profesor</th>
                                                <th>Días</th>
                                                <th>Horario</th>
                                                <th>Modalidad</th>
                                                <th>Fecha Inicio</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {filteredCourses.map((course) => (
                                                <tr key={course.id}>
                                                    <td>
                                                        <strong>{course.nombre}</strong>
                                                        <br />
                                                        <small className="text-muted">
                                                            <i className="bi bi-award me-1"></i>
                                                            {course.tipo_certificado || 'Certificado'}
                                                        </small>
                                                    </td>
                                                    <td>{course.profesor || '—'}</td>
                                                    <td>
                                                        {course.dias_semana ? (
                                                            <div className="d-flex flex-wrap gap-1">
                                                                {course.dias_semana.split(',').map((dia, idx) => (
                                                                    <span key={idx} className="badge bg-info text-dark">
                                                                        {dia.trim()}
                                                                    </span>
                                                                ))}
                                                            </div>
                                                        ) : (
                                                            <span className="text-muted">Sin asignar</span>
                                                        )}
                                                    </td>
                                                    <td>
                                                        {course.hora_inicio && course.hora_fin ? (
                                                            <span>
                                                                <i className="bi bi-clock me-1"></i>
                                                                {formatTime(course.hora_inicio)} - {formatTime(course.hora_fin)}
                                                            </span>
                                                        ) : (
                                                            <span className="text-muted">Sin asignar</span>
                                                        )}
                                                    </td>
                                                    <td>
                                                        <span className={`badge ${course.modalidad === 'Online' ? 'bg-primary' :
                                                                course.modalidad === 'Presencial' ? 'bg-success' :
                                                                    'bg-warning text-dark'
                                                            }`}>
                                                            {course.modalidad}
                                                        </span>
                                                    </td>
                                                    <td>{course.fecha_inicio || '—'}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>

                                <div className="mt-3 text-muted">
                                    <small>
                                        Mostrando {filteredCourses.length} de {courses.length} curso(s)
                                    </small>
                                </div>
                            </>
                        )}
                    </div>
                </div>

                {/* Leyenda de información */}
                <div className="card shadow-sm">
                    <div className="card-body">
                        <h6 className="card-title mb-3">
                            <i className="bi bi-info-circle me-2"></i>
                            Información
                        </h6>
                        <ul className="mb-0">
                            <li>Los horarios se muestran en formato de 24 horas</li>
                            <li>Puedes filtrar por día de la semana para ver qué cursos se imparten cada día</li>
                            <li>Los cursos sin horario asignado aparecen como "Sin asignar"</li>
                            <li>Para asignar o modificar horarios, edita el curso correspondiente</li>
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Horarios;
