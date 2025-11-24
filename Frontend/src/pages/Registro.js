// Ejemplo de uso en un componente React:
import authService from '../services/authService';

const handleLogin = async (rut, password) => {
    try {
        const response = await authService.login(rut, password);
        console.log('Inicio de sesión exitoso:', response);
        // Aquí rediriges al dashboard según el rol (Cliente, Admin, Empresa)
        // Ejemplo: navigate(`/${response.rol.toLowerCase()}/dashboard`);
    } catch (error) {
        alert(error.message);
    }
};
// ... (resto del componente)