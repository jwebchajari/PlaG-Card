"use client";

import Link from "next/link";
import { ShoppingBag, ChevronRight } from "lucide-react";
import { useCart } from "@/lib/cart";
import { formatPrice, linePrice } from "@/lib/site";
import styles from "./menu.module.css";

export function lineUnit(item, extras) {
	return linePrice(
		{ basePrice: item.basePrice ?? item.price, meatCount: item.meatCount, breadType: item.breadType, category: item.category },
		extras
	);
}

export default function CartBar({ extras }) {
	const items = useCart();
	const count = items.reduce((n, it) => n + (Number(it.quantity) || 1), 0);
	const total = items.reduce((n, it) => n + lineUnit(it, extras) * (Number(it.quantity) || 1), 0);

	return (
		<div className={`${styles.cartBarWrap} ${count > 0 ? styles.cartBarShow : ""}`} aria-hidden={count === 0}>
			<Link href="/comprar" className={styles.cartBar} tabIndex={count > 0 ? 0 : -1}>
				<span className={styles.cartIcon}>
					<ShoppingBag size={22} aria-hidden="true" />
					<span className={styles.cartCount}>{count}</span>
				</span>
				<span className={styles.cartLabel}>Ver pedido</span>
				<span className={styles.cartTotal}>{formatPrice(total)}</span>
				<ChevronRight size={20} aria-hidden="true" />
			</Link>
		</div>
	);
}
