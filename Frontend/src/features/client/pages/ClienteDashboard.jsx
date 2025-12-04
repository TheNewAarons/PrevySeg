import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import authService from "../../../services/authService";
import '../styles/ClienteDashboard.css';
import courseService from '../../../services/courseService.jsx'


const ClienteDashboard = () => {
  const navigate = useNavigate();
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const data = await courseService.getCourses();
        if (mounted) setCourses(data || []);
      } catch (err) {
        console.error('Error fetching courses', err);
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => { mounted = false; };
    fetchCursos()
  }, []);
  //Barra de busqueda
  const [modalidad, setModalidad] = useState("");
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
    try {
      const data = await courseService.getCourses(filters);
      console.log(data)
      setCourses(data)
    } catch (error) {
      console.log("filtrar datos error")
    } finally {
      setLoading(false)
    }
  }
  // Fin Barra de busqueda





  const inscribirCurso = async (id) => {
    try {
      await courseService.enrollCourse(id);
      alert('Inscripción iniciada. Revisa tu panel de inscripciones.');
    } catch (err) {
      console.error(err);
      alert('Error al inscribirse. Intenta nuevamente.');
    }
  };

  const logout = () => {
    if (!confirm('¿Estás seguro que deseas cerrar sesión?')) return;
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    sessionStorage.removeItem('access_token');
    sessionStorage.removeItem('refresh_token');
    navigate('/login', { replace: true });
  };

  return (
    <div className="cliente-dashboard">
      <nav className="navbar navbar-expand-lg sticky-top">
        <div className="container-fluid">
          <a className="navbar-brand" href="/">
            <img src="/images/logo.png" alt="PrevySeg Logo" style={{ height: 44 }} />
          </a>
          <div className="user-profile ms-auto">
            <div className="d-flex align-items-center gap-3">
              <div className="d-flex align-items-center gap-2">
                <img src="/placeholder.svg?height=40&width=40" alt="Usuario" className="user-avatar" />
                <p className="user-name d-none d-md-block mb-0">Usuario</p>
              </div>
              <button className="btn-logout" onClick={logout}>
                <i className="bi bi-box-arrow-right me-2"></i>Cerrar Sesión
              </button>
            </div>
          </div>
        </div>
      </nav>

      <div className="dashboard-container container">
        <h1 className="page-title">Cursos Disponibles</h1>
        <p className="page-subtitle">Explora nuestra oferta de cursos de capacitación en seguridad</p>
        {/*Barra de busqueda*/}
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
              <select className="form-control" name="area" value={filters.area} onChange={handleFilterChange} >
                <option value="">Todas las áreas</option>
                <option value="seguridad">Seguridad</option>
                <option value="administracion">Administración</option>
                <option value="tecnologia">Tecnología</option>
                <option value="oficios">Oficios técnicos</option>
                <option value="alimentos">Alimentos</option>
                <option value="estetica">Belleza y estetica</option>
              </select>
            </div>

            {/* Modalidad */}
            <div className="col-md-3">
              <select className="form-control" name="modalidad" value={filters.modalidad} onChange={handleFilterChange} >
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
              <button className="btn btn-primary w-100" onClick={() => fetchCursos()}  >
                Filtrar
              </button>
            </div>

          </div>
        </div>

        {/*Barra de busqueda fin*/}
        {loading ? (
          <div className="text-center py-5">Cargando cursos...</div>
        ) : (
          <div className="row g-4">
            {courses.length === 0 && <p className="text-muted">No hay cursos disponibles.</p>}
            {courses.map(course => (
              <div key={course.id} className="col-md-6 col-lg-4">
                <div className="course-card">
                  <img src={course.image || `/placeholder.svg?height=200&width=400`} alt={course.nombre} className="course-image" />
                  <div className="course-body">
                    <h3 className="course-title">{course.nombre}</h3>
                    <span className="badge-certificate">
                      <i className="bi bi-award me-1"></i>{course.tipo_certificado || 'Certificado'}
                    </span>

                    <div className="course-info">
                      <div className="info-item">
                        <i className="bi bi-clock-fill"></i>
                        <span><span className="info-label">Duración:</span> {course.horas || '—'}</span>
                      </div>
                      <div className="info-item">
                        <i className="bi bi-person-fill"></i>
                        <span><span className="info-label">Instructor:</span> {course.profesor || '—'}</span>
                      </div>
                    </div>

                    <div className="course-price">{course.valor ? `$${course.valor}` : '—'}</div>
                    <button className="btn-inscribirse" onClick={() => inscribirCurso(course.id)}>
                      <i className="bi bi-check-circle me-2"></i>Inscribirse
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ClienteDashboard;
