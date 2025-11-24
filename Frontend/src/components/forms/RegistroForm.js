import React, { useState } from 'react';
import authService from '../../services/authService'; // Asegúrate que la ruta sea correcta
// Importar useNavigate si planeas hacer la redirección
import { useNavigate } from 'react-router-dom';

const RegistroForm = () => {
    const navigate = useNavigate();
    
    // Definición de los estados iniciales del formulario, reflejando el Modelo Lógico (USUARIO)
    const [formData, setFormData] = useState({
        rut: '',
        password: '',
        nombre: '',
        fecha_nacimiento: '', // Formato YYYY-MM-DD
        telefono: '',
        domicilio: '',
        email: '',
        lugar_trabajo: '',
    });

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(false);

    // Función para manejar el cambio en cualquier campo del formulario
    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        });
        // Limpiar errores al empezar a escribir
        if (error) setError(null);
    };

    // Función para manejar el envío del formulario
    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        setSuccess(false);

        try {
            // Se llama a la función de registro del servicio de API
            const response = await authService.register(formData);
            
            setLoading(false);
            setSuccess(true);
            
            // Redirigir al cliente a su panel después del registro exitoso
            console.log("Registro exitoso:", response);
            navigate('/cliente/dashboard'); 

        } catch (err) {
            setLoading(false);
            // Mostrar un mensaje de error más amigable para el usuario
            setError(err.message || 'Ocurrió un error inesperado durante el registro.');
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
                
                {/* Bloque de Información Personal (HU-1) */}
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
                    <label>
                        * Fecha de Nacimiento:
                        <input
                            type="date"
                            name="fecha_nacimiento"
                            value={formData.fecha_nacimiento}
                            onChange={handleChange}
                            required
                        />
                    </label>
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
                {error && <p style={{ color: 'red' }}>Error: {error}</p>}
                {success && <p style={{ color: 'green' }}>¡Registro exitoso! Redirigiendo...</p>}
                
                <button type="submit" disabled={loading}>
                    {loading ? 'Registrando...' : 'Registrarme en PrevySeg'}
                </button>
            </form>
        </div>
    );
};

export default RegistroForm;