import styles from "./ProductCard.module.css";

export default function ProductCard({ product, addToCart, onImageClick }) {
    const enOferta = product.oferta && product.valorOferta;
    const precioOriginal = Number(product.valorOriginal || product.price);
    const precioOferta = Number(product.valorOferta || product.price);

    // Calculo del descuento
    let descuento = 0;
    if (enOferta && precioOriginal > precioOferta) {
        descuento = Math.round(((precioOriginal - precioOferta) / precioOriginal) * 100);
    }

    return (
        <div className={styles.card}>
            
            {/* BADGE DE OFERTA */}
            {enOferta && (
                <div className={styles.offerBadge}>
                    🔥 {descuento}% OFF
                </div>
            )}

            {/* IMAGEN */}
            <img
                src={product.image}
                alt={product.name}
                className={styles.img}
                onClick={() => onImageClick(product)}
            />

            {/* INFO */}
            <div className={styles.info}>
                <h3 className={styles.title}>{product.name}</h3>
                <p className={styles.desc}>{product.description}</p>

                {/* PRECIOS */}
                <div className={styles.bottomRow}>
                    <div className={styles.priceBox}>
                        {enOferta ? (
                            <>
                                <span className={styles.oldPrice}>${precioOriginal}</span>
                                <span className={styles.offerPrice}>${precioOferta}</span>
                            </>
                        ) : (
                            <span className={styles.price}>${product.price.toFixed(2)}</span>
                        )}
                    </div>

                    <button
                        className={styles.addBtn}
                        onClick={() => addToCart(product)}
                    >
                        Agregar
                    </button>
                </div>
            </div>
        </div>
    );
}
