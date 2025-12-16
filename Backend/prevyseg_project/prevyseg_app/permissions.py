from rest_framework import permissions

class IsSelforAdmin(permissions.BasePermission):
    #Funcion para permitir acceso solo al propio usuario, excepto el admin que puede realizar todas las funciones CREATE/DELETE/UPDATE
    def has_object_permission(self, request, view, obj):
        if hasattr(request.user, 'id_rol') and request.user.id_rol.nombre_rol == 'Administrador':
            return True
        
        # Permitir a Empresa modificar Clientes (para vincularlos)
        if hasattr(request.user, 'id_rol') and request.user.id_rol.nombre_rol == 'Empresa':
            if hasattr(obj, 'id_rol') and obj.id_rol.nombre_rol == 'Cliente':
                return True

        #user normal vera su propio user
        return  obj.id_usuario == request.user.id_usuario