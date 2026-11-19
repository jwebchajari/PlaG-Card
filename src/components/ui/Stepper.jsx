"use client";

import { Minus, Plus } from "lucide-react";
import styles from "./Stepper.module.css";

export default function Stepper({ value, onChange, min = 1, max = 99, label, size = "m" }) {
	return (
		<div className={`${styles.stepper} ${size === "s" ? styles.small : ""}`} role="group" aria-label={label}>
			<button
				type="button"
				className={styles.btn}
				onClick={() => onChange(Math.max(min, value - 1))}
				disabled={value <= min}
				aria-label={`Restar ${label.toLowerCase()}`}
			>
				<Minus size={18} strokeWidth={2.5} />
			</button>
			<output className={styles.value} aria-live="polite">
				{value}
			</output>
			<button
				type="button"
				className={styles.btn}
				onClick={() => onChange(Math.min(max, value + 1))}
				disabled={value >= max}
				aria-label={`Sumar ${label.toLowerCase()}`}
			>
				<Plus size={18} strokeWidth={2.5} />
			</button>
		</div>
	);
}
