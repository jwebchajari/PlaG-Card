"use client";

import { Button, Form } from "react-bootstrap";
import { Icon } from "@iconify/react";
import styles from "../ComprarPage.module.css";

export default function CartItem({
  item,
  open,
  toggle,
  extraCarne,
  extraPanEspecial,
  updateItemMeat,
  updateItemBread,
  updateCartItemQuantity,
  updateCartItemNotes,
  removeCartItem,
  formatPrice,
}) {
  if (!item) return null;

  const isBurger = item.category === "hamburguesas";
  const isSandwich = item.category === "sandwich";

  const finalUnitPrice =
    item.price + (item.extraMeatPrice || 0) + (item.extraBreadPrice || 0);

  const itemTotal = finalUnitPrice * item.quantity;

  return (
    <div className={styles.cardItem}>

      {/* ======================= */}
      {/*   IMAGEN + TEXTO        */}
      {/* ======================= */}
      <div style={{ display: "flex", width: "100%", gap: "14px" }}>
        
        {/* IMAGEN */}
        <img src={item.image} alt={item.name} className={styles.cardImg} />

        {/* TEXTOS */}
        <div style={{ flexGrow: 1 }}>
          {/* HEADER */}
          <div className={styles.cardHead}>
            <div>
              <h6 className={styles.cardTitle}>{item.name}</h6>
              <p className={styles.cardSub}>
                ${formatPrice(finalUnitPrice)} × {item.quantity} =
                <b> ${formatPrice(itemTotal)}</b>
              </p>
            </div>

            <button
              className={styles.removeBtn}
              onClick={() => removeCartItem(item.id)}
            >
              <Icon icon="lucide:trash-2" width={18} />
            </button>
          </div>

          {/* CANTIDAD (Ahora está dentro del bloque superior y queda bien alineado) */}
          <div className={styles.optionBox}>
            <label>Cantidad</label>

            <div className={styles.counterRow}>
              <Button
                size="sm"
                variant="light"
                onClick={() =>
                  updateCartItemQuantity(item.id, item.quantity - 1)
                }
                disabled={item.quantity <= 1}
              >
                -
              </Button>

              <span className={styles.counterValue}>{item.quantity}</span>

              <Button
                size="sm"
                variant="light"
                onClick={() =>
                  updateCartItemQuantity(item.id, item.quantity + 1)
                }
              >
                +
              </Button>

              <span className={styles.itemTotal}>
                Total: ${formatPrice(itemTotal)}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* ======================= */}
      {/*   BOTÓN PERSONALIZAR    */}
      {/* ======================= */}
      <div
        className={styles.accordionToggle}
        onClick={() => toggle(item.id)}
        style={{ width: "100%" }}
      >
        <span>⚙ Personalizar</span>
        <span>{open ? "▲" : "▼"}</span>
      </div>

      {/* ======================= */}
      {/*   ACORDEÓN FOOTER       */}
      {/* ======================= */}
      {open && (
        <div className={styles.accordionContent}>

          {/* CARNES */}
          {isBurger && (
            <div className={styles.optionBox}>
              <label>🍖 Carnes</label>

              <div className={styles.counterRow}>
                <Button
                  size="sm"
                  variant="light"
                  onClick={() => updateItemMeat(item.id, item.meatCount - 1)}
                  disabled={item.meatCount <= 1}
                >
                  -
                </Button>

                <span className={styles.counterValue}>{item.meatCount}</span>

                <Button
                  size="sm"
                  variant="light"
                  onClick={() =>
                    updateItemMeat(item.id, Math.min(5, item.meatCount + 1))
                  }
                  disabled={item.meatCount >= 5}
                >
                  +
                </Button>

                {item.extraMeatPrice > 0 && (
                  <span className={styles.extraTag}>
                    +${formatPrice(item.extraMeatPrice)}
                  </span>
                )}
              </div>
            </div>
          )}

          {/* PAN */}
          {(isBurger || isSandwich) && (
            <div className={styles.optionBox}>
              <label>🍞 Pan</label>

              <select
                className={styles.select}
                value={item.breadType}
                onChange={(e) => updateItemBread(item.id, e.target.value)}
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

          {/* NOTAS */}
          <div className={styles.optionBox}>
            <label>📝 Notas</label>
            <Form.Control
              size="sm"
              placeholder="Sin cebolla, extra salsa..."
              value={item.notes || ""}
              onChange={(e) => updateCartItemNotes(item.id, e.target.value)}
            />
          </div>
        </div>
      )}
    </div>
  );
}
