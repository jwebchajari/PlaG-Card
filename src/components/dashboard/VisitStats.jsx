"use client";

import { useEffect, useState } from "react";
import { Eye } from "lucide-react";
import { getVisitas } from "@/lib/admin-data";
import { claveFecha } from "@/utils/horarios";
import styles from "./dashboard.module.css";

function resumen(data) {
	const dias = data.dias || {};
	const ultimos = (n) => {
		let suma = 0;
		for (let i = 0; i < n; i++) suma += Number(dias[claveFecha(new Date(Date.now() - i * 86_400_000))]) || 0;
		return suma;
	};
	return { total: Number(data.total) || 0, hoy: ultimos(1), semana: ultimos(7), mes: ultimos(30) };
}

const nf = new Intl.NumberFormat("es-AR");

export default function VisitStats({ local }) {
	const [stats, setStats] = useState(null);
	const [failed, setFailed] = useState(false);

	useEffect(() => {
		getVisitas(local)
			.then((data) => setStats(resumen(data)))
			.catch(() => setFailed(true));
	}, [local]);

	if (failed) return null;

	const items = [
		{ label: "Hoy", value: stats?.hoy },
		{ label: "Últimos 7 días", value: stats?.semana },
		{ label: "Últimos 30 días", value: stats?.mes },
		{ label: "Total", value: stats?.total },
	];

	return (
		<section className={styles.stats} aria-labelledby="visitas-title">
			<h2 id="visitas-title" className={styles.statsTitle}>
				<Eye size={18} aria-hidden="true" />
				Visitas al menú
			</h2>
			<dl className={styles.statsGrid}>
				{items.map((it) => (
					<div key={it.label} className={styles.stat}>
						<dt>{it.label}</dt>
						<dd>{stats ? nf.format(it.value) : "–"}</dd>
					</div>
				))}
			</dl>
		</section>
	);
}
