"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { getDatos, saveDatos } from "@/lib/admin-data";
import { Check, LoaderCircle } from "lucide-react";
import LoadingScreen from "@/components/Loading";
import styles from "@/components/dashboard/dashboard.module.css";

function Field({ id, label, hint, ...input }) {
	return (
		<div className={styles.field}>
			<label htmlFor={id}>{label}</label>
			<input id={id} name={id} className={styles.input} {...input} />
			{hint && <p className={styles.hint}>{hint}</p>}
		</div>
	);
}

export default function DatosDelLocal() {
	const { local } = useParams();
	const [form, setForm] = useState(null);
	const [state, setState] = useState({ busy: false, saved: false, error: "" });

	useEffect(() => {
		getDatos(local).then((data) =>
				setForm({
					nombre: data.nombre || "",
					direccion: data.direccion || "",
					whatsapp: data.whatsapp || "",
					alias: data.alias || "",
					costoEnvio: data.costoEnvio ?? "",
					extras: { carne: data.extras?.carne ?? "", panEspecial: data.extras?.panEspecial ?? "" },
					redes: { instagram: data.redes?.instagram || "", facebook: data.redes?.facebook || "", twitter: data.redes?.twitter || "" },
				})
			);
	}, [local]);

	if (!form) return <LoadingScreen label="Cargando datos..." />;

	const set = (patch) => {
		setForm((f) => ({ ...f, ...patch }));
		setState((s) => ({ ...s, saved: false }));
	};

	async function submit(e) {
		e.preventDefault();
		setState({ busy: true, saved: false, error: "" });
		try {
			await saveDatos(local, form);
			setState({ busy: false, saved: true, error: "" });
		} catch {
			setState({ busy: false, saved: false, error: "No se pudo guardar. Probá de nuevo." });
		}
	}

	return (
		<div className={styles.page}>
			<div className={styles.pageHead}>
				<div>
					<h1 className={styles.h1}>Datos del local</h1>
					<p className={styles.lead}>Se muestran en el sitio, en los pedidos y en Google.</p>
				</div>
			</div>

			<form className={styles.stack} onSubmit={submit}>
				<section className={styles.card}>
					<h2 className={styles.h2}>Contacto</h2>
					<Field id="nombre" label="Nombre del local" value={form.nombre} onChange={(e) => set({ nombre: e.target.value })} hint="Como querés que aparezca en el panel." />
					<Field id="direccion" label="Dirección" value={form.direccion} onChange={(e) => set({ direccion: e.target.value })} hint="Calle y número. La ciudad se agrega sola." />
					<Field
						id="whatsapp"
						label="WhatsApp para pedidos"
						inputMode="tel"
						value={form.whatsapp}
						onChange={(e) => set({ whatsapp: e.target.value })}
						hint="Con código de área, sin 0 ni 15. Ej: 3456 529321. El código de país se agrega solo."
					/>
					<Field id="alias" label="Alias o CBU" value={form.alias} onChange={(e) => set({ alias: e.target.value })} hint="Se muestra cuando el cliente elige transferencia." />
				</section>

				<section className={styles.card}>
					<h2 className={styles.h2}>Envío a domicilio</h2>
					<Field
						id="costoEnvio"
						label="Costo de envío ($)"
						type="number"
						inputMode="numeric"
						min="0"
						placeholder="Sin definir"
						value={form.costoEnvio}
						onChange={(e) => set({ costoEnvio: e.target.value })}
						hint={
							form.costoEnvio === ""
								? "Vacío: el cliente ve “a confirmar” y lo arreglás por WhatsApp."
								: Number(form.costoEnvio) === 0
									? "En 0 el cliente ve “Envío gratis”."
									: "Se suma al total cuando el cliente elige envío a domicilio."
						}
					/>
				</section>

				<section className={styles.card}>
					<h2 className={styles.h2}>Extras</h2>
					<div className={styles.fieldRow}>
						<Field
							id="carne"
							label="Medallón extra ($)"
							type="number"
							inputMode="numeric"
							min="0"
							value={form.extras.carne}
							onChange={(e) => set({ extras: { ...form.extras, carne: e.target.value } })}
						/>
						<Field
							id="panEspecial"
							label="Pan especial ($)"
							type="number"
							inputMode="numeric"
							min="0"
							value={form.extras.panEspecial}
							onChange={(e) => set({ extras: { ...form.extras, panEspecial: e.target.value } })}
						/>
					</div>
				</section>

				<section className={styles.card}>
					<h2 className={styles.h2}>Redes</h2>
					<Field id="instagram" label="Instagram" placeholder="@pintolagula o link" value={form.redes.instagram} onChange={(e) => set({ redes: { ...form.redes, instagram: e.target.value } })} />
					<Field id="facebook" label="Facebook" placeholder="Link de la página" value={form.redes.facebook} onChange={(e) => set({ redes: { ...form.redes, facebook: e.target.value } })} />
				</section>

				<div className={styles.formActions}>
					{state.error && (
						<p className={styles.errorBox} role="alert">
							{state.error}
						</p>
					)}
					<button type="submit" className={styles.primaryBtn} disabled={state.busy}>
						{state.busy ? <LoaderCircle size={18} className={styles.spin} aria-hidden="true" /> : state.saved && <Check size={18} aria-hidden="true" />}
						{state.saved ? "Guardado" : "Guardar datos"}
					</button>
				</div>
			</form>
		</div>
	);
}
