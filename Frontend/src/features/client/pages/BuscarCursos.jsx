import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../services/authContext.jsx';
import courseService from '../../../services/courseService.jsx';
import '../../admin/styles/AdminDashboard.css';

const BuscarCursos = () => {
    const navigate = useNavigate();
    const { user, logout } = useAuth();

    const [courses, setCourses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedCourse, setSelectedCourse] = useState(null);

    const [filters, setFilters] = useState({
        search: "",
        modalidad: "",
        area: "",
        max_valor: "",
        min_horas: "",
    });

    useEffect(() => {
        if (!user) navigate("/login");
    }, [user, navigate]);

    const fetchCursos = async () => {
        if (!user) return;
        try {
            setLoading(true);
            const data = await courseService.getCursosDisponibles(filters);
            setCourses(Array.isArray(data) ? data : []);
        } catch (err) {
            console.error("Error fetching cursos disponibles:", err);
            if (err.message === "NO_TOKEN" || err.status === 401) logout();
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCursos();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [user]);

    const handleFilterChange = (e) => {
        setFilters((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const irADetalleInscripcion = (cursoId) => {
        navigate(`/cliente/cursos/${cursoId}/inscripcion`);
    };

    const openModal = (course) => setSelectedCourse(course);
    const closeModal = () => setSelectedCourse(null);

    if (!user) {
        return (
            <div className="d-flex justify-content-center align-items-center" style={{ height: "100vh" }}>
                <div className="spinner-border" role="status">
                    <span className="visually-hidden">Cargando...</span>
                </div>
            </div>
        );
    }

    const handleLogout = () => {
        if (window.confirm("¿Estás seguro que deseas cerrar sesión?")) {
            logout();
        }
    };

    return (
        <div className="administrador-dashboard">
            <nav className="navbar navbar-expand-lg navbar-light">
                <div className="container-fluid px-4">
                    <a className="navbar-brand" href="/cliente/dashboard">
                        <img src="/images/logos/logo.png" alt="PrevySeg Logo" />
                    </a>

                    <div className="d-flex align-items-center gap-3 ms-auto">
                        <div className="user-profile">
                            <div className="user-info text-end d-none d-md-block">
                                <p className="user-name">{user.nombre}</p>
                                <p className="user-role">Cliente</p>
                            </div>
                            <img src="/placeholder.svg?height=40&width=40" alt="Perfil" className="user-avatar" />
                        </div>
                        <button className="btn btn-logout" onClick={handleLogout}>
                            <i className="bi bi-box-arrow-right me-1"></i>
                            <span className="d-none d-sm-inline">Cerrar Sesión</span>
                        </button>
                    </div>
                </div>
            </nav>

            <div className="container mt-4">
                <div className="d-flex justify-content-between align-items-center mb-4">
                    <div>
                        <h1 className="fw-bold text-dark mb-2">Buscar Cursos</h1>
                        <p className="text-muted mb-0">Encuentra el curso perfecto para ti</p>
                    </div>
                    <button className="btn btn-outline-secondary" onClick={() => navigate('/cliente/dashboard')}>
                        <i className="bi bi-arrow-left me-2"></i>Volver al Panel
                    </button>
                </div>

                <div className="filters-container mb-4 p-4 bg-light rounded shadow-sm">
                    <h4 className="mb-3">Filtrar cursos</h4>

                    <div className="row g-3">
                        <div className="col-md-4">
                            <input
                                type="text"
                                name="search"
                                value={filters.search}
                                onChange={handleFilterChange}
                                className="form-control"
                                placeholder="Buscar por nombre..."
                            />
                        </div>

                        <div className="col-md-3">
                            <select className="form-control" name="area" value={filters.area} onChange={handleFilterChange}>
                                <option value="">Todas las áreas</option>
                                <option value="seguridad">Seguridad</option>
                                <option value="administracion">Administración</option>
                                <option value="tecnologia">Tecnología</option>
                                <option value="oficios">Oficios técnicos</option>
                                <option value="alimentos">Alimentos</option>
                                <option value="estetica">Belleza y estética</option>
                            </select>
                        </div>

                        <div className="col-md-3">
                            <select className="form-control" name="modalidad" value={filters.modalidad} onChange={handleFilterChange}>
                                <option value="">Todas las modalidades</option>
                                <option value="Presencial">Presencial</option>
                                <option value="Online">Online</option>
                                <option value="Mixto">Mixto</option>
                            </select>
                        </div>

                        <div className="col-md-2">
                            <input
                                type="number"
                                name="min_horas"
                                value={filters.min_horas}
                                onChange={handleFilterChange}
                                className="form-control"
                                placeholder="Mín. horas"
                            />
                        </div>

                        <div className="col-md-2">
                            <input
                                type="number"
                                name="max_valor"
                                value={filters.max_valor}
                                onChange={handleFilterChange}
                                className="form-control"
                                placeholder="Valor máx."
                            />
                        </div>

                        <div className="col-md-2">
                            <button className="btn btn-primary w-100" onClick={fetchCursos}>
                                Filtrar
                            </button>
                        </div>
                    </div>
                </div>

                {loading ? (
                    <div className="text-center py-5">Cargando cursos...</div>
                ) : (
                    <div className="row g-4 mb-5">
                        {courses.length === 0 && (
                            <div className="col-12 text-center py-5">
                                <i className="bi bi-inbox text-muted" style={{ fontSize: '3rem' }}></i>
                                <p className="mt-3 text-muted">No encontramos cursos con esos filtros. ¡Intenta buscar otra cosa!</p>
                            </div>
                        )}

                        {courses.map((course) => {
                            const yaInscrito = !!course.ya_inscrito;

                            return (
                                <div key={course.id} className="col-md-6 col-lg-4">
                                    <div className="course-card h-100 shadow-sm">
                                        <div className="course-image-container position-relative">
                                            <img
                                                src={course.image ? `/images/courses/${course.image}` : "/images/courses/default-course.png"}
                                                alt={course.nombre}
                                                className="course-image card-img-top"
                                                onError={(e) => {
                                                    e.target.onerror = null;
                                                    e.target.src = "/images/courses/default-course.png";
                                                }}
                                            />
                                            <span className="position-absolute top-0 end-0 m-2 badge bg-primary shadow-sm">
                                                {course.modalidad || "Mixto"}
                                            </span>
                                            {yaInscrito && (
                                                <div className="position-absolute bottom-0 start-0 w-100 bg-success text-white text-center py-1 opacity-75 small fw-bold">
                                                    <i className="bi bi-check-circle-fill me-1"></i> INSCRITO
                                                </div>
                                            )}
                                        </div>

                                        <div className="course-body card-body d-flex flex-column p-4">

                                            <div className="d-flex justify-content-between align-items-start mb-2">
                                                <h3 className="course-title card-title h5 mb-0 text-truncate-2 lines">{course.nombre}</h3>
                                            </div>

                                            <div className="d-flex align-items-center mb-3">
                                                <span className="badge bg-light text-secondary border me-2">
                                                    <i className="bi bi-award me-1"></i>
                                                    {course.tipo_certificado || "Certificado"}
                                                </span>
                                                <span className="small text-muted">
                                                    <i className="bi bi-clock me-1"></i> {course.horas} hrs
                                                </span>
                                            </div>

                                            <div className="course-info mb-4 flex-grow-1">
                                                <div className="d-flex justify-content-between align-items-center mb-2">
                                                    <small className="text-muted">Instructor</small>
                                                    <small className="fw-semibold text-end text-truncate w-50">{course.profesor || "PrevySeg"}</small>
                                                </div>
                                                <div className="d-flex justify-content-between align-items-center">
                                                    <small className="text-muted">Cupos</small>
                                                    <small className={`fw-semibold ${course.cupos_disponibles < 5 ? 'text-danger' : 'text-success'}`}>
                                                        {course.cupos_disponibles > 0 ? `${course.cupos_disponibles} disponibles` : 'Agotados'}
                                                    </small>
                                                </div>
                                            </div>

                                            <div className="mt-auto">
                                                <div className="d-flex align-items-end justify-content-between mb-3">
                                                    <span className="text-muted small">Valor</span>
                                                    <span className="course-price h4 mb-0 text-primary">
                                                        {course.valor ? `$${parseInt(course.valor).toLocaleString('es-CL')}` : "Gratis"}
                                                    </span>
                                                </div>

                                                <div className="d-grid gap-2">
                                                    {yaInscrito ? (
                                                        <button
                                                            className="btn btn-outline-success disabled"
                                                            disabled
                                                        >
                                                            <i className="bi bi-check-lg me-2"></i>
                                                            Ya estás inscrito
                                                        </button>
                                                    ) : (
                                                        <button
                                                            type="button"
                                                            className="btn btn-primary d-flex justify-content-between align-items-center"
                                                            onClick={() => irADetalleInscripcion(course.id)}
                                                        >
                                                            <span>Inscribirse ahora</span>
                                                            <i className="bi bi-arrow-right"></i>
                                                        </button>
                                                    )}

                                                    <button
                                                        type="button"
                                                        className="btn btn-link text-decoration-none text-muted btn-sm"
                                                        onClick={() => openModal(course)}
                                                    >
                                                        Ver más detalles
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>

            {/* Modal Detalles */}
            {selectedCourse && (
                <div
                    className="modal fade show"
                    style={{ display: "block", backgroundColor: "rgba(0,0,0,0.5)", zIndex: 1050 }}
                    tabIndex="-1"
                    onClick={closeModal}
                >
                    <div className="modal-dialog modal-lg modal-dialog-centered" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-content">
                            <div className="modal-header">
                                <h5 className="modal-title">{selectedCourse.nombre}</h5>
                                <button type="button" className="btn-close" onClick={closeModal}></button>
                            </div>

                            <div className="modal-body">
                                <div className="row">
                                    <div className="col-md-5 mb-3 mb-md-0">
                                        <img
                                            src={
                                                selectedCourse.image
                                                    ? `/images/courses/${selectedCourse.image}`
                                                    : "/images/courses/default-course.png"
                                            }
                                            alt={selectedCourse.nombre}
                                            className="img-fluid rounded shadow-sm"
                                            onError={(e) => {
                                                e.target.onerror = null;
                                                e.target.src = "/images/courses/default-course.png";
                                            }}
                                        />
                                    </div>

                                    <div className="col-md-7">
                                        <h6 className="fw-bold text-primary">Descripción</h6>
                                        <p>{selectedCourse.descripcion || "Sin descripción disponible."}</p>

                                        <div className="row mt-3">
                                            <div className="col-6 mb-2">
                                                <small className="text-muted d-block">Modalidad</small>
                                                <strong>{selectedCourse.modalidad || "No especificada"}</strong>
                                            </div>
                                            <div className="col-6 mb-2">
                                                <small className="text-muted d-block">Área</small>
                                                <strong>{selectedCourse.area || "General"}</strong>
                                            </div>
                                            <div className="col-6 mb-2">
                                                <small className="text-muted d-block">Fecha de Inicio</small>
                                                <strong>{selectedCourse.fecha_inicio || "Por definir"}</strong>
                                            </div>
                                            <div className="col-6 mb-2">
                                                <small className="text-muted d-block">Cupos Disponibles</small>
                                                <strong>{selectedCourse.cupos_disponibles ?? "—"}</strong>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <hr />

                                <div className="mt-3">
                                    <h6 className="fw-bold text-primary">Documentos Requeridos</h6>
                                    <div className="small">
                                        {Array.isArray(selectedCourse.documentos_requeridos) && selectedCourse.documentos_requeridos.length ? (
                                            <ul className="mb-0">
                                                {selectedCourse.documentos_requeridos.map((d) => (
                                                    <li key={d.id_tipo_doc}>{d.nombre}</li>
                                                ))}
                                            </ul>
                                        ) : (
                                            <span>No se requieren documentos específicos.</span>
                                        )}
                                    </div>
                                </div>
                            </div>

                            <div className="modal-footer">
                                <button type="button" className="btn btn-secondary" onClick={closeModal}>
                                    Cerrar
                                </button>
                                <button
                                    type="button"
                                    className="btn btn-primary"
                                    onClick={() => irADetalleInscripcion(selectedCourse.id)}
                                >
                                    Ir a Inscripción
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default BuscarCursos;
