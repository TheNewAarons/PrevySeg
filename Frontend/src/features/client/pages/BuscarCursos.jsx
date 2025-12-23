import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../services/authContext.jsx';
import courseService from '../../../services/courseService.jsx';
import '../styles/ClienteDashboard.css'; // Updated CSS
import Navbar from '../../../components/layout/Navbar';

const BuscarCursos = () => {
    const navigate = useNavigate();
    const { user } = useAuth();

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
            // Removed direct logout call here as useAuth/Navbar handles auth state more gracefully usually, 
            // but if desired we could keep it. For now, assuming standard flow.
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
            <div className="d-flex justify-content-center align-items-center vh-100">
                <div className="spinner-border text-primary" role="status">
                    <span className="visually-hidden">Cargando...</span>
                </div>
            </div>
        );
    }

    return (
        <div className="cliente-dashboard">
            <Navbar />

            <div className="container mt-4">
                <div className="d-flex flex-column flex-md-row justify-content-between align-items-center mb-5 animate-fade-in">
                    <div className="mb-3 mb-md-0">
                        <h1 className="page-title">Catálogo de Cursos</h1>
                        <p className="page-subtitle">Explora y encuentra tu próxima oportunidad de aprendizaje.</p>
                    </div>
                    <button className="btn btn-outline-secondary" onClick={() => navigate('/cliente/dashboard')}>
                        <i className="bi bi-arrow-left me-2"></i>Volver al Panel
                    </button>
                </div>

                {/* Filters Section */}
                <div className="bg-white p-4 rounded-3 shadow-sm mb-5 animate-fade-in" style={{ border: '1px solid rgba(0,0,0,0.05)' }}>
                    <div className="row g-3">
                        <div className="col-md-4">
                            <label className="form-label small text-muted fw-bold">Buscar</label>
                            <div className="input-group">
                                <span className="input-group-text bg-light border-end-0"><i className="bi bi-search text-muted"></i></span>
                                <input
                                    type="text"
                                    name="search"
                                    value={filters.search}
                                    onChange={handleFilterChange}
                                    className="form-control bg-light border-start-0 ps-0"
                                    placeholder="Nombre del curso..."
                                />
                            </div>
                        </div>

                        <div className="col-md-3">
                            <label className="form-label small text-muted fw-bold">Área</label>
                            <select className="form-select bg-light" name="area" value={filters.area} onChange={handleFilterChange}>
                                <option value="">Todas</option>
                                <option value="seguridad">Seguridad</option>
                                <option value="administracion">Administración</option>
                                <option value="tecnologia">Tecnología</option>
                                <option value="oficios">Oficios técnicos</option>
                                <option value="alimentos">Alimentos</option>
                                <option value="estetica">Belleza y estética</option>
                            </select>
                        </div>

                        <div className="col-md-3">
                            <label className="form-label small text-muted fw-bold">Modalidad</label>
                            <select className="form-select bg-light" name="modalidad" value={filters.modalidad} onChange={handleFilterChange}>
                                <option value="">Cualquiera</option>
                                <option value="Presencial">Presencial</option>
                                <option value="Online">Online</option>
                                <option value="Mixto">Mixto</option>
                            </select>
                        </div>

                        <div className="col-md-2 d-flex align-items-end">
                            <button className="btn btn-inscribirse w-100" onClick={fetchCursos}>
                                Filtrar
                            </button>
                        </div>
                    </div>
                </div>

                {loading ? (
                    <div className="d-flex justify-content-center py-5">
                        <div className="spinner-border text-primary" role="status">
                            <span className="visually-hidden">Cargando...</span>
                        </div>
                    </div>
                ) : (
                    <div className="row g-4 mb-5">
                        {courses.length === 0 && (
                            <div className="col-12 text-center py-5">
                                <i className="bi bi-search text-muted" style={{ fontSize: '3rem', opacity: 0.5 }}></i>
                                <p className="mt-3 text-muted">No encontramos cursos que coincidan con tu búsqueda.</p>
                                <button className="btn btn-link text-decoration-none" onClick={() => setFilters({ search: "", modalidad: "", area: "", max_valor: "", min_horas: "" })}>
                                    Limpiar filtros
                                </button>
                            </div>
                        )}

                        {courses.map((course) => {
                            const yaInscrito = !!course.ya_inscrito;

                            return (
                                <div key={course.id} className="col-md-6 col-lg-4 d-flex">
                                    <div className="course-card w-100 animate-slide-up">
                                        <div className="position-relative">
                                            <img
                                                src={course.image ? `/images/courses/${course.image}` : "/images/courses/default-course.png"}
                                                alt={course.nombre}
                                                className="course-image"
                                                onError={(e) => {
                                                    e.target.onerror = null;
                                                    e.target.src = "/images/courses/default-course.png";
                                                }}
                                            />
                                            <div className="position-absolute top-0 end-0 m-3">
                                                <span className="badge bg-white text-dark shadow-sm border">
                                                    {course.modalidad || "Mixto"}
                                                </span>
                                            </div>
                                            {yaInscrito && (
                                                <div className="position-absolute bottom-0 start-0 w-100 bg-success text-white text-center py-1 opacity-90 small fw-bold">
                                                    <i className="bi bi-check-circle-fill me-1"></i> Inscrito
                                                </div>
                                            )}
                                        </div>

                                        <div className="course-body">
                                            <div className="d-flex justify-content-between align-items-start mb-2">
                                                <h3 className="course-title text-truncate-2" title={course.nombre}>
                                                    {course.nombre}
                                                </h3>
                                            </div>

                                            <div className="d-flex align-items-center mb-3 gap-2">
                                                <span className="badge bg-light text-secondary border fw-normal">
                                                    <i className="bi bi-award me-1"></i>
                                                    {course.tipo_certificado || "Certificado"}
                                                </span>
                                                <span className="small text-muted">
                                                    <i className="bi bi-clock me-1"></i> {course.horas} hrs
                                                </span>
                                            </div>

                                            <div className="course-info mt-auto pt-3 border-top border-light">
                                                <div className="info-item justify-content-between mb-1">
                                                    <span className="text-muted small">Profesor</span>
                                                    <span className="small fw-semibold text-end text-truncate w-50">{course.profesor || "PrevySeg"}</span>
                                                </div>
                                                <div className="info-item justify-content-between">
                                                    <span className="text-muted small">Disponibilidad</span>
                                                    <span className={`small fw-bold ${course.cupos_disponibles < 5 ? 'text-danger' : 'text-success'}`}>
                                                        {course.cupos_disponibles > 0 ? `${course.cupos_disponibles} cupos` : 'Agotado'}
                                                    </span>
                                                </div>
                                            </div>

                                            <div className="mt-3">
                                                <div className="d-flex justify-content-between align-items-end mb-3">
                                                    <span className="course-price mb-0">
                                                        {course.valor ? `$${parseInt(course.valor).toLocaleString('es-CL')}` : "Gratis"}
                                                    </span>
                                                </div>

                                                <div className="d-grid gap-2">
                                                    {yaInscrito ? (
                                                        <button className="btn btn-outline-success disabled" disabled>
                                                            <i className="bi bi-check-lg me-2"></i> Inscrito
                                                        </button>
                                                    ) : (
                                                        <button
                                                            className="btn btn-inscribirse"
                                                            onClick={() => irADetalleInscripcion(course.id)}
                                                        >
                                                            Inscribirse
                                                            <i className="bi bi-arrow-right ms-2"></i>
                                                        </button>
                                                    )}
                                                    <button
                                                        className="btn btn-link text-decoration-none text-secondary btn-sm"
                                                        onClick={() => openModal(course)}
                                                    >
                                                        Ver detalles completos
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
                        <div className="modal-content border-0 shadow-lg rounded-4 overflow-hidden">
                            <div className="modal-header border-0 pb-0">
                                <h5 className="modal-title fw-bold text-dark px-2">{selectedCourse.nombre}</h5>
                                <button type="button" className="btn-close" onClick={closeModal}></button>
                            </div>

                            <div className="modal-body p-4">
                                <div className="row g-4">
                                    <div className="col-md-5">
                                        <img
                                            src={selectedCourse.image ? `/images/courses/${selectedCourse.image}` : "/images/courses/default-course.png"}
                                            alt={selectedCourse.nombre}
                                            className="img-fluid rounded-3 shadow-sm w-100 object-fit-cover"
                                            style={{ height: '240px' }}
                                            onError={(e) => { e.target.onerror = null; e.target.src = "/images/courses/default-course.png"; }}
                                        />
                                    </div>

                                    <div className="col-md-7">
                                        <h6 className="fw-bold mb-2" style={{ color: 'var(--prevy-navy)' }}>Descripción</h6>
                                        <p className="text-muted small mb-4">{selectedCourse.descripcion || "Sin descripción disponible."}</p>

                                        <div className="row g-2">
                                            <div className="col-6">
                                                <div className="p-2 bg-light rounded border">
                                                    <small className="d-block text-muted" style={{ fontSize: '0.7rem' }}>Modalidad</small>
                                                    <span className="fw-semibold small">{selectedCourse.modalidad || "—"}</span>
                                                </div>
                                            </div>
                                            <div className="col-6">
                                                <div className="p-2 bg-light rounded border">
                                                    <small className="d-block text-muted" style={{ fontSize: '0.7rem' }}>Área</small>
                                                    <span className="fw-semibold small">{selectedCourse.area || "—"}</span>
                                                </div>
                                            </div>
                                            <div className="col-6">
                                                <div className="p-2 bg-light rounded border">
                                                    <small className="d-block text-muted" style={{ fontSize: '0.7rem' }}>Inicio</small>
                                                    <span className="fw-semibold small">{selectedCourse.fecha_inicio || "—"}</span>
                                                </div>
                                            </div>
                                            <div className="col-6">
                                                <div className="p-2 bg-light rounded border">
                                                    <small className="d-block text-muted" style={{ fontSize: '0.7rem' }}>Cupos</small>
                                                    <span className="fw-semibold small">{selectedCourse.cupos_disponibles ?? "—"}</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <hr className="my-4 text-muted mx-2" style={{ opacity: 0.1 }} />

                                <div className="px-2">
                                    <h6 className="fw-bold mb-3" style={{ color: 'var(--prevy-navy)' }}>Requisitos</h6>
                                    {Array.isArray(selectedCourse.documentos_requeridos) && selectedCourse.documentos_requeridos.length ? (
                                        <div className="d-flex flex-wrap gap-2">
                                            {selectedCourse.documentos_requeridos.map((d) => (
                                                <span key={d.id_tipo_doc} className="badge bg-light text-secondary border fw-normal py-2 px-3">
                                                    <i className="bi bi-file-earmark-text me-1"></i> {d.nombre}
                                                </span>
                                            ))}
                                        </div>
                                    ) : (
                                        <span className="text-muted small">No se requieren documentos específicos.</span>
                                    )}
                                </div>
                            </div>

                            <div className="modal-footer border-0 pt-0 pb-4 px-4">
                                <button type="button" className="btn btn-outline-secondary" onClick={closeModal}>
                                    Cerrar
                                </button>
                                <button
                                    type="button"
                                    className="btn btn-inscribirse"
                                    style={{ width: 'auto', minWidth: '160px' }}
                                    onClick={() => irADetalleInscripcion(selectedCourse.id)}
                                >
                                    Inscribirse ahora
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
