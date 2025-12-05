import React from 'react';
import BotonVolver from '../../../components/common/ButtonBack';

const Reportes = () => {
    return (
        <div className="container mt-5">
            <BotonVolver />
            <div className="card shadow-sm mt-4">
                <div className="card-body text-center p-5">
                    <i className="bi bi-graph-up text-info display-1 mb-3"></i>
                    <h2 className="card-title">Reportes</h2>
                    <p className="card-text lead">
                        Este módulo está en construcción. Próximamente podrás visualizar reportes y estadísticas aquí.
                    </p>
                </div>
            </div>
        </div>
    );
};

export default Reportes;
