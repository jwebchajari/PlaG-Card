import { useState } from "react";
import { formatPrice } from "@/utils/format"; // ⭐ IMPORTANTE
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

    // Lógica por categoría
    const isBurger = category === "hamburguesas";
    const isSandwich = category === "sandwich";

    const extraMeatPrice = isBurger ? (meatCount - 1) * (extraCarne || 0) : 0;
    const extraBreadPrice = breadType !== "comun" ? extraPanEspecial || 0 : 0;

    const finalPrice = precioOferta + extraMeatPrice + extraBreadPrice;

    const handleAdd = () => {
        addToCart({
            ...product,
            meatCount: isBurger ? meatCount : 1,
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
                        <div className={styles.offerBadge}>🔥 {descuento}% OFF</div>
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
                                    ${formatPrice(precioOriginal)}
                                </span>
                                <span className={styles.offerPrice}>
                                    ${formatPrice(finalPrice)}
                                </span>
                            </div>
                        ) : (
                            <span className={styles.price}>
                                ${formatPrice(finalPrice)}
                            </span>
                        )}

                        <button className={styles.addBtn} onClick={handleAdd}>
                            Agregar
                        </button>
                    </div>
                </div>
            </div>

            {/* ---------- PERSONALIZACIÓN ---------- */}
            {(isBurger || isSandwich) && (
                <div className={styles.accordion}>
                    <button
                        className={styles.accordionToggle}
                        onClick={() => setShowExtras((p) => !p)}
                    >
                        {showExtras ? "▼ Personalización" : "► Personalizar pedido"}
                    </button>

                    {showExtras && (
                        <div className={styles.optionsBlock}>

                            {/* SOLO HAMBURGUESA: CARNES */}
                            {isBurger && (
                                <>
                                    <label className={styles.optionLabel}>🍖 Carne:</label>

                                    <div className={styles.optionRow}>
                                        <button
                                            className={styles.selectorBtn}
                                            onClick={() => setMeatCount(m => Math.max(1, m - 1))}
                                        >
                                            -
                                        </button>

                                        <span className={styles.qtyDisplay}>{meatCount}</span>

                                        <button
                                            className={styles.selectorBtn}
                                            disabled={meatCount >= 5}
                                            onClick={() => setMeatCount(m => Math.min(5, m + 1))}
                                        >
                                            +
                                        </button>

                                        {meatCount > 1 && (
                                            <span className={styles.extraText}>
                                                +${formatPrice(extraMeatPrice)}
                                            </span>
                                        )}
                                    </div>
                                </>
                            )}

                            {/* PAN PARA HAMBURGUESA Y SANDWICH */}
                            <label className={styles.optionLabel}>🍞 Pan:</label>
                            <select
                                className={styles.select}
                                value={breadType}
                                onChange={(e) => setBreadType(e.target.value)}
                            >
                                <option value="comun">Común</option>
                                <option value="papa">
                                    Pan de papa (+${formatPrice(extraPanEspecial)})
                                </option>
                                <option value="parmesano">
                                    Parmesano (+${formatPrice(extraPanEspecial)})
                                </option>
                            </select>

                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
