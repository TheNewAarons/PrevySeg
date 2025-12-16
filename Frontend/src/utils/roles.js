export const getRoleName = (user) => {
    return user?.datos_rol?.nombre_rol || 'Cliente';
};

// Devuelve la clase del badge según el rol
export const getRoleBadgeClass = (roleName) => {
    // Color Plomo (Gris) solo en borde
    return 'bg-white text-secondary border border-secondary';
};