from rest_framework import permissions

class IsSelforAdmin(permissions.BasePermission):
    #Funcion para permitir acceso solo al propio usuario, excepto el admin que puede realizar todas las funciones CREATE/DELETE/UPDATE
    def has_object_permission(self, request, view, obj):
        #verifica si el user es de rol administrador para brindar el acceso total
        if hasattr(request.user, 'id_rol') and request.user.id_rol.nombre_rol == 'Administrador':
            return True
        #user normal vera su propio user
        return  obj.id_usuario == request.user.id_usuario