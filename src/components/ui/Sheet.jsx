"use client";

import { useEffect, useRef } from "react";
import { X } from "lucide-react";
import styles from "./Sheet.module.css";

/**
 * Bottom sheet on phones, centered dialog from 768px. Built on <dialog> for
 * focus trapping, Escape handling and the top layer.
 */
export default function Sheet({ open, onClose, title, titleId, hideTitle = false, children, footer, media }) {
	const ref = useRef(null);
	const onCloseRef = useRef(onClose);
	onCloseRef.current = onClose;

	useEffect(() => {
		const d = ref.current;
		if (!d) return;
		if (open && !d.open) d.showModal();
		if (!open && d.open) d.close();
	}, [open]);

	useEffect(() => {
		const d = ref.current;
		const onCancel = (e) => {
			e.preventDefault();
			onCloseRef.current();
		};
		d.addEventListener("cancel", onCancel);
		return () => d.removeEventListener("cancel", onCancel);
	}, []);

	return (
		<dialog
			ref={ref}
			className={styles.sheet}
			aria-labelledby={titleId}
			onClick={(e) => {
				if (e.target === ref.current) onClose();
			}}
		>
			{open && (
				<div className={styles.panel}>
					<div className={styles.handle} aria-hidden="true" />
					<button type="button" className={styles.close} onClick={onClose} aria-label="Cerrar">
						<X size={20} strokeWidth={2.25} />
					</button>
					<div className={styles.scroll}>
						{media}
						<div className={styles.body}>
							<h2 id={titleId} className={hideTitle ? "visually-hidden" : styles.title}>
								{title}
							</h2>
							{children}
						</div>
					</div>
					{footer && <div className={styles.footer}>{footer}</div>}
				</div>
			)}
		</dialog>
	);
}
