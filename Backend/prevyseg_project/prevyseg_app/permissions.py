from rest_framework.permissions import BasePermission

class IsAdminRole(BasePermission):
    def has_permission(self, request, view):
        user = request.user

        # Debe estar autenticado
        if not user or not user.is_authenticated:
            return False
        
        # Validar rol por ID
        return user.id_rol.id_rol == 2

