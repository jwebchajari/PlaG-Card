"use client";

import Image from "next/image";
import { Clock, MapPin } from "lucide-react";
import { WhatsappIcon, InstagramIcon, FacebookIcon } from "@/components/BrandIcons";
import InstallApp from "./InstallApp";
import { SITE_NAME, SITE_CITY, instagramUrl, facebookUrl, mapsUrl, waNumber } from "@/lib/site";
import logo from "../../../public/brand/logo-96.png";
import styles from "./menu.module.css";
import installStyles from "./install.module.css";

export default function SiteFooter({ datos, onHours }) {
	const ig = instagramUrl(datos.redes?.instagram);
	const fb = facebookUrl(datos.redes?.facebook);
	const phone = waNumber(datos.whatsapp);

	return (
		<footer className={styles.footer}>
			<div className={styles.footerInner}>
				<div className={styles.footerCol}>
					<div className={styles.footerBrand}>
						<Image src={logo} alt="" width={48} height={50} />
						<div>
							<p className={styles.footerName}>{SITE_NAME}</p>
							<p className={styles.footerCity}>Hamburguesas en {SITE_CITY}, Entre Ríos</p>
						</div>
					</div>
					<div className={installStyles.desktopOnly}>
						<InstallApp />
					</div>
				</div>

				<ul className={styles.footerLinks}>
					{datos.direccion && (
						<li>
							<a href={mapsUrl(datos.direccion)} target="_blank" rel="noopener noreferrer">
								<MapPin size={18} aria-hidden="true" />
								{datos.direccion}
							</a>
						</li>
					)}
					<li>
						<button type="button" onClick={onHours}>
							<Clock size={18} aria-hidden="true" />
							Ver horarios
						</button>
					</li>
					{phone && (
						<li>
							<a href={`https://wa.me/${phone}`} target="_blank" rel="noopener noreferrer">
								<WhatsappIcon size={18} />
								Escribinos por WhatsApp
							</a>
						</li>
					)}
					{ig && (
						<li>
							<a href={ig} target="_blank" rel="noopener noreferrer">
								<InstagramIcon size={18} />
								Instagram
							</a>
						</li>
					)}
					{fb && (
						<li>
							<a href={fb} target="_blank" rel="noopener noreferrer">
								<FacebookIcon size={18} />
								Facebook
							</a>
						</li>
					)}
				</ul>

				<p className={styles.copy}>
					© {new Date().getFullYear()} {SITE_NAME}
				</p>
			</div>
		</footer>
	);
}
