import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "./authContext";

const LoadingSpinner = () => (
    <div className="d-flex justify-content-center align-items-center" style={{ height: '100vh' }}>
        <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Cargando...</span>
        </div>
    </div>
);

//ruta que requiere estar autenticado (cualquier rol)
export const ProtectedRoute = ({ children }) => {
    const { isAuthenticated, loading } = useAuth();

    if (loading) {
        return <LoadingSpinner />;
    }

    if (!isAuthenticated()) {
        return <Navigate to="/login" replace />;
    }

    return children;
};

//ruta solo para un ROL específico
export const RoleRoute = ({ children, allowedRole }) => {
    const { user, hasRole, loading } = useAuth();

    console.log('🔐 RoleRoute - Loading:', loading);
    console.log('🔐 RoleRoute - User:', user);
    console.log('🔐 RoleRoute - Allowed Role:', allowedRole);

    if (loading) {
        return <LoadingSpinner />;
    }

    if (!user) {
        console.log('❌ No hay usuario, redirigiendo a login');
        return <Navigate to="/login" replace />;
    }

    const userRole = user.rol_nombre || user.rol;
    console.log('👤 Rol del usuario:', userRole);
    console.log('✅ ¿Tiene permiso?', hasRole(allowedRole));

    if (!hasRole(allowedRole)) {
        console.log('⛔ No tiene el rol necesario, redirigiendo...');
        //redirige al dashboard del rol del usuario
        return <Navigate to={getDashboardByRole(userRole)} replace />;
    }

    console.log('✅ Acceso permitido');
    return children;
};

//ruta para MÚLTIPLES roles
export const MultiRoleRoute = ({ children, allowedRoles }) => {
    const { user, hasAnyRole, loading } = useAuth();

    if (loading) {
        return <LoadingSpinner />;
    }

    if (!user) {
        return <Navigate to="/login" replace />;
    }

    if (!hasAnyRole(allowedRoles)) {
        return <Navigate to={getDashboardByRole(user.rol_nombre)} replace />;
    }

    return children;
};

//ruta solo para usuarios NO autenticados (Login, Register)
export const PublicRoute = ({ children }) => {
    const { user, loading } = useAuth();

    if (loading) {
        return <LoadingSpinner />;
    }

    if (user) {
        //si ya está autenticado, redirige a su dashboard
        return <Navigate to={getDashboardByRole(user.rol_nombre)} replace />;
    }

    return children;
};

//función auxiliar para redireccionar según rol
const getDashboardByRole = (rol) => {
    switch (rol) {
        case 'Administrador':
            return '/administrador/dashboard';
        case 'Empresa':
            return '/empresa/dashboard';
        case 'Cliente':
            return '/cliente/dashboard';
        default:
            return '/';
    }
};