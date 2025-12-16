import React from 'react';
import { useNavigate } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';
import { useAuth } from '../../services/authContext';

const Navbar = () => {
    const navigate = useNavigate();
    const { user, logout } = useAuth();

    const handleLogout = () => {
        if (window.confirm('¿Estás seguro de que deseas cerrar sesión?')) {
            logout();
            navigate('/login');
        }
    };

    if (!user) return null;

    return (
        <nav className="navbar navbar-expand-lg bg-white shadow-sm px-3" style={{ borderBottom: '1px solid #eee' }}>
            <div className="container-fluid">
                <a className="navbar-brand" href="/">
                    <img src="/images/logos/logo.png" alt="PrevySeg Logo" style={{ height: '40px' }} />
                </a>

                <div className="d-flex align-items-center ms-auto">
                    <div className="d-flex flex-column text-end me-3">
                        <span className="fw-bold text-dark" style={{ fontSize: '0.95rem' }}>{user.nombre || 'Usuario'}</span>
                        <span className="text-muted text-uppercase" style={{ fontSize: '0.75rem', letterSpacing: '0.5px' }}>
                            {user.rol || 'Sin Rol'}
                        </span>
                    </div>

                    <div
                        className="rounded-circle text-white d-flex align-items-center justify-content-center me-3 fw-bold"
                        style={{ width: '40px', height: '40px', fontSize: '1.2rem', backgroundColor: '#8bc4a0' }}
                    >
                        {user.nombre ? user.nombre.charAt(0).toUpperCase() : 'U'}
                    </div>

                    <button
                        className="btn btn-outline-danger btn-sm d-flex align-items-center"
                        onClick={handleLogout}
                        title="Cerrar Sesión"
                    >
                        <i className="bi bi-box-arrow-right"></i>
                        <span className="d-none d-md-inline ms-2">Salir</span>
                    </button>
                </div>
            </div>
        </nav>
    );
};

export default Navbar;
