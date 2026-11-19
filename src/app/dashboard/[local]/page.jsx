"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";
import { Pencil, Trash2, Plus, Search } from "lucide-react";
import { CATEGORIES, formatPrice } from "@/lib/site";
import { normalizeProduct } from "@/lib/menu-shared";
import { listComidas, deleteComida } from "@/lib/admin-data";
import ProductImage from "@/components/menu/ProductImage";
import LoadingScreen from "@/components/Loading";
import VisitStats from "@/components/dashboard/VisitStats";
import styles from "@/components/dashboard/dashboard.module.css";

export default function Productos() {
	const { local } = useParams();
	const [raw, setRaw] = useState(null);
	const [error, setError] = useState("");
	const [query, setQuery] = useState("");

	useEffect(() => {
		listComidas(local)
			.then(setRaw)
			.catch(() => {
				setRaw({});
				setError("No pudimos cargar los productos. Probá recargar la página.");
			});
	}, [local]);

	const groups = useMemo(() => {
		if (!raw) return [];
		const q = query.trim().toLowerCase();
		const items = Object.entries(raw)
			.map(([id, item]) => normalizeProduct(id, item))
			.filter((p) => !q || p.name.toLowerCase().includes(q));
		return CATEGORIES.map((c) => ({ ...c, items: items.filter((p) => p.category === c.id) })).filter((g) => g.items.length);
	}, [raw, query]);

	async function handleDelete(id, name) {
		if (!confirm(`¿Borrar "${name}" del menú? No se puede deshacer.`)) return;
		try {
			await deleteComida(local, id);
			setRaw((prev) => {
				const next = { ...prev };
				delete next[id];
				return next;
			});
		} catch {
			setError(`No se pudo borrar "${name}". Probá de nuevo.`);
		}
	}

	if (!raw) return <LoadingScreen label="Cargando productos..." />;

	const total = Object.keys(raw).length;

	return (
		<div className={styles.page}>
			<div className={styles.pageHead}>
				<div>
					<h1 className={styles.h1}>Productos</h1>
					<p className={styles.lead}>{total} en el menú</p>
				</div>
				<Link href={`/dashboard/${local}/agregar`} className={styles.primaryBtn}>
					<Plus size={20} aria-hidden="true" />
					Agregar
				</Link>
			</div>

			<VisitStats local={local} />

			{error && (
				<p className={styles.errorBox} role="alert">
					{error}
				</p>
			)}

			{total > 0 && (
				<div className={styles.search}>
					<Search size={18} aria-hidden="true" />
					<label htmlFor="q" className="visually-hidden">
						Buscar producto
					</label>
					<input id="q" type="search" placeholder="Buscar producto" value={query} onChange={(e) => setQuery(e.target.value)} autoComplete="off" />
				</div>
			)}

			{total === 0 && !error && (
				<div className={styles.emptyBox}>
					<p>Todavía no cargaste productos.</p>
					<Link href={`/dashboard/${local}/agregar`} className={styles.primaryBtn}>
						Agregar el primero
					</Link>
				</div>
			)}

			{total > 0 && groups.length === 0 && <p className={styles.muted}>Ningún producto coincide con “{query}”.</p>}

			{groups.map((g) => (
				<section key={g.id} className={styles.group} aria-labelledby={`g-${g.id}`}>
					<h2 id={`g-${g.id}`} className={styles.h2}>
						{g.label} <span className={styles.count}>{g.items.length}</span>
					</h2>
					<ul className={styles.productList}>
						{g.items.map((p) => (
							<li key={p.id} className={styles.productRow}>
								<ProductImage src={p.image} alt="" className={styles.productImg} width={112} height={112} />
								<div className={styles.productInfo}>
									<p className={styles.productName}>{p.name}</p>
									<p className={styles.productPrice}>
										{formatPrice(p.price)}
										{p.originalPrice && <s>{formatPrice(p.originalPrice)}</s>}
										{p.originalPrice && <span className={styles.badge}>Oferta</span>}
									</p>
								</div>
								<div className={styles.rowActions}>
									<Link href={`/dashboard/${local}/editar/${p.id}`} className={styles.iconBtn} aria-label={`Editar ${p.name}`}>
										<Pencil size={18} aria-hidden="true" />
									</Link>
									<button
										type="button"
										className={`${styles.iconBtn} ${styles.danger}`}
										onClick={() => handleDelete(p.id, p.name)}
										aria-label={`Borrar ${p.name}`}
									>
										<Trash2 size={18} aria-hidden="true" />
									</button>
								</div>
							</li>
						))}
					</ul>
				</section>
			))}
		</div>
	);
}
