"use client";
import styles from "./AddToCartToast.module.css";

export default function AddToCartToast({ show, productName }) {
    if (!show) return null;

    return (
        <div className={styles.toast}>
            ✅ <strong>{productName}</strong> añadido al carrito
        </div>
    );
}
