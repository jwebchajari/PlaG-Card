"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { cart } from "@/lib/cart";
import Hero from "./Hero";
import CategoryNav from "./CategoryNav";
import ProductRow from "./ProductRow";
import ProductSheet from "./ProductSheet";
import Spotlight from "./Spotlight";
import InfoSheet from "./InfoSheet";
import InstallBanner from "./InstallBanner";
import CartBar from "./CartBar";
import SiteFooter from "./SiteFooter";
import VisitTracker from "./VisitTracker";
import styles from "./menu.module.css";

export default function MenuApp({ sections, datos, horarios, focusProduct = null }) {
	const [selected, setSelected] = useState(null);
	const [infoOpen, setInfoOpen] = useState(false);
	const [toast, setToast] = useState(null);
	const toastTimer = useRef(null);

	const closeProduct = useCallback(() => setSelected(null), []);
	const closeInfo = useCallback(() => setInfoOpen(false), []);

	useEffect(() => () => clearTimeout(toastTimer.current), []);

	useEffect(() => {
		if (process.env.NODE_ENV === "production" && "serviceWorker" in navigator) {
			navigator.serviceWorker.register("/sw.js").catch(() => {});
		}
	}, []);

	function handleAdd(line) {
		cart.add(line);
		setSelected(null);
		setToast(line.name);
		clearTimeout(toastTimer.current);
		toastTimer.current = setTimeout(() => setToast(null), 2600);
	}

	return (
		<>
			<VisitTracker />
			<Hero horarios={horarios} titleAsHeading={!focusProduct} onInfo={() => setInfoOpen(true)} />

			<InstallBanner />

			<CategoryNav sections={sections} />

			<main className={styles.main} id="menu">
				{focusProduct && <Spotlight product={focusProduct} onOpen={() => setSelected(focusProduct)} />}

				{sections.length === 0 && (
					<p className={styles.empty}>Estamos actualizando el menú. Volvé en un ratito.</p>
				)}

				{sections.map((section) => (
					<section key={section.id} id={section.id} className={styles.section} aria-labelledby={`h-${section.id}`}>
						<h2 id={`h-${section.id}`} className={styles.sectionTitle}>
							{section.label}
							<span className={styles.sectionCount}>{section.products.length}</span>
						</h2>
						<ul className={styles.list}>
							{section.products.map((p) => (
								<li key={p.id}>
									<ProductRow product={p} onOpen={() => setSelected(p)} />
								</li>
							))}
						</ul>
					</section>
				))}
			</main>

			<SiteFooter datos={datos} onHours={() => setInfoOpen(true)} />

			<CartBar extras={datos.extras} />

			<div className={`${styles.toast} ${toast ? styles.toastShow : ""}`} role="status" aria-live="polite">
				{toast && (
					<>
						Agregaste <strong>{toast}</strong>
					</>
				)}
			</div>

			<ProductSheet product={selected} extras={datos.extras} onClose={closeProduct} onAdd={handleAdd} />
			<InfoSheet open={infoOpen} onClose={closeInfo} horarios={horarios} datos={datos} />
		</>
	);
}
