/**
 * Obtiene el token del usuario desde localStorage de forma segura
 * @returns {string|null} - Token o null si no hay usuario
 */
export const getToken = () => {
    try {
        const userStorage = localStorage.getItem('user');
        
        if (!userStorage) {
            return null;
        }
        
        const user = JSON.parse(userStorage);
        return user?.token || null;
    } catch (error) {
        console.error('Error al obtener token:', error);
        return null;
    }
};

/**
 * Crea headers con autenticación para peticiones API
 * @returns {Object} - Headers con Authorization
 * @throws {Error} - Si no hay token disponible
 */
export const getAuthHeaders = () => {
    const token = getToken();
    
    if (!token) {
        throw new Error('NO_TOKEN');
    }
    
    return {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
    };
};

/**
 * Verifica si hay una sesión activa
 * @returns {boolean}
 */
export const hasActiveSession = () => {
    return getToken() !== null;
};