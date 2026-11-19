"use client";

import { useEffect, useState } from "react";
import { Download, Share } from "lucide-react";
import styles from "./menu.module.css";

/** Quiet install offer in the footer instead of a popup over the menu. */
export default function InstallApp() {
	const [prompt, setPrompt] = useState(null);
	const [ios, setIos] = useState(false);
	const [done, setDone] = useState(false);

	useEffect(() => {
		const standalone = window.matchMedia("(display-mode: standalone)").matches || window.navigator.standalone === true;
		if (standalone) return;
		const ua = navigator.userAgent;
		setIos(/iphone|ipad|ipod/i.test(ua) || (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1));
		const onPrompt = (e) => {
			e.preventDefault();
			setPrompt(e);
		};
		window.addEventListener("beforeinstallprompt", onPrompt);
		return () => window.removeEventListener("beforeinstallprompt", onPrompt);
	}, []);

	if (done) return null;

	if (prompt) {
		return (
			<button
				type="button"
				className={styles.installBtn}
				onClick={async () => {
					prompt.prompt();
					await prompt.userChoice;
					setPrompt(null);
					setDone(true);
				}}
			>
				<Download size={18} aria-hidden="true" />
				Instalar la app en tu celular
			</button>
		);
	}

	if (ios) {
		return (
			<p className={styles.installHint}>
				<Share size={16} aria-hidden="true" />
				Para instalar la app: tocá Compartir en Safari y elegí “Agregar a inicio”.
			</p>
		);
	}

	return null;
}
