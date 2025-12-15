import React, { useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import authService from "../../../services/authService";
import { useAuth } from '../../../services/authContext.jsx';
import '../styles/ClienteDashboard.css';
import courseService from '../../../services/courseService.jsx'


const ClienteDashboard = () => {
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

  const handleLogout = () => {
    if (!window.confirm("¿Estás seguro que deseas cerrar sesión?")) return;
    logout();
  };

  const handleFilterChange = (e) => {
    setFilters((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const fetchCursos = async () => {
    if (!user) return;
    try {
      setLoading(true);

      // ojo: tu CursosDisponiblesView solo filtra area/modalidad (y tenía typo query_paramas)
      // igual mando todo, pero si no usas search/max_valor/min_horas en backend, se ignoran.
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

  return (
    <div className="cliente-dashboard">
      <nav className="navbar navbar-expand-lg sticky-top">
        <div className="container-fluid">
          <a className="navbar-brand" href="/">
            <img src="/images/logos/logo.png" alt="PrevySeg Logo" style={{ height: 44 }} />
          </a>
          <div className="user-profile ms-auto">
            <div className="d-flex align-items-center gap-3">
              <div className="d-flex align-items-center gap-2">
                <img src="/placeholder.svg?height=40&width=40" alt="Usuario" className="user-avatar" />
                <p className="user-name d-none d-md-block mb-0">{user.nombre || "Usuario"}</p>
              </div>
              <button className="btn-logout" onClick={handleLogout}>
                <i className="bi bi-box-arrow-right me-2"></i>Cerrar Sesión
              </button>
            </div>
          </div>
        </div>
      </nav>

      <div className="dashboard-container container">
        <h1 className="page-title">Cursos Disponibles</h1>
        <p className="page-subtitle">Explora nuestra oferta de cursos de capacitación en seguridad</p>
        <div className="d-flex gap-2 mb-4">
          <button
            className="btn btn-outline-primary"
            onClick={() => navigate("/cliente/cursos/mis-inscripciones")}
          >
            <i className="bi bi-journal-check me-2"></i>
            Mis Cursos Inscritos
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
          <div className="row g-4">
            {courses.length === 0 && <p className="text-muted">No hay cursos disponibles.</p>}

            {courses.map((course) => {
              const yaInscrito = !!course.ya_inscrito;

              return (
                <div key={course.id} className="col-md-6 col-lg-4">
                  <div className="course-card h-100 shadow-sm">
                    <div className="course-image-container">
                      <img
                        src={course.image ? `/images/courses/${course.image}` : "/images/courses/default-course.png"}
                        alt={course.nombre}
                        className="course-image card-img-top"
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src = "/images/courses/default-course.png";
                        }}
                      />
                    </div>

                    <div className="course-body card-body d-flex flex-column">
                      <h3 className="course-title card-title h5">{course.nombre}</h3>

                      <span className="badge bg-info text-dark mb-2 align-self-start">
                        <i className="bi bi-award me-1"></i>
                        {course.tipo_certificado || "Certificado"}
                      </span>

                      <div className="course-info mb-3">
                        <div className="info-item mb-1">
                          <i className="bi bi-clock-fill me-2 text-muted"></i>
                          <span>
                            <span className="fw-bold">Duración:</span> {course.horas ?? "—"} horas
                          </span>
                        </div>
                        <div className="info-item">
                          <i className="bi bi-person-fill me-2 text-muted"></i>
                          <span>
                            <span className="fw-bold">Instructor:</span> {course.profesor || "—"}
                          </span>
                        </div>
                      </div>

                      <div className="mt-auto d-flex justify-content-between align-items-center">
                        <div className="course-price h4 mb-0 text-primary">
                          {course.valor ? `$${course.valor}` : "—"}
                        </div>

                        <div className="d-flex gap-2">
                          <button
                            type="button"
                            className="btn btn-outline-primary btn-sm"
                            onClick={() => openModal(course)}
                          >
                            Ver Detalles
                          </button>

                          <button
                            type="button"
                            className={`btn btn-sm ${yaInscrito ? "btn-secondary" : "btn-primary"}`}
                            disabled={yaInscrito}
                            onClick={() => !yaInscrito && irADetalleInscripcion(course.id)}
                            title={yaInscrito ? "Ya estás inscrito en este curso" : "Ir a inscripción"}
                          >
                            {yaInscrito ? (
                              <>
                                <i className="bi bi-check-circle me-2"></i>Inscrito
                              </>
                            ) : (
                              <>
                                <i className="bi bi-pencil-square me-2"></i>Inscribirse
                              </>
                            )}
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

export default ClienteDashboard;