import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import authService from '../../services/authService'; // Servicio para manejar el login
 // Estilos

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
            const user = await authService.login(formData.rut, formData.password);
            
            // HU-ADM-1: Redirección basada en el rol
            let dashboardPath = '/';
            if (user && user.rol) {
                // Normaliza el rol para la URL (ej: 'Administrador' -> '/admin/dashboard')
                const rolLower = user.rol.toLowerCase();
                dashboardPath = `/${rolLower}/dashboard`;
            } else {
                 // Por defecto, va al dashboard del cliente
                dashboardPath = '/cliente/dashboard';
            }
            
            navigate(dashboardPath, { replace: true });

        } catch (err) {
            setLoading(false);
            setError(err.message || 'Error desconocido al intentar iniciar sesión.');
            console.error('Error de Login:', err);
        }
    };

    return (
        <div className="card">
            <div className="card-header">
                <h1 className="card-title">Iniciar sesión</h1>
                <p className="card-description">Ingresa tus credenciales para acceder a tu cuenta PrevySeg</p>
            </div>
            
            <div className="card-content">
                <form onSubmit={handleSubmit}>
                    
                    {error && <div className="message error-message">{error}</div>}

                    <div className="form-group">
                        <label htmlFor="rut" className="form-label">RUT</label>
                        <input 
                            type="text" 
                            id="rut" 
                            name="rut"
                            className="form-input" 
                            placeholder="12.345.678-9"
                            value={formData.rut}
                            onChange={handleChange}
                            required
                        />
                    </div>

                    <div className="form-group">
                        <div className="label-row">
                            <label htmlFor="password" className="form-label">Contraseña</label>
                            <Link to="/recuperar-password" className="link">¿Olvidaste tu contraseña?</Link>
                        </div>
                        <input 
                            type="password" 
                            id="password" 
                            name="password"
                            className="form-input" 
                            placeholder="••••••••"
                            value={formData.password}
                            onChange={handleChange}
                            required
                        />
                    </div>

                    <button type="submit" className="btn-primary" disabled={loading}>
                        {loading ? 'Accediendo...' : 'Iniciar sesión'}
                    </button>
                </form>

                <div className="register-section">
                    <p className="register-text">
                        ¿No tienes una cuenta? 
                        <Link to="/inscripcion" className="link-primary">Regístrate aquí</Link>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default LoginForm;