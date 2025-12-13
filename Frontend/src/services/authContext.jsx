import React, {createContext, useContext, useState, useEffect, Children} from "react";
import { useNavigate } from "react-router-dom";
import authService from "./authService";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    //al cargar la app, verifica si hay usuario en localStorage
    useEffect(() => {
        const checkAuth = () => {
            try {
                const currentUser = authService.getCurrentUser();
                if (currentUser) {
                    setUser(currentUser);
                }
            } catch (error) {
                console.error('Error al cargar usuario:', error);
                authService.logout();
            } finally {
                setLoading(false);
            }
        };

        checkAuth();
    }, []);

    //función para login (usa tu authService)
    const login = async (rut, password) => {
        try {
            const data = await authService.login(rut, password);
            setUser(data);
            return data;
        } catch (error) {
            throw error;
        }
    };

    //función para registro (usa tu authService)
    const register = async (userData) => {
        try {
            const data = await authService.register(userData);
            setUser(data);
            return data;
        } catch (error) {
            throw error;
        }
    };

    //función para logout
    const logout = () => {
        console.log('🚪 Logout ejecutado'); // Debug
        
        // Limpia localStorage
        authService.logout();
        
        // Limpia el estado
        setUser(null);
        console.log('🚪 User establecido a null'); // Debug
        
        // Redirige y recarga la página para limpiar todo
        window.location.href = '/login'; // Usa window.location para forzar recarga
    };

    //verifica si el usuario está autenticado
    const isAuthenticated = () => {
        return user !== null && user.token;
    };

    //verifica si el usuario tiene un rol específico
    //el backend retorna el rol en user.rol_nombre o user.rol
    const hasRole = (roleName) => {
        const userRole = user?.rol_nombre || user?.rol;
        console.log('🔍 hasRole - Comparando:', userRole, 'con', roleName); // Debug
        const result = userRole === roleName;
        console.log('🔍 hasRole - Resultado:', result); // Debug
        return result;
    };

    //verifica si el usuario tiene uno de varios roles
    const hasAnyRole = (roles) => {
        return roles.includes(user?.rol_nombre) || roles.includes(user?.rol);
    };

    const value = {
        user,
        login,
        register,
        logout,
        isAuthenticated,
        hasRole,
        hasAnyRole,
        loading
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};

//hook personalizado para usar el contexto
export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth debe usarse dentro de AuthProvider');
    }
    return context;
};