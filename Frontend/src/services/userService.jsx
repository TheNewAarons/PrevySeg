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
    }
};

export default userService;
