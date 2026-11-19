"use client";

import { useState } from "react";
import ProductRow from "@/components/menu/ProductRow";
import ProductImage from "@/components/menu/ProductImage";
import { SITE_NAME, formatPrice } from "@/lib/site";
import styles from "./preview.module.css";

const VIEWS = [
	{ id: "menu", label: "En el menú" },
	{ id: "detalle", label: "Al abrirlo" },
	{ id: "whatsapp", label: "En WhatsApp" },
];

/** Builds the public product shape from the dashboard form values. */
export function previewProduct({ nombre, descripcion, valor, oferta, valorOferta, categoria }, image) {
	const v = Number(valor) || 0;
	const o = Number(valorOferta) || 0;
	const enOferta = Boolean(oferta) && o > 0 && o < v;
	return {
		id: "preview",
		name: (nombre || "").trim() || "Nombre del producto",
		description: (descripcion || "").trim(),
		price: enOferta ? o : v,
		originalPrice: enOferta ? v : null,
		image: image || "",
		category: categoria,
	};
}

/**
 * Renders the product with the real menu components, so the owner sees
 * exactly what customers will see.
 */
export default function PublishPreview({ product, compact = false }) {
	const [view, setView] = useState("menu");

	return (
		<section className={styles.wrap} aria-label="Vista previa de la publicación">
			<div className={styles.tabs} role="tablist" aria-label="Dónde se ve">
				{VIEWS.map((v) => (
					<button
						key={v.id}
						type="button"
						role="tab"
						aria-selected={view === v.id}
						className={styles.tab}
						onClick={() => setView(v.id)}
					>
						{v.label}
					</button>
				))}
			</div>

			<div className={`${styles.stage} ${compact ? styles.stageCompact : ""}`} role="tabpanel">
				{view === "menu" && (
					<div className={styles.menuFrame} inert="">
						<ProductRow product={product} onOpen={() => {}} />
					</div>
				)}

				{view === "detalle" && (
					<div className={styles.detail}>
						<ProductImage src={product.image} alt="" className={styles.detailImg} width={800} height={500} eager />
						<div className={styles.detailBody}>
							<p className={styles.detailName}>{product.name}</p>
							{product.description && <p className={styles.detailDesc}>{product.description}</p>}
							<p className={styles.detailPrice}>{formatPrice(product.price)}</p>
						</div>
					</div>
				)}

				{view === "whatsapp" && (
					<div className={styles.chat}>
						<div className={styles.bubble}>
							<div className={styles.card}>
								<div className={styles.cardPhoto}>
									<ProductImage src={product.image} alt="" className={styles.cardImg} width={480} height={500} eager />
								</div>
								<div className={styles.cardPanel}>
									<span className={styles.cardBrand}>{SITE_NAME}</span>
									<span className={styles.cardName}>{product.name}</span>
									<span className={styles.cardPrice}>{formatPrice(product.price)}</span>
								</div>
							</div>
							<div className={styles.linkMeta}>
								<strong>
									{product.name} · {formatPrice(product.price)}
								</strong>
								<span>pla-g-card.vercel.app</span>
							</div>
						</div>
					</div>
				)}
			</div>
			<p className={styles.note}>
				{view === "menu" && "La foto se recorta en cuadrado en la lista del menú."}
				{view === "detalle" && "Al tocar el producto, la foto se ve apaisada arriba de todo."}
				{view === "whatsapp" && "Así aparece la vista previa cuando alguien comparte este producto."}
			</p>
		</section>
	);
}
