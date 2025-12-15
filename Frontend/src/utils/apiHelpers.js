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

/**
 * Wrapper for fetch that handles authentication automatically
 * @param {string} url - URL to fetch
 * @param {Object} options - Fetch options
 * @returns {Promise<Response>}
 */
export const authenticatedFetch = async (url, options = {}) => {
    const headers = getAuthHeaders();

    // Merge headers, preserving any custom headers passed in options
    const mergedHeaders = {
        ...headers,
        ...options.headers
    };

    // If body is FormData, allow the browser to set Content-Type with boundary
    if (options.body instanceof FormData) {
        delete mergedHeaders['Content-Type'];
    }

    const config = {
        ...options,
        headers: mergedHeaders
    };

    try {
        const response = await fetch(url, config);

        if (response.status === 401) {
            console.error('Session expired. Redirecting to login...');
            localStorage.removeItem('user');
            // Force redirect to login
            window.location.href = '/login';
            // Throw error to stop downstream processing
            throw new Error('SESSION_EXPIRED');
        }

        return response;
    } catch (error) {
        if (error.message === 'NO_TOKEN') {
            console.error('No active session. Redirecting...');
            window.location.href = '/login';
        }
        throw error;
    }
};