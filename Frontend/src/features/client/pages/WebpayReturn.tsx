import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Navbar from '../../../components/layout/Navbar';
import courseService from '../../../services/courseService';

const WebpayReturn = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const [status, setStatus] = useState('processing'); // processing, success, failure
    const [message, setMessage] = useState('Procesando su pago...');
    const [details, setDetails] = useState<any>(null);

    useEffect(() => {
        const queryParams = new URLSearchParams(location.search);
        const token_ws = queryParams.get('token_ws');
        const tbk_token = queryParams.get('TBK_TOKEN');
        const tbk_orden_compra = queryParams.get('TBK_ORDEN_COMPRA');
        const tbk_id_sesion = queryParams.get('TBK_ID_SESION');

        // Check if aborted by user (TBK_TOKEN exists but token_ws is missing in some cases, or user clicked button to abort)
        if (tbk_token && !token_ws) {
            setStatus('failure');
            setMessage('El pago fue anulado por el usuario.');
            return;
        }

        // Also if transaction aborted directly in webpay
        if (tbk_orden_compra && tbk_id_sesion && !token_ws) {
            setStatus('failure');
            setMessage('La transacción fue anulada.');
            return;
        }

        if (token_ws) {
            confirmTransaction(token_ws);
        } else {
            setStatus('failure');
            setMessage('No se recibió token de Webpay.');
        }
    }, [location]);

    const confirmTransaction = async (token: string) => {
        try {
            // Call backend to confirm
            const data = await courseService.confirmWebpayTransaction(token);

            if (data.status === 'AUTHORIZED') {
                setStatus('success');
                setMessage('¡Pago realizado con éxito!');
                setDetails(data);
            } else {
                setStatus('failure');
                setMessage(data.message || 'El pago fue rechazado.');
            }
        } catch (error) {
            console.error(error);
            setStatus('failure');
            setMessage('Ocurrió un error al confirmar el pago.');
        }
    };

    return (
        <div className="cliente-dashboard">
            <Navbar />
            <div className="container mt-5">
                <div className="card shadow-sm border-0 rounded-3 p-5 text-center">
                    {status === 'processing' && (
                        <div>
                            <div className="spinner-border text-primary mb-3" role="status"></div>
                            <h3>Procesando pago...</h3>
                            <p className="text-muted">Por favor espere, no cierre esta ventana.</p>
                        </div>
                    )}

                    {status === 'success' && (
                        <div className="animate-fade-in">
                            <div className="text-success mb-3">
                                <i className="bi bi-check-circle-fill" style={{ fontSize: '4rem' }}></i>
                            </div>
                            <h2 className="text-success fw-bold">¡Pago Exitoso!</h2>
                            <p className="lead mb-4">{message}</p>

                            <div className="alert alert-success d-inline-block px-5">
                                <p className="mb-1"><strong>Orden:</strong> {details?.details?.buy_order}</p>
                                <p className="mb-0"><strong>Monto:</strong> ${(details?.details?.amount)?.toLocaleString('es-CL')}</p>
                            </div>

                            <div className="mt-4">
                                <button className="btn btn-primary btn-lg rounded-pill px-5" onClick={() => navigate('/cliente/cursos/mis-inscripciones')}>
                                    Volver a mis Cursos
                                </button>
                            </div>
                        </div>
                    )}

                    {status === 'failure' && (
                        <div className="animate-fade-in">
                            <div className="text-danger mb-3">
                                <i className="bi bi-x-circle-fill" style={{ fontSize: '4rem' }}></i>
                            </div>
                            <h2 className="text-danger fw-bold">Pago Fallido</h2>
                            <p className="lead text-danger mb-4">{message}</p>

                            <div className="mt-4">
                                <button className="btn btn-secondary btn-lg rounded-pill px-5" onClick={() => navigate('/cliente/cursos/mis-inscripciones')}>
                                    Volver a Intentar
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default WebpayReturn;
