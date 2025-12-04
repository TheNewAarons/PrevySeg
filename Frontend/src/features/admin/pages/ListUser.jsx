import React from "react";
import { useNavigate } from "react-router-dom";
import UsuarioList from "../components/UsersList";
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';
import '../styles/AdminDashboard.css';

const ListUsers = () => {
    const navigate = useNavigate();

    return (
        <div className="administrador-dashboard">
            <nav className="navbar navbar-expand-lg navbar-light">
                <div className="container-fluid px-4">
                    <a className="navbar-brand" href="/">
                        <img src="/images/logos/logo.png" alt="PrevySeg Logo" />
                    </a>
                    <div className="d-flex align-items-center gap-3 ms-auto">
                        <button className="btn btn-secondary" onClick={() => navigate('/administrador/dashboard')}>
                            <i className="bi bi-arrow-left me-2"></i>Volver al Dashboard
                        </button>
                    </div>
                </div>
            </nav>

            <div className="main-container">
                <div className="page-header">
                    <h1 className="page-title">Gestión de Usuarios</h1>
                    <p className="page-subtitle">Administra todos los usuarios registrados en la plataforma</p>
                </div>
                <UsuarioList />
            </div>
        </div>
    )
}
export default ListUsers;
