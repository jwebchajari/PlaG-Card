"use client";

import { useState } from "react";
import { Store, Bike, Banknote, Landmark, Copy, Check } from "lucide-react";
import { envioLabel } from "@/lib/site";
import styles from "./checkout.module.css";

function Segmented({ name, legend, value, onChange, options }) {
	return (
		<fieldset className={styles.fieldset}>
			<legend className={styles.label}>{legend}</legend>
			<div className={styles.segmented}>
				{options.map(({ id, label, hint, Icon }) => (
					<label key={id} className={styles.segment}>
						<input type="radio" name={name} value={id} checked={value === id} onChange={() => onChange(id)} />
						<Icon size={20} aria-hidden="true" />
						<span>{label}</span>
						{hint && <span className={styles.segmentHint}>{hint}</span>}
					</label>
				))}
			</div>
		</fieldset>
	);
}

function Field({ id, label, error, optional, ...input }) {
	return (
		<div className={styles.field}>
			<label className={styles.label} htmlFor={id}>
				{label} {optional && <span className={styles.optional}>(opcional)</span>}
			</label>
			<input
				id={id}
				className={styles.input}
				aria-invalid={error ? "true" : undefined}
				aria-describedby={error ? `${id}-error` : undefined}
				{...input}
			/>
			{error && (
				<p id={`${id}-error`} className={styles.fieldError}>
					{error}
				</p>
			)}
		</div>
	);
}

export default function BuyerForm({ buyer, onChange, errors, alias, costoEnvio, aceptaEnvio = true, aceptaTransferencia = true }) {
	const [copied, setCopied] = useState(false);

	async function copyAlias() {
		try {
			await navigator.clipboard.writeText(alias);
			setCopied(true);
			setTimeout(() => setCopied(false), 2000);
		} catch {
			/* clipboard blocked: the alias stays visible to copy by hand */
		}
	}

	return (
		<section className={styles.card} aria-labelledby="buyer-title">
			<h2 id="buyer-title" className={styles.sectionTitle}>
				Tus datos
			</h2>

			<Field
				id="nombre"
				name="nombre"
				label="Nombre"
				autoComplete="name"
				value={buyer.nombre}
				onChange={(e) => onChange({ nombre: e.target.value })}
				error={errors.nombre}
			/>

			<Segmented
				name="entrega"
				legend="Entrega"
				value={buyer.entrega}
				onChange={(v) => onChange({ entrega: v })}
				options={[
					{ id: "retiro", label: "Retiro en el local", hint: "Sin cargo", Icon: Store },
					...(aceptaEnvio ? [{ id: "envio", label: "Envío a domicilio", hint: `Envío: ${envioLabel(costoEnvio).toLowerCase()}`, Icon: Bike }] : []),
				]}
			/>

			{buyer.entrega === "envio" && (
				<>
					<Field
						id="direccion"
						name="direccion"
						label="Dirección"
						autoComplete="street-address"
						value={buyer.direccion}
						onChange={(e) => onChange({ direccion: e.target.value })}
						error={errors.direccion}
					/>
					<Field
						id="referencia"
						name="referencia"
						label="Referencia"
						optional
						placeholder="Casa con portón negro, timbre 2..."
						value={buyer.referencia}
						onChange={(e) => onChange({ referencia: e.target.value })}
					/>
				</>
			)}

			<Segmented
				name="pago"
				legend="Pago"
				value={buyer.pago}
				onChange={(v) => onChange({ pago: v })}
				options={[
					{ id: "efectivo", label: "Efectivo", Icon: Banknote },
					...(aceptaTransferencia ? [{ id: "transferencia", label: "Transferencia", Icon: Landmark }] : []),
				]}
			/>

			{buyer.pago === "transferencia" && alias && (
				<div className={styles.alias}>
					<div>
						<p className={styles.aliasLabel}>Alias para transferir</p>
						<p className={styles.aliasValue}>{alias}</p>
					</div>
					<button type="button" className={styles.copyBtn} onClick={copyAlias}>
						{copied ? <Check size={18} aria-hidden="true" /> : <Copy size={18} aria-hidden="true" />}
						<span aria-live="polite">{copied ? "Copiado" : "Copiar"}</span>
					</button>
				</div>
			)}
		</section>
	);
}
