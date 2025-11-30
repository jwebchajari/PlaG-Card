"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button, Form, Alert } from "react-bootstrap";
import { Icon } from "@iconify/react";
import styles from "./ComprarPage.module.css";

export default function ComprarPage() {
    const router = useRouter();

    const [cartItems, setCartItems] = useState([]);
    const [loading, setLoading] = useState(true);

    /* ====================== DATOS DEL LOCAL ====================== */
    const [localWhatsapp, setLocalWhatsapp] = useState("");
    const [localDireccion, setLocalDireccion] = useState("");

    /* ====================== FORM ====================== */
    const [nombre, setNombre] = useState("");
    const [metodo, setMetodo] = useState("retiro");
    const [direccion, setDireccion] = useState("");
    const [obsEntrega, setObsEntrega] = useState("");
    const [sending, setSending] = useState(false);
    const [errorMsg, setErrorMsg] = useState("");

    /* =====================================================
       Cargar datos del local
    ===================================================== */
    useEffect(() => {
        async function load() {
            try {
                const res = await fetch("/api/locales/datos");
                const data = await res.json();

                setLocalWhatsapp(data.whatsapp || "");
                setLocalDireccion(data.direccion || "");
            } catch (err) {
                console.error("Error cargando datos del local:", err);
            }
        }

        load();
    }, []);

    /* =====================================================
       Cargar carrito y NORMALIZARLO
    ===================================================== */
    useEffect(() => {
        if (typeof window === "undefined") return;

        const stored = localStorage.getItem("cartData");
        if (!stored) {
            setLoading(false);
            return;
        }

        try {
            const { items, timestamp } = JSON.parse(stored);
            const diff = Date.now() - timestamp;
            const limit = 3 * 60 * 60 * 1000;

            if (!Array.isArray(items) || diff > limit) {
                localStorage.removeItem("cartData");
                setLoading(false);
                return;
            }

            /* 🔥 NORMALIZAR CADA PRODUCTO 🔥 */
            const normalized = items.map(item => ({
                id: item.id,
                name: item.name || item.nombre || "Producto",
                price: Number(item.price ?? item.valor ?? 0),
                image: item.image || item.imagen || "/logo.png",
                quantity: Number(item.quantity ?? 1),
                notes: item.notes ?? ""
            }));

            setCartItems(normalized);

        } catch (e) {
            console.error("Error cargando carrito:", e);
            localStorage.removeItem("cartData");
        }

        setLoading(false);
    }, []);

    /* =====================================================
       Guardar carrito
    ===================================================== */
    useEffect(() => {
        if (typeof window === "undefined") return;

        if (cartItems.length > 0) {
            localStorage.setItem(
                "cartData",
                JSON.stringify({ items: cartItems, timestamp: Date.now() })
            );
        } else {
            localStorage.removeItem("cartData");
        }
    }, [cartItems]);

    /* =====================================================
       Helpers del carrito
    ===================================================== */
    const updateCartItemQuantity = (id, newQuantity) => {
        setCartItems(prev =>
            prev.map(item =>
                item.id === id
                    ? { ...item, quantity: Math.max(1, newQuantity) }
                    : item
            )
        );
    };

    const updateCartItemNotes = (id, notes) => {
        setCartItems(prev =>
            prev.map(item =>
                item.id === id ? { ...item, notes } : item
            )
        );
    };

    const removeCartItem = id => {
        setCartItems(prev => prev.filter(item => item.id !== id));
    };

    const totalPrice = cartItems.reduce(
        (acc, item) => acc + item.price * item.quantity,
        0
    );

    const showError = msg => {
        setErrorMsg(msg);
        setTimeout(() => setErrorMsg(""), 2500);
    };

    /* =====================================================
       Enviar WhatsApp
    ===================================================== */
    const sendWhatsappOrder = () => {
        if (!nombre.trim()) return showError("Ingresá tu nombre.");
        if (metodo === "envio" && !direccion.trim()) return showError("Ingresá tu dirección.");
        if (cartItems.length === 0) return showError("Tu carrito está vacío.");
        if (!localWhatsapp) return showError("El local no tiene WhatsApp configurado.");

        setSending(true);

        let mensaje = `*Nuevo pedido desde Pintó La Gula*%0A`;
        mensaje += `👤 *Cliente:* ${nombre}%0A`;
        mensaje += `📦 *Método:* ${metodo === "retiro" ? "Retiro en local" : "Envío a domicilio"}%0A`;

        if (metodo === "retiro") {
            mensaje += `📍 *Retira en:* ${localDireccion || "Local"}%0A`;
        }

        if (metodo === "envio") {
            mensaje += `🏠 *Dirección:* ${direccion}%0A`;
            if (obsEntrega.trim())
                mensaje += `📌 *Observaciones:* ${obsEntrega}%0A`;
        }

        mensaje += `%0A*Detalle del pedido:*%0A`;

        cartItems.forEach(item => {
            mensaje += `• ${item.quantity} x ${item.name} — $${(
                item.price * item.quantity
            ).toFixed(2)}%0A`;

            if (item.notes?.trim())
                mensaje += `  📝 Nota: ${item.notes}%0A`;
        });

        mensaje += `%0A💵 *Total:* $${totalPrice.toFixed(2)}%0A`;

        const url = `https://wa.me/${localWhatsapp}?text=${mensaje}`;
        window.open(url, "_blank");

        setTimeout(() => {
            setSending(false);
            router.push("/");
        }, 800);
    };

    /* =====================================================
       Render
    ===================================================== */

    const handleBack = () => router.push("/");

    if (loading) {
        return (
            <div className={styles.loadingScreen}>
                <p>Cargando carrito…</p>
            </div>
        );
    }

    if (!loading && cartItems.length === 0) {
        return (
            <div className={styles.emptyScreen}>
                <Icon icon="lucide:shopping-bag" width={60} className={styles.emptyIcon} />
                <h4 className="mb-2">Tu carrito está vacío</h4>
                <p className="text-muted mb-4">Volvé al menú y agregá algo 🍔</p>
                <Button variant="primary" onClick={handleBack}>Volver al menú</Button>
            </div>
        );
    }

    return (
        <div className={styles.container}>

            {/* CABECERA */}
            <div className={styles.headerRow}>
                <Button variant="link" className={styles.backBtn} onClick={handleBack}>
                    <Icon icon="mdi:chevron-left" width={22} />
                    <span>Seguir comprando</span>
                </Button>
                <h3 className="m-0 fw-bold">Tu pedido</h3>
                <div style={{ width: 90 }} />
            </div>

            {errorMsg && (
                <Alert variant="danger" className={styles.alert}>{errorMsg}</Alert>
            )}

            {/* ITEMS */}
            <div className="mb-3">
                {cartItems.map(item => (
                    <div key={item.id} className={styles.cardItem}>
                        <img src={item.image} alt={item.name} className={styles.cardImg} />

                        <div className="flex-grow-1">
                            <div className={styles.cardHead}>
                                <div>
                                    <h6 className={styles.cardTitle}>{item.name}</h6>
                                    <p className={styles.cardSub}>
                                        ${item.price} x {item.quantity} = $
                                        {(item.price * item.quantity).toFixed(2)}
                                    </p>
                                </div>

                                <button
                                    className={styles.removeBtn}
                                    onClick={() => removeCartItem(item.id)}
                                >
                                    <Icon icon="lucide:trash-2" width={18} />
                                </button>
                            </div>

                            <div className={styles.qtyRow}>
                                <Button
                                    size="sm"
                                    variant="outline-secondary"
                                    className={styles.qtyBtn}
                                    onClick={() => updateCartItemQuantity(item.id, item.quantity - 1)}
                                    disabled={item.quantity <= 1}
                                >
                                    -
                                </Button>

                                <span className="fw-bold">{item.quantity}</span>

                                <Button
                                    size="sm"
                                    variant="outline-secondary"
                                    className={styles.qtyBtn}
                                    onClick={() => updateCartItemQuantity(item.id, item.quantity + 1)}
                                >
                                    +
                                </Button>
                            </div>

                            <Form.Control
                                size="sm"
                                placeholder="Notas (sin cebolla, extra cheddar...)"
                                value={item.notes || ""}
                                onChange={(e) => updateCartItemNotes(item.id, e.target.value)}
                            />
                        </div>
                    </div>
                ))}
            </div>

            {/* TOTAL */}
            <div className={styles.totalRow}>
                <span className={styles.totalLabel}>Total:</span>
                <span className={styles.totalPrice}>${totalPrice.toFixed(2)}</span>
            </div>

            {/* FORM */}
            <div className="mb-4">
                <Form.Label>Tu nombre</Form.Label>
                <Form.Control value={nombre} onChange={(e) => setNombre(e.target.value)} />

                <Form.Label className="mt-3">Método de entrega</Form.Label>
                <div className={styles.radioRow}>
                    <Form.Check
                        type="radio"
                        label="Retiro en el local"
                        checked={metodo === "retiro"}
                        onChange={() => setMetodo("retiro")}
                    />
                    <Form.Check
                        type="radio"
                        label="Envío a domicilio"
                        checked={metodo === "envio"}
                        onChange={() => setMetodo("envio")}
                    />
                </div>

                {metodo === "envio" && (
                    <>
                        <Form.Label className="mt-3">Dirección</Form.Label>
                        <Form.Control
                            value={direccion}
                            onChange={(e) => setDireccion(e.target.value)}
                        />

                        <Form.Label className="mt-3">Observaciones</Form.Label>
                        <Form.Control
                            value={obsEntrega}
                            onChange={(e) => setObsEntrega(e.target.value)}
                        />
                    </>
                )}
            </div>

            {/* ACCIONES */}
            <div className={styles.actionRow}>
                <Button variant="outline-secondary" className={styles.secondaryBtn} onClick={handleBack}>
                    ← Seguir comprando
                </Button>

                <Button className={styles.whatsappBtn} onClick={sendWhatsappOrder} disabled={sending}>
                    {sending ? (
                        <>
                            <span className="spinner-border spinner-border-sm me-2" />
                            Enviando...
                        </>
                    ) : (
                        <>
                            <Icon icon="logos:whatsapp-icon" width={22} className="me-2" />
                            Enviar pedido por WhatsApp
                        </>
                    )}
                </Button>
            </div>
        </div>
    );
}
