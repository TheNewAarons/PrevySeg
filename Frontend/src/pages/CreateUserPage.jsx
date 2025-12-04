import React from "react";
import { Navigate, useNavigate } from "react-router-dom";
import CreateUserForm from "../components/CreateUserAdmin";
























import BotonVolver from "../components/ButtonBack";

const CreateUserPage = () => {
    const navigate = useNavigate();
    const handleSuccess = () => {
        navigate('/administrador/dashboard')
    };
    return (
        <div style={{ padding: '20px', maxWidth: '800px', margin: '0 auto' }}>
            <BotonVolver />

            <h1>Administración de Usuarios</h1>

            {/* Aquí incrustamos el formulario y le pasamos la función de éxito */}
            <CreateUserForm onUserCreated={handleSuccess} />
        </div>
    )
}
export default CreateUserPage