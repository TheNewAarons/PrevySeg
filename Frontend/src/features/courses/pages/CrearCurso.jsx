import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';
import courseService from '../../../services/courseService';
import '../../admin/styles/AdminDashboard.css';
import Navbar from '../../../components/layout/Navbar';

const CrearCurso = () => {
    const navigate = useNavigate();
    const [tiposDocs, setTiposDocs] = useState([]);
    const [selectedDocIds, setSelectedDocIds] = useState([]);
    const [loading, setLoading] = useState(false);
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

    // Estado para manejar los horarios por dia
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
    useEffect(() => {
        const loadTiposDocs = async () => {
            try {
                const data = await courseService.getTiposDocumentos();
                setTiposDocs(Array.isArray(data) ? data : []);
            } catch (err) {
                console.error("Error cargando tipos de documentos:", err);
                setTiposDocs([]);
            }
        };

        loadTiposDocs();
    }, []);

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
        //reglas mínimas ajustables en base a lo que se requiera
        if (!formData.nombre.trim()) return "El nombre del curso es obligatorio.";
        if (!formData.descripcion.trim()) return "La descripción es obligatoria.";
        if (!formData.fecha_inicio) return "La fecha de inicio es obligatoria.";
        if (selectedDocIds.length === 0) {
            return "Debes seleccionar al menos un documento requerido.";
        }

        // Validar horarios
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

        const error = validate();
        if (error) {
            alert(error);
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
            await courseService.createCourse(payload);
            alert("Curso creado correctamente ✅");
            //limpieza
            setFormData({
                nombre: "",
                descripcion: "",
                horas: "",
                profesor: "",
                valor: "",
                tipo_certificado: "",
                fecha_inicio: "",
                cupos_disponibles: "",
                modalidad: "Presencial",
                area: "seguridad",
                estado: "por_empezar",
            });
            setHorarios(horarios.map(h => ({ ...h, inicio: '', fin: '', activo: false })));
            setSelectedDocIds([]);
        } catch (err) {
            console.error("Error creando curso:", err);
            alert(err?.message || "Error al crear el curso.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="administrador-dashboard">
            <Navbar />

            <div className="main-container">
                <div className="d-flex justify-content-between align-items-center mb-4">
                    <div>
                        <h1 className="page-title">Crear Nuevo Curso</h1>
                        <p className="page-subtitle">Completa el formulario para registrar un nuevo curso en el sistema.</p>
                    </div>
                    <button className="btn btn-outline-secondary" onClick={() => navigate('/administrador/dashboard')}>
                        <i className="bi bi-arrow-left me-2"></i>Volver al Panel
                    </button>
                </div>

                <div className="bg-white rounded-4 shadow-sm p-4 border" style={{ borderColor: 'var(--border-color)' }}>
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

                        <div className="mb-3">
                            <label className="form-label">Documentos Requeridos</label>

                            {tiposDocs.length === 0 ? (
                                <div className="text-muted">
                                    No hay tipos de documentos disponibles (o no cargaron).
                                </div>
                            ) : (
                                <div className="border rounded p-3">
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
                                Selecciona los documentos obligatorios para este curso. El cliente solo podrá subir estos.
                            </small>
                        </div>

                        <hr className="my-4" />
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
                            <button type="button" className="btn btn-secondary" onClick={() => navigate('/administrador/dashboard')}>Cancelar</button>
                            <button type="submit" className="btn btn-primary" disabled={loading}>{loading ? "Creando..." : "Crear Curso"}</button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default CrearCurso;
