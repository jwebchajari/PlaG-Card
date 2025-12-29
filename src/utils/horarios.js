// =====================
// NORMALIZACIÓN DE HORARIOS
// =====================

function normalizarDia(dia) {
	return dia
		.toLowerCase()
		.normalize("NFD")
		.replace(/[\u0300-\u036f]/g, "");
}

function parseHora(hora) {
	if (!hora) return null;
	const [h, m] = hora.split(":").map(Number);
	return h * 60 + m;
}

export function getEstadoLocal(horarios) {
	const diasOrden = [
		"domingo",
		"lunes",
		"martes",
		"miercoles",
		"jueves",
		"viernes",
		"sabado",
	];

	const horariosNorm = {};
	Object.entries(horarios || {}).forEach(([dia, data]) => {
		horariosNorm[normalizarDia(dia)] = data;
	});

	const now = new Date();
	const minutosAhora = now.getHours() * 60 + now.getMinutes();
	const hoy = diasOrden[now.getDay()];

	const infoHoy = horariosNorm[hoy];
	let abierto = false;
	let cierraA = null;

	if (infoHoy && !infoHoy.cerrado) {
		const franjas = Array.isArray(infoHoy.franjas)
			? infoHoy.franjas
			: Object.values(infoHoy.franjas || {});

		for (const f of franjas) {
			const inicio = f.inicio || f.desde;
			const fin = f.fin || f.hasta;

			let inicioMin = parseHora(inicio);
			let finMin = parseHora(fin);

			if (inicioMin == null || finMin == null) continue;

			// ⏰ cruza medianoche
			if (finMin === 0) finMin = 1440;

			if (inicioMin <= minutosAhora && minutosAhora < finMin) {
				abierto = true;
				cierraA = fin;
				break;
			}
		}
	}

	if (abierto) {
		return {
			abierto: true,
			mensaje: `Cerramos a ${cierraA}`,
			cierraA,
		};
	}

	// Buscar próxima apertura
	for (let i = 0; i < 7; i++) {
		const idx = (now.getDay() + i) % 7;
		const diaKey = diasOrden[idx];
		const infoDia = horariosNorm[diaKey];

		if (!infoDia || infoDia.cerrado) continue;

		const franjas = Array.isArray(infoDia.franjas)
			? infoDia.franjas
			: Object.values(infoDia.franjas || {});

		for (const f of franjas) {
			const inicio = f.inicio || f.desde;
			const inicioMin = parseHora(inicio);
			if (inicioMin == null) continue;

			const minutosObjetivo = i === 0 ? inicioMin : i * 1440 + inicioMin;

			const diff = minutosObjetivo - minutosAhora;

			if (diff > 0) {
				const h = Math.floor(diff / 60);
				const m = diff % 60;

				return {
					abierto: false,
					mensaje:
						h > 0 ? `Abrimos en ${h}h ${m}m` : `Abrimos en ${m}m`,
					cierraA: null,
				};
			}
		}
	}

	return {
		abierto: false,
		mensaje: "Cerrado por hoy",
		cierraA: null,
	};
}
