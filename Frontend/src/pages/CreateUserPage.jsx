import React from "react";
import { Navigate, useNavigate } from "react-router-dom";
import CreateUserForm from "../components/CreateUserAdmin";

const CreateUserPage = () => {
    const navigate = useNavigate();
    const handleSuccess = () =>{
        navigate('/administrador/dashboard')
    };
    return(
        <div style={{ padding: '20px', maxWidth: '800px', margin: '0 auto' }}>
            <button 
                onClick={() => navigate(-1)} //Botón para cancelar/volver
                style={{ marginBottom: '20px', padding: '5px 10px', cursor: 'pointer' }}
            >
                ← Volver al Dashboard
            </button>
            
            <h1>Administración de Usuarios</h1>
            
            {/* Aquí incrustamos el formulario y le pasamos la función de éxito */}
            <CreateUserForm onUserCreated={handleSuccess} />
        </div>
    )
}
export default CreateUserPage