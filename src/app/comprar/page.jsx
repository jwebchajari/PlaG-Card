"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button, Form, Alert } from "react-bootstrap";
import { Icon } from "@iconify/react";
import styles from "./ComprarPage.module.css";

export default function ComprarPage() {
    const router = useRouter();

    /* ====================== Estados ====================== */
    const [cartItems, setCartItems] = useState([]);
    const [loading, setLoading] = useState(true);

    const [localWhatsapp, setLocalWhatsapp] = useState("");
    const [localDireccion, setLocalDireccion] = useState("");
    const [localAlias, setLocalAlias] = useState("");

    const [nombre, setNombre] = useState("");
    const [metodo, setMetodo] = useState("retiro");
    const [metodoPago, setMetodoPago] = useState("efectivo");
    const [direccion, setDireccion] = useState("");
    const [obsEntrega, setObsEntrega] = useState("");

    const [sending, setSending] = useState(false);
    const [errorMsg, setErrorMsg] = useState("");
    const [copied, setCopied] = useState(false);

    /* ====================== Refs para scroll ====================== */
    const nombreRef = useRef(null);
    const direccionRef = useRef(null);
    const metodoPagoRef = useRef(null);

    const scrollToRef = (ref) => {
        if (ref?.current) {
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
            } catch (err) {
                console.error("Error cargando datos del local:", err);
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
                const diff = Date.now() - timestamp;

                if (diff < 3 * 60 * 60 * 1000 && Array.isArray(items) && items.length > 0) {
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

    /* ====================== Helpers carrito ====================== */

    const updateCartItemQuantity = (id, qty) => {
        setCartItems((prev) =>
            prev.map((item) => (item.id === id ? { ...item, quantity: Math.max(1, qty) } : item))
        );
    };

    const updateCartItemNotes = (id, notes) => {
        setCartItems((prev) =>
            prev.map((item) => (item.id === id ? { ...item, notes } : item))
        );
    };

    const removeCartItem = (id) =>
        setCartItems((prev) => prev.filter((i) => i.id !== id));

    const totalPrice = cartItems.reduce(
        (acc, item) => acc + item.price * item.quantity,
        0
    );

    const showError = (msg) => {
        setErrorMsg(msg);
        setTimeout(() => setErrorMsg(""), 2500);
    };

    /* ====================== Copiar alias ====================== */
    const copyAlias = async () => {
        try {
            await navigator.clipboard.writeText(localAlias);
            setCopied(true);
            setTimeout(() => setCopied(false), 1500);
        } catch {
            alert("No se pudo copiar el alias.");
        }
    };

    /* ====================== Enviar WhatsApp ====================== */
    const sendWhatsappOrder = useCallback(() => {
        if (!nombre.trim()) {
            showError("Debés escribir tu nombre.");
            scrollToRef(nombreRef);
            return;
        }

        if (metodo === "envio" && !direccion.trim()) {
            showError("Debés ingresar una dirección.");
            scrollToRef(direccionRef);
            return;
        }

        if (!metodoPago) {
            showError("Elegí un método de pago.");
            scrollToRef(metodoPagoRef);
            return;
        }

        if (cartItems.length === 0) {
            showError("Tu carrito está vacío.");
            return;
        }

        const phoneDigits = (localWhatsapp || "").replace(/\D/g, "");
        if (!phoneDigits) {
            showError("El local no tiene WhatsApp configurado.");
            return;
        }

        setSending(true);

        const br = "%0A";

        let msg = `🛎️ *Nuevo pedido desde Pintó La Gula* ${br}${br}`;
        msg += `👤 *Cliente:* ${nombre}${br}`;
        msg += `🚚 *Entrega:* ${metodo === "retiro" ? "Retiro en el local" : "Envío a domicilio"}${br}`;
        msg += `💳 *Pago:* ${metodoPago === "efectivo" ? "Efectivo" : "Transferencia"}${br}`;

        if (metodoPago === "transferencia" && localAlias) {
            msg += `🏦 *Alias:* ${localAlias}${br}`;
            msg += `📎 Enviar comprobante luego de la transferencia.${br}`;
        }

        if (metodo === "envio") {
            msg += `${br}🏠 *Dirección:* ${direccion}${br}`;
            if (obsEntrega.trim()) msg += `📌 *Observaciones:* ${obsEntrega}${br}`;
        } else {
            msg += `${br}📍 *Retira en:* ${localDireccion || "Local"}${br}`;
        }

        msg += `${br}🛒 *Pedido:*${br}`;
        cartItems.forEach((item) => {
            msg += `• ${item.quantity} × ${item.name} — $${(item.price * item.quantity).toFixed(
                2
            )}${br}`;
            if (item.notes?.trim()) msg += `  📝 Nota: ${item.notes}${br}`;
        });

        msg += `${br}💵 *Total:* $${totalPrice.toFixed(2)}${br}`;
        msg += `${br}🙏 ¡Gracias por tu compra!`;

        const url = `https://wa.me/${phoneDigits}?text=${msg}`;
        window.open(url, "_blank");

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
        localDireccion,
        localAlias,
        router
    ]);

    /* ====================== Render ====================== */

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

                <h3 className="m-0 fw-bold">Tu pedido</h3>

                <div style={{ width: 90 }} />
            </div>

            {errorMsg && (
                <Alert variant="danger" className={styles.alert}>
                    {errorMsg}
                </Alert>
            )}

            {/* ITEMS */}
            <div className="mb-3">
                {cartItems.map((item) => (
                    <div key={item.id} className={styles.cardItem}>
                        <img src={item.image} alt={item.name} className={styles.cardImg} />

                        <div className="flex-grow-1">
                            <div className={styles.cardHead}>
                                <div>
                                    <h6 className={styles.cardTitle}>{item.name}</h6>
                                    <p className={styles.cardSub}>
                                        ${item.price} × {item.quantity} = ${" "}
                                        {(item.price * item.quantity).toFixed(2)}
                                    </p>
                                </div>

                                <button className={styles.removeBtn} onClick={() => removeCartItem(item.id)}>
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

            {/* FORM CLIENTE */}
            <div className="mb-4">
                <Form.Label>Tu nombre</Form.Label>
                <Form.Control ref={nombreRef} value={nombre} onChange={(e) => setNombre(e.target.value)} />

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
                        <Form.Control ref={direccionRef} value={direccion} onChange={(e) => setDireccion(e.target.value)} />

                        <Form.Label className="mt-3">Observaciones</Form.Label>
                        <Form.Control value={obsEntrega} onChange={(e) => setObsEntrega(e.target.value)} />
                    </>
                )}

                {/* METODO DE PAGO */}
                <Form.Label className="mt-3">Método de pago</Form.Label>
                <div ref={metodoPagoRef} className={styles.radioRow}>
                    <Form.Check
                        type="radio"
                        label="Efectivo"
                        checked={metodoPago === "efectivo"}
                        onChange={() => setMetodoPago("efectivo")}
                    />

                    <Form.Check
                        type="radio"
                        label="Transferencia"
                        checked={metodoPago === "transferencia"}
                        onChange={() => setMetodoPago("transferencia")}
                    />
                </div>

                {/* ALIAS SI ES TRANSFERENCIA */}
                {metodoPago === "transferencia" && localAlias && (
                    <div className={styles.aliasBox}>
                        <p className={styles.aliasLabel}>Alias para transferir</p>

                        <div className={styles.aliasRow}>
                            <span className={styles.aliasText}>{localAlias}</span>

                            <Button size="sm" className={styles.copyBtn} onClick={copyAlias}>
                                {copied ? "✔ Copiado" : "Copiar"}
                            </Button>
                        </div>

                        <small className="text-muted">
                            Primero envía el pedido por WhatsApp.  
                            Luego realizá la transferencia y enviá el comprobante por el chat.
                        </small>
                    </div>
                )}
            </div>

            {/* BOTONES */}
            <div className={styles.actionRow}>
                <Link href="/" className={`btn ${styles.secondaryBtn}`}>
                    ← Seguir comprando
                </Link>

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
