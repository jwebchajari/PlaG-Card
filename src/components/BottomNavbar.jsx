"use client";

import { Icon } from "@iconify/react";
import styles from "./BottomNavbar.module.css";

export default function BottomNavbar({
	active,
	setActive,
	expanded,
	onExpandToggle,
}) {
	const tabs = [
		{ id: "hamburguesas", icon: "mdi:hamburger", label: "Burgers" },
		{ id: "sandwich", icon: "mdi:food-takeout-box", label: "Sandwich" },
		{ id: "papas", icon: "mdi:french-fries", label: "Papas" },
		/* { id: "bebidas", icon: "mdi:cup-outline", label: "Bebidas" }, */
	];

	return (
		<>
			{/* PANEL EXPANDIDO */}
			<div className={`${styles.expandPanel} ${expanded ? styles.showPanel : ""}`}>
				<h4 className={styles.panelTitle}>Opciones</h4>

				<div className={styles.optionRow}>
					<Icon icon="mdi:map-marker" width={22} />
					<span>Dirección: Repetto 2280</span>
				</div>

				<a
					className={styles.optionRowLink}
					href="https://www.google.com/maps/search/?api=1&query=Repetto+2280+Rosario"
					target="_blank"
				>
					<Icon icon="mdi:map" width={22} color="red" />
					<span className="text-danger fw-semibold">Llegar con Google Maps</span>
				</a>

				<button className={styles.closeBtn} onClick={onExpandToggle}>
					<Icon icon="mdi:chevron-down" width={26} />
					<span>Contraer</span>
				</button>
			</div>

			{/* NAVBAR INFERIOR */}
			<nav className={styles.nav}>
				{tabs.map((tab) => (
					<button
						key={tab.id}
						className={`${styles.tab} ${active === tab.id ? styles.active : ""}`}
						onClick={() => setActive(tab.id)}
					>
						<Icon icon={tab.icon} width={26} />
						<span>{tab.label}</span>
					</button>
				))}

				{/* BOTÓN EXPANDIR */}
				<button className={styles.expandBtn} onClick={onExpandToggle}>
					<Icon
						icon={expanded ? "mdi:chevron-down" : "mdi:chevron-up"}
						width={28}
					/>
				</button>
			</nav>
		</>
	);
}
