import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../../../components/layout/Navbar';
import courseService from '../../../services/courseService';
import '../../admin/styles/AdminDashboard.css';

const ComplianceDashboard = () => {
    const navigate = useNavigate();
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadStats = async () => {
            try {
                const data = await courseService.getComplianceStats();
                setStats(data);
            } catch (err) {
                console.error("Error cargando stats", err);
            } finally {
                setLoading(false);
            }
        };
        loadStats();
    }, []);

    if (loading) {
        return (
            <div className="administrador-dashboard">
                <Navbar />
                <div className="main-container text-center py-5">
                    <div className="spinner-border text-primary" role="status"></div>
                </div>
            </div>
        );
    }

    return (
        <div className="administrador-dashboard">
            <Navbar />
            <div className="main-container">
                <div className="d-flex justify-content-between align-items-center mb-4">
                    <div>
                        <h1 className="page-title">Compliance Dashboard</h1>
                        <p className="page-subtitle">Monitoreo de cumplimiento normativo SENCE</p>
                    </div>
                    <button className="btn btn-outline-secondary" onClick={() => navigate('/administrador/dashboard')}>
                        <i className="bi bi-arrow-left me-2"></i>Volver
                    </button>
                </div>

                <div className="row g-4">
                    {/* Tarjeta SENCE Codes */}
                    <div className="col-md-4">
                        <div className="card shadow-sm border-0 h-100">
                            <div className="card-body text-center">
                                <div className="mb-3">
                                    <i className="bi bi-patch-check-fill fs-1 text-primary"></i>
                                </div>
                                <h5 className="card-title text-muted">Cobertura SENCE</h5>
                                <h2 className="display-4 fw-bold">{stats?.cursos?.ratio_cumplimiento}%</h2>
                                <p className="text-muted small">Cursos con código SENCE</p>

                                {stats?.cursos?.sin_codigo_sence > 0 && (
                                    <div className="alert alert-warning mt-3 mb-0 text-start small">
                                        <strong>{stats.cursos.sin_codigo_sence} cursos sin código:</strong>
                                        <ul className="mb-0 ps-3 mt-1">
                                            {stats.cursos.alertas.map((name, i) => (
                                                <li key={i}>{name}</li>
                                            ))}
                                        </ul>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Tarjeta Documentos */}
                    <div className="col-md-4">
                        <div className="card shadow-sm border-0 h-100">
                            <div className="card-body text-center">
                                <div className="mb-3">
                                    <i className="bi bi-file-earmark-person fs-1 text-warning"></i>
                                </div>
                                <h5 className="card-title text-muted">Revisión Documental</h5>
                                <h2 className="display-4 fw-bold">{stats?.documentos?.pendientes_revision}</h2>
                                <p className="text-muted small">Documentos pendientes de aprobación</p>

                                <button className="btn btn-warning btn-sm mt-3 text-dark" onClick={() => navigate('/administrador/documentos/pendientes')}>
                                    Ir a Revisiones
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Tarjeta Pagos */}
                    <div className="col-md-4">
                        <div className="card shadow-sm border-0 h-100">
                            <div className="card-body text-center">
                                <div className="mb-3">
                                    <i className="bi bi-credit-card fs-1 text-success"></i>
                                </div>
                                <h5 className="card-title text-muted">Gestión Financiera</h5>
                                <h2 className="display-4 fw-bold">{stats?.financiero?.pagos_pendientes}</h2>
                                <p className="text-muted small">Pagos Webpay Pendientes</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ComplianceDashboard;
