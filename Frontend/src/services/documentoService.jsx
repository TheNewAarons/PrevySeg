// services/documentoService.jsx
import authService from "./authService";

const API_URL = "http://127.0.0.1:8000/api/documentos/";
const USER_API_URL = "http://127.0.0.1:8000/api/usuarios/";

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


const documentoService = {
    getDocumentos,
  getUsuarioById,
  aprobarDocumento,
  rechazarDocumento,
};

export default documentoService;

