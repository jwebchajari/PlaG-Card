"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";
import { getHorarios, saveHorarios } from "@/lib/admin-data";
import { Plus, X, Check, LoaderCircle, Copy, CalendarRange, MoonStar } from "lucide-react";
import LoadingScreen from "@/components/Loading";
import { DIAS, normalizeHorarios } from "@/utils/horarios";
import styles from "@/components/dashboard/dashboard.module.css";
import h from "@/components/dashboard/horarios.module.css";

const CORTO = { lunes: "L", martes: "M", "miércoles": "X", jueves: "J", viernes: "V", "sábado": "S", domingo: "D" };
const GRUPOS = [
	{ label: "Todos", dias: DIAS },
	{ label: "Lun a Vie", dias: DIAS.slice(0, 5) },
	{ label: "Fin de semana", dias: ["sábado", "domingo"] },
];

const cap = (d) => d.charAt(0).toUpperCase() + d.slice(1);
const toMin = (t) => {
	const [a, b] = (t || "").split(":").map(Number);
	return Number.isFinite(a) && Number.isFinite(b) ? a * 60 + b : null;
};

function problema(f) {
	const a = toMin(f.desde);
	const b = toMin(f.hasta);
	if (a === null || b === null) return "Completá las dos horas.";
	if (a === b) return "La apertura y el cierre no pueden ser iguales.";
	return null;
}

const cruzaMedianoche = (f) => toMin(f.hasta) !== null && toMin(f.hasta) < toMin(f.desde);

