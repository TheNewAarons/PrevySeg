import React from "react";
import { useNavigate } from "react-router-dom";
import UsuarioList from "../components/UsersList";
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';
import '../styles/AdminDashboard.css';
import Navbar from '../../../components/layout/Navbar';

const ListUsers = () => {
    const navigate = useNavigate();

    return (
        <div className="administrador-dashboard">
            <Navbar />

            <div className="main-container">
                <div className="d-flex justify-content-between align-items-center mb-4">
                    <div>
                        <h1 className="page-title">Gestión de Usuarios</h1>
                        <p className="page-subtitle">Administra todos los usuarios registrados en la plataforma</p>
                    </div>
                    <button className="btn btn-outline-secondary" onClick={() => navigate('/administrador/dashboard')}>
                        <i className="bi bi-arrow-left me-2"></i>Volver al Panel
                    </button>
                </div>
                <UsuarioList />
            </div>
        </div>
    )
}
export default ListUsers;
