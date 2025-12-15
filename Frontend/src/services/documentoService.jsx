// services/documentoService.jsx
import authService from "./authService";
import { getAuthHeaders } from "../utils/apiHelpers";
const API_URL = "http://127.0.0.1:8000/api/documentos/";
const USER_API_URL = "http://127.0.0.1:8000/api/usuarios/";
const CURSOS_API_URL = "http://127.0.0.1:8000/api/cursos/"

const getDocumentos = async () => {
    try {
        const user = authService.getCurrentUser();

        if (!user) {
            throw new Error("Usuario no autenticado");
        }

        const token = user.token;

        const response = await fetch(API_URL, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            }
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
        const user = authService.getCurrentUser();

        if (!user) {
            throw new Error("Usuario no autenticado");
        }

        const token = user.token;

        const response = await fetch(`${USER_API_URL}${id}/`, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            }
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
        const user = authService.getCurrentUser();
        console.log("user desde authService en getDocumentosPendientes:", user);

        if (!user) throw new Error("Usuario no autenticado");

        const token = user.token;
        console.log("Token usado en getDocumentosPendientes:", token);

        const response = await fetch(`${API_URL}pendientes/`, {
        method: "GET",
        headers: {
            Authorization: `Bearer ${token}`,
        },
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
    const headers = getAuthHeaders();
    const { "Content-Type": _, ...safeHeaders } = headers;

    const formData = new FormData();
    formData.append("tipo_documento", tipoDocumentoId);
    formData.append("archivo", file); // ✅ CLAVE

    const response = await fetch(
        `http://127.0.0.1:8000/api/cursos/${cursoId}/documentos/subir/`,
        {
        method: "POST",
        headers: safeHeaders,
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
        const user = authService.getCurrentUser();
        if (!user) throw new Error("Usuario no autenticado");

        const token = user.token;

        const response = await fetch(`${API_URL}${id}/aprobar/`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            }
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
        const user = authService.getCurrentUser();
        if (!user) throw new Error("Usuario no autenticado");

        const token = user.token;

        const response = await fetch(`${API_URL}${id}/rechazar/`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            },
            body: JSON.stringify({ observacion })  // enviamos observación
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
    const headers = getAuthHeaders();
    const { "Content-Type": _, ...safeHeaders } = headers;
    const response = await fetch(`${CURSOS_API_URL}${cursoId}/documentos/`, {
        method: "GET",
        headers,
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

