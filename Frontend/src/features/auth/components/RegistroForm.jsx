// ...existing code...
import React, { useState } from 'react';
import authService from '../../../services/authService';
import { useNavigate } from 'react-router-dom';
import '../styles/RegistroForm.css';
import { validateRut, formatRut, validateAge } from "../../../utils/validation";

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
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    const handleChange = (e) => {
        const { name, value } = e.target;
        if (name === 'rut') {
            setFormData({
                ...formData,
                [name]: formatRut(value),
            });
        } else {
            setFormData({
                ...formData,
                [name]: value,
            });
        }
        if (error) setError(null);
    };

    const togglePasswordVisibility = () => {
        setShowPassword(!showPassword);
    };

    const toggleConfirmPasswordVisibility = () => {
        setShowConfirmPassword(!showConfirmPassword);
    };

    const validatePassword = (password) => {
        const passwordErrors = [];
        if (password.length < 8) passwordErrors.push("La contraseña debe tener más de 8 caracteres");
        if (!/[A-Z]/.test(password)) passwordErrors.push("La contraseña debe tener al menos 1 mayúscula");
        if (!/[0-9]/.test(password)) passwordErrors.push("La contraseña debe tener al menos 1 dígito");
        if (!/[@./+/\-/_]/.test(password)) passwordErrors.push("La contraseña debe tener algún caracter especial (@, ., /, +, -, _)");
        return passwordErrors;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!validateRut(formData.rut)) {
            setError("El RUT ingresado no es válido.");
            return;
        }

        if (formData.fecha_nacimiento && !validateAge(formData.fecha_nacimiento)) {
            setError("Debes ser mayor de 18 años para registrarte.");
            return;
        }

        const passwordErrors = validatePassword(formData.password);
        if (passwordErrors.length > 0) {
            setError(passwordErrors.join(', '));
            return;
        }

        setLoading(true);
        setError(null);
        setSuccess(false);

        try {
            const response = await authService.register(formData);
            setLoading(false);
            setSuccess(true);
            console.log("Registro exitoso:", response);
            navigate('/cliente/dashboard');
        } catch (err) {
            setLoading(false);
            setError(err.message || 'Ocurrió un error inesperado durante el registro.');
            console.error('Error al registrar:', err);
        }
    };
    const handleGoHome = () => {
        navigate('/', { replace: true })
    }

    return (
        <div className="register-container">
            <div className="register-card">
                <button
                    onClick={handleGoHome}
                    className="btn-back-home"
                    disabled={loading}
                    style={{
                        position: 'absolute',
                        top: '15px',
                        left: '15px',
                        background: 'none',
                        border: 'none',
                        color: '#666',
                        cursor: 'pointer',
                        padding: '8px 12px',
                        borderRadius: '5px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '5px',
                        fontSize: '0.9rem',
                        transition: 'all 0.2s ease'
                    }}
                    onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = '#f5f5f5';
                        e.currentTarget.style.color = '#333';
                    }}
                    onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = 'transparent';
                        e.currentTarget.style.color = '#666';
                    }}
                >
                    <i className="bi bi-arrow-left" style={{ fontSize: '0.9rem' }}></i>
                    Volver al Inicio
                </button>
                <div className="logo-container">
                    <div className="logo-icon" aria-hidden>
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                        </svg>
                    </div>
                    <h1 className="brand-name">PrevySeg</h1>
                    <p className="brand-subtitle">Formulario de Inscripción</p>
                </div>

                <form id="registerForm" onSubmit={handleSubmit}>
                    <h3 className="section-title">Datos Personales</h3>

                    <div className="row mb-3">
                        <div className="col-md-6">
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
                        <div className="col-md-6">
                            <label htmlFor="nombre" className="form-label">Nombre Completo</label>
                            <input
                                type="text"
                                className="form-control"
                                id="nombre"
                                name="nombre"
                                placeholder="Juan Pérez González"
                                value={formData.nombre}
                                onChange={handleChange}
                                required
                            />
                        </div>
                    </div>

                    <div className="row mb-3">
                        <div className="col-md-6">
                            <label htmlFor="fecha_nacimiento" className="form-label">Fecha de Nacimiento</label>
                            <input
                                type="date"
                                className="form-control"
                                id="fecha_nacimiento"
                                name="fecha_nacimiento"
                                value={formData.fecha_nacimiento}
                                onChange={handleChange}
                                required
                            />
                        </div>
                        <div className="col-md-6">
                            <label htmlFor="telefono" className="form-label">Teléfono</label>
                            <input
                                type="tel"
                                className="form-control"
                                id="telefono"
                                name="telefono"
                                placeholder="+56 9 1234 5678"
                                value={formData.telefono}
                                onChange={handleChange}
                                required
                            />
                        </div>
                    </div>

                    <div className="mb-3">
                        <label htmlFor="domicilio" className="form-label">Domicilio</label>
                        <input
                            type="text"
                            className="form-control"
                            id="domicilio"
                            name="domicilio"
                            placeholder="Calle Principal #123, Comuna, Ciudad"
                            value={formData.domicilio}
                            onChange={handleChange}
                            required
                        />
                    </div>

                    <h3 className="section-title mt-4">Contacto y Datos Laborales</h3>

                    <div className="mb-3">
                        <label htmlFor="email" className="form-label">Correo Electrónico</label>
                        <input
                            type="email"
                            className="form-control"
                            id="email"
                            name="email"
                            placeholder="tu@ejemplo.com"
                            value={formData.email}
                            onChange={handleChange}
                            required
                        />
                    </div>

                    <div className="mb-3">
                        <label htmlFor="lugar_trabajo" className="form-label">Lugar de Trabajo</label>
                        <input
                            type="text"
                            className="form-control"
                            id="lugar_trabajo"
                            name="lugar_trabajo"
                            placeholder="Empresa o lugar donde trabaja"
                            value={formData.lugar_trabajo}
                            onChange={handleChange}
                        />
                    </div>

                    <h3 className="section-title mt-4">Seguridad</h3>

                    <div className="row mb-3">
                        <div className="col-md-6">
                            <label htmlFor="password" className="form-label">Contraseña</label>
                            <div style={{ position: 'relative' }}>
                                <input
                                    type={showPassword ? "text" : "password"}
                                    className="form-control"
                                    id="password"
                                    name="password"
                                    placeholder="••••••••"
                                    value={formData.password}
                                    onChange={handleChange}
                                    required
                                    style={{ paddingRight: '40px' }}
                                />
                                <button
                                    type="button"
                                    className="btn btn-outline-secondary"
                                    onClick={togglePasswordVisibility}
                                    style={{
                                        position: 'absolute',
                                        right: '5px',
                                        top: '50%',
                                        transform: 'translateY(-50%)',
                                        border: 'none',
                                        background: 'transparent',
                                        padding: '5px 10px',
                                        cursor: 'pointer'
                                    }}
                                >
                                    <i className={`bi ${showPassword ? 'bi-eye-slash' : 'bi-eye'}`}></i>
                                </button>
                            </div>
                        </div>
                        <div className="col-md-6">
                            <label htmlFor="confirm_password" className="form-label">Confirmar Contraseña</label>
                            <div style={{ position: 'relative' }}>
                                <input
                                    type={showConfirmPassword ? "text" : "password"}
                                    className="form-control"
                                    id="confirm_password"
                                    name="confirm_password"
                                    placeholder="••••••••"
                                    required
                                    style={{ paddingRight: '40px' }}
                                />
                                <button
                                    type="button"
                                    className="btn btn-outline-secondary"
                                    onClick={toggleConfirmPasswordVisibility}
                                    style={{
                                        position: 'absolute',
                                        right: '5px',
                                        top: '50%',
                                        transform: 'translateY(-50%)',
                                        border: 'none',
                                        background: 'transparent',
                                        padding: '5px 10px',
                                        cursor: 'pointer'
                                    }}
                                >
                                    <i className={`bi ${showConfirmPassword ? 'bi-eye-slash' : 'bi-eye'}`}></i>
                                </button>
                            </div>
                        </div>
                    </div>

                    {error && <div className="alert alert-danger" role="alert">{error}</div>}
                    {success && <div className="alert alert-success" role="alert">¡Registro exitoso! Redirigiendo...</div>}

                    <button type="submit" className="btn-primary-custom mt-3" disabled={loading}>
                        {loading ? 'Registrando...' : 'Completar Inscripción'}
                    </button>

                    <div className="divider" style={{ marginTop: '1rem' }}><span>O</span></div>

                    <div className="login-link" style={{ marginTop: '0.75rem' }}>
                        ¿Ya tienes una cuenta? <a href="/login" className="link-primary">Inicia sesión aquí</a>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default RegistroForm;
