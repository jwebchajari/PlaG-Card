// =====================
// NORMALIZACIÓN DE HORARIOS
// =====================
function parseHora(hora) {
	if (!hora) return null;
	const [h, m] = hora.split(":").map(Number);
	return h * 60 + m;
}

export function getEstadoLocal(horarios) {
	const dias = [
		"domingo",
		"lunes",
		"martes",
		"miércoles",
		"jueves",
		"viernes",
		"sábado",
	];

	const now = new Date();
	const diaActual = dias[now.getDay()];
	const horaActual = now.getHours();
	const minutoActual = now.getMinutes();
	const minutosAhora = horaActual * 60 + minutoActual;

	const infoDia = horarios[diaActual] || {};
	const cerrado = Boolean(infoDia.cerrado);

	let franjas = [];
	if (Array.isArray(infoDia.franjas)) franjas = infoDia.franjas;
	else if (infoDia.franjas) franjas = Object.values(infoDia.franjas);

	const franjasNorm = franjas.map((f) => {
		const inicio = f.inicio || f.desde;
		const fin = f.fin || f.hasta;

		return {
			inicio,
			fin,
			inicioMin: parseHora(inicio),
			finMin: parseHora(fin),
		};
	});

	let abierto = false;
	let cierraA = null;
	let proximaApertura = null;

	// Revisar las franjas del día
	for (const fr of franjasNorm) {
		if (fr.inicioMin <= minutosAhora && minutosAhora < fr.finMin) {
			abierto = true;
			cierraA = fr.fin;
			break;
		}

		if (fr.inicioMin > minutosAhora) {
			if (!proximaApertura || fr.inicioMin < proximaApertura.inicioMin) {
				proximaApertura = fr;
			}
		}
	}

	// Si no abre más hoy → buscar mañana
	if (!abierto && !proximaApertura) {
		const idxHoy = now.getDay();
		const idxManiana = (idxHoy + 1) % 7;
		const diaManiana = dias[idxManiana];

		const infoManiana = horarios[diaManiana] || {};
		let frManiana = [];

		if (Array.isArray(infoManiana.franjas)) frManiana = infoManiana.franjas;
		else if (infoManiana.franjas)
			frManiana = Object.values(infoManiana.franjas);

		if (frManiana[0]) {
			const inicio = frManiana[0].inicio || frManiana[0].desde;
			proximaApertura = {
				inicio,
				inicioMin: parseHora(inicio) + 1440, // sumar 24h
			};
		}
	}

	let mensaje = "";

	if (abierto) {
		mensaje = `Cerramos a ${cierraA}`;
		return { abierto: true, mensaje, cierraA };
	}

	if (proximaApertura) {
		const minutosObjetivo = proximaApertura.inicioMin;
		const diff = minutosObjetivo - minutosAhora;

		const h = Math.floor(diff / 60);
		const m = diff % 60;

		mensaje = `Abrimos en ${h}h ${m}m`;
	} else {
		mensaje = "Cerrado por hoy";
	}

	return { abierto: false, mensaje, cierraA: null };
}
