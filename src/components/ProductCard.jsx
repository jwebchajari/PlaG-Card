import styles from "./ProductCard.module.css";

export default function ProductCard({ product, addToCart, onImageClick }) {
    return (
        <div className={styles.card}>
            <img
                src={product.image}
                alt={product.name}
                className={styles.img}
                onClick={() => onImageClick(product)}
            />

            <div className={styles.info}>
                <h3 className={styles.title}>{product.name}</h3>
                <p className={styles.desc}>{product.description}</p>

                <div className={styles.bottomRow}>
                    <span className={styles.price}>${product.price.toFixed(2)}</span>

                    <button className={styles.addBtn} onClick={() => addToCart(product)}>
                        Agregar
                    </button>
                </div>
            </div>
        </div>
    );
}