export default function Horarios() {
	const { local } = useParams();
	const [horarios, setHorarios] = useState(null);
	const [original, setOriginal] = useState("");
	const [state, setState] = useState({ busy: false, saved: false, error: "" });
	const [plantilla, setPlantilla] = useState({ desde: "20:30", hasta: "23:30", dias: [...DIAS] });

	useEffect(() => {
		getHorarios(local).then((data) => {
				const n = normalizeHorarios(data);
				setHorarios(n);
				setOriginal(JSON.stringify(n));
			});
	}, [local]);

	const dirty = horarios && JSON.stringify(horarios) !== original;
	const errores = useMemo(
		() => (horarios ? DIAS.filter((d) => !horarios[d].cerrado && horarios[d].franjas.some((f) => problema(f))) : []),
		[horarios]
	);

	// Avoid losing edits by closing the tab.
	useEffect(() => {
		if (!dirty) return;
		const warn = (e) => {
			e.preventDefault();
			e.returnValue = "";
		};
		window.addEventListener("beforeunload", warn);
		return () => window.removeEventListener("beforeunload", warn);
	}, [dirty]);

	if (!horarios) return <LoadingScreen label="Cargando horarios..." />;

	function update(dia, fn) {
		setHorarios((prev) => ({ ...prev, [dia]: fn(prev[dia]) }));
		setState((s) => ({ ...s, saved: false }));
	}

	function copiarA(dias, fuente) {
		setHorarios((prev) => {
			const next = { ...prev };
			dias.forEach((d) => {
				next[d] = { cerrado: fuente.cerrado, franjas: fuente.franjas.map((f) => ({ ...f })) };
			});
			return next;
		});
		setState((s) => ({ ...s, saved: false }));
	}

	const setFranja = (dia, i, campo, valor) =>
		update(dia, (d) => ({ ...d, franjas: d.franjas.map((f, j) => (j === i ? { ...f, [campo]: valor } : f)) }));

	function aplicarPlantilla() {
		copiarA(plantilla.dias, { cerrado: false, franjas: [{ desde: plantilla.desde, hasta: plantilla.hasta }] });
	}

	async function guardar() {
		if (errores.length) {
			setState({ busy: false, saved: false, error: `Revisá ${errores.map(cap).join(", ")}.` });
			return;
		}
		setState({ busy: true, saved: false, error: "" });
		try {
			await saveHorarios(local, horarios);
			setOriginal(JSON.stringify(horarios));
			setState({ busy: false, saved: true, error: "" });
		} catch {
			setState({ busy: false, saved: false, error: "No se pudo guardar. Probá de nuevo." });
		}
	}

	return (
		<div className={`${styles.page} ${h.page}`}>
			<div className={styles.pageHead}>
				<div>
					<h1 className={styles.h1}>Horarios</h1>
					<p className={styles.lead}>Lo que pongas acá define si el menú dice “Abierto” o “Cerrado”.</p>
				</div>
			</div>

			{/* Bulk edit: the fastest way to set the whole week */}
			<section className={`${styles.card} ${h.quick}`} aria-labelledby="rapido">
				<h2 id="rapido" className={h.quickTitle}>
					<CalendarRange size={18} aria-hidden="true" />
					Cargar varios días a la vez
				</h2>
				<div className={h.quickTimes}>
					<label className={h.time}>
						<span>Abre</span>
						<input type="time" value={plantilla.desde} onChange={(e) => setPlantilla((p) => ({ ...p, desde: e.target.value }))} />
					</label>
					<label className={h.time}>
						<span>Cierra</span>
						<input type="time" value={plantilla.hasta} onChange={(e) => setPlantilla((p) => ({ ...p, hasta: e.target.value }))} />
					</label>
				</div>
				<fieldset className={h.dayPicker}>
					<legend className="visually-hidden">Días</legend>
					{DIAS.map((d) => (
						<label key={d} className={h.dayChip} title={cap(d)}>
							<input
								type="checkbox"
								checked={plantilla.dias.includes(d)}
								onChange={(e) =>
									setPlantilla((p) => ({ ...p, dias: e.target.checked ? [...p.dias, d] : p.dias.filter((x) => x !== d) }))
								}
							/>
							<span aria-hidden="true">{CORTO[d]}</span>
							<span className="visually-hidden">{cap(d)}</span>
						</label>
					))}
				</fieldset>
				<div className={h.groupRow}>
					{GRUPOS.map((g) => (
						<button key={g.label} type="button" className={h.groupBtn} onClick={() => setPlantilla((p) => ({ ...p, dias: [...g.dias] }))}>
							{g.label}
						</button>
					))}
				</div>
				<button type="button" className={styles.ghostBtn} onClick={aplicarPlantilla} disabled={!plantilla.dias.length}>
					Aplicar a {plantilla.dias.length === 7 ? "toda la semana" : `${plantilla.dias.length} ${plantilla.dias.length === 1 ? "día" : "días"}`}
				</button>
			</section>

			<ul className={h.week}>
				{DIAS.map((dia) => {
					const d = horarios[dia];
					return (
						<li key={dia} className={`${h.day} ${d.cerrado ? h.dayClosed : ""}`}>
							<div className={h.dayHead}>
								<h2 className={h.dayName}>{cap(dia)}</h2>
								<label className={styles.switch}>
									<input
										type="checkbox"
										checked={!d.cerrado}
										onChange={() =>
											update(dia, (x) => ({
												cerrado: !x.cerrado,
												franjas: !x.cerrado || x.franjas.length ? x.franjas : [{ desde: "20:30", hasta: "23:30" }],
											}))
										}
										aria-label={`${cap(dia)} abierto`}
									/>
									<span className={styles.switchTrack} aria-hidden="true" />
									<span className={h.switchText}>{d.cerrado ? "Cerrado" : "Abierto"}</span>
								</label>
							</div>

							{!d.cerrado && (
								<div className={h.ranges}>
									{d.franjas.map((f, i) => {
										const err = problema(f);
										return (
											<div key={i} className={h.rangeBlock}>
												<div className={h.range}>
													<label className={h.time}>
														<span>Abre</span>
														<input type="time" value={f.desde} onChange={(e) => setFranja(dia, i, "desde", e.target.value)} aria-invalid={err ? "true" : undefined} />
													</label>
													<label className={h.time}>
														<span>Cierra</span>
														<input type="time" value={f.hasta} onChange={(e) => setFranja(dia, i, "hasta", e.target.value)} aria-invalid={err ? "true" : undefined} />
													</label>
													{d.franjas.length > 1 && (
														<button
															type="button"
															className={`${styles.iconBtn} ${styles.danger}`}
															onClick={() => update(dia, (x) => ({ ...x, franjas: x.franjas.filter((_, j) => j !== i) }))}
															aria-label={`Quitar franja ${i + 1} del ${dia}`}
														>
															<X size={18} aria-hidden="true" />
														</button>
													)}
												</div>
												{err ? (
													<p className={styles.fieldError}>{err}</p>
												) : (
													cruzaMedianoche(f) && (
														<p className={h.midnight}>
															<MoonStar size={14} aria-hidden="true" /> Cierra pasada la medianoche
														</p>
													)
												)}
											</div>
										);
									})}

									<div className={h.dayActions}>
										<button
											type="button"
											className={h.textBtn}
											onClick={() => update(dia, (x) => ({ ...x, franjas: [...x.franjas, { desde: "12:00", hasta: "15:00" }] }))}
										>
											<Plus size={16} aria-hidden="true" />
											Agregar turno
										</button>
										<button type="button" className={h.textBtn} onClick={() => copiarA(DIAS.filter((x) => x !== dia), d)}>
											<Copy size={16} aria-hidden="true" />
											Copiar a todos
										</button>
									</div>
								</div>
							)}
						</li>
					);
				})}
			</ul>

			<div className={`${h.saveBar} ${dirty || state.error ? h.saveBarShow : ""}`}>
				<p className={h.saveText} role="status">
					{state.error || (dirty ? "Tenés cambios sin guardar" : state.saved ? "Horarios guardados" : "")}
				</p>
				<button type="button" className={styles.primaryBtn} onClick={guardar} disabled={state.busy || !dirty}>
					{state.busy ? <LoaderCircle size={18} className={styles.spin} aria-hidden="true" /> : !dirty && state.saved && <Check size={18} aria-hidden="true" />}
					{state.busy ? "Guardando..." : dirty ? "Guardar" : "Guardado"}
				</button>
			</div>
		</div>
	);
}
