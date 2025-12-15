// services/courseService.jsx
import authService from "./authService";
import { authenticatedFetch } from "../utils/apiHelpers";


const API_URL = "http://127.0.0.1:8000/api/cursos/";

/**
 * Obtiene cursos con filtros opcionales usando fetch.
 */
const getCourses = async (params = {}) => {
    try {
        // Construir querystring dinámico
        const queryString = new URLSearchParams(params).toString();
        const url = queryString ? `${API_URL}?${queryString}` : API_URL;

        const response = await authenticatedFetch(url, {
            method: "GET"
        });

        const data = await response.json();

        if (!response.ok) {
            const error = new Error(data.detail || "Error al obtener cursos");
            error.status = response.status;
            throw error;
        }

        return data;

    } catch (error) {
        if (error.message === 'NO_TOKEN') {
            console.error('❌ No hay sesión activa');
        }
        console.error("Error al obtener cursos:", error);
        throw error;
    }
};

/**
 * Obtiene un curso específico por ID.
 */
const getCourseById = async (id) => {
    try {
        const response = await authenticatedFetch(`${API_URL}${id}/`, {
            method: "GET"
        });

        const data = await response.json();

        if (!response.ok) {
            const error = new Error(data.detail || "Error al obtener curso");
            error.status = response.status;
            throw error;
        }

        return data;

    } catch (error) {
        if (error.message === 'NO_TOKEN') {
            console.error('No hay sesión activa');
        }
        console.error("Error al obtener curso:", error);
        throw error;
    }
};

/**
 * Crea un nuevo curso.
 */
const createCourse = async (courseData) => {
    try {
        const response = await authenticatedFetch(API_URL, {
            method: "POST",
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
        if (error.message === 'NO_TOKEN') {
            console.error('❌ No hay sesión activa');
        }
        console.error("Error al crear curso:", error);
        throw error;
    }
};

/**
 * Actualiza un curso existente.
 */
const updateCourse = async (id, courseData) => {
    try {
        const response = await authenticatedFetch(`${API_URL}${id}/`, {
            method: "PUT",
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
        if (error.message === 'NO_TOKEN') {
            console.error('❌ No hay sesión activa');
        }
        console.error("Error al actualizar curso:", error);
        throw error;
    }
};

/**
 * Elimina un curso.
 */
const deleteCourse = async (id) => {
    try {
        const response = await authenticatedFetch(`${API_URL}${id}/`, {
            method: "DELETE"
        });

        if (!response.ok) {
            const data = await response.json();
            const error = new Error(data.detail || "Error al eliminar curso");
            error.status = response.status;
            throw error;
        }

        return true;

    } catch (error) {
        if (error.message === 'NO_TOKEN') {
            console.error('No hay sesión activa');
        }
        console.error("Error al eliminar curso:", error);
        throw error;
    }
};


const getTiposDocumentos = async () => {
    const response = await authenticatedFetch(`${API_URL}tipos-documento/`, {
        method: "GET",
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.detail || "Error al obtener tipos de documentos");
    return data; // [{id_tipo_doc, nombre}]
};

const getInscripcionDetalle = async (cursoId) => {
    const response = await authenticatedFetch(`${API_URL}${cursoId}/inscripcion-detalle/`, {
        method: "GET",
    });

    const contentType = response.headers.get("content-type") || "";
    const data = contentType.includes("application/json")
        ? await response.json()
        : { detail: await response.text() };

    if (!response.ok) {
        const error = new Error(data.error || data.detail || "Error al obtener detalle inscripción");
        error.status = response.status;
        error.data = data;
        throw error;
    }

    return data;
};

const verificarInscripcion = async (cursoId) => {
    const response = await authenticatedFetch(`${API_URL}${cursoId}/verificar-inscripcion/`, {
        method: "GET",
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.detail || "Error al verificar inscripción");
    return data;
};

const finalizarInscripcion = async (cursoId) => {
    const response = await authenticatedFetch(`${API_URL}${cursoId}/finalizar-inscripcion/`, {
        method: "POST",
    });

    const contentType = response.headers.get("content-type") || "";
    const data = contentType.includes("application/json")
        ? await response.json()
        : { detail: await response.text() };

    if (!response.ok) {
        const error = new Error(data.error || data.detail || "Error al finalizar inscripción");
        error.status = response.status;
        error.data = data;
        throw error;
    }

    return data;
};
//para obtener cursos disponibles (borrar si es necesario) se usara para probar funcionalidades
const getCursosDisponibles = async (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    const url = queryString
        ? `${API_URL}cursos-disponibles/?${queryString}`
        : `${API_URL}cursos-disponibles/`;

    const response = await authenticatedFetch(url, { method: "GET" });

    const contentType = response.headers.get("content-type") || "";
    const data = contentType.includes("application/json")
        ? await response.json()
        : { detail: await response.text() };

    if (!response.ok) throw new Error(data.detail || "Error al obtener cursos disponibles");
    return data; // viene con ya_inscrito (si lo dejas), documentos_subidos, etc.
};
//Inscripciones
const getMisInscripciones = async () => {
    const res = await authenticatedFetch(`${API_URL}mis-inscripciones/`, {
        method: "GET",
    });

    const contentType = res.headers.get("content-type") || "";
    const data = contentType.includes("application/json")
        ? await res.json()
        : { detail: await res.text() };

    if (!res.ok) {
        const error = new Error(data.detail || data.error || "Error al obtener mis inscripciones");
        error.status = res.status;
        error.data = data;
        throw error;
    }

    return data;
};
//Inscripcion para visualizacion de Admin
const getInscripcionesUsuario = async (usuarioId) => {
    const response = await authenticatedFetch(
        `${API_URL}usuarios/${usuarioId}/inscripciones/`
    );

    const contentType = response.headers.get("content-type") || "";
    const data = contentType.includes("application/json")
        ? await response.json()
        : { detail: await response.text() };

    if (!response.ok) {
        throw new Error(data.detail || "Error al obtener inscripciones del usuario");
    }

    return data;
};

const courseService = {
    getCourses,
    getCourseById,
    createCourse,
    updateCourse,
    deleteCourse,
    finalizarInscripcion,
    verificarInscripcion,
    getInscripcionDetalle,
    getTiposDocumentos,
    getCursosDisponibles,
    getMisInscripciones,
    getInscripcionesUsuario,
};

export default courseService;