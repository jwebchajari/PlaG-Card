export const DIAS = ["lunes", "martes", "miércoles", "jueves", "viernes", "sábado", "domingo"];

// Index by JS getDay(): 0 = domingo
const DIAS_POR_GETDAY = ["domingo", "lunes", "martes", "miércoles", "jueves", "viernes", "sábado"];

const TZ = "America/Argentina/Buenos_Aires";

function sinTildes(s) {
	return String(s).toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "");
}

function parseHora(hora) {
	if (!hora || !/^\d{1,2}:\d{2}$/.test(hora)) return null;
	const [h, m] = hora.split(":").map(Number);
	return h * 60 + m;
}

/** Accepts the raw Firebase node and always returns the 7 days with franjas {desde, hasta}. */
export function normalizeHorarios(raw = {}) {
	const porClave = {};
	Object.entries(raw || {}).forEach(([k, v]) => {
		porClave[sinTildes(k)] = v;
	});

	const out = {};
	DIAS.forEach((dia) => {
		const info = porClave[sinTildes(dia)] || {};
		const lista = Array.isArray(info.franjas) ? info.franjas : Object.values(info.franjas || {});
		out[dia] = {
			cerrado: Boolean(info.cerrado),
			franjas: lista
				.map((f) => ({ desde: f?.desde || f?.inicio || "", hasta: f?.hasta || f?.fin || "" }))
				.filter((f) => parseHora(f.desde) != null && parseHora(f.hasta) != null),
		};
	});
	return out;
}

/** Current day index (0 = domingo) and minutes since midnight in Argentina. */
export function ahoraArgentina(date = new Date()) {
	const parts = new Intl.DateTimeFormat("en-US", {
		timeZone: TZ,
		weekday: "short",
		hour: "2-digit",
		minute: "2-digit",
		hourCycle: "h23",
	}).formatToParts(date);
	const get = (t) => parts.find((p) => p.type === t)?.value;
	const day = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].indexOf(get("weekday"));
	return { day, minutes: Number(get("hour")) * 60 + Number(get("minute")) };
}

export function fechaArgentina(date = new Date()) {
	return new Intl.DateTimeFormat("es-AR", {
		timeZone: TZ,
		weekday: "long",
		day: "numeric",
		month: "long",
	}).format(date);
}

/** YYYY-MM-DD in Argentina time, used as a stable key in the database. */
export function claveFecha(date = new Date()) {
	return new Intl.DateTimeFormat("en-CA", { timeZone: TZ, year: "numeric", month: "2-digit", day: "2-digit" }).format(date);
}

export function diaDeHoy(date = new Date()) {
	return DIAS_POR_GETDAY[ahoraArgentina(date).day];
}

/** Ranges as absolute minutes from the start of `dayIndex`; a range ending at or before its start crosses midnight. */
function rangos(horarios, dayIndex) {
	const info = horarios?.[DIAS_POR_GETDAY[(dayIndex + 7) % 7]];
	if (!info || info.cerrado) return [];
	return info.franjas.map((f) => {
		const a = parseHora(f.desde);
		let b = parseHora(f.hasta);
		if (b <= a) b += 1440;
		return { a, b, desde: f.desde, hasta: f.hasta };
	});
}

/**
 * Open/closed state in Argentina time.
 * Returns { abierto, titulo, detalle }.
 */
export function getEstadoLocal(horarios, date = new Date()) {
	const { day, minutes } = ahoraArgentina(date);

	// A range from yesterday that crosses midnight
	for (const r of rangos(horarios, day - 1)) {
		if (r.b > 1440 && minutes < r.b - 1440) {
			return { abierto: true, titulo: "Abierto ahora", detalle: `Cierra a las ${r.hasta}` };
		}
	}
	for (const r of rangos(horarios, day)) {
		if (r.a <= minutes && minutes < r.b) {
			return { abierto: true, titulo: "Abierto ahora", detalle: `Cierra a las ${r.hasta}` };
		}
	}

	for (let i = 0; i < 7; i++) {
		const proximos = rangos(horarios, day + i)
			.filter((r) => i > 0 || r.a > minutes)
			.sort((x, y) => x.a - y.a);
		if (proximos.length) {
			const r = proximos[0];
			const cuando =
				i === 0 ? "hoy" : i === 1 ? "mañana" : `el ${DIAS_POR_GETDAY[(day + i) % 7]}`;
			return { abierto: false, titulo: "Cerrado", detalle: `Abre ${cuando} a las ${r.desde}` };
		}
	}

	return { abierto: false, titulo: "Cerrado", detalle: "Sin horarios cargados" };
}
