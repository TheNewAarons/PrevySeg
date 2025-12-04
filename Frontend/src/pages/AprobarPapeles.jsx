import React from 'react';
import BotonVolver from '../components/ButtonBack';

const AprobarPapeles = () => {
    return (
        <div className="container mt-5">
            <BotonVolver />
            <div className="card shadow-sm mt-4">
                <div className="card-body text-center p-5">
                    <i className="bi bi-file-earmark-check-fill text-primary display-1 mb-3"></i>
                    <h2 className="card-title">Aprobar Papeles</h2>
                    <p className="card-text lead">
                        Este módulo está en construcción. Próximamente podrás revisar y aprobar documentación aquí.
                    </p>
                </div>
            </div>
        </div>
    );
};

export default AprobarPapeles;
