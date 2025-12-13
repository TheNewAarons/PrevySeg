import React, { use, useEffect, useState } from "react";

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
        id_rol: ''
    });
    //añadimos estado para los roles
    const [roles, setRoles] = useState([])
    const [rolesLoading, setRolesLoanding] = useState(true)
    const [rolesError, setRolesError] = useState(null)
    useEffect(() => {
        const fetchRoles = async () =>{
            try{
                setRolesLoanding(true)
                setRolesError(null)

                const userStorage = localStorage.getItem("user")
                const token = userStorage ? JSON.parse(userStorage).token : null
                const res = await fetch("http://localhost:8000/api/roles/", {
                    headers: token
                    ? {'Authorization' : `Bearer ${token}`} : {}
                })
                if (!res.ok){
                    throw new Error("No se logro cargar los roles")
                }
                const data = await res.json();

                setRoles(data);

                const clienteRol = data.find(r => r.nombre_rol === 'Cliente')
                if (clienteRol && !formData.id_rol){
                    setFormData(prev =>({
                        ...prev,
                        id_rol : clienteRol.id_rol
                    }))
                }
            }catch(err){
                console.error("Error cargando roles:", err);
                setRolesError(err.message);
            }finally{
                setRolesLoanding(false)
            }
        };
        fetchRoles()
    }, [])

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value })
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const userStorage = localStorage.getItem('user');
            if (!userStorage) {
                alert("Tu sesión ha expirado. Por favor, inicia sesión nuevamente.");
                window.location.href = '/login';
                return;
            }

            const userData = JSON.parse(userStorage);
            let token = userData.token;

            //Creamos una copia y si está vacío, mandamos null.
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
                body: JSON.stringify(dataToSend) //Enviamos los datos limpios
            });

            //Si el token expiró (401), redirigir al login
            if (response.status === 401) {
                alert("Tu sesión ha expirado. Por favor, inicia sesión nuevamente.");
                localStorage.removeItem('user');
                window.location.href = '/login';
                return;
            }

            if (!response.ok) {
                //Leemos la respuesta del servidor (que dice POR QUÉ falló)
                const errorData = await response.json();
                console.log("Error del servidor:", errorData);

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
        <div className="form-container" style={{ border: '1px solid #ddd', padding: '20px', marginBottom: '20px' }}>
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

                    {rolesLoading && <p>Cargando roles...</p>}
                    {rolesError && <p style={{ color: 'red' }}>Error: {rolesError}</p>}

                    {!rolesLoading && !rolesError && (
                        <select
                            name="id_rol"
                            value={formData.id_rol}
                            onChange={(e) =>
                                setFormData({
                                    ...formData,
                                    id_rol: parseInt(e.target.value, 10)   // aseguramos número, no string
                                })
                            }
                            required
                        >
                            <option value="">Seleccione un rol</option>
                            {roles.map((rol) => (
                                <option key={rol.id_rol} value={rol.id_rol}>
                                    {rol.nombre_rol}
                                </option>
                            ))}
                        </select>
                    )}
                </div>

                <button type="submit" style={{ gridColumn: 'span 2', padding: '10px', background: '#007bff', color: 'white', border: 'none' }}>
                    Crear Usuario
                </button>
            </form>
        </div>
    );
};
export default CreateUserForm;
