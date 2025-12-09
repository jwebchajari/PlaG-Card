"use client";

import CartItem from "./CartItem";
import styles from "./cart.module.css";
import { useState } from "react";

export default function CartList({
    cartItems,
    extraCarne,
    extraPanEspecial,
    updateItemMeat,
    updateItemBread,
    updateCartItemQuantity,
    updateCartItemNotes,
    removeCartItem,
    formatPrice,
    openSection,
    toggleSection
}) {
    const [openGlobal, setOpenGlobal] = useState(true);

    return (
        <div className={styles.globalAccordionBox}>

            {/* 🔵 BOTÓN PRINCIPAL DEL ACORDEÓN GLOBAL */}
            <div
                className={styles.globalAccordionToggle}
                onClick={() => setOpenGlobal((p) => !p)}
            >
                <span>🧾 Ver pedido ({cartItems.length} items)</span>
                <span>{openGlobal ? "▲" : "▼"}</span>
            </div>

            {/* 🔵 CONTENIDO DEL ACORDEÓN */}
            {openGlobal && (
                <div className={styles.globalAccordionContent}>
                    {cartItems.map((item) => (
                        <CartItem
                            key={item.id}
                            item={item}
                            open={openSection[item.id]}
                            toggle={toggleSection}
                            extraCarne={extraCarne}
                            extraPanEspecial={extraPanEspecial}
                            updateItemMeat={updateItemMeat}
                            updateItemBread={updateItemBread}
                            updateCartItemQuantity={updateCartItemQuantity}
                            updateCartItemNotes={updateCartItemNotes}
                            removeCartItem={removeCartItem}
                            formatPrice={formatPrice}
                        />
                    ))}
                </div>
            )}
        </div>
    );
}
