"use client";

import { MapPin, Navigation, Bike } from "lucide-react";
import Sheet from "@/components/ui/Sheet";
import { InstagramIcon, FacebookIcon } from "@/components/BrandIcons";
import { DIAS, diaDeHoy, getEstadoLocal } from "@/utils/horarios";
import { fullAddress, mapsUrl, instagramUrl, facebookUrl, envioLabel } from "@/lib/site";
import styles from "./menu.module.css";

/** Hours, address and socials in one place, opened from the header status row. */
export default function InfoSheet({ open, onClose, horarios, datos }) {
	const hoy = open ? diaDeHoy() : null;
	const estado = open ? getEstadoLocal(horarios) : null;
	const ig = instagramUrl(datos.redes?.instagram);
	const fb = facebookUrl(datos.redes?.facebook);

	return (
		<Sheet
			open={open}
			onClose={onClose}
			title="Horarios y ubicación"
			titleId="info-title"
			footer={
				datos.direccion && (
					<a className={`${styles.addBtn} ${styles.btnCenter}`} href={mapsUrl(datos.direccion)} target="_blank" rel="noopener noreferrer">
						<Navigation size={18} aria-hidden="true" />
						<span>Cómo llegar</span>
					</a>
				)
			}
		>
			{estado && (
				<p className={`${styles.status} ${estado.abierto ? styles.statusOpenLight : styles.statusClosedLight}`}>
					<span className={styles.statusDot} aria-hidden="true" />
					<strong>{estado.titulo}</strong>
					<span className={styles.statusDetail}>{estado.detalle}</span>
				</p>
			)}

			<dl className={styles.hours}>
				{DIAS.map((dia) => {
					const info = horarios[dia];
					const esHoy = dia === hoy;
					return (
						<div key={dia} className={`${styles.hoursRow} ${esHoy ? styles.hoursToday : ""}`}>
							<dt>
								{dia.charAt(0).toUpperCase() + dia.slice(1)}
								{esHoy && <span className={styles.todayTag}>Hoy</span>}
							</dt>
							<dd>
								{info.cerrado || info.franjas.length === 0 ? (
									<span className={styles.hoursClosed}>Cerrado</span>
								) : (
									info.franjas.map((f, i) => (
										<span key={i} className={styles.hoursRange}>
											{f.desde} a {f.hasta}
										</span>
									))
								)}
							</dd>
						</div>
					);
				})}
			</dl>

			{datos.direccion && (
				<p className={styles.infoAddress}>
					<MapPin size={18} aria-hidden="true" />
					{fullAddress(datos.direccion)}
				</p>
			)}

			<p className={styles.infoLine}>
				<Bike size={18} aria-hidden="true" />
				{datos.opciones?.envio === false ? (
					"Por ahora solo retiro en el local"
				) : (
					<>
						Envío a domicilio: <strong>{envioLabel(datos.costoEnvio)}</strong>
					</>
				)}
			</p>

			{(ig || fb) && (
				<div className={styles.infoSocial}>
					{ig && (
						<a href={ig} target="_blank" rel="noopener noreferrer" className={styles.shareInline}>
							<InstagramIcon size={18} />
							Instagram
						</a>
					)}
					{fb && (
						<a href={fb} target="_blank" rel="noopener noreferrer" className={styles.shareInline}>
							<FacebookIcon size={18} />
							Facebook
						</a>
					)}
				</div>
			)}
		</Sheet>
	);
}
