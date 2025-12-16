import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../services/authContext.jsx';
import '../../admin/styles/AdminDashboard.css'; // Reutilizando estilo del admin

const ClienteDashboard = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  useEffect(() => {
    if (!user) navigate("/login");
  }, [user, navigate]);

  const handleLogout = () => {
    if (window.confirm("¿Estás seguro que deseas cerrar sesión?")) {
      logout();
    }
  };

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
    <div className="administrador-dashboard"> {/* Usando clase del admin para heredar estilos */}
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

      <div className="main-container">
        <div className="page-header">
          <h1 className="page-title">Bienvenido, {user.nombre}</h1>
          <p className="page-subtitle">Gestiona tus cursos y avance académico desde aquí.</p>
        </div>

        <div className="modules-grid">

          {/* Módulo Buscar Cursos */}
          <div className="module-card" onClick={() => navigate('/cliente/cursos/buscar')}>
            <div className="module-icon">
              <i className="bi bi-search"></i>
            </div>
            <h3 className="module-title">Buscar Cursos</h3>
            <p className="module-description">
              Explora el catálogo de cursos disponibles, revisa su contenido e inscríbete.
            </p>
            <span className="module-badge">Inscripciones</span>
          </div>

          {/* Módulo Mis Cursos */}
          <div className="module-card" onClick={() => navigate('/cliente/cursos/mis-inscripciones')}>
            <div className="module-icon">
              <i className="bi bi-journal-bookmark-fill"></i>
            </div>
            <h3 className="module-title">Mis Cursos</h3>
            <p className="module-description">
              Accede a tus cursos inscritos, revisa el estado de tus documentos y visualiza tu progreso.
            </p>
            <span className="module-badge">Académico</span>
          </div>

          {/* Módulo Calendario */}
          <div className="module-card" onClick={() => navigate('/cliente/horarios')}>
            <div className="module-icon">
              <i className="bi bi-calendar-week-fill"></i>
            </div>
            <h3 className="module-title">Calendario de Cursos</h3>
            <p className="module-description">
              Visualiza los horarios de clases, fechas de inicio y organiza tu agenda académica.
            </p>
            <span className="module-badge">Planificación</span>
          </div>

        </div>
      </div>
    </div>
  );
};

export default ClienteDashboard;