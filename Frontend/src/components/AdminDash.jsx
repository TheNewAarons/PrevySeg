import React from 'react';
import { useNavigate } from 'react-router-dom';
import UsuarioList from './UsersList'; // Asegúrate que la ruta sea correcta a tu componente
import authService from '../services/authService';

const AdminDashboard = () => {
    const navigate = useNavigate();

    const handleLogout = () => {
        authService.logout(); // Borra el token
        navigate('/login');   // Te devuelve al login
    };

    return (
        <div className="dashboard-container">
            {/* --- Barra Superior (Navbar) --- */}
            <nav style={{ display: 'flex', justifyContent: 'space-between', padding: '20px', background: '#333', color: 'white' }}>
                <h2>Panel de Administración - PrevySeg</h2>
                <button 
                    onClick={handleLogout}
                    style={{ background: 'red', color: 'white', border: 'none', padding: '10px', cursor: 'pointer' }}
                >
                    Cerrar Sesión
                </button>
                <button 
                    onClick={() => navigate('/administrador/crear-user')}
                    style={{ background: 'red', color: 'white', border: 'none', padding: '10px', cursor: 'pointer' }}
                >
                    Crear Usuario
                </button>
            </nav>

            {/* --- Contenido Principal --- */}
            <main style={{ padding: '20px' }}>
                <h3>Gestión de Usuarios</h3>
                <p>Bienvenido, Administrador. Aquí está la lista de usuarios registrados:</p>
                
                {/* Aquí renderizamos la lista que arreglamos */}
                <UsuarioList /> 
            </main>
        </div>
    );
};

export default AdminDashboard;