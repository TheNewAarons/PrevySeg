import React, { useState } from "react";

const CreateUserForm = ({ onUserCreated }) => {
    const [formData, setFormData] = useState({
        rut: '',
        password: '',
        nombre: '',
        email: '',
        telefono: '',
        domicilio: '',
        fecha_nacimiento: '',
        lugar_trabajo: '',
        id_rol: 2 
    });

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value })
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const userStorage = localStorage.getItem('user');
            if (!userStorage) throw new Error("No hay sesión activa");
            const token = JSON.parse(userStorage).token;

            // Creamos una copia y si está vacío, mandamos null.
            const dataToSend = { ...formData };
            if (!dataToSend.fecha_nacimiento) dataToSend.fecha_nacimiento = null;
            if (!dataToSend.lugar_trabajo) dataToSend.lugar_trabajo = null;

            console.log("Enviando datos:", dataToSend); // Para depurar en consola

            const response = await fetch('http://localhost:8000/api/usuarios/', {
                method: "POST",
                headers: {
                    "Authorization": `Bearer ${token}`,
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(dataToSend) // Enviamos los datos limpios
            });
            
            if (!response.ok) {
                // Leemos la respuesta del servidor (que dice POR QUÉ falló)
                const errorData = await response.json();
                console.log("Error del servidor:", errorData);

                // Convertimos el objeto de error en texto legible
                // Ej: { rut: ["Ya existe"], password: ["Muy corta"] } -> "rut: Ya existe, password: Muy corta"
                const errorMessages = Object.entries(errorData)
                    .map(([key, value]) => `${key}: ${value}`)
                    .join(' | ');

                throw new Error(errorMessages || "Error desconocido al crear usuario");
            }
            
            alert("Usuario creado exitosamente");
            onUserCreated(); 
        } catch (error) {
            console.error(error);
            alert(`No se pudo crear: ${error.message}`);
        }
    }  

    return (
        <div className="form-container" style={{border: '1px solid #ddd', padding: '20px', marginBottom: '20px'}}>
            <h3>Registrar Nuevo Usuario</h3>
            <form onSubmit={handleSubmit} style={{ display: 'grid', gap: '10px', gridTemplateColumns: '1fr 1fr' }}>
                
                <input name="rut" placeholder="RUT (12.345.678-9)" onChange={handleChange} value={formData.rut} required />
                <input name="nombre" placeholder="Nombre Completo" onChange={handleChange} value={formData.nombre} required />
                <input name="email" type="email" placeholder="Correo Electrónico" onChange={handleChange} value={formData.email} required />
                <input name="password" type="password" placeholder="Contraseña" onChange={handleChange} value={formData.password} required />
                
                <input name="telefono" placeholder="Teléfono" onChange={handleChange} value={formData.telefono} required />
                <input name="domicilio" placeholder="Domicilio" onChange={handleChange} value={formData.domicilio} required />

                
                <input name="fecha_nacimiento" type="date" onChange={handleChange} value={formData.fecha_nacimiento} />
                <input name="lugar_trabajo" placeholder="Lugar de Trabajo" onChange={handleChange} value={formData.lugar_trabajo} />

                <div style={{ gridColumn: 'span 2' }}>
                    <label>Asignar Rol: </label>
                    <select name="id_rol" onChange={handleChange} value={formData.id_rol}>
                        <option value="2">Cliente</option>
                        <option value="3">Empresa</option>
                        <option value="1">Administrador</option>
                    </select>
                </div>

                <button type="submit" style={{ gridColumn: 'span 2', padding: '10px', background: '#007bff', color: 'white', border: 'none' }}>
                    Crear Usuario
                </button>
            </form>
        </div>
    );
};
export default CreateUserForm;