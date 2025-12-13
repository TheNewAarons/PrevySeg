import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import authService from "../../../services/authService";
import { useAuth } from '../../../services/authContext.jsx';
import '../styles/ClienteDashboard.css';
import courseService from '../../../services/courseService.jsx'


const ClienteDashboard = () => {
    const navigate = useNavigate();
    const { user, logout } = useAuth(); // 🔑 Usar useAuth en lugar de authService
  
    const [courses, setCourses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedCourse, setSelectedCourse] = useState(null);

    // 🔑 Verificar que hay usuario
    useEffect(() => {
      if (!user) {
        console.log('No hay usuario, redirigiendo...');
        navigate('/login');
      }
    }, [user, navigate]);

    // Cargar cursos inicialmente
    useEffect(() => {
      if (!user) return; // No cargar si no hay usuario
      
      let mounted = true;
      (async () => {
        try {
          const data = await courseService.getCourses();
          if (mounted) setCourses(data || []);
        } catch (err) {
          console.error('Error fetching courses', err);
          if (err.message === 'NO_TOKEN' || err.status === 401) {
            logout();
          }
        } finally {
          if (mounted) setLoading(false);
        }
      })();
      return () => { mounted = false; };
    }, [user, logout]);

    // Barra de búsqueda
    const [filters, setFilters] = useState({
      search: "",
      modalidad: "",
      area: "",
      max_valor: "",
      min_horas: "",
    });

    const handleFilterChange = (e) => {
      setFilters({
        ...filters,
        [e.target.name]: e.target.value
      });
    };

    const fetchCursos = async () => {
      if (!user) return; // No hacer fetch si no hay usuario
      
      try {
        setLoading(true);
        const data = await courseService.getCourses(filters);
        console.log(data);
        setCourses(data);
      } catch (error) {
        console.log("filtrar datos error", error);
        if (error.message === 'NO_TOKEN' || error.status === 401) {
          logout();
        }
      } finally {
        setLoading(false);
      }
    };

    const inscribirCurso = async (id) => {
      if (!user) return; // No inscribir si no hay usuario
      
      try {
        await courseService.enrollCourse(id);
        alert('Inscripción iniciada. Revisa tu panel de inscripciones.');
      } catch (err) {
        console.error(err);
        if (err.message === 'NO_TOKEN' || err.status === 401) {
          alert("Tu sesión ha expirado. Por favor inicia sesión nuevamente.");
          logout();
          return;
        }
        alert('Error al inscribirse. Intenta nuevamente.');
      }
    };

    const handleLogout = () => {
      if (!window.confirm('¿Estás seguro que deseas cerrar sesión?')) return;
      console.log('Cliente - Logout clickeado');
      logout();
    };

    const openModal = (course) => {
      setSelectedCourse(course);
    };

    const closeModal = () => {
      setSelectedCourse(null);
    };

    // 🔑 Mientras no hay usuario, mostrar loading
    if (!user) {
      return (
        <div className="d-flex justify-content-center align-items-center" style={{ height: '100vh' }}>
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
                  <p className="user-name d-none d-md-block mb-0">
                    {user.nombre || 'Usuario'}
                  </p>
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
          <button
            className="btn btn-primary mb-4"
            onClick={() => navigate("/cliente/detalle-documento")}
          >
            Ver Detalle Documento
          </button>

          {/* Barra de búsqueda */}
          <div className="filters-container mb-4 p-4 bg-light rounded shadow-sm">
            <h4 className="mb-3">Filtrar cursos</h4>

            <div className="row g-3">
              {/* Buscar por nombre */}
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

              {/* Área */}
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

              {/* Modalidad */}
              <div className="col-md-3">
                <select className="form-control" name="modalidad" value={filters.modalidad} onChange={handleFilterChange}>
                  <option value="">Todas las modalidades</option>
                  <option value="Presencial">Presencial</option>
                  <option value="Online">Online</option>
                  <option value="Mixto">Mixto</option>
                </select>
              </div>

              {/* Horas mínimas */}
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

              {/* Valor máximo */}
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

              {/* Botón aplicar */}
              <div className="col-md-2">
                <button className="btn btn-primary w-100" onClick={() => fetchCursos()}>
                  Filtrar
                </button>
              </div>
            </div>
          </div>

          {/* Lista de cursos */}
          {loading ? (
            <div className="text-center py-5">Cargando cursos...</div>
          ) : (
            <div className="row g-4">
              {courses.length === 0 && <p className="text-muted">No hay cursos disponibles.</p>}
              {courses.map(course => (
                <div key={course.id} className="col-md-6 col-lg-4">
                  <div className="course-card h-100 shadow-sm">
                    <div className="course-image-container">
                      <img
                        src={course.image ? `/images/courses/${course.image}` : "/images/courses/default-course.png"}
                        alt={course.nombre}
                        className="course-image card-img-top"
                        onError={(e) => { e.target.onerror = null; e.target.src = "/images/courses/default-course.png"; }}
                      />
                    </div>
                    <div className="course-body card-body d-flex flex-column">
                      <h3 className="course-title card-title h5">{course.nombre}</h3>
                      <span className="badge bg-info text-dark mb-2 align-self-start">
                        <i className="bi bi-award me-1"></i>{course.tipo_certificado || 'Certificado'}
                      </span>

                      <div className="course-info mb-3">
                        <div className="info-item mb-1">
                          <i className="bi bi-clock-fill me-2 text-muted"></i>
                          <span><span className="fw-bold">Duración:</span> {course.horas || '—'} horas</span>
                        </div>
                        <div className="info-item">
                          <i className="bi bi-person-fill me-2 text-muted"></i>
                          <span><span className="fw-bold">Instructor:</span> {course.profesor || '—'}</span>
                        </div>
                      </div>

                      <div className="mt-auto d-flex justify-content-between align-items-center">
                        <div className="course-price h4 mb-0 text-primary">{course.valor ? `$${course.valor}` : '—'}</div>
                        <div className="d-flex gap-2">
                          <button className="btn btn-outline-primary btn-sm" onClick={() => openModal(course)}>
                            Ver Detalles
                          </button>
                          <button className="btn btn-primary btn-sm" onClick={() => inscribirCurso(course.id)}>
                            Inscribirse
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Modal de Detalles */}
        {selectedCourse && (
          <div className="modal fade show" style={{ display: 'block', backgroundColor: 'rgba(0,0,0,0.5)' }} tabIndex="-1">
            <div className="modal-dialog modal-lg modal-dialog-centered">
              <div className="modal-content">
                <div className="modal-header">
                  <h5 className="modal-title">{selectedCourse.nombre}</h5>
                  <button type="button" className="btn-close" onClick={closeModal}></button>
                </div>
                <div className="modal-body">
                  <div className="row">
                    <div className="col-md-5 mb-3 mb-md-0">
                      <img
                        src={selectedCourse.image ? `/images/courses/${selectedCourse.image}` : "/images/courses/default-course.png"}
                        alt={selectedCourse.nombre}
                        className="img-fluid rounded shadow-sm"
                        onError={(e) => { e.target.onerror = null; e.target.src = "/images/courses/default-course.png"; }}
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
                          <strong>{selectedCourse.cupos_disponibles || "Ilimitados"}</strong>
                        </div>
                      </div>
                    </div>
                  </div>

                  <hr />

                  <div className="mt-3">
                    <h6 className="fw-bold text-primary">Documentos Requeridos</h6>
                    <p className="small">{selectedCourse.documentos_requeridos || "No se requieren documentos específicos."}</p>
                  </div>
                </div>
                <div className="modal-footer">
                  <button type="button" className="btn btn-secondary" onClick={closeModal}>Cerrar</button>
                  <button type="button" className="btn btn-primary" onClick={() => { inscribirCurso(selectedCourse.id); closeModal(); }}>
                    Inscribirse Ahora
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