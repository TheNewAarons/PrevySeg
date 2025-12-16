import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';
import courseService from '../../../services/courseService';
import authService from '../../../services/authService';
import '../../admin/styles/AdminDashboard.css';
import Navbar from '../../../components/layout/Navbar';

const EditarCurso = () => {
    const navigate = useNavigate();
    const { id } = useParams();
    const [loading, setLoading] = useState(true);

    // Estados para catálogos
    const [tiposDocs, setTiposDocs] = useState([]);
    const [selectedDocIds, setSelectedDocIds] = useState([]);

    // Estado del formulario
    const [formData, setFormData] = useState({
        nombre: '',
        descripcion: '',
        horas: '',
        profesor: '',
        valor: '',
        tipo_certificado: '',
        fecha_inicio: '',
        cupos_disponibles: '',
        modalidad: 'Presencial',
        area: 'seguridad',
        estado: 'por_empezar'
    });

    // Estado para manejar los horarios por dia (estructura igual a CrearCurso)
    const [horarios, setHorarios] = useState([
        { dia: 'Lunes', inicio: '', fin: '', activo: false },
        { dia: 'Martes', inicio: '', fin: '', activo: false },
        { dia: 'Miercoles', inicio: '', fin: '', activo: false },
        { dia: 'Jueves', inicio: '', fin: '', activo: false },
        { dia: 'Viernes', inicio: '', fin: '', activo: false },
        { dia: 'Sabado', inicio: '', fin: '', activo: false },
        { dia: 'Domingo', inicio: '', fin: '', activo: false },
    ]);

    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    // Cargar tipos de documentos y datos del curso iniciales
    useEffect(() => {
        const loadData = async () => {
            try {
                // 1. Cargar tipos de documentos
                const docsData = await courseService.getTiposDocumentos();
                setTiposDocs(Array.isArray(docsData) ? docsData : []);

                // 2. Cargar datos del curso
                const courseData = await courseService.getCourseById(id);

                // Mapear campos simples
                setFormData({
                    nombre: courseData.nombre || '',
                    descripcion: courseData.descripcion || '',
                    horas: courseData.horas || '',
                    profesor: courseData.profesor || '',
                    valor: courseData.valor || '',
                    tipo_certificado: courseData.tipo_certificado || '',
                    fecha_inicio: courseData.fecha_inicio || '',
                    cupos_disponibles: courseData.cupos_disponibles || '',
                    modalidad: courseData.modalidad || 'Presencial',
                    area: courseData.area || 'seguridad',
                    estado: courseData.estado || 'por_empezar'
                });

                // Mapear Documentos Requeridos
                // El backend devuelve una lista de objetos en courseData.documentos_requeridos
                if (Array.isArray(courseData.documentos_requeridos)) {
                    setSelectedDocIds(courseData.documentos_requeridos.map(d => d.id_tipo_doc));
                }

                // Mapear Horarios
                // courseData.horarios viene como [{dia_semana: 'Lunes', hora_inicio: '08:00:00', ...}]
                if (Array.isArray(courseData.horarios)) {
                    const mappedHorarios = [
                        { dia: 'Lunes', inicio: '', fin: '', activo: false },
                        { dia: 'Martes', inicio: '', fin: '', activo: false },
                        { dia: 'Miercoles', inicio: '', fin: '', activo: false },
                        { dia: 'Jueves', inicio: '', fin: '', activo: false },
                        { dia: 'Viernes', inicio: '', fin: '', activo: false },
                        { dia: 'Sabado', inicio: '', fin: '', activo: false },
                        { dia: 'Domingo', inicio: '', fin: '', activo: false },
                    ];

                    courseData.horarios.forEach(h => {
                        const dayIndex = mappedHorarios.findIndex(mh => mh.dia === h.dia_semana);
                        if (dayIndex !== -1) {
                            mappedHorarios[dayIndex].activo = true;
                            // Cortar los segundos '08:00:00' -> '08:00'
                            mappedHorarios[dayIndex].inicio = String(h.hora_inicio).substring(0, 5);
                            mappedHorarios[dayIndex].fin = String(h.hora_fin).substring(0, 5);
                        }
                    });
                    setHorarios(mappedHorarios);
                }

                setError('');
            } catch (err) {
                console.error('Error al cargar datos:', err);
                if (err.status === 401 || String(err.message).includes("token_not_valid")) {
                    alert("Tu sesión ha expirado. Por favor inicia sesión nuevamente.");
                    authService.logout();
                    navigate('/login');
                } else {
                    setError('Error al cargar el curso. Por favor intenta nuevamente.');
                }
            } finally {
                setLoading(false);
            }
        };

        loadData();
    }, [id, navigate]);

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const toggleDoc = (id) => {
        setSelectedDocIds((prev) =>
            prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
        );
    };

    const handleScheduleChange = (index, field, value) => {
        const newHorarios = [...horarios];
        newHorarios[index][field] = value;
        setHorarios(newHorarios);
    };

    const toggleDay = (index) => {
        const newHorarios = [...horarios];
        newHorarios[index].activo = !newHorarios[index].activo;
        setHorarios(newHorarios);
    };

    const validate = () => {
        if (!formData.nombre.trim()) return "El nombre del curso es obligatorio.";
        if (!formData.descripcion.trim()) return "La descripción es obligatoria.";
        if (!formData.fecha_inicio) return "La fecha de inicio es obligatoria.";
        if (selectedDocIds.length === 0) {
            return "Debes seleccionar al menos un documento requerido.";
        }

        const activeSchedules = horarios.filter(h => h.activo);
        if (activeSchedules.length === 0) {
            return "Debes seleccionar al menos un día de horario.";
        }

        for (let s of activeSchedules) {
            if (!s.inicio || !s.fin) {
                return `El horario del día ${s.dia} está incompleto.`;
            }
            if (s.fin <= s.inicio) {
                return `En ${s.dia}, la hora de fin debe ser mayor que la de inicio.`;
            }
        }
        return null;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');

        const validationError = validate();
        if (validationError) {
            setError(validationError);
            window.scrollTo(0, 0); // Scroll to top to see error
            return;
        }

        setLoading(true);

        try {
            const payload = {
                ...formData,
                horas: formData.horas ? Number(formData.horas) : null,
                valor: formData.valor ? Number(formData.valor) : null,
                cupos_disponibles: formData.cupos_disponibles
                    ? Number(formData.cupos_disponibles)
                    : null,
                documentos_requeridos_ids: selectedDocIds,
                horarios: horarios.filter(h => h.activo).map(h => ({
                    dia_semana: h.dia,
                    hora_inicio: h.inicio,
                    hora_fin: h.fin
                }))
            };

            await courseService.updateCourse(id, payload);
            setSuccess('Curso actualizado exitosamente.');
            setTimeout(() => {
                navigate('/administrador/cursos');
            }, 1500);
        } catch (err) {
            console.error('Error al actualizar curso:', err);
            if (err.status === 401) {
                setError('No estás autenticado. Por favor inicia sesión.');
            } else if (err.data) {
                setError(JSON.stringify(err.data));
            } else {
                setError(`Error al actualizar curso: ${err.message}`);
            }
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="administrador-dashboard">
                <Navbar />
                <div className="main-container">
                    <div className="text-center py-5">
                        <div className="spinner-border text-primary" role="status">
                            <span className="visually-hidden">Cargando...</span>
                        </div>
                        <p className="mt-3">Cargando datos del curso...</p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="administrador-dashboard">
            <Navbar />

            <div className="main-container">
                <div className="container mt-4">
                    <div className="card shadow-lg">
                        <div className="card-header bg-warning text-dark">
                            <h2 className="mb-0">Editar Curso</h2>
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
                                    <div className="col-md-4 mb-3">
                                        <label className="form-label">Modalidad</label>
                                        <select className="form-select" name="modalidad" value={formData.modalidad} onChange={handleChange}>
                                            <option value="Presencial">Presencial</option>
                                            <option value="Online">Online</option>
                                            <option value="Mixto">Mixto</option>
                                        </select>
                                    </div>
                                    <div className="col-md-4 mb-3">
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
                                    <div className="col-md-4 mb-3">
                                        <label className="form-label">Estado</label>
                                        <select className="form-select" name="estado" value={formData.estado} onChange={handleChange}>
                                            <option value="por_empezar">Por Empezar</option>
                                            <option value="en_curso">En Curso</option>
                                            <option value="finalizado">Finalizado</option>
                                        </select>
                                    </div>
                                </div>

                                {/* Selección de Documentos */}
                                <div className="mb-3">
                                    <label className="form-label">Documentos Requeridos</label>
                                    {tiposDocs.length === 0 ? (
                                        <div className="text-muted">
                                            No hay tipos de documentos disponibles.
                                        </div>
                                    ) : (
                                        <div className="border rounded p-3" style={{ maxHeight: '200px', overflowY: 'auto' }}>
                                            {tiposDocs.map((doc) => (
                                                <div className="form-check" key={doc.id_tipo_doc}>
                                                    <input
                                                        className="form-check-input"
                                                        type="checkbox"
                                                        id={`tipo-doc-${doc.id_tipo_doc}`}
                                                        checked={selectedDocIds.includes(doc.id_tipo_doc)}
                                                        onChange={() => toggleDoc(doc.id_tipo_doc)}
                                                    />
                                                    <label
                                                        className="form-check-label"
                                                        htmlFor={`tipo-doc-${doc.id_tipo_doc}`}
                                                    >
                                                        {doc.nombre}
                                                    </label>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                    <small className="text-muted">
                                        Selecciona los documentos que el alumno debe subir obligatoriamente.
                                    </small>
                                </div>

                                <hr className="my-4" />
                                <h5 className="mb-3">Horario del Curso</h5>

                                <div className="table-responsive">
                                    <table className="table">
                                        <thead>
                                            <tr>
                                                <th style={{ width: '50px' }}>Activo</th>
                                                <th>Día</th>
                                                <th>Hora Inicio</th>
                                                <th>Hora Fin</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {horarios.map((h, index) => (
                                                <tr key={h.dia}>
                                                    <td>
                                                        <div className="form-check d-flex justify-content-center">
                                                            <input
                                                                className="form-check-input"
                                                                type="checkbox"
                                                                checked={h.activo}
                                                                onChange={() => toggleDay(index)}
                                                            />
                                                        </div>
                                                    </td>
                                                    <td>{h.dia}</td>
                                                    <td>
                                                        <input
                                                            type="time"
                                                            className="form-control"
                                                            value={h.inicio}
                                                            onChange={(e) => handleScheduleChange(index, 'inicio', e.target.value)}
                                                            disabled={!h.activo}
                                                        />
                                                    </td>
                                                    <td>
                                                        <input
                                                            type="time"
                                                            className="form-control"
                                                            value={h.fin}
                                                            onChange={(e) => handleScheduleChange(index, 'fin', e.target.value)}
                                                            disabled={!h.activo}
                                                        />
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>

                                <div className="d-flex justify-content-between">
                                    <button type="button" className="btn btn-secondary" onClick={() => navigate('/administrador/cursos')}>Cancelar</button>
                                    <button type="submit" className="btn btn-warning" disabled={loading}>{loading ? "Guardando..." : "Actualizar Curso"}</button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default EditarCurso;
