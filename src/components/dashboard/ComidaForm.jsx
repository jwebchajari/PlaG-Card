"use client";

import { useEffect, useRef, useState } from "react";
import { LoaderCircle, Trash2 } from "lucide-react";
import ImageUploader from "./ImageUploader";
import PublishPreview, { previewProduct } from "./PublishPreview";
import styles from "./dashboard.module.css";

const CATEGORY_OPTIONS = ["Hamburguesa", "Sandwich", "Papas", "Bebidas", "Otros"];

/** Accepts a Drive share link or a bare file ID and returns a direct image URL. */
export function parseImageUrl(url) {
	const clean = (url || "").trim();
	if (!clean) return "";
	if (/^[a-zA-Z0-9_-]{25,}$/.test(clean)) return `https://drive.google.com/uc?export=view&id=${clean}`;
	const id =
		clean.match(/\/file\/d\/([a-zA-Z0-9_-]+)/)?.[1] ||
		clean.match(/[?&]id=([a-zA-Z0-9_-]+)/)?.[1] ||
		(clean.includes("drive.google.com") && clean.match(/\/d\/([a-zA-Z0-9_-]+)/)?.[1]);
	return id ? `https://drive.google.com/uc?export=view&id=${id}` : clean;
}

/** Loads the image once to know whether the saved URL actually works. */
function useImageOk(url) {
	const [ok, setOk] = useState(null); // null = checking or empty
	useEffect(() => {
		setOk(null);
		if (!url) return;
		let alive = true;
		const img = new Image();
		img.referrerPolicy = "no-referrer";
		img.onload = () => alive && setOk(true);
		img.onerror = () => alive && setOk(false);
		img.src = url;
		return () => {
			alive = false;
		};
	}, [url]);
	return ok;
}

const EMPTY = { nombre: "", categoria: "Hamburguesa", valor: "", descripcion: "", oferta: false, valorOferta: "", imagen: "" };

export default function ComidaForm({ local, initial, submitLabel, onSubmit, onDelete }) {
	const [form, setForm] = useState(() => ({ ...EMPTY, ...initial, imagen: parseImageUrl(initial?.imagen) }));
	const [errors, setErrors] = useState({});
	const [state, setState] = useState({ busy: false, message: "" });
	const imageOk = useImageOk(form.imagen);
	const formRef = useRef(null);

	function set(name, value) {
		setForm((f) => ({ ...f, [name]: value }));
		setErrors((e) => ({ ...e, [name]: undefined }));
	}

	async function submit(e) {
		e.preventDefault();
		const errs = {};
		if (!form.nombre.trim()) errs.nombre = "Poné el nombre del producto.";
		if (!(Number(form.valor) > 0)) errs.valor = "Poné un precio mayor a 0.";
		if (form.oferta && !(Number(form.valorOferta) > 0 && Number(form.valorOferta) < Number(form.valor)))
			errs.valorOferta = "El precio de oferta tiene que ser menor al precio normal.";
		if (form.imagen && imageOk === false) errs.imagen = "La foto no carga. Subila de nuevo o revisá el link.";
		setErrors(errs);
		if (Object.keys(errs).length) {
			formRef.current?.querySelector(`[name="${Object.keys(errs)[0]}"]`)?.focus();
			return;
		}
		setState({ busy: true, message: "" });
		const ok = await onSubmit({ ...form, nombre: form.nombre.trim(), descripcion: form.descripcion.trim() });
		setState({ busy: false, message: ok ? "" : "No se pudo guardar. Probá de nuevo." });
	}

	const err = (name) =>
		errors[name] && (
			<p id={`${name}-error`} className={styles.fieldError}>
				{errors[name]}
			</p>
		);
	const aria = (name) => ({ "aria-invalid": errors[name] ? "true" : undefined, "aria-describedby": errors[name] ? `${name}-error` : undefined });

	return (
		<form ref={formRef} className={styles.formGrid} onSubmit={submit} noValidate>
			<div className={styles.formMain}>
				<div className={styles.field}>
					<label htmlFor="nombre">Nombre</label>
					<input id="nombre" name="nombre" className={styles.input} value={form.nombre} onChange={(e) => set("nombre", e.target.value)} {...aria("nombre")} />
					{err("nombre")}
				</div>

				<div className={styles.fieldRow}>
					<div className={styles.field}>
						<label htmlFor="categoria">Categoría</label>
						<select id="categoria" name="categoria" className={styles.input} value={form.categoria} onChange={(e) => set("categoria", e.target.value)}>
							{CATEGORY_OPTIONS.map((c) => (
								<option key={c}>{c}</option>
							))}
						</select>
					</div>
					<div className={styles.field}>
						<label htmlFor="valor">Precio</label>
						<input id="valor" name="valor" type="number" inputMode="numeric" min="0" className={styles.input} value={form.valor} onChange={(e) => set("valor", e.target.value)} {...aria("valor")} />
						{err("valor")}
					</div>
				</div>

				<div className={styles.field}>
					<label htmlFor="descripcion">Descripción</label>
					<textarea id="descripcion" name="descripcion" rows={3} className={styles.input} value={form.descripcion} onChange={(e) => set("descripcion", e.target.value)} />
				</div>

				<label className={styles.switch}>
					<input type="checkbox" name="oferta" checked={Boolean(form.oferta)} onChange={(e) => set("oferta", e.target.checked)} />
					<span className={styles.switchTrack} aria-hidden="true" />
					<span>En oferta</span>
				</label>

				{form.oferta && (
					<div className={styles.field}>
						<label htmlFor="valorOferta">Precio de oferta</label>
						<input id="valorOferta" name="valorOferta" type="number" inputMode="numeric" min="0" className={styles.input} value={form.valorOferta || ""} onChange={(e) => set("valorOferta", e.target.value)} {...aria("valorOferta")} />
						{err("valorOferta")}
					</div>
				)}
			</div>

			<div className={styles.formSide}>
				<ImageUploader
					local={local}
					value={form.imagen}
					onChange={(url) => set("imagen", url)}
					productName={form.nombre}
					product={previewProduct(form)}
					parseLink={parseImageUrl}
					error={errors.imagen}
				/>
				<div className={styles.sidePreview}>
					<h2 className={styles.fieldLabel}>Vista previa</h2>
					<PublishPreview product={previewProduct(form, form.imagen)} />
				</div>
			</div>

			<div className={styles.formActions}>
				{state.message && (
					<p className={styles.errorBox} role="alert">
						{state.message}
					</p>
				)}
				<button type="submit" className={styles.primaryBtn} disabled={state.busy}>
					{state.busy && <LoaderCircle size={18} className={styles.spin} aria-hidden="true" />}
					{submitLabel}
				</button>
				{onDelete && (
					<button type="button" className={styles.dangerBtn} onClick={onDelete}>
						<Trash2 size={18} aria-hidden="true" />
						Borrar producto
					</button>
				)}
			</div>
		</form>
	);
}
