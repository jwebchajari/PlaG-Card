import { useState } from "react";
import styles from "./ProductCard.module.css";

export default function ProductCard({
    product,
    addToCart,
    onImageClick,
    category,
    extraCarne,
    extraPanEspecial,
}) {
    const enOferta = product.oferta && product.valorOferta;
    const precioOriginal = Number(product.valorOriginal || product.price);
    const precioOferta = Number(product.valorOferta || product.price);

    const [meatCount, setMeatCount] = useState(1);
    const [breadType, setBreadType] = useState("comun");
    const [showExtras, setShowExtras] = useState(false);

    const isBurgerOrSandwich =
        category === "hamburguesas" || category === "sandwich";

    const extraMeatPrice = (meatCount - 1) * (extraCarne || 0);
    const extraBreadPrice = breadType !== "comun" ? extraPanEspecial || 0 : 0;

    const finalPrice = precioOferta + extraMeatPrice + extraBreadPrice;

    const handleAdd = () => {
        addToCart({
            ...product,
            meatCount,
            breadType,
            price: precioOferta,
            extraMeatPrice,
            extraBreadPrice,
        });
    };

    let descuento = 0;
    if (enOferta && precioOriginal > precioOferta) {
        descuento = Math.round(
            ((precioOriginal - precioOferta) / precioOriginal) * 100
        );
    }

    return (
        <div className={styles.card}>
            {/* ---------- PARTE SUPERIOR ---------- */}
            <div className={styles.topRow}>
                <div className={styles.imgWrapper}>
                    {enOferta && (
                        <div className={styles.offerBadge}>
                            🔥 {descuento}% OFF
                        </div>
                    )}

                    <img
                        src={product.image}
                        className={styles.img}
                        onClick={() => onImageClick(product)}
                        alt={product.name}
                    />
                </div>

                <div className={styles.info}>
                    <h3 className={styles.title}>{product.name}</h3>
                    <p className={styles.desc}>{product.description}</p>

                    <div className={styles.priceAndButton}>
                        {enOferta ? (
                            <div className={styles.priceBox}>
                                <span className={styles.oldPrice}>
                                    ${precioOriginal}
                                </span>
                                <span className={styles.offerPrice}>
                                    ${finalPrice}
                                </span>
                            </div>
                        ) : (
                            <span className={styles.price}>${finalPrice}</span>
                        )}

                        <button className={styles.addBtn} onClick={handleAdd}>
                            Agregar
                        </button>
                    </div>
                </div>
            </div>

            {/* ---------- ACORDEÓN DE PERSONALIZACIÓN ---------- */}
            {isBurgerOrSandwich && (
                <div className={styles.accordion}>
                    <button
                        className={styles.accordionToggle}
                        onClick={() => setShowExtras((p) => !p)}
                    >
                        {showExtras ? "▼ Personalización" : "► Personalizar pedido"}
                    </button>

                    {showExtras && (
                        <div className={styles.optionsBlock}>
                            {/* CARNES */}
                            <label className={styles.optionLabel}>Carne:</label>
                            <div className={styles.optionRow}>
                                <button
                                    className={styles.selectorBtn}
                                    onClick={() =>
                                        setMeatCount((m) => Math.max(1, m - 1))
                                    }
                                >
                                    -
                                </button>

                                <span className={styles.qtyDisplay}>
                                    {meatCount}
                                </span>

                                <button
                                    className={styles.selectorBtn}
                                    disabled={meatCount >= 5}
                                    onClick={() =>
                                        setMeatCount((m) => Math.min(5, m + 1))
                                    }
                                >
                                    +
                                </button>

                                {meatCount > 1 && (
                                    <span className={styles.extraText}>
                                        +${extraMeatPrice}
                                    </span>
                                )}
                            </div>

                            {/* PAN */}
                            <label className={styles.optionLabel}>Pan:</label>
                            <select
                                className={styles.select}
                                value={breadType}
                                onChange={(e) => setBreadType(e.target.value)}
                            >
                                <option value="comun">Común</option>
                                <option value="papa">
                                    Pan de papa (+${extraPanEspecial})
                                </option>
                                <option value="parmesano">
                                    Parmesano (+${extraPanEspecial})
                                </option>
                            </select>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
