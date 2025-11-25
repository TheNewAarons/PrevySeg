// Definimos la URL base de tu API de Django (asumiendo que corre en localhost:8000)
// Ajusta esto si tu puerto o dominio es diferente.
const API_URL = 'http://localhost:8000/api/auth/';

/**
 * Registra un nuevo usuario en la plataforma PrevySeg. (HU-1)
 * @param {object} userData - Datos del usuario para el registro.
 * @returns {object} - La respuesta de la API que incluye tokens y datos del usuario.
 */
const register = async (userData) => {
    try {
        const response = await fetch(`${API_URL}register/`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(userData),
        });

        const data = await response.json();

        if (response.ok) {
            // Guardamos el token en el almacenamiento local tras un registro exitoso
            if (data.token) {
                localStorage.setItem('user', JSON.stringify(data));
            }
            return data;
        } else {
            // Manejo de errores de validación (ej. RUT ya existe, contraseña débil)
            throw new Error(data.message || data.detail || 'Error en el registro');
        }
    } catch (error) {
        console.error('Error durante el registro:', error);
        throw error;
    }
};

/**
 * Inicia sesión del usuario (Cliente, Admin o Empresa). (HU-3, HU-ADM-1)
 * @param {string} rut - RUT del usuario.
 * @param {string} password - Contraseña del usuario.
 * @returns {object} - La respuesta de la API que incluye tokens y rol.
 */
const login = async (rut, password) => {
    try {
        const response = await fetch(`${API_URL}login/`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ rut, password }),
        });

        const data = await response.json();

        if (response.ok) {
            // Guardamos el token y el rol para futuras solicitudes y control de acceso
            localStorage.setItem('user', JSON.stringify(data));
            return data;
        } else {
            // Manejo de errores de credenciales no válidas (HU-3)
            throw new Error(data.detail || 'RUT o contraseña incorrectos.');
        }
    } catch (error) {
        console.error('Error durante el login:', error);
        throw error;
    }
};

/**
 * Cierra la sesión del usuario eliminando los tokens.
 */
const logout = () => {
    localStorage.removeItem('user');
};

/**
 * Obtiene el usuario actual y sus tokens del almacenamiento local.
 * @returns {object|null}
 */
const getCurrentUser = () => {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
};


// Exportamos las funciones para usarlas en los componentes de React
const authService = {
    register,
    login,
    logout,
    getCurrentUser,
};

export default authService;