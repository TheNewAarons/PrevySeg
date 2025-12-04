import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';
import '../../admin/styles/AdminDashboard.css'; // Reutilizamos estilos por ahora

const CrearCurso = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        nombre: '',
        descripcion: '',
        horas: '',
        profesor: '',
        valor: '',
        tipo_certificado: '',
        fecha_inicio: '',
        cupos_disponibles: '',
        documentos_requeridos: '',
        modalidad: 'Presencial',
        area: 'seguridad',
        dias_semana: '',
        hora_inicio: '',
        hora_fin: ''
    });
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');

        const userStr = localStorage.getItem('user');
        let token = null;
        if (userStr) {
            const user = JSON.parse(userStr);
            token = user.token;
        }

        if (!token) {
            setError('No estás autenticado. Por favor inicia sesión.');
            return;
        }

        try {
            // Usamos 127.0.0.1 para evitar problemas de resolución de DNS con localhost
            const response = await fetch('http://127.0.0.1:8000/api/cursos/', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(formData)
            });

            if (response.ok) {
                setSuccess('Curso creado exitosamente.');
                setTimeout(() => {
                    navigate('/administrador/dashboard');
                }, 2000);
            } else {
                const data = await response.json();
                setError(JSON.stringify(data));
            }
        } catch (err) {
            console.error('Error al crear curso:', err);
            setError(`Error al conectar con el servidor: ${err.message}`);
        }
    };

    return (
        <div className="administrador-dashboard">
            <nav className="navbar navbar-expand-lg navbar-light">
                <div className="container-fluid px-4">
                    <a className="navbar-brand" href="/">
                        <img src="/images/logos/logo.png" alt="PrevySeg Logo" />
                    </a>
                    <div className="d-flex align-items-center gap-3 ms-auto">
                        <button className="btn btn-secondary" onClick={() => navigate('/administrador/dashboard')}>
                            <i className="bi bi-arrow-left me-2"></i>Volver al Dashboard
                        </button>
                    </div>
                </div>
            </nav>

            <div className="main-container">
                <div className="container mt-4">
                    <div className="card shadow-lg">
                        <div className="card-header bg-primary text-white">
                            <h2 className="mb-0">Crear Nuevo Curso</h2>
                        </div>
                        <div className="card-body">
                            {error && <div className="alert alert-danger">{error}</div>}
                            {success && <div className="alert alert-success">{success}</div>}

                            <form onSubmit={handleSubmit}>
                                <div className="row">
                                    <div className="col-md-6 mb-3">
                                        <label className="form-label">Nombre del Curso</label>
                                        <input type="text" className="form-control" name="nombre" value={formData.nombre} onChange={handleChange} required />
                                    </div>
                                    <div className="col-md-6 mb-3">
                                        <label className="form-label">Profesor</label>
                                        <input type="text" className="form-control" name="profesor" value={formData.profesor} onChange={handleChange} required />
                                    </div>
                                </div>

                                <div className="mb-3">
                                    <label className="form-label">Descripción</label>
                                    <textarea className="form-control" name="descripcion" rows="3" value={formData.descripcion} onChange={handleChange} required></textarea>
                                </div>

                                <div className="row">
                                    <div className="col-md-4 mb-3">
                                        <label className="form-label">Horas</label>
                                        <input type="number" className="form-control" name="horas" value={formData.horas} onChange={handleChange} required />
                                    </div>
                                    <div className="col-md-4 mb-3">
                                        <label className="form-label">Valor</label>
                                        <input type="number" className="form-control" name="valor" value={formData.valor} onChange={handleChange} required />
                                    </div>
                                    <div className="col-md-4 mb-3">
                                        <label className="form-label">Cupos Disponibles</label>
                                        <input type="number" className="form-control" name="cupos_disponibles" value={formData.cupos_disponibles} onChange={handleChange} required />
                                    </div>
                                </div>

                                <div className="row">
                                    <div className="col-md-6 mb-3">
                                        <label className="form-label">Tipo de Certificado</label>
                                        <input type="text" className="form-control" name="tipo_certificado" value={formData.tipo_certificado} onChange={handleChange} required />
                                    </div>
                                    <div className="col-md-6 mb-3">
                                        <label className="form-label">Fecha de Inicio</label>
                                        <input type="date" className="form-control" name="fecha_inicio" value={formData.fecha_inicio} onChange={handleChange} required />
                                    </div>
                                </div>

                                <div className="row">
                                    <div className="col-md-6 mb-3">
                                        <label className="form-label">Modalidad</label>
                                        <select className="form-select" name="modalidad" value={formData.modalidad} onChange={handleChange}>
                                            <option value="Presencial">Presencial</option>
                                            <option value="Online">Online</option>
                                            <option value="Mixto">Mixto</option>
                                        </select>
                                    </div>
                                    <div className="col-md-6 mb-3">
                                        <label className="form-label">Área</label>
                                        <select className="form-select" name="area" value={formData.area} onChange={handleChange}>
                                            <option value="seguridad">Seguridad Privada</option>
                                            <option value="administracion">Administración y Finanzas</option>
                                            <option value="tecnologia">Tecnología y Sistemas</option>
                                            <option value="oficios">Oficios Técnicos</option>
                                            <option value="alimentos">Alimentos y Manipulación</option>
                                            <option value="estetica">Belleza y Estética</option>
                                        </select>
                                    </div>
                                </div>

                                <div className="mb-3">
                                    <label className="form-label">Documentos Requeridos</label>
                                    <textarea className="form-control" name="documentos_requeridos" rows="2" value={formData.documentos_requeridos} onChange={handleChange}></textarea>
                                </div>

                                <hr className="my-4" />
                                <h5 className="mb-3">Horario del Curso</h5>

                                <div className="row">
                                    <div className="col-md-12 mb-3">
                                        <label className="form-label">Días de la Semana</label>
                                        <input
                                            type="text"
                                            className="form-control"
                                            name="dias_semana"
                                            value={formData.dias_semana}
                                            onChange={handleChange}
                                            placeholder="Ej: Lunes,Miércoles,Viernes"
                                        />
                                        <small className="text-muted">Separa los días con comas</small>
                                    </div>
                                </div>

                                <div className="row">
                                    <div className="col-md-6 mb-3">
                                        <label className="form-label">Hora de Inicio</label>
                                        <input
                                            type="time"
                                            className="form-control"
                                            name="hora_inicio"
                                            value={formData.hora_inicio}
                                            onChange={handleChange}
                                        />
                                    </div>
                                    <div className="col-md-6 mb-3">
                                        <label className="form-label">Hora de Fin</label>
                                        <input
                                            type="time"
                                            className="form-control"
                                            name="hora_fin"
                                            value={formData.hora_fin}
                                            onChange={handleChange}
                                        />
                                    </div>
                                </div>

                                <div className="d-flex justify-content-between">
                                    <button type="button" className="btn btn-secondary" onClick={() => navigate('/administrador/dashboard')}>Cancelar</button>
                                    <button type="submit" className="btn btn-primary">Crear Curso</button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CrearCurso;
