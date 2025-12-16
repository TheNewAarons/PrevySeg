const API_URL = 'http://localhost:8000/api/usuarios/';

const userService = {
    /**
     * Obtiene la lista de usuarios.
     * @param {string} token - Token de autenticaciónjwt.
     * @param {string} [rolNombre] - Filtro opcional por nombre de rol (ej: 'Cliente').
     */
    getUsers: async (rolNombre = null) => {
        try {
            const user = JSON.parse(localStorage.getItem('user'));
            const token = user?.token;

            if (!token) {
                throw new Error("No hay token de sesión.");
            }

            let url = API_URL;
            if (rolNombre) {
                url += `?rol_nombre=${rolNombre}`;
            }

            const response = await fetch(url, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                // Si es 401, lanzamos error específico para que el dashboard lo capture
                if (response.status === 401) {
                    throw new Error("token_not_valid");
                }
                throw new Error(errorData.detail || "Error al obtener usuarios");
            }

            return await response.json();
        } catch (error) {
            console.error("Error en getUsers:", error);
            throw error;
        }
    },

    /**
     * Obtiene la lista de candidatos disponibles (usuarios cliente sin empresa).
     * Solo para rol Empresa.
     */
    getCandidates: async () => {
        try {
            const user = JSON.parse(localStorage.getItem('user'));
            const token = user?.token;
            if (!token) throw new Error("No hay token de sesión.");

            const response = await fetch(`${API_URL}?candidates=true`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.detail || "Error al obtener candidatos");
            }

            return await response.json();
        } catch (error) {
            console.error("Error en getCandidates:", error);
            throw error;
        }
    },

    /**
     * Crea un nuevo usuario (sin iniciar sesión automáticamente).
     * Ideal para administradores o empresas que crean cuentas para otros.
     */
    createUser: async (userData) => {
        try {
            // Nota: Usamos el endpoint de registro público. 
            // Si el backend requiriera permisos especiales, habría que usar otro endpoint.
            const response = await fetch('http://localhost:8000/api/auth/register/', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(userData),
            });

            const data = await response.json();

            if (!response.ok) {
                const errorMessage = data.message || data.detail || JSON.stringify(data);
                throw new Error(errorMessage);
            }

            return data;
        } catch (error) {
            console.error("Error al crear usuario:", error);
            throw error;
        }
    },

    /**
     * Actualiza los datos de un usuario existente.
     */
    updateUser: async (idUsuario, updateData) => {
        try {
            const user = JSON.parse(localStorage.getItem('user'));
            const token = user?.token;

            if (!token) throw new Error("No hay token de sesión.");

            const response = await fetch(`${API_URL}${idUsuario}/`, {
                method: 'PATCH',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(updateData),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.detail || "Error al actualizar usuario");
            }

            return await response.json();
        } catch (error) {
            console.error("Error updating user:", error);
            throw error;
        }
    }
};

export default userService;
