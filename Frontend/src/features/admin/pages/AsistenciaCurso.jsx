import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Navbar from '../../../components/layout/Navbar';
import courseService from '../../../services/courseService';
import '../../admin/styles/AdminDashboard.css';

const AsistenciaCurso = () => {
    const { id } = useParams(); // Curso ID
    const navigate = useNavigate();

    const [curso, setCurso] = useState(null);
    const [alumnos, setAlumnos] = useState([]);
    const [asistencias, setAsistencias] = useState({}); // Map: userId -> {id_asistencia, hora_entrada, hora_salida}
    const [loading, setLoading] = useState(true);
    const [fecha, setFecha] = useState(new Date().toISOString().split('T')[0]); // Default Today
    const [saving, setSaving] = useState(false);
    const [dirty, setDirty] = useState({}); // userId -> bool (modified)

    useEffect(() => {
        loadData();
    }, [id, fecha]);

    const loadData = async () => {
        setLoading(true);
        try {
            const P1 = courseService.getCourseById(id);
            const P2 = courseService.getNominaAlumnos(id);
            const P3 = courseService.getAsistencia(id, fecha);

            const [cursoData, alumnosData, asistenciaList] = await Promise.all([P1, P2, P3]);

            setCurso(cursoData);
            setAlumnos(alumnosData);

            // Map asistencia list to object for easier access
            const map = {};
            asistenciaList.forEach(a => {
                map[a.usuario] = a; // usuario ID is the key
            });
            setAsistencias(map);
            setDirty({});

        } catch (err) {
            console.error("Error cargando datos", err);
            alert("Error cargando datos: " + err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleTimeChange = (userId, field, value) => {
        // Update local state map
        const currentRecord = asistencias[userId] || {};

        const newRecord = {
            ...currentRecord,
            [field]: value
        };

        setAsistencias({
            ...asistencias,
            [userId]: newRecord
        });

        setDirty({
            ...dirty,
            [userId]: true
        });
    };

    const handleSaveRow = async (userId) => {
        const record = asistencias[userId];
        if (!record || !record.hora_entrada) {
            alert("Debes ingresar al menos la hora de entrada.");
            return;
        }

        try {
            setSaving(true);
            const payload = {
                id_asistencia: record.id_asistencia,
                usuario: userId,
                curso: id,
                fecha: fecha,
                hora_entrada: record.hora_entrada,
                hora_salida: record.hora_salida || null,
                metodo: 'Manual'
            };

            const saved = await courseService.saveAsistencia(payload);

            // Update local state with real ID if it was new
            setAsistencias({
                ...asistencias,
                [userId]: saved
            });

            // Mark clean
            const newDirty = { ...dirty };
            delete newDirty[userId];
            setDirty(newDirty);

        } catch (err) {
            console.error("Error saving", err);
            alert("Error guardando: " + err.message);
        } finally {
            setSaving(false);
        }
    };

    const handleExportSence = async () => {
        try {
            const blob = await courseService.downloadAsistenciaReport(id);
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `asistencia_sence_${id}.csv`;
            document.body.appendChild(a);
            a.click();
            a.remove();
        } catch (err) {
            alert("Error exportando: " + err.message);
        }
    };

    if (loading) {
        return (
            <div className="administrador-dashboard">
                <Navbar />
                <div className="main-container text-center py-5">
                    <div className="spinner-border text-primary" role="status"></div>
                </div>
            </div>
        );
    }

    return (
        <div className="administrador-dashboard">
            <Navbar />

            <div className="main-container">
                <div className="d-flex justify-content-between align-items-center mb-4">
                    <div>
                        <h1 className="page-title">Control de Asistencia</h1>
                        <h6 className="text-muted">{curso?.nombre}</h6>
                    </div>
                    <div>
                        <button className="btn btn-outline-secondary me-2" onClick={() => navigate(`/administrador/cursos/${id}`)}>
                            <i className="bi bi-arrow-left me-2"></i>Volver
                        </button>
                        <button className="btn btn-primary" onClick={handleExportSence}>
                            <i className="bi bi-download me-2"></i>Exportar SENCE (CSV)
                        </button>
                    </div>
                </div>

                <div className="card shadow-sm border-0">
                    <div className="card-header bg-white py-3">
                        <div className="row align-items-center">
                            <div className="col-md-4">
                                <label className="form-label fw-bold">Fecha de Clase:</label>
                                <input
                                    type="date"
                                    className="form-control"
                                    value={fecha}
                                    onChange={(e) => setFecha(e.target.value)}
                                />
                            </div>
                            <div className="col-md-8 text-end">
                                <span className="badge bg-info text-dark">
                                    <i className="bi bi-info-circle me-1"></i>
                                    Los cambios se deben guardar por fila individualmente.
                                </span>
                            </div>
                        </div>
                    </div>
                    <div className="card-body p-0">
                        <div className="table-responsive">
                            <table className="table table-hover align-middle mb-0">
                                <thead className="table-light">
                                    <tr>
                                        <th>Alumno</th>
                                        <th>RUT</th>
                                        <th>Hora Entrada</th>
                                        <th>Hora Salida</th>
                                        <th className="text-center">Acciones</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {alumnos.length === 0 ? (
                                        <tr>
                                            <td colSpan="5" className="text-center py-4 text-muted">No hay alumnos inscritos en este curso.</td>
                                        </tr>
                                    ) : (
                                        alumnos.map(alumno => {
                                            const rec = asistencias[alumno.usuario_id] || {};
                                            const isDirty = dirty[alumno.usuario_id];

                                            return (
                                                <tr key={alumno.usuario_id} className={isDirty ? "table-warning" : ""}>
                                                    <td className="fw-bold">{alumno.nombre}</td>
                                                    <td className="text-muted small">{alumno.rut}</td>
                                                    <td>
                                                        <input
                                                            type="time"
                                                            className="form-control"
                                                            value={rec.hora_entrada || ''}
                                                            onChange={(e) => handleTimeChange(alumno.usuario_id, 'hora_entrada', e.target.value)}
                                                        />
                                                    </td>
                                                    <td>
                                                        <input
                                                            type="time"
                                                            className="form-control"
                                                            value={rec.hora_salida || ''}
                                                            onChange={(e) => handleTimeChange(alumno.usuario_id, 'hora_salida', e.target.value)}
                                                        />
                                                    </td>
                                                    <td className="text-center">
                                                        {isDirty && (
                                                            <button
                                                                className="btn btn-sm btn-success"
                                                                onClick={() => handleSaveRow(alumno.usuario_id)}
                                                                disabled={saving}
                                                            >
                                                                <i className="bi bi-check-lg"></i> Guardar
                                                            </button>
                                                        )}
                                                        {!isDirty && rec.id_asistencia && (
                                                            <span className="text-success"><i className="bi bi-check-circle-fill"></i> Registrado</span>
                                                        )}
                                                    </td>
                                                </tr>
                                            );
                                        })
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AsistenciaCurso;
