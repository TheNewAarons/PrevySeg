import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import CreateUserForm from "../components/CreateUserAdmin";
import { useAuth } from "../../../services/authContext";
import authService from '../../../services/authService';
import '../styles/AdminDashboard.css';
import Navbar from '../../../components/layout/Navbar';

const CreateUserPage = () => {
    const navigate = useNavigate();
    const { user } = useAuth();

    useEffect(() => {
        if (!user) {
            navigate('/login');
            return;
        }
    }, [user, navigate]);

    const handleSuccess = () => {
        navigate('/administrador/dashboard');
    };

    return (
        <div className="administrador-dashboard">
            <Navbar />

            <div className="main-container">
                <div className="d-flex justify-content-between align-items-center mb-4">
                    <div>
                        <h1 className="page-title">Ingresar Nuevo Cliente</h1>
                        <p className="page-subtitle">Registra usuarios y asigna sus roles correspondientes.</p>
                    </div>
                    <button className="btn btn-outline-secondary" onClick={() => navigate('/administrador/dashboard')}>
                        <i className="bi bi-arrow-left me-2"></i>Volver al Panel
                    </button>
                </div>

                <div className="bg-white rounded-4 shadow-sm p-4 border" style={{ borderColor: 'var(--border-color)' }}>
                    <CreateUserForm onUserCreated={handleSuccess} />
                </div>
            </div>
        </div>
    );
}

export default CreateUserPage;
