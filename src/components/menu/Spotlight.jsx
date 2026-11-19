"use client";

import { ArrowRight } from "lucide-react";
import ShareButton from "@/components/ui/ShareButton";
import { SITE_NAME, formatPrice, productUrl } from "@/lib/site";
import ProductImage from "./ProductImage";
import { discount } from "./ProductRow";
import styles from "./menu.module.css";

/** Featured product on /producto/[id]: the page's own H1. */
export default function Spotlight({ product, onOpen }) {
	const off = discount(product);
	return (
		<article className={styles.spotlight} aria-labelledby="spotlight-title">
			<ProductImage src={product.image} alt={product.name} className={styles.spotlightImg} eager width={800} height={500} />
			<div className={styles.spotlightBody}>
				<h1 id="spotlight-title" className={styles.spotlightTitle}>
					{product.name}
				</h1>
				{product.description && <p className={styles.sheetDesc}>{product.description}</p>}
				<p className={styles.priceLine}>
					<span className={styles.priceLg}>{formatPrice(product.price)}</span>
					{off > 0 && (
						<>
							<s className={styles.oldPrice}>{formatPrice(product.originalPrice)}</s>
							<span className={styles.offBadge}>-{off}%</span>
						</>
					)}
				</p>
				<div className={styles.spotlightActions}>
					<button type="button" className={styles.addBtn} onClick={onOpen} aria-haspopup="dialog">
						<span>Pedir</span>
						<ArrowRight size={20} aria-hidden="true" />
					</button>
					<ShareButton
						className={styles.shareInline}
						label="Compartir"
						text={`${product.name} en ${SITE_NAME}:`}
						url={productUrl(product.id)}
					/>
				</div>
			</div>
		</article>
	);
}
