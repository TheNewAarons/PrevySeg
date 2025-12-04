import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';
import '../styles/EmpresaDashboard.css';

const EmpresaDashboard = () => {
    const navigate = useNavigate();
    const [userName, setUserName] = useState('Empresa Demo');
    const [userInitial, setUserInitial] = useState('E');

    useEffect(() => {
        // Cargar nombre de usuario desde localStorage si existe
        const storedUser = JSON.parse(localStorage.getItem('user') || '{}');
        if (storedUser.nombre) {
            setUserName(storedUser.nombre);
            setUserInitial(storedUser.nombre.charAt(0).toUpperCase());
        }
    }, []);

    const logout = () => {
        if (window.confirm('¿Estás seguro de que deseas cerrar sesión?')) {
            localStorage.removeItem('access_token');
            localStorage.removeItem('refresh_token');
            localStorage.removeItem('user');
            sessionStorage.clear();
            navigate('/login', { replace: true });
        }
    };

    const goToModule = (module) => {
        console.log('Navegando a módulo:', module);
        // Aquí puedes implementar la navegación real cuando existan las rutas
        // navigate(`/empresa/${module}`);
        alert(`Función "${module}" en desarrollo`);
    };

    return (
        <div className="empresa-dashboard">
            {/* Navbar */}
            <nav className="navbar navbar-expand-lg">
                <div className="container-fluid">
                    <a className="navbar-brand" href="/">
                        <img src="/images/logos/logo.png" alt="PrevySeg Logo" />
                    </a>
                    <div className="user-profile ms-auto">
                        <div className="user-avatar">{userInitial}</div>
                        <p className="user-name">{userName}</p>
                        <button className="btn-logout" onClick={logout}>
                            <i className="bi bi-box-arrow-right"></i> Cerrar Sesión
                        </button>
                    </div>
                </div>
            </nav>

            {/* Main Content */}
            <div className="main-container">
                {/* Header */}
                <div className="dashboard-header">
                    <h1>Dashboard Empresa</h1>
                    <p>Gestiona a tus trabajadores y sus certificaciones</p>
                </div>

                {/* Statistics */}
                <div className="stats-container">
                    <div className="stat-card">
                        <div className="stat-icon green">
                            <i className="bi bi-people-fill"></i>
                        </div>
                        <div className="stat-content">
                            <h3>24</h3>
                            <p>Trabajadores Activos</p>
                        </div>
                    </div>
                    <div className="stat-card">
                        <div className="stat-icon blue">
                            <i className="bi bi-file-earmark-check-fill"></i>
                        </div>
                        <div className="stat-content">
                            <h3>12</h3>
                            <p>Documentos Pendientes</p>
                        </div>
                    </div>
                    <div className="stat-card">
                        <div className="stat-icon orange">
                            <i className="bi bi-award-fill"></i>
                        </div>
                        <div className="stat-content">
                            <h3>18</h3>
                            <p>Certificaciones Activas</p>
                        </div>
                    </div>
                </div>

                {/* Modules */}
                <div className="modules-grid">
                    {/* Agregar Trabajador */}
                    <div className="module-card">
                        <div className="module-icon">
                            <i className="bi bi-person-plus-fill"></i>
                        </div>
                        <h3>Agregar Trabajador</h3>
                        <p>Registra nuevos trabajadores en el sistema y asígnalos a cursos de capacitación</p>
                        <button className="btn-module" onClick={() => goToModule('agregar-trabajador')}>
                            Ingresar <i className="bi bi-arrow-right"></i>
                        </button>
                    </div>

                    {/* Revisión de Documentos */}
                    <div className="module-card">
                        <div className="module-icon">
                            <i className="bi bi-file-earmark-text-fill"></i>
                        </div>
                        <h3>Revisión de Documentos</h3>
                        <p>Revisa y valida los documentos y certificaciones de tus trabajadores</p>
                        <button className="btn-module" onClick={() => goToModule('revision-documentos')}>
                            Revisar <i className="bi bi-arrow-right"></i>
                        </button>
                    </div>

                    {/* Trabajadores */}
                    <div className="module-card">
                        <div className="module-icon">
                            <i className="bi bi-people"></i>
                        </div>
                        <h3>Trabajadores</h3>
                        <p>Visualiza y administra la lista completa de trabajadores registrados en tu empresa</p>
                        <button className="btn-module" onClick={() => goToModule('trabajadores')}>
                            Ver Lista <i className="bi bi-arrow-right"></i>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default EmpresaDashboard;
