"use client";

import { useEffect, useState, useCallback, useRef, useMemo } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Alert } from "react-bootstrap";
import { Icon } from "@iconify/react";

import styles from "./ComprarPage.module.css";

import CartList from "./components/CartList";
import BuyerForm from "./components/BuyerForm";
import TotalRow from "./components/TotalRow";
import WhatsappButton from "./components/WhatsappButton";

export default function ComprarPage() {
  const router = useRouter();

  /* ====================== Helpers ====================== */
  const formatPrice = (num) => new Intl.NumberFormat("es-AR").format(num);

  /* ====================== Estados ====================== */
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);

  const [localWhatsapp, setLocalWhatsapp] = useState("");
  const [localDireccion, setLocalDireccion] = useState("");
  const [localAlias, setLocalAlias] = useState("");

  const [extraCarne, setExtraCarne] = useState(1500);
  const [extraPanEspecial, setExtraPanEspecial] = useState(0);

  const [nombre, setNombre] = useState("");
  const [metodo, setMetodo] = useState("retiro");
  const [metodoPago, setMetodoPago] = useState("efectivo");
  const [direccion, setDireccion] = useState("");
  const [obsEntrega, setObsEntrega] = useState("");

  const [sending, setSending] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [errors, setErrors] = useState({}); // ⬅ errores por campo

  const [openSection, setOpenSection] = useState({});

  const toggleSection = (id) => {
    setOpenSection((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  /* ====================== Refs ====================== */

  const nombreRef = useRef(null);
  const direccionRef = useRef(null);
  const metodoPagoRef = useRef(null);

  const scrollToRef = (ref) => {
    if (ref.current) {
      ref.current.scrollIntoView({ behavior: "smooth", block: "center" });
      ref.current.focus?.();
    }
  };

  /* ====================== Cargar datos del local ====================== */

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch("/api/locales/datos");
        const data = await res.json();

        setLocalWhatsapp(data.whatsapp || "");
        setLocalDireccion(data.direccion || "");
        setLocalAlias(data.alias || "");

        setExtraCarne(data.extras?.carne || 1500);
        setExtraPanEspecial(data.extras?.panEspecial || 0);
      } catch (e) {
        console.error("Error cargando datos del local:", e);
      }
    }
    load();
  }, []);

  /* ====================== Cargar carrito ====================== */

  useEffect(() => {
    if (typeof window === "undefined") return;

    const stored = localStorage.getItem("cartData");

    if (stored) {
      try {
        const { items, timestamp } = JSON.parse(stored);
        if (Date.now() - timestamp < 3 * 60 * 60 * 1000) {
          setCartItems(items);
        } else {
          localStorage.removeItem("cartData");
        }
      } catch {
        localStorage.removeItem("cartData");
      }
    }

    setLoading(false);
  }, []);

  /* ====================== Guardar carrito ====================== */

  useEffect(() => {
    if (cartItems.length > 0) {
      localStorage.setItem(
        "cartData",
        JSON.stringify({ items: cartItems, timestamp: Date.now() })
      );
    } else {
      localStorage.removeItem("cartData");
    }
  }, [cartItems]);

  /* ====================== Helpers carrito ====================== */

  const updateItemMeat = (id, newCount) => {
    setCartItems((prev) =>
      prev.map((item) =>
        item.id === id
          ? {
            ...item,
            meatCount: Math.max(1, Math.min(5, newCount)), // MAX 5
            extraMeatPrice:
              Math.max(0, Math.min(5, newCount) - 1) * extraCarne,
          }
          : item
      )
    );
  };

  const updateItemBread = (id, breadType) => {
    setCartItems((prev) =>
      prev.map((item) =>
        item.id === id
          ? {
            ...item,
            breadType,
            extraBreadPrice:
              breadType === "Berly" ? 0 : extraPanEspecial,
          }
          : item
      )
    );
  };

  const updateCartItemQuantity = (id, qty) => {
    setCartItems((prev) =>
      prev.map((item) =>
        item.id === id
          ? { ...item, quantity: Math.max(1, qty) }
          : item
      )
    );
  };

  const updateCartItemNotes = (id, notes) => {
    setCartItems((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, notes } : item
      )
    );
  };

  const removeCartItem = (id) => {
    setCartItems((prev) => prev.filter((i) => i.id !== id));
  };

  /* ====================== TOTAL ====================== */

  const totalPrice = useMemo(() => {
    return cartItems.reduce((acc, item) => {
      const finalUnit =
        item.price +
        (item.extraMeatPrice || 0) +
        (item.extraBreadPrice || 0);

      return acc + finalUnit * item.quantity;
    }, 0);
  }, [cartItems]);

  /* ====================== WhatsApp Builder ====================== */

  const buildItemMessage = (item) => {
    const br = "%0A";
    const isBurger = item.category === "hamburguesas";
    const isSandwich = item.category === "sandwich";

    let msg = `• ${item.quantity} × ${item.name}`;
    const finalUnit =
      item.price + (item.extraMeatPrice || 0) + (item.extraBreadPrice || 0);

    msg += ` — $${formatPrice(finalUnit * item.quantity)}${br}`;

    if (isBurger) msg += `   🍖 Carnes: ${item.meatCount}${br}`;
    if (isBurger || isSandwich) msg += `   🍞 Pan: ${item.breadType}${br}`;
    if (item.notes?.trim()) msg += `   📝 Nota: ${item.notes}${br}`;

    return msg + br;
  };

  /* ====================== Enviar WhatsApp ====================== */

  const sendWhatsappOrder = useCallback(() => {
    const newErrors = {};

    // Validaciones
    if (!nombre.trim()) newErrors.nombre = "Debés escribir tu nombre.";
    if (metodo === "envio" && !direccion.trim())
      newErrors.direccion = "Debés ingresar una dirección.";
    // Si quisieras validar método de pago solo si no tiene default:
    // if (!metodoPago) newErrors.metodoPago = "Debés elegir un método de pago.";

    setErrors(newErrors);

    if (Object.keys(newErrors).length > 0) {
      setErrorMsg("Faltan completar algunos datos obligatorios.");

      if (newErrors.nombre) scrollToRef(nombreRef);
      else if (newErrors.direccion) scrollToRef(direccionRef);
      else if (newErrors.metodoPago) scrollToRef(metodoPagoRef);

      return;
    }

    if (cartItems.length === 0) {
      setErrorMsg("Tu carrito está vacío.");
      return;
    }

    const phoneDigits = (localWhatsapp || "").replace(/\D/g, "");
    if (!phoneDigits) {
      setErrorMsg("El local no tiene WhatsApp configurado.");
      return;
    }

    setSending(true);

    const br = "%0A";

    let msg = `🛎️ *Nuevo pedido desde Pintó La Gula* ${br}${br}`;
    msg += `👤 *Cliente:* ${nombre}${br}`;
    msg += `🚚 *Entrega:* ${metodo}${br}`;
    msg += `💳 *Pago:* ${metodoPago}${br}${br}`;

    if (metodo === "envio") {
      msg += `🏠 Dirección: ${direccion}${br}`;
      if (obsEntrega.trim()) msg += `📌 Observaciones: ${obsEntrega}${br}`;
    }

    msg += `${br}🛒 *Pedido:*${br}`;
    cartItems.forEach((item) => (msg += buildItemMessage(item)));

    msg += `💵 *TOTAL:* $${formatPrice(totalPrice)}${br}${br}`;
    msg += `🙏 ¡Gracias por tu compra!`;

    window.open(`https://wa.me/${phoneDigits}?text=${msg}`, "_blank");

    setTimeout(() => {
      setSending(false);
      router.push("/");
    }, 900);
  }, [
    nombre,
    metodo,
    metodoPago,
    direccion,
    obsEntrega,
    cartItems,
    totalPrice,
    localWhatsapp,
    router,
  ]);

  /* ====================== RENDER ====================== */

  if (loading)
    return (
      <div className={styles.loadingScreen}>
        <p>Cargando carrito…</p>
      </div>
    );

  if (!loading && cartItems.length === 0)
    return (
      <div className={styles.emptyScreen}>
        <Icon icon="lucide:shopping-bag" width={60} className={styles.emptyIcon} />
        <h4 className="mb-2">Tu carrito está vacío</h4>
        <p className="text-muted mb-4">Volvé al menú y agregá algo rico 🍔</p>
        <Link href="/" className="btn btn-primary">
          Volver al menú
        </Link>
      </div>
    );

  return (
    <div className={styles.container}>
      {/* HEADER */}
      <div className={styles.headerRow}>
        <Link href="/" className={styles.backBtn}>
          <Icon icon="mdi:chevron-left" width={22} />
          <span>Seguir comprando</span>
        </Link>
        <div style={{ width: 100 }} />
      </div>

      {errorMsg && <Alert className={styles.alert}>{errorMsg}</Alert>}

      <CartList
        cartItems={cartItems}
        extraCarne={extraCarne}
        extraPanEspecial={extraPanEspecial}
        updateItemMeat={updateItemMeat}
        updateItemBread={updateItemBread}
        updateCartItemQuantity={updateCartItemQuantity}
        updateCartItemNotes={updateCartItemNotes}
        removeCartItem={removeCartItem}
        formatPrice={formatPrice}
        openSection={openSection}
        toggleSection={toggleSection}
      />

      {/* TOTAL */}
      <TotalRow total={totalPrice} formatPrice={formatPrice} />

      {/* FORMULARIO (con refs para scroll) */}
      <div ref={nombreRef}></div>
      <BuyerForm
        nombre={nombre}
        setNombre={setNombre}
        metodo={metodo}
        setMetodo={setMetodo}
        direccion={direccion}
        setDireccion={setDireccion}
        obsEntrega={obsEntrega}
        setObsEntrega={setObsEntrega}
        metodoPago={metodoPago}
        setMetodoPago={setMetodoPago}
        localAlias={localAlias}
        errors={errors}
      />
      <div ref={direccionRef}></div>
      <div ref={metodoPagoRef}></div>

      {/* BOTONES */}
      <div className={styles.actionRow}>
        <WhatsappButton
          sendWhatsappOrder={sendWhatsappOrder}
          sending={sending}
        />

        <Link href="/" className={`btn ${styles.secondaryBtn}`}>
          ← Seguir comprando
        </Link>
      </div>
    </div>
  );
}
