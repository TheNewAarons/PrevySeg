// services/documentoService.jsx
import authService from "./authService";
import { authenticatedFetch } from "../utils/apiHelpers";
const API_URL = "http://127.0.0.1:8000/api/documentos/";
const USER_API_URL = "http://127.0.0.1:8000/api/usuarios/";
const CURSOS_API_URL = "http://127.0.0.1:8000/api/cursos/"

const getDocumentos = async () => {
    try {
        const response = await authenticatedFetch(API_URL, {
            method: "GET"
        });

        const data = await response.json();

        if (!response.ok) {
            const error = new Error(data.detail || "Error al obtener documentos");
            error.status = response.status;
            throw error;
        }

        return data;

    } catch (error) {
        console.error("Error obteniendo documentos:", error);
        throw error;
    }
};

const getUsuarioById = async (id) => {
    try {
        const response = await authenticatedFetch(`${USER_API_URL}${id}/`, {
            method: "GET"
        });

        const data = await response.json();

        if (!response.ok) {
            const error = new Error(data.detail || "Error al obtener usuario");
            error.status = response.status;
            throw error;
        }

        return data;

    } catch (error) {
        console.error("Error obteniendo usuario:", error);
        throw error;
    }
};
const getDocumentosPendientes = async () => {
    try {
        const response = await authenticatedFetch(`${API_URL}pendientes/`, {
            method: "GET"
        });

        const data = await response.json();
        console.log("Respuesta backend documentos/pendientes:", data);

        if (!response.ok) {
            // Si el problema es de token inválido, podemos limpiar sesión
            if (data.code === "token_not_valid") {
                console.warn("Token inválido, limpiando sesión...");
                authService.logout?.(); // por si tienes logout
            }

            const error = new Error(
                data.detail || "Error al obtener documentos pendientes"
            );
            error.status = response.status;
            throw error;
        }

        return data;
    } catch (error) {
        console.error("Error obteniendo documentos pendientes:", error);
        throw error;
    }
};

const subirDocumentoCurso = async (cursoId, tipoDocumentoId, file) => {
    const response = await authenticatedFetch(
        `http://127.0.0.1:8000/api/cursos/${cursoId}/documentos/subir/`,
        {
            method: "POST",
            body: formData,
        }
    );

    const data = await response.json();

    if (!response.ok) {
        console.error("Error backend:", data);
        throw new Error(data.error || "Error al subir documento");
    }

    return data;
};

const aprobarDocumento = async (id) => {
    try {
        const response = await authenticatedFetch(`${API_URL}${id}/aprobar/`, {
            method: "POST"
        });

        if (!response.ok) {
            const data = await response.json();
            throw new Error(data.detail || "Error al aprobar documento");
        }

        const data = await response.json();
        return data;

    } catch (error) {
        console.error("Error aprobando documento:", error);
        throw error;
    }
};
const rechazarDocumento = async (id, observacion) => {
    try {
        const response = await authenticatedFetch(`${API_URL}${id}/rechazar/`, {
            method: "POST",
            body: JSON.stringify({ observacion })
        });

        if (!response.ok) {
            const data = await response.json();
            throw new Error(data.detail || "Error al rechazar documento");
        }

        const data = await response.json();
        return data;

    } catch (error) {
        console.error("Error rechazando documento:", error);
        throw error;
    }
};
const getDocumentosCurso = async (cursoId) => {
    const response = await authenticatedFetch(`${CURSOS_API_URL}${cursoId}/documentos/`, {
        method: "GET",
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.detail || "Error obteniendo documentos del curso");
    return data;
};



const documentoService = {
    getDocumentos,
    getUsuarioById,
    aprobarDocumento,
    rechazarDocumento,
    getDocumentosPendientes,
    subirDocumentoCurso,
    getDocumentosCurso,
};

export default documentoService;

