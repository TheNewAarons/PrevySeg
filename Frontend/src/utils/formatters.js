export const formatPriceCLP = (value) => {
    if (value === null || value === undefined) return '—';
    try {
        return new Intl.NumberFormat('es-CL', {
            style: 'currency',
            currency: 'CLP',
            minimumFractionDigits: 0
        }).format(Number(value));
    } catch (e) {
        return String(value);
    }
};
