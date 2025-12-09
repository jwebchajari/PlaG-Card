import styles from "../ComprarPage.module.css";

export default function TotalRow({ total, formatPrice }) {
    return (
        <div className={styles.totalRow}>
            <span className={styles.totalLabel}>Total:</span>
            <span className={styles.totalPrice}>${formatPrice(total)}</span>
        </div>
    );
}
