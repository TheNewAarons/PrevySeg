import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';
import '../../admin/styles/AdminDashboard.css';
import '../styles/HorariosCliente.css'; // New styles
import courseService from '../../../services/courseService';
import { useAuth } from '../../../services/authContext';
import Navbar from '../../../components/layout/Navbar';

const HorariosCliente = () => {
    const navigate = useNavigate();
    const { user } = useAuth();
    const [courses, setCourses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    // Calendar Configuration
    const START_HOUR = 8; // 8 AM
    const END_HOUR = 23;  // 11 PM (to cover up to 22:30)
    const HOUR_HEIGHT = 60; // px per hour
    const TOTAL_HEIGHT = (END_HOUR - START_HOUR + 1) * HOUR_HEIGHT;

    // Map Spanish days to standard order
    const dayMap = {
        'Lunes': 0, 'Martes': 1, 'Miércoles': 2, 'Jueves': 3,
        'Viernes': 4, 'Sábado': 5, 'Domingo': 6
    };
    const daysOfWeek = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];

    // Distinct colors for courses
    const courseColors = [
        '#3b82f6', '#10b981', '#f59e0b', '#ef4444',
        '#8b5cf6', '#ec4899', '#6366f1', '#14b8a6'
    ];

    useEffect(() => {
        if (!user) {
            navigate('/login');
            return;
        }
        fetchCourses();
    }, [user, navigate]);

    const fetchCourses = async () => {
        try {
            setLoading(true);
            const data = await courseService.getMisInscripciones();

            // Map inscription data
            const enrolledCourses = (data.inscripciones || [])
                .filter(ins => ins.curso_estado === 'en_curso') // Filter only active courses
                .map((ins, index) => ({
                    id: ins.curso, // curso ID
                    nombre: ins.curso_nombre,
                    profesor: ins.curso_profesor,
                    horarios: ins.curso_horarios,
                    modalidad: ins.curso_modalidad,
                    color: courseColors[index % courseColors.length] // Assign color
                }));

            setCourses(enrolledCourses);
            setError('');
        } catch (err) {
            console.error('Error al cargar cursos:', err);
            setError('Error al cargar el calendario. Por favor intenta nuevamente.');
        } finally {
            setLoading(false);
        }
    };

    // Helper to calculate position
    const getEventStyle = (startTime, endTime, dayName) => {
        const [startH, startM] = startTime.split(':').map(Number);
        const [endH, endM] = endTime.split(':').map(Number);

        const startTotalMinutes = (startH * 60) + startM;
        const endTotalMinutes = (endH * 60) + endM;
        const durationMinutes = endTotalMinutes - startTotalMinutes;

        // Calculate offset from START_HOUR (e.g., 7 AM)
        const offsetMinutes = startTotalMinutes - (START_HOUR * 60);

        return {
            top: `${(offsetMinutes / 60) * HOUR_HEIGHT}px`,
            height: `${(durationMinutes / 60) * HOUR_HEIGHT}px`,
        };
    };

    // Helper to normalize strings for comparison (remove accents)
    const normalizeStr = (str) => {
        return str ? str.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase() : "";
    };

    // Flatten all schedule items into a single list of renderable events
    const getAllEvents = () => {
        const events = [];
        courses.forEach(course => {
            if (course.horarios && course.horarios.length > 0) {
                course.horarios.forEach(h => {
                    events.push({
                        ...h,
                        courseName: course.nombre,
                        profesor: course.profesor,
                        color: course.color,
                        modalidad: course.modalidad
                    });
                });
            }
        });
        return events;
    };

    const allEvents = getAllEvents();

    if (loading) {
        return (
            <div className="d-flex justify-content-center align-items-center vh-100">
                <div className="spinner-border text-primary" role="status">
                    <span className="visually-hidden">Cargando...</span>
                </div>
            </div>
        );
    }

    return (
        <div className="administrador-dashboard">
            <Navbar />

            <div className="container mt-4 mb-5">
                <div className="d-flex justify-content-between align-items-center mb-4">
                    <div>
                        <h1 className="fw-bold text-dark mb-2">Mi Calendario Académico</h1>
                        <p className="text-muted mb-0">Vista semanal de tus clases y horarios</p>
                    </div>
                    <button className="btn btn-outline-secondary" onClick={() => navigate('/cliente/dashboard')}>
                        <i className="bi bi-arrow-left me-2"></i>Volver al Panel
                    </button>
                </div>

                {error && (
                    <div className="alert alert-danger" role="alert">
                        <i className="bi bi-exclamation-triangle me-2"></i> {error}
                    </div>
                )}

                <div className="calendar-container">
                    {/* Header: Days */}
                    <div className="calendar-header">
                        <div className="calendar-header-cell time-column">GMT-3</div>
                        {daysOfWeek.map(day => (
                            <div key={day} className="calendar-header-cell">
                                {day}
                            </div>
                        ))}
                    </div>

                    {/* Body: Time Grid */}
                    <div className="calendar-body">
                        {/* Time Column */}
                        <div className="time-labels">
                            {Array.from({ length: END_HOUR - START_HOUR + 1 }).map((_, i) => (
                                <div key={i} className="time-label">
                                    {`${START_HOUR + i}:00`}
                                </div>
                            ))}
                        </div>

                        {/* Day Columns */}
                        {daysOfWeek.map(day => (
                            <div
                                key={day}
                                className="day-column"
                                style={{ height: `${TOTAL_HEIGHT}px`, minHeight: 'auto' }}
                            >
                                {allEvents
                                    .filter(event => normalizeStr(event.dia_semana) === normalizeStr(day))
                                    .map((event, idx) => (
                                        <div
                                            key={`${event.courseName}-${event.dia_semana}-${event.hora_inicio}-${idx}`}
                                            className="calendar-event"
                                            style={{
                                                ...getEventStyle(event.hora_inicio, event.hora_fin, day),
                                                backgroundColor: event.color
                                            }}
                                            title={`${event.courseName}\n${event.hora_inicio.slice(0, 5)} - ${event.hora_fin.slice(0, 5)}\nProf: ${event.profesor}`}
                                        >
                                            <span className="event-title">{event.courseName}</span>
                                            <div className="event-time">
                                                {event.hora_inicio.slice(0, 5)} - {event.hora_fin.slice(0, 5)}
                                            </div>
                                            <div className="event-time" style={{ fontSize: '0.7rem', opacity: 0.8 }}>
                                                {event.modalidad}
                                            </div>
                                        </div>
                                    ))
                                }
                            </div>
                        ))}
                    </div>
                </div>


            </div>
        </div>
    );
};

export default HorariosCliente;
