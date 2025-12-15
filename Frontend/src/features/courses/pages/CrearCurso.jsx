import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';
import courseService from '../../../services/courseService';
import '../../admin/styles/AdminDashboard.css';

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
        estado: 'por_empezar',
    });
    const [schedules, setSchedules] = useState({
        'Lunes': { active: false, start: '', end: '' },
        'Martes': { active: false, start: '', end: '' },
        'Miércoles': { active: false, start: '', end: '' },
        'Jueves': { active: false, start: '', end: '' },
        'Viernes': { active: false, start: '', end: '' },
        'Sábado': { active: false, start: '', end: '' },
    });
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
    const validate = () => {
        //reglas mínimas ajustables en base a lo que se requiera
        if (!formData.nombre.trim()) return "El nombre del curso es obligatorio.";
        if (!formData.descripcion.trim()) return "La descripción es obligatoria.";
        if (!formData.fecha_inicio) return "La fecha de inicio es obligatoria.";


        const activeDays = Object.values(schedules).filter(d => d.active);
        if (activeDays.length === 0) {
            return "Debes seleccionar al menos un día de horario.";
        }

        for (const [day, schedule] of Object.entries(schedules)) {
            if (schedule.active) {
                if (!schedule.start || !schedule.end) {
                    return `Debes completar el horario para el día ${day}.`;
                }
                if (schedule.end <= schedule.start) {
                    return `La hora de fin debe ser mayor a la de inicio en ${day}.`;
                }
            }
        }


        if (selectedDocIds.length === 0) {
            return "Debes seleccionar al menos un documento requerido.";
        }

        return null;
    };
    const handleSubmit = async (e) => {
        e.preventDefault();

        const error = validate();
        if (error) {
            setError(error);
            return;
        }
        setError('');
        setSuccess('');

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
                horarios: Object.entries(schedules)
                    .filter(([_, schedule]) => schedule.active)
                    .map(([day, schedule]) => ({
                        dia_semana: day,
                        hora_inicio: schedule.start,
                        hora_fin: schedule.end
                    }))
            };
            await courseService.createCourse(payload);
            setSuccess("Curso creado correctamente ✅");
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
            setSchedules({
                'Lunes': { active: false, start: '', end: '' },
                'Martes': { active: false, start: '', end: '' },
                'Miércoles': { active: false, start: '', end: '' },
                'Jueves': { active: false, start: '', end: '' },
                'Viernes': { active: false, start: '', end: '' },
                'Sábado': { active: false, start: '', end: '' },
            });
            setSelectedDocIds([]);
        } catch (err) {
            console.error("Error creando curso:", err);
            setError(err?.message || "Error al crear el curso.");
        } finally {
            setLoading(false);
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
                                <h5 className="mb-3">Horario del Curso</h5>

                                <div className="row">
                                    <div className="col-md-12 mb-3">
                                        <label className="form-label">Días y Horarios</label>
                                        <div className="border rounded p-3">
                                            {Object.keys(schedules).map((day) => (
                                                <div key={day} className="mb-3">
                                                    <div className="form-check">
                                                        <input
                                                            className="form-check-input"
                                                            type="checkbox"
                                                            checked={schedules[day].active}
                                                            onChange={(e) => {
                                                                setSchedules({
                                                                    ...schedules,
                                                                    [day]: { ...schedules[day], active: e.target.checked }
                                                                });
                                                            }}
                                                            id={`check-${day}`}
                                                        />
                                                        <label className="form-check-label fw-bold" htmlFor={`check-${day}`}>
                                                            {day}
                                                        </label>
                                                    </div>
                                                    {schedules[day].active && (
                                                        <div className="row mt-2 ms-3">
                                                            <div className="col-5">
                                                                <label className="small text-muted">Inicio</label>
                                                                <input
                                                                    type="time"
                                                                    className="form-control form-control-sm"
                                                                    value={schedules[day].start}
                                                                    onChange={(e) => {
                                                                        setSchedules({
                                                                            ...schedules,
                                                                            [day]: { ...schedules[day], start: e.target.value }
                                                                        });
                                                                    }}
                                                                    required
                                                                />
                                                            </div>
                                                            <div className="col-5">
                                                                <label className="small text-muted">Fin</label>
                                                                <input
                                                                    type="time"
                                                                    className="form-control form-control-sm"
                                                                    value={schedules[day].end}
                                                                    onChange={(e) => {
                                                                        setSchedules({
                                                                            ...schedules,
                                                                            [day]: { ...schedules[day], end: e.target.value }
                                                                        });
                                                                    }}
                                                                    required
                                                                />
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>

                                <div className="d-flex justify-content-between">
                                    <button type="button" className="btn btn-secondary" onClick={() => navigate('/administrador/dashboard')}>Cancelar</button>
                                    <button type="submit" className="btn btn-primary" disabled={loading}>{loading ? "Creando..." : "Crear Curso"}</button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            </div >
        </div >
    );
};

export default CrearCurso;
