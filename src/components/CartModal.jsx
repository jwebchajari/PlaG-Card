import { useState } from "react";
import { Modal, Button, Form, Alert } from "react-bootstrap";
import { Icon } from "@iconify/react";
import styles from "./CartModal.module.css";

export default function CartModal({
	show,
	onClose,
	cartItems,
	updateCartItemNotes,
	updateCartItemQuantity,
	removeCartItem,
	totalPrice
}) {
	const [nombre, setNombre] = useState("");
	const [metodo, setMetodo] = useState("retiro");
	const [direccion, setDireccion] = useState("");
	const [obsEntrega, setObsEntrega] = useState("");
	const [sending, setSending] = useState(false);
	const [errorMsg, setErrorMsg] = useState("");

	const telefono = "5493412275598";

	/* ============================================================
	   MOSTRAR ERROR ELEGANTE (NO alert())
	=============================================================== */
	const showError = (msg) => {
		setErrorMsg(msg);
		setTimeout(() => setErrorMsg(""), 2500);
	};

	/* ============================================================
	   ENVIAR WHATSAPP
	=============================================================== */
	const sendWhatsappOrder = () => {
		// Validaciones bonitas
		if (!nombre.trim()) return showError("Por favor ingresá tu nombre.");

		if (metodo === "envio" && !direccion.trim())
			return showError("Ingresá tu dirección para el envío.");

		setSending(true);

		let mensaje = `*Nuevo pedido desde Pintó La Gula*%0A`;
		mensaje += `👤 *Cliente:* ${nombre}%0A`;
		mensaje += `📦 *Método:* ${metodo === "retiro" ? "Retiro en local" : "Envío a domicilio"}%0A`;

		if (metodo === "envio") {
			mensaje += `🏠 *Dirección:* ${direccion}%0A`;
			if (obsEntrega.trim())
				mensaje += `📌 *Observaciones:* ${obsEntrega}%0A`;
		}

		mensaje += `%0A*Detalle del pedido:*%0A`;
		cartItems.forEach(item => {
			mensaje += `• ${item.quantity} x ${item.name} — $${(item.price * item.quantity).toFixed(2)}%0A`;
			if (item.notes?.trim())
				mensaje += `  📝 Nota: ${item.notes}%0A`;
		});

		mensaje += `%0A💵 *Total:* $${totalPrice.toFixed(2)}%0A`;

		const url = `https://wa.me/${telefono}?text=${mensaje}`;
		window.open(url, "_blank");

		setTimeout(() => {
			setSending(false);
			onClose();
		}, 800);
	};

	return (
		<Modal show={show} onHide={onClose} centered size="lg">
			<Modal.Header closeButton>
				<Modal.Title>Tu pedido</Modal.Title>
			</Modal.Header>

			<Modal.Body className={styles.body}>
				{/* ALERTA ELEGANTE */}
				{errorMsg && (
					<Alert variant="danger" className="py-2">
						{errorMsg}
					</Alert>
				)}

				{cartItems.length === 0 ? (
					<div className={styles.empty}>
						<Icon icon="lucide:shopping-bag" width={50} className="mb-3 text-muted" />
						<h5>Carrito vacío</h5>
						<p className="text-muted">Agregá productos para continuar</p>
						<Button onClick={onClose}>Volver</Button>
					</div>
				) : (
					<>
						{/* LISTA DE PRODUCTOS */}
						<div className={styles.items}>
							{cartItems.map(item => (
								<div key={item.id} className={styles.item}>
									<img src={item.image} className={styles.img} />

									<div className="flex-grow-1">
										<p className={styles.name}>{item.name}</p>

										<p className={styles.sub}>
											${item.price} x {item.quantity} = $
											{(item.price * item.quantity).toFixed(2)}
										</p>

										<div className="d-flex align-items-center gap-2">
											<Button
												size="sm"
												variant="outline-secondary"
												onClick={() => updateCartItemQuantity(item.id, item.quantity - 1)}
												disabled={item.quantity <= 1}
											>
												-
											</Button>
											<span className="fw-bold">{item.quantity}</span>
											<Button
												size="sm"
												variant="outline-secondary"
												onClick={() => updateCartItemQuantity(item.id, item.quantity + 1)}
											>
												+
											</Button>
										</div>

										<Form.Control
											className="mt-2"
											placeholder="Notas (sin cebolla...)"
											value={item.notes}
											onChange={(e) => updateCartItemNotes(item.id, e.target.value)}
										/>
									</div>

									<button
										className={styles.delete}
										onClick={() => removeCartItem(item.id)}
									>
										<Icon icon="lucide:trash" width={20} />
									</button>
								</div>
							))}
						</div>

						<hr />

						{/* TOTAL */}
						<div className={styles.totalRow}>
							<h5>Total:</h5>
							<h5>${totalPrice.toFixed(2)}</h5>
						</div>

						{/* DATOS DEL CLIENTE */}
						<div className="mt-3">
							<Form.Label>Tu nombre</Form.Label>
							<Form.Control
								value={nombre}
								onChange={(e) => setNombre(e.target.value)}
							/>

							<Form.Label className="mt-3">Método de entrega</Form.Label>
							<div className="d-flex gap-4">
								<Form.Check
									type="radio"
									label="Retiro"
									checked={metodo === "retiro"}
									onChange={() => setMetodo("retiro")}
								/>
								<Form.Check
									type="radio"
									label="Envío"
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
					</>
				)}
			</Modal.Body>

			{cartItems.length > 0 && (
				<Modal.Footer className={styles.footer}>
					<Button variant="secondary" onClick={onClose}>
						Seguir comprando
					</Button>

					<Button
						className={styles.whatsappBtn}
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
								<Icon icon="logos:whatsapp-icon" width={22} className="me-2" />
								Enviar pedido
							</>
						)}
					</Button>
				</Modal.Footer>
			)}
		</Modal>
	);
}
