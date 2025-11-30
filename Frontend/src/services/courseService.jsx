// services/courseService.jsx
import authService from "./authService";

const API_URL = "http://127.0.0.1:8000/api/cursos/";

/**
 * Obtiene cursos con filtros opcionales usando fetch.
 */
const getCourses = async (params = {}) => {
    try {
        const user = authService.getCurrentUser();
        const token = user.token;

        // Construir querystring dinámico
        const queryString = new URLSearchParams(params).toString();
        const url = queryString ? `${API_URL}?${queryString}` : API_URL;

        const response = await fetch(url, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            }
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.detail || "Error al obtener cursos");
        }

        return data;

    } catch (error) {
        console.error("Error al obtener cursos:", error);
        throw error;
    }
};

// Si después quieres inscribir cursos, se agrega acá más métodos.
// Por ahora solo mostramos cursos.

const courseService = {
    getCourses,
};

export default courseService;

