"use client";

import { Icon } from "@iconify/react";
import styles from "./BottomNavbar.module.css";

export default function BottomNavbar({ active, setActive, expanded, onExpandToggle }) {
	const tabs = [
		{ id: "hamburguesas", icon: "mdi:hamburger", label: "Burgers" },
		{ id: "sandwich", icon: "mdi:food-croissant", label: "Sandwich" },
		{ id: "papas", icon: "mdi:food-french-fries", label: "Papas" },
		{ id: "bebidas", icon: "mdi:cup", label: "Bebidas" },
	];

	return (
		<nav className={`${styles.nav} ${expanded ? styles.expandedNav : ""}`}>
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

			{/* Botón expandir/contraer */}
			<button className={styles.expandBtn} onClick={onExpandToggle}>
				<Icon icon={expanded ? "mdi:chevron-down" : "mdi:chevron-up"} width={28} />
			</button>
		</nav>
	);
}
