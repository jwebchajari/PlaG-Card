"use client";

import { useEffect, useState } from "react";
import { Download } from "lucide-react";
import styles from "./install.module.css";

function installHelp() {
	const ua = navigator.userAgent;
	if (/Instagram|FBAN|FBAV|FB_IAB|TikTok|musical_ly/i.test(ua)) {
		return "Tocá el menú de esta pantalla (⋯), elegí “Abrir en el navegador” y volvé a tocar este botón.";
	}
	if (/iphone|ipad|ipod/i.test(ua) || (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1)) {
		return "Tocá Compartir y después “Agregar a inicio”.";
	}
	return "Abrí el menú del navegador (⋮) y elegí “Instalar app” o “Agregar a pantalla principal”.";
}

/** Botón visible solo en celular. El CSS lo oculta en PC y dentro de la app instalada. */
export default function InstallBanner() {
	const [prompt, setPrompt] = useState(null);
	const [help, setHelp] = useState("");
	const [installed, setInstalled] = useState(false);

	useEffect(() => {
		const onPrompt = (e) => {
			e.preventDefault();
			setPrompt(e);
			setHelp("");
		};
		const onInstalled = () => {
			setInstalled(true);
			setPrompt(null);
		};
		window.addEventListener("beforeinstallprompt", onPrompt);
		window.addEventListener("appinstalled", onInstalled);
		return () => {
			window.removeEventListener("beforeinstallprompt", onPrompt);
			window.removeEventListener("appinstalled", onInstalled);
		};
	}, []);

	async function install() {
		if (!prompt) {
			setHelp((current) => (current ? "" : installHelp()));
			return;
		}
		prompt.prompt();
		const choice = await prompt.userChoice.catch(() => null);
		setPrompt(null);
		if (choice?.outcome === "accepted") setInstalled(true);
	}

	if (installed) return null;

	return (
		<div className={styles.banner}>
			<button type="button" className={styles.button} onClick={install} aria-expanded={prompt ? undefined : Boolean(help)}>
				<Download size={18} aria-hidden="true" />
				Descargá la app de Pintó la Gula
			</button>
			{help && <p className={styles.help} role="status">{help}</p>}
		</div>
	);
}
