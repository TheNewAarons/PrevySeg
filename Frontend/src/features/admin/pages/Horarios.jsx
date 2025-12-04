import React from 'react';
import BotonVolver from '../../../components/common/ButtonBack';

const Horarios = () => {
    return (
        <div className="container mt-5">
            <BotonVolver />
            <div className="card shadow-sm mt-4">
                <div className="card-body text-center p-5">
                    <i className="bi bi-calendar-week-fill text-success display-1 mb-3"></i>
                    <h2 className="card-title">Horarios</h2>
                    <p className="card-text lead">
                        Este módulo está en construcción. Próximamente podrás gestionar los horarios de los cursos aquí.
                    </p>
                </div>
            </div>
        </div>
    );
};

export default Horarios;
