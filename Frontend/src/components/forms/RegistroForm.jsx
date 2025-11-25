import React, { useState } from 'react';
import authService from '../../services/authService';
// IMPORTANTE: Se necesita 'Link' para el último punto
import { useNavigate, Link } from 'react-router-dom'; 
import '../../styles/components/forms/RegistroForm.css'; 

const RegistroForm = () => {
    const navigate = useNavigate();
    
    const [formData, setFormData] = useState({
        rut: '',
        password: '',
        nombre: '',
        fecha_nacimiento: '',
        telefono: '',
        domicilio: '',
        email: '',
        lugar_trabajo: '',
    });

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(false);

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
        setSuccess(false);

        try {
            await authService.register(formData);
            
            setLoading(false);
            setSuccess(true);
            
            setTimeout(() => {
                navigate('/cliente/dashboard'); 
            }, 1500);

        } catch (err) {
            setLoading(false);
            setError(err.message || 'Ocurrió un error inesperado durante el registro.');
            setSuccess(false);
            console.error('Error al registrar:', err);
        }
    };

    return (
        <div className="registro-container">
            <h2>Registro de Nuevo Cliente</h2>
            <p>Por favor, ingrese sus datos personales. (* Campos obligatorios)</p>

            <form onSubmit={handleSubmit} className="form-registro">
                
                {/* Bloque de Autenticación */}
                <fieldset>
                    <legend>Credenciales de Acceso</legend>
                    <input
                        type="text"
                        name="rut"
                        placeholder="* RUT (Ej: 12345678-k)"
                        value={formData.rut}
                        onChange={handleChange}
                        required
                    />
                    <input
                        type="password"
                        name="password"
                        placeholder="* Clave de Acceso (Mín. 8 caracteres, mayúscula y número)"
                        value={formData.password}
                        onChange={handleChange}
                        required
                    />
                </fieldset>
                
                {/* Bloque de Información Personal */}
                <fieldset>
                    <legend>Información Personal</legend>
                    <input
                        type="text"
                        name="nombre"
                        placeholder="* Nombre Completo"
                        value={formData.nombre}
                        onChange={handleChange}
                        required
                    />
                    <input
                        type="email"
                        name="email"
                        placeholder="* Correo Electrónico"
                        value={formData.email}
                        onChange={handleChange}
                        required
                    />
                    <div className="input-group-fix">
                        <span className="input-label-text">* Fecha de Nacimiento:</span>
                        <input
                            type="date"
                            name="fecha_nacimiento"
                            value={formData.fecha_nacimiento}
                            onChange={handleChange}
                            required
                        />
                    </div>
                    <input
                        type="tel"
                        name="telefono"
                        placeholder="* Teléfono de Contacto"
                        value={formData.telefono}
                        onChange={handleChange}
                        required
                    />
                    <input
                        type="text"
                        name="domicilio"
                        placeholder="* Domicilio"
                        value={formData.domicilio}
                        onChange={handleChange}
                        required
                    />
                    <input
                        type="text"
                        name="lugar_trabajo"
                        placeholder="Lugar de Trabajo (Opcional)"
                        value={formData.lugar_trabajo}
                        onChange={handleChange}
                    />
                </fieldset>

                {/* Mensajes de Estado */}
                {error && <div className="message error-message">{error}</div>}
                {success && <div className="message success-message">¡Registro exitoso! Redirigiendo...</div>}
                
                <button type="submit" disabled={loading}>
                    {loading ? 'Registrando...' : 'Registrarme en PrevySeg'}
                </button>
            </form>

            {/* 3. SOLUCIÓN: Enlace de Login */}
            <p className="login-prompt">
                ¿Ya tienes una cuenta? <Link to="/login">Inicia sesión aquí</Link>
            </p>
        </div>
    );
};

export default RegistroForm;