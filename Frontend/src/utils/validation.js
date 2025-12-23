export const validateRut = (rut) => {
    if (!rut) return false;

    //Limpiamos el RUT de puntos y guiones
    let valor = rut.replace(/\./g, '').replace(/-/g, '');

    //Aislamos Cuerpo y Dígito Verificador
    if (valor.length < 2) return false;

    let cuerpo = valor.slice(0, -1);
    let dv = valor.slice(-1).toUpperCase();

    //Validamos que el cuerpo sean solo números
    if (!/^\d+$/.test(cuerpo)) return false;

    //Calculamos Dígito Verificador
    let suma = 0;
    let multiplo = 2;

    for (let i = 1; i <= cuerpo.length; i++) {
        //Obtenemos el dígito del cuerpo desde el final (cuerpo es string)
        let index = multiplo * parseInt(cuerpo.charAt(cuerpo.length - i));
        suma = suma + index;
        if (multiplo < 7) {
            multiplo = multiplo + 1;
        } else {
            multiplo = 2;
        }
    }

    let dvEsperado = 11 - (suma % 11);

    if (dvEsperado === 11) dvEsperado = '0';
    else if (dvEsperado === 10) dvEsperado = 'K';
    else dvEsperado = dvEsperado.toString();

    return dv === dvEsperado;
};

export const formatRut = (rut) => {
    if (!rut) return '';
    let valor = rut.replace(/\./g, '').replace(/-/g, '');

    if (valor.length > 1) {
        let cuerpo = valor.slice(0, -1);
        let dv = valor.slice(-1).toUpperCase();

        rut = cuerpo + '-' + dv;

        if (cuerpo.length > 3) {
            rut = parseFloat(cuerpo).toLocaleString('es-CL') + '-' + dv;
        }
    }

    return rut;
};

//Validamos edad (mayor de 18)
// Validar edad (mayor de 18)
export const validateAge = (birthDateString) => {
    if (!birthDateString) return false;

    const today = new Date();
    // birthDateString viene como "YYYY-MM-DD"
    // Lo parseamos manualmente para evitar problemas de zona horaria con new Date("YYYY-MM-DD")
    const [year, month, day] = birthDateString.split('-').map(Number);

    // Mes en Date es 0-indexado (0 = Enero, 11 = Diciembre)
    const birthDate = new Date(year, month - 1, day);

    let age = today.getFullYear() - birthDate.getFullYear();
    const m = today.getMonth() - birthDate.getMonth();

    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
        age--;
    }

    return age >= 18;
};
