import React, {useEffect, useState} from "react";

const UsuarioList = () => {
    const [usuarios, setUsuarios] = useState([]);
    const [cargando, setCargando] = useState(true);
    const [error, setError] = useState(null);
    //Lista filtrada (lo que se muestra en pantalla)
    const [filtrados, setFiltrados] = useState([]);

    //Estado del buscador (RUT ingresado por el usuario)
    const [busqueda, setBusqueda] = useState("");

    
    useEffect(() => {
        const fetchUsuarios = async () => {
        try {
            const userStorage = localStorage.getItem('user');
                
                if (!userStorage) {
                    throw new Error("No has iniciado sesión.");
                }

                const userData = JSON.parse(userStorage);
                
                //Extraemos el token desde dentro del objeto
                const token = userData.token; 

                if (!token) {
                    throw new Error("Token no válido o sesión expirada.");
                }
            const response = await fetch("http://localhost:8000/api/usuarios/", {
                headers: {
                    "Authorization" : `Bearer ${token}`,
                    "Content-Type": "application/json",
                }        
            })
            if (!response.ok) {
                    if (response.status === 401) throw new Error("Sesión caducada. Inicia sesión de nuevo.");
                    if (response.status === 403) throw new Error("No tienes permisos de Administrador.");
                    throw new Error("Error al obtener usuarios del servidor.");
            }
            const data = await response.json();
            setUsuarios(data);
            setFiltrados(data);
        } catch(err){
            setError(err.message)
        } finally{
            setCargando(false)
        }
    };
    fetchUsuarios();
    }, []);

    //Funcion para filtrar por rut
    const handleBusqueda = (e) => {
        const valor = e.target.value;
        setBusqueda(valor)

        //Filtracion dinamica
        const resultados = usuarios.filter((u) => u.rut.toLowerCase().includes(valor.toLowerCase()))
        setFiltrados(resultados)
    }
    if (cargando) return <p>Cargando usuarios...</p>
    if (error) return <p>{error}</p>
    return (
        <div style={{ padding: "20px", maxWidth: "700px" }}>
        <h1>Lista de Usuarios</h1>

        <input
            type="text"
            placeholder="Buscar por RUT..."
            value={busqueda}
            onChange={handleBusqueda}
            style={{
            width: "100%",
            padding: "10px",
            marginBottom: "20px",
            fontSize: "16px",
            }}
        />

        {filtrados.length > 0 ? (
            <ul>
            {filtrados.map((u) => (
                <li key={u.id_usuario} style={{ marginBottom: "20px", listStyle: "none", padding: "10px", borderBottom: "1px solid #ccc" }}>
                
                <p><strong>ID usuario:</strong> {u.id_usuario}</p>
                <p><strong>RUT:</strong> {u.rut}</p>
                <p><strong>Nombre:</strong> {u.nombre}</p>
                <p><strong>Fecha nacimiento:</strong> {u.fecha_nacimiento}</p>
                <p><strong>Teléfono:</strong> {u.telefono}</p>
                <p><strong>Domicilio:</strong> {u.domicilio}</p>
                <p><strong>Email:</strong> {u.email}</p>
                <p><strong>Lugar de trabajo:</strong> {u.lugar_trabajo}</p>
                <p><strong>Rol:</strong> {u.id_rol?.nombre_rol || "Sin rol"}</p>

                </li>
            ))}
            </ul>
        ) : (
            <p>No se encontraron usuarios.</p>
        )}
        </div>
    );
}
export default UsuarioList
