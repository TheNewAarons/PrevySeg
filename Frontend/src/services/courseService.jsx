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
            const error = new Error(data.detail || "Error al obtener cursos");
            error.status = response.status;
            throw error;
        }

        return data;

    } catch (error) {
        console.error("Error al obtener cursos:", error);
        throw error;
    }
};

/**
 * Obtiene un curso específico por ID.
 */
const getCourseById = async (id) => {
    try {
        const user = authService.getCurrentUser();
        const token = user.token;

        const response = await fetch(`${API_URL}${id}/`, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            }
        });

        const data = await response.json();

        if (!response.ok) {
            const error = new Error(data.detail || "Error al obtener curso");
            error.status = response.status;
            throw error;
        }

        return data;

    } catch (error) {
        console.error("Error al obtener curso:", error);
        throw error;
    }
};

/**
 * Crea un nuevo curso.
 */
const createCourse = async (courseData) => {
    try {
        const user = authService.getCurrentUser();
        const token = user.token;

        const response = await fetch(API_URL, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            },
            body: JSON.stringify(courseData)
        });

        const data = await response.json();

        if (!response.ok) {
            const error = new Error(data.detail || "Error al crear curso");
            error.status = response.status;
            error.data = data;
            throw error;
        }

        return data;

    } catch (error) {
        console.error("Error al crear curso:", error);
        throw error;
    }
};

/**
 * Actualiza un curso existente.
 */
const updateCourse = async (id, courseData) => {
    try {
        const user = authService.getCurrentUser();
        const token = user.token;

        const response = await fetch(`${API_URL}${id}/`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            },
            body: JSON.stringify(courseData)
        });

        const data = await response.json();

        if (!response.ok) {
            const error = new Error(data.detail || "Error al actualizar curso");
            error.status = response.status;
            error.data = data;
            throw error;
        }

        return data;

    } catch (error) {
        console.error("Error al actualizar curso:", error);
        throw error;
    }
};

/**
 * Elimina un curso.
 */
const deleteCourse = async (id) => {
    try {
        const user = authService.getCurrentUser();
        const token = user.token;

        const response = await fetch(`${API_URL}${id}/`, {
            method: "DELETE",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            }
        });

        if (!response.ok) {
            const data = await response.json();
            const error = new Error(data.detail || "Error al eliminar curso");
            error.status = response.status;
            throw error;
        }

        return true;

    } catch (error) {
        console.error("Error al eliminar curso:", error);
        throw error;
    }
};

/**
 * Inscribe a un usuario en un curso.
 */
const enrollCourse = async (courseId) => {
    try {
        const user = authService.getCurrentUser();
        const token = user.token;

        const response = await fetch(`${API_URL}${courseId}/inscribir/`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            }
        });

        const data = await response.json();

        if (!response.ok) {
            const error = new Error(data.detail || "Error al inscribir curso");
            error.status = response.status;
            throw error;
        }

        return data;
    } catch (error) {
        console.error("Error al inscribir curso:", error);
        throw error;
    }
};

const courseService = {
    getCourses,
    getCourseById,
    createCourse,
    updateCourse,
    deleteCourse,
    enrollCourse,
};

export default courseService;

