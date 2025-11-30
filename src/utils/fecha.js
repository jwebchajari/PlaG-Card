export function formatearFecha() {
	const dias = [
		"Domingo",
		"Lunes",
		"Martes",
		"Miércoles",
		"Jueves",
		"Viernes",
		"Sábado",
	];
	const meses = [
		"Enero",
		"Febrero",
		"Marzo",
		"Abril",
		"Mayo",
		"Junio",
		"Julio",
		"Agosto",
		"Septiembre",
		"Octubre",
		"Noviembre",
		"Diciembre",
	];

	const f = new Date();

	const diaSemana = dias[f.getDay()];
	const dia = f.getDate();
	const mes = meses[f.getMonth()];

	return `${diaSemana} ${dia} de ${mes}`;
}
