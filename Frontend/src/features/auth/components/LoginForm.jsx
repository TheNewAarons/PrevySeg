import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import authService from '../../../services/authService'; // Servicio para manejar el login
import '../styles/LoginForm.css'; // Asegúrate de tener los estilos adecuados

// Renombrado a LoginForm para ser consistente con RegistroForm
const LoginForm = () => {
    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        rut: '',
        password: '',
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        });
        if (error) setError(null);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            const data = await authService.login(formData.rut, formData.password);
            setLoading(false);

            // Obtener rol desde la respuesta (fallback a localStorage por si acaso)
            const rol = data?.rol || (JSON.parse(localStorage.getItem('user') || '{}').rol);

            // Mapeo explícito de rutas por rol
            let dashboardPath = '/cliente/dashboard';
            if (rol) {
                const rolLower = rol.toLowerCase();
                if (rolLower === 'administrador') dashboardPath = '/administrador/dashboard';
                else if (rolLower === 'empresa') dashboardPath = '/empresa/dashboard';
                else dashboardPath = '/cliente/dashboard';
            }

            navigate(dashboardPath, { replace: true });

        } catch (err) {
            setLoading(false);
            setError(err.message || 'Error desconocido al intentar iniciar sesión.');
            console.error('Error de Login:', err);
        }
    };

    return (
        <div className="login-container">
            <div className="login-card">
                <div className="logo-container">
                    <div className="logo-icon" aria-hidden>
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                        </svg>
                    </div>
                    <h1 className="brand-name">PrevySeg</h1>
                    <p className="brand-subtitle">Organismo Técnico de Capacitación</p>
                </div>

                <form id="loginForm" onSubmit={handleSubmit}>
                    {error && <div className="alert alert-danger" role="alert">{error}</div>}

                    <div className="mb-3">
                        <label htmlFor="rut" className="form-label">RUT</label>
                        <input
                            type="text"
                            className="form-control"
                            id="rut"
                            name="rut"
                            placeholder="12.345.678-9"
                            value={formData.rut}
                            onChange={handleChange}
                            required
                        />
                    </div>

                    <div className="mb-3">
                        <label htmlFor="password" className="form-label">Contraseña</label>
                        <input
                            type="password"
                            className="form-control"
                            id="password"
                            name="password"
                            placeholder="••••••••"
                            value={formData.password}
                            onChange={handleChange}
                            required
                        />
                    </div>

                    <div className="d-flex justify-content-between align-items-center mb-3">
                        <div className="form-check">
                            <input className="form-check-input" type="checkbox" id="rememberMe" />
                            <label className="form-check-label" htmlFor="rememberMe" style={{ fontSize: '.875rem', color: '#666' }}>
                                Recordarme
                            </label>
                        </div>
                        <Link to="/recuperar-password" className="forgot-password">¿Olvidaste tu contraseña?</Link>
                    </div>

                    <button type="submit" className="btn-primary-custom" disabled={loading}>
                        {loading ? 'Accediendo...' : 'Iniciar Sesión'}
                    </button>
                </form>
                <div className="divider"><span>O</span></div>

                <div className="register-link">
                    ¿No tienes una cuenta? <Link to="/inscripcion" className="link-primary">Regístrate aquí</Link>
                </div>
            </div>
        </div>
    );
};

export default LoginForm;
