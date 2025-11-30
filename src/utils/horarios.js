// src/utils/horarios.js

function parseHora(horaStr) {
    if (!horaStr) return null;
    const [h, m] = horaStr.split(":").map(Number);
    if (Number.isNaN(h) || Number.isNaN(m)) return null;
    return h * 60 + m;
}

export function calcularEstadoDelDia(horarios = {}) {
    const ahora = new Date();
    const diaSemana = ahora.getDay(); // 0 domingo - 6 sábado

    const mapDias = [
        "domingo",
        "lunes",
        "martes",
        "miércoles",
        "jueves",
        "viernes",
        "sábado",
    ];

    const diaClave = mapDias[diaSemana];
    const info = horarios[diaClave];

    // Si no hay config para el día
    if (!info) {
        return {
            abierto: false,
            mensaje: "Sin horarios configurados para hoy",
        };
    }

    // Si está marcado como cerrado
    if (info.cerrado) {
        return {
            abierto: false,
            mensaje: "Hoy no se trabaja",
        };
    }

    // Asegurar que las franjas sean un array
    const franjas =
        Array.isArray(info.franjas) && info.franjas.length > 0
            ? info.franjas
            : [];

    if (franjas.length === 0) {
        return {
            abierto: false,
            mensaje: "Sin franjas horarias cargadas para hoy",
        };
    }

    const minutosAhora = ahora.getHours() * 60 + ahora.getMinutes();

    // Buscar si está dentro de alguna franja
    let dentroDeFranja = null;
    let proximaFranja = null;

    for (const fr of franjas) {
        const inicio = parseHora(fr.inicio);
        const fin = parseHora(fr.fin);
        if (inicio == null || fin == null) continue;

        if (minutosAhora >= inicio && minutosAhora <= fin) {
            dentroDeFranja = fr;
            break;
        }

        if (minutosAhora < inicio) {
            if (!proximaFranja || inicio < parseHora(proximaFranja.inicio)) {
                proximaFranja = fr;
            }
        }
    }

    if (dentroDeFranja) {
        return {
            abierto: true,
            mensaje: `Abierto ahora — cierra a las ${dentroDeFranja.fin}`,
        };
    }

    if (proximaFranja) {
        return {
            abierto: false,
            mensaje: `Cerrado ahora — abrimos a las ${proximaFranja.inicio}`,
        };
    }

    return {
        abierto: false,
        mensaje: "Cerrado por hoy",
    };
}
