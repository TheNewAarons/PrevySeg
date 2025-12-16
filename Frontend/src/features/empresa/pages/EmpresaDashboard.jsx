import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';
import '../styles/EmpresaDashboard.css';
import { useAuth } from '../../../services/authContext';
import userService from '../../../services/userService';
import documentoService from '../../../services/documentoService';
import Navbar from '../../../components/layout/Navbar';

const EmpresaDashboard = () => {
    const navigate = useNavigate();
    const { user, logout } = useAuth(); //

    const [workersCount, setWorkersCount] = useState(0);
    const [docsCount, setDocsCount] = useState(0);

    // 🔑 Verificar que hay usuario
    useEffect(() => {
        if (!user) {
            console.log('No hay usuario, redirigiendo...');
            navigate('/login');
            return;
        }
        // Cargar contadores
        loadStats();
    }, [user, navigate]);

    const loadStats = async () => {
        try {
            // Cargar trabajadores para el contador (getUsers por defecto trae mis trabajadores)
            const workers = await userService.getUsers();
            const countWorkers = workers.filter(w => w.id_usuario !== user.user_id).length;
            setWorkersCount(countWorkers);

            // Cargar documentos para contar pendientes
            const docs = await documentoService.getDocumentos();
            const countDocs = docs.filter(d => d.estado_revision === 'EN_REVISION').length;
            setDocsCount(countDocs);

        } catch (error) {
            console.error("Error cargando estadísticas:", error);
        }
    };

    const goToModule = (module) => {
        console.log('Navegando a módulo:', module);
        if (module === 'agregar-trabajador') {
            navigate('/empresa/agregar-trabajador');
            return;
        }
        if (module === 'trabajadores') {
            navigate('/empresa/lista-trabajadores');
            return;
        }
        if (module === 'revision-documentos') {
            navigate('/empresa/revision-documentos');
            return;
        }
        // navigate(`/empresa/${module}`);
        alert(`Función "${module}" en desarrollo`);
    };

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
        <div className="empresa-dashboard">
            <Navbar />

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
                            <h3>{workersCount}</h3>
                            <p>Trabajadores Activos</p>
                        </div>
                    </div>
                    <div className="stat-card">
                        <div className="stat-icon green">
                            <i className="bi bi-file-earmark-check-fill"></i>
                        </div>
                        <div className="stat-content">
                            <h3>{docsCount}</h3>
                            <p>Documentos Pendientes</p>
                        </div>
                    </div>
                    <div className="stat-card">
                        <div className="stat-icon green">
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
