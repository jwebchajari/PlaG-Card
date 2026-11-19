"use client";

import { useState } from "react";
import { Trash2, SlidersHorizontal } from "lucide-react";
import { cart } from "@/lib/cart";
import Stepper from "@/components/ui/Stepper";
import ProductImage from "@/components/menu/ProductImage";
import { BREADS, MAX_MEATS, breadLabel, formatPrice, isBurger, isCustomizable } from "@/lib/site";
import styles from "./checkout.module.css";

export default function CartLine({ line, extras }) {
	const [editing, setEditing] = useState(false);
	const qty = Number(line.quantity) || 1;
	const burger = isBurger(line);
	const custom = isCustomizable(line);
	const extraBread = Number(extras?.panEspecial) || 0;
	const editId = `edit-${line.id}`;

	if (line.unavailable) {
		return (
			<article className={`${styles.line} ${styles.lineGone}`}>
				<div className={styles.lineMain}>
					<p className={styles.lineName}>{line.name}</p>
					<p className={styles.fieldError}>Ya no está en el menú.</p>
				</div>
				<button type="button" className={styles.iconBtn} onClick={() => cart.remove(line.id)} aria-label={`Quitar ${line.name}`}>
					<Trash2 size={20} aria-hidden="true" />
				</button>
			</article>
		);
	}

	const details = [
		burger && `${line.meatCount || 1} ${line.meatCount > 1 ? "medallones" : "medallón"}`,
		custom && breadLabel(line.breadType || "Berly"),
	].filter(Boolean);

	return (
		<article className={styles.line}>
			<div className={styles.lineTop}>
				<ProductImage src={line.image} alt="" className={styles.lineImg} width={128} height={128} />
				<div className={styles.lineMain}>
					<p className={styles.lineName}>{line.name}</p>
					{details.length > 0 && <p className={styles.lineDetails}>{details.join(" · ")}</p>}
					{line.notes && <p className={styles.lineNotes}>“{line.notes}”</p>}
				</div>
				<p className={styles.linePrice}>{formatPrice(line.unit * qty)}</p>
			</div>

			<div className={styles.lineControls}>
				<Stepper value={qty} onChange={(v) => cart.update(line.id, { quantity: v })} min={1} max={20} label="Cantidad" size="s" />
				<div className={styles.lineActions}>
					<button
						type="button"
						className={styles.textBtn}
						aria-expanded={editing}
						aria-controls={editId}
						onClick={() => setEditing((v) => !v)}
					>
						<SlidersHorizontal size={18} aria-hidden="true" />
						{editing ? "Listo" : "Editar"}
					</button>
					<button type="button" className={styles.iconBtn} onClick={() => cart.remove(line.id)} aria-label={`Quitar ${line.name}`}>
						<Trash2 size={20} aria-hidden="true" />
					</button>
				</div>
			</div>

			{editing && (
				<div id={editId} className={styles.edit}>
					{burger && (
						<div className={styles.editRow}>
							<span className={styles.editLabel}>Medallones</span>
							<Stepper
								value={line.meatCount || 1}
								onChange={(v) => cart.update(line.id, { meatCount: v })}
								min={1}
								max={MAX_MEATS}
								label="Medallones"
								size="s"
							/>
						</div>
					)}
					{custom && (
						<div className={styles.editRow}>
							<label className={styles.editLabel} htmlFor={`bread-${line.id}`}>
								Pan
							</label>
							<select
								id={`bread-${line.id}`}
								className={styles.select}
								value={line.breadType || "Berly"}
								onChange={(e) => cart.update(line.id, { breadType: e.target.value })}
							>
								{BREADS.map((b) => (
									<option key={b.id} value={b.id}>
										{b.label}
										{b.extra && extraBread > 0 ? ` (+${formatPrice(extraBread)})` : ""}
									</option>
								))}
							</select>
						</div>
					)}
					<div>
						<label className={styles.editLabel} htmlFor={`notes-${line.id}`}>
							Aclaraciones
						</label>
						<input
							id={`notes-${line.id}`}
							className={styles.input}
							value={line.notes || ""}
							onChange={(e) => cart.update(line.id, { notes: e.target.value })}
							placeholder="Sin cebolla, extra salsa..."
							maxLength={140}
							autoComplete="off"
						/>
					</div>
				</div>
			)}
		</article>
	);
}
