"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button, Form, Alert } from "react-bootstrap";
import { Icon } from "@iconify/react";

export default function ComprarPage() {
    const router = useRouter();

    const [cartItems, setCartItems] = useState([]);
    const [loading, setLoading] = useState(true);

    const [nombre, setNombre] = useState("");
    const [metodo, setMetodo] = useState("retiro");
    const [direccion, setDireccion] = useState("");
    const [obsEntrega, setObsEntrega] = useState("");
    const [sending, setSending] = useState(false);
    const [errorMsg, setErrorMsg] = useState("");

    const telefono = "5493412275598";

    /* ============ Cargar carrito desde localStorage ============ */
    useEffect(() => {
        if (typeof window === "undefined") return;

        const stored = localStorage.getItem("cartData");
        if (stored) {
            try {
                const { items, timestamp } = JSON.parse(stored);
                const diff = Date.now() - timestamp;
                const limit = 3 * 60 * 60 * 1000; // 3 hs

                if (diff < limit && Array.isArray(items) && items.length > 0) {
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

    /* ============ Guardar carrito al modificar ============ */
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

    /* ============ Helpers carrito ============ */

    const updateCartItemQuantity = (id, newQuantity) => {
        setCartItems((prev) =>
            prev.map((item) =>
                item.id === id
                    ? { ...item, quantity: Math.max(1, newQuantity) }
                    : item
            )
        );
    };

    const updateCartItemNotes = (id, notes) => {
        setCartItems((prev) =>
            prev.map((item) => (item.id === id ? { ...item, notes } : item))
        );
    };

    const removeCartItem = (id) => {
        setCartItems((prev) => prev.filter((item) => item.id !== id));
    };

    const totalPrice = cartItems.reduce(
        (acc, item) => acc + item.price * item.quantity,
        0
    );

    /* ============ Errores lindos ============ */

    const showError = (msg) => {
        setErrorMsg(msg);
        setTimeout(() => setErrorMsg(""), 2500);
    };

    /* ============ Enviar pedido por WhatsApp ============ */

    const sendWhatsappOrder = () => {
        if (!nombre.trim()) return showError("Por favor ingresá tu nombre.");
        if (metodo === "envio" && !direccion.trim())
            return showError("Ingresá tu dirección para el envío.");

        if (cartItems.length === 0)
            return showError("Tu carrito está vacío.");

        setSending(true);

        let mensaje = `*Nuevo pedido desde Pintó La Gula*%0A`;
        mensaje += `👤 *Cliente:* ${nombre}%0A`;
        mensaje += `📦 *Método:* ${metodo === "retiro" ? "Retiro en local" : "Envío a domicilio"
            }%0A`;

        if (metodo === "envio") {
            mensaje += `🏠 *Dirección:* ${direccion}%0A`;
            if (obsEntrega.trim())
                mensaje += `📌 *Observaciones:* ${obsEntrega}%0A`;
        }

        mensaje += `%0A*Detalle del pedido:*%0A`;

        cartItems.forEach((item) => {
            mensaje += `• ${item.quantity} x ${item.name} — $${(
                item.price * item.quantity
            ).toFixed(2)}%0A`;
            if (item.notes?.trim()) {
                mensaje += `  📝 Nota: ${item.notes}%0A`;
            }
        });

        mensaje += `%0A💵 *Total:* $${totalPrice.toFixed(2)}%0A`;
        mensaje += `%0AGracias! 🙌`;

        const url = `https://wa.me/${telefono}?text=${mensaje}`;
        window.open(url, "_blank");

        setTimeout(() => {
            setSending(false);
            router.push("/"); // vuelve al home después de enviar
        }, 800);
    };

    const handleBack = () => {
        router.push("/");
    };

    /* ============ Render ============ */

    if (loading) {
        return (
            <div className="d-flex justify-content-center align-items-center vh-100">
                <p>Cargando carrito…</p>
            </div>
        );
    }

    if (!loading && cartItems.length === 0) {
        return (
            <div className="container d-flex flex-column justify-content-center align-items-center vh-100 text-center">
                <Icon
                    icon="lucide:shopping-bag"
                    width={60}
                    className="mb-3 text-muted"
                />
                <h4 className="mb-2">Tu carrito está vacío</h4>
                <p className="text-muted mb-4">
                    Volvé al menú y agregá algunas hamburguesas 🍔
                </p>
                <Button variant="primary" onClick={handleBack}>
                    Volver al menú
                </Button>
            </div>
        );
    }

    return (
        <div className="container py-3 mb-5 pb-5">
            {/* Header con botón volver */}
            <div className="d-flex justify-content-between align-items-center mb-3">
                <Button variant="link" className="p-0 d-flex align-items-center" onClick={handleBack}>
                    <Icon icon="mdi:chevron-left" width={22} />
                    <span>Seguir comprando</span>
                </Button>
                <h3 className="m-0 fw-bold">Tu pedido</h3>
                <div style={{ width: 90 }} /> {/* espacio para equilibrar layout */}
            </div>

            {errorMsg && (
                <Alert variant="danger" className="py-2">
                    {errorMsg}
                </Alert>
            )}

            {/* Lista de productos */}
            <div className="mb-3">
                {cartItems.map((item) => (
                    <div
                        key={item.id}
                        className="d-flex gap-3 align-items-start border rounded-3 p-2 mb-2"
                    >
                        <img
                            src={item.image}
                            alt={item.name}
                            style={{
                                width: 80,
                                height: 80,
                                objectFit: "cover",
                                borderRadius: 12,
                            }}
                        />

                        <div className="flex-grow-1">
                            <div className="d-flex justify-content-between">
                                <div>
                                    <h6 className="mb-1 fw-bold">{item.name}</h6>
                                    <p className="mb-1 text-muted">
                                        ${item.price} x {item.quantity} = $
                                        {(item.price * item.quantity).toFixed(2)}
                                    </p>
                                </div>

                                <button
                                    className="btn btn-link text-danger p-0"
                                    onClick={() => removeCartItem(item.id)}
                                >
                                    <Icon icon="lucide:trash-2" width={18} />
                                </button>
                            </div>

                            <div className="d-flex align-items-center gap-2 mb-2">
                                <Button
                                    size="sm"
                                    variant="outline-secondary"
                                    onClick={() =>
                                        updateCartItemQuantity(item.id, item.quantity - 1)
                                    }
                                    disabled={item.quantity <= 1}
                                >
                                    -
                                </Button>
                                <span className="fw-bold">{item.quantity}</span>
                                <Button
                                    size="sm"
                                    variant="outline-secondary"
                                    onClick={() =>
                                        updateCartItemQuantity(item.id, item.quantity + 1)
                                    }
                                >
                                    +
                                </Button>
                            </div>

                            <Form.Control
                                size="sm"
                                placeholder="Notas (sin cebolla, extra cheddar...)"
                                value={item.notes || ""}
                                onChange={(e) =>
                                    updateCartItemNotes(item.id, e.target.value)
                                }
                            />
                        </div>
                    </div>
                ))}
            </div>

            {/* Total */}
            <div className="d-flex justify-content-between align-items-center border-top pt-3 mb-3">
                <span className="fw-bold fs-5">Total:</span>
                <span className="fw-bold fs-5">${totalPrice.toFixed(2)}</span>
            </div>

            {/* Datos del cliente */}
            <div className="mb-4">
                <Form.Label>Tu nombre</Form.Label>
                <Form.Control
                    value={nombre}
                    onChange={(e) => setNombre(e.target.value)}
                />

                <Form.Label className="mt-3">Método de entrega</Form.Label>
                <div className="d-flex gap-4">
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

            {/* Botones de acción */}
            <div className="d-flex flex-column flex-md-row justify-content-between gap-2">
                <Button
                    variant="outline-secondary"
                    className="w-100"
                    onClick={handleBack}
                >
                    ← Seguir comprando
                </Button>

                <Button
                    className="w-100 d-flex justify-content-center align-items-center"
                    style={{ backgroundColor: "#25D366", borderColor: "#25D366" }}
                    onClick={sendWhatsappOrder}
                    disabled={sending}
                >
                    {sending ? (
                        <>
                            <span className="spinner-border spinner-border-sm me-2" />
                            Enviando...
                        </>
                    ) : (
                        <>
                            <Icon
                                icon="logos:whatsapp-icon"
                                width={22}
                                className="me-2"
                            />
                            Enviar pedido por WhatsApp
                        </>
                    )}
                </Button>
            </div>
        </div>
    );
}
