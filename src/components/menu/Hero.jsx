"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { ChevronRight } from "lucide-react";
import ShareButton from "@/components/ui/ShareButton";
import { getEstadoLocal } from "@/utils/horarios";
import { SITE_NAME, SITE_URL } from "@/lib/site";
import logo from "../../../public/brand/logo-96.png";
import styles from "./menu.module.css";

export default function Hero({ horarios, titleAsHeading, onInfo }) {
	const [estado, setEstado] = useState(null);

	// Time-dependent UI renders only on the client, in Argentina time.
	useEffect(() => {
		const tick = () => setEstado(getEstadoLocal(horarios));
		tick();
		const t = setInterval(tick, 60_000);
		return () => clearInterval(t);
	}, [horarios]);

	const Title = titleAsHeading ? "h1" : "p";

	return (
		<header className={styles.hero}>
			<div className={styles.heroInner}>
				<div className={styles.heroBar}>
					<Image src={logo} alt="" width={52} height={54} className={styles.heroLogo} priority />
					<div className={styles.heroText}>
						<Title className={styles.brand}>{SITE_NAME}</Title>
						<p className={styles.tagline}>Hamburguesas en Chajarí</p>
					</div>
					<ShareButton
						className={styles.shareBtn}
						text={`Mirá el menú de ${SITE_NAME} y pedí por WhatsApp:`}
						url={SITE_URL}
					/>
				</div>

				<button type="button" className={styles.statusRow} onClick={onInfo} aria-haspopup="dialog">
					{estado ? (
						<span className={`${styles.statusText} ${estado.abierto ? styles.isOpen : styles.isClosed}`}>
							<span className={styles.statusDot} aria-hidden="true" />
							<strong>{estado.titulo}</strong>
							<span className={styles.statusDetail}>{estado.detalle}</span>
						</span>
					) : (
						<span className={styles.statusText}>Horarios</span>
					)}
					<span className={styles.statusMore}>
						Horarios y ubicación
						<ChevronRight size={18} aria-hidden="true" />
					</span>
				</button>
			</div>
		</header>
	);
}
