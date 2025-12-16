import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';
import '../styles/EmpresaDashboard.css';
import { useAuth } from '../../../services/authContext';
import documentoService from '../../../services/documentoService';
import Navbar from '../../../components/layout/Navbar';

const RevisionDocumentos = () => {
    const navigate = useNavigate();
    const { user } = useAuth();
    const [documentos, setDocumentos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        if (!user) {
            navigate('/login');
            return;
        }
        loadDocumentos();
    }, [user, navigate]);

    const loadDocumentos = async () => {
        try {
            setLoading(true);
            // El backend ya filtra por rol Empresa, retornando docs de sus trabajadores
            const data = await documentoService.getDocumentos();
            setDocumentos(data);
        } catch (error) {
            console.error("Error cargando documentos:", error);
            // alert("Error al cargar documentos."); 
        } finally {
            setLoading(false);
        }
    };

    const handleVerDocumento = (url) => {
        window.open(url, '_blank');
    };

    const filteredDocs = documentos.filter(doc => {
        const searchLower = searchTerm.toLowerCase();
        // Filtrar por nombre del documento, usuario (si el serializer lo trae) o RUT
        // Nota: DocumentoSubidoSerializer suele traer el ID de usuario, y a veces nested data.
        // Si no trae nested data del usuario, solo podremos filtrar por tipo de documento.
        // Asumiendo que quisieramos filtrar por tipo de documento:
        return (doc.tipo_documento_nombre || '').toLowerCase().includes(searchLower) ||
            (doc.usuario_nombre || '').toLowerCase().includes(searchLower)
    });

    return (
        <div className="empresa-dashboard">
            <Navbar />

            <div className="main-container">
                <div className="d-flex justify-content-between align-items-center mb-4">
                    <div>
                        <h1 className="page-title">Revisión de Documentos</h1>
                        <p className="page-subtitle">Visualiza los documentos subidos por tus trabajadores.</p>
                    </div>
                    <button className="btn btn-secondary" onClick={() => navigate('/empresa/dashboard')}>
                        <i className="bi bi-arrow-left me-2"></i>Volver
                    </button>
                </div>

                <div className="card shadow-sm border-0">
                    <div className="card-header bg-white py-3">
                        <div className="row align-items-center">
                            <div className="col-md-6">
                                <div className="input-group">
                                    <span className="input-group-text bg-light border-end-0">
                                        <i className="bi bi-search text-muted"></i>
                                    </span>
                                    <input
                                        type="text"
                                        className="form-control border-start-0 ps-0"
                                        placeholder="Buscar por tipo de documento..."
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                    />
                                </div>
                            </div>
                            <div className="col-md-6 text-end text-muted small">
                                Total: <strong>{filteredDocs.length}</strong> documentos
                            </div>
                        </div>
                    </div>
                    <div className="card-body p-0">
                        {loading ? (
                            <div className="text-center py-5">
                                <div className="spinner-border text-primary" role="status">
                                    <span className="visually-hidden">Cargando...</span>
                                </div>
                            </div>
                        ) : filteredDocs.length > 0 ? (
                            <div className="table-responsive">
                                <table className="table table-hover align-middle mb-0">
                                    <thead className="table-light">
                                        <tr>
                                            <th className="ps-4">Documento</th>
                                            <th>Trabajador</th>
                                            <th>Curso</th>
                                            <th>Estado</th>
                                            <th>Fecha Subida</th>
                                            <th>Acción</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {filteredDocs.map(doc => (
                                            <tr key={doc.id_doc_subido}>
                                                <td className="ps-4">
                                                    <div className="d-flex align-items-center">
                                                        <i className="bi bi-file-earmark-pdf fs-4 text-danger me-3"></i>
                                                        <div className="fw-bold">{doc.tipo_documento_nombre || 'Documento'}</div>
                                                    </div>
                                                </td>
                                                <td>{doc.usuario_nombre}</td>
                                                <td>{doc.curso_nombre || '-'}</td>
                                                <td>
                                                    {doc.estado_revision === 'APROBADO' && <span className="badge bg-success">Aprobado</span>}
                                                    {doc.estado_revision === 'RECHAZADO' && <span className="badge bg-danger">Rechazado</span>}
                                                    {doc.estado_revision === 'EN_REVISION' && <span className="badge bg-warning text-dark">En Revisión</span>}
                                                </td>
                                                <td>{new Date(doc.fecha_subida).toLocaleDateString()}</td>
                                                <td>
                                                    <button
                                                        className="btn btn-sm btn-primary"
                                                        onClick={() => handleVerDocumento(doc.url_archivo)}
                                                        title="Ver Documento"
                                                    >
                                                        <i className="bi bi-eye me-1"></i>Ver
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        ) : (
                            <div className="text-center py-5">
                                <div className="mb-3 text-muted">
                                    <i className="bi bi-file-earmark-x fs-1"></i>
                                </div>
                                <h5>No se encontraron documentos</h5>
                                <p className="text-muted">Tus trabajadores aún no han subido documentos o no coinciden con la búsqueda.</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default RevisionDocumentos;
