export const getRoleName = (user) => {
    return user?.datos_rol?.nombre_rol || 'Cliente';
};

// Devuelve la clase del badge según el rol
export const getRoleBadgeClass = (roleName) => {
    const roleLower = roleName.toLowerCase();

    if (roleLower === 'administrador') return 'bg-danger';
    if (roleLower === 'empresa') return 'bg-warning text-dark';
    return 'bg-info text-dark'; 
};  