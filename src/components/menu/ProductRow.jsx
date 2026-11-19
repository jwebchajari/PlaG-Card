"use client";

import { Plus } from "lucide-react";
import { formatPrice } from "@/lib/site";
import ProductImage from "./ProductImage";
import styles from "./menu.module.css";

export function discount(p) {
	return p.originalPrice ? Math.round(((p.originalPrice - p.price) / p.originalPrice) * 100) : 0;
}

export default function ProductRow({ product, onOpen }) {
	const off = discount(product);

	return (
		<button type="button" className={styles.row} onClick={onOpen} aria-haspopup="dialog">
			<span className={styles.rowText}>
				<span className={styles.rowName}>{product.name}</span>
				{product.description && <span className={styles.rowDesc}>{product.description}</span>}
				<span className={styles.priceLine}>
					<span className={styles.price}>{formatPrice(product.price)}</span>
					{off > 0 && (
						<>
							<s className={styles.oldPrice}>{formatPrice(product.originalPrice)}</s>
							<span className={styles.offBadge}>-{off}%</span>
						</>
					)}
				</span>
			</span>

			<span className={styles.rowMedia}>
				<ProductImage src={product.image} alt="" className={styles.rowImg} />
				<span className={styles.rowAdd} aria-hidden="true">
					<Plus size={20} strokeWidth={2.75} />
				</span>
			</span>
		</button>
	);
}
