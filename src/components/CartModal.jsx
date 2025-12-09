import { useState } from "react";
import { Modal, Button, Form, Alert } from "react-bootstrap";
import { Icon } from "@iconify/react";
import styles from "./CartModal.module.css";

export default function CartModal({
	show,
	onClose,
	cartItems,
	setCartItems,
	updateCartItemNotes,
	updateCartItemQuantity,
	removeCartItem,
	totalPrice,
	extrasCarne = 1250,
	extrasPanEspecial = 750
}) {
	const [nombre, setNombre] = useState("");
	const [metodo, setMetodo] = useState("retiro");
	const [direccion, setDireccion] = useState("");
	const [obsEntrega, setObsEntrega] = useState("");
	const [sending, setSending] = useState(false);
	const [errorMsg, setErrorMsg] = useState("");

	const telefono = "5493412275598";

	/* =======================
	   Mostrar error elegante
	======================= */
	const showError = (msg) => {
		setErrorMsg(msg);
		setTimeout(() => setErrorMsg(""), 2500);
	};

	/* =======================
	   Update Carnes
	======================= */
	const updateCartItemMeat = (id, newCount) => {
		setCartItems((prev) =>
			prev.map((item) =>
				item.id === id
					? {
							...item,
							meatCount: Math.max(1, newCount),
							extraMeatPrice: Math.max(0, newCount - 1) * extrasCarne
					  }
					: item
			)
		);
	};

	/* =======================
	   Update Pan
	======================= */
	const updateCartItemBread = (id, breadType) => {
		setCartItems((prev) =>
			prev.map((item) =>
				item.id === id
					? {
							...item,
							breadType,
							extraBreadPrice: breadType === "comun" ? 0 : extrasPanEspecial
					  }
					: item
			)
		);
	};

	/* =======================
	   WhatsApp
	======================= */
	const sendWhatsappOrder = () => {
		if (!nombre.trim()) return showError("Por favor ingresá tu nombre.");
		if (metodo === "envio" && !direccion.trim())
			return showError("Ingresá tu dirección para el envío.");

		setSending(true);

		let mensaje = `*Nuevo pedido desde Pintó La Gula*%0A`;
		mensaje += `👤 *Cliente:* ${nombre}%0A`;
		mensaje += `📦 *Método:* ${
			metodo === "retiro" ? "Retiro en local" : "Envío a domicilio"
		}%0A`;

		if (metodo === "envio") {
			mensaje += `🏠 *Dirección:* ${direccion}%0A`;
			if (obsEntrega.trim()) mensaje += `📌 *Observaciones:* ${obsEntrega}%0A`;
		}

		mensaje += `%0A*Detalle del pedido:*%0A`;

		cartItems.forEach((item) => {
			const finalUnit =
				item.price +
				(item.categoria === "Hamburguesa" ? item.extraMeatPrice || 0 : 0) +
				(item.extraBreadPrice || 0);

			const subtotal = finalUnit * item.quantity;

			mensaje += `• ${item.quantity} x ${item.name} — $${subtotal}%0A`;

			if (item.categoria === "Hamburguesa") {
				mensaje += `   🍖 Carnes: ${item.meatCount}%0A`;
				mensaje += `   🍞 Pan: ${item.breadType}%0A`;
			}

			if (item.categoria === "Sandwich") {
				mensaje += `   🍞 Pan: ${item.breadType}%0A`;
			}

			if (item.notes?.trim()) {
				mensaje += `   📝 Nota: ${item.notes}%0A`;
			}

			mensaje += "%0A";
		});

		mensaje += `💵 *Total:* $${totalPrice}%0A`;

		const url = `https://wa.me/${telefono}?text=${mensaje}`;
		window.open(url, "_blank");

		setTimeout(() => {
			setSending(false);
			onClose();
		}, 700);
	};

	return (
		<Modal show={show} onHide={onClose} centered size="lg">
			<Modal.Header closeButton>
				<Modal.Title>Tu pedido</Modal.Title>
			</Modal.Header>

			<Modal.Body className={styles.body}>
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
						{/* ======================
							LISTA DE PRODUCTOS
						====================== */}
						<div className={styles.items}>
							{cartItems.map((item) => {
								const finalUnit =
									item.price +
									(item.categoria === "Hamburguesa"
										? item.extraMeatPrice || 0
										: 0) +
									(item.extraBreadPrice || 0);

								return (
									<div key={item.id} className={styles.item}>
										<img src={item.image} className={styles.img} />

										<div className="flex-grow-1">
											<p className={styles.name}>{item.name}</p>

											<p className={styles.sub}>
												${finalUnit} × {item.quantity} = $
												{(finalUnit * item.quantity).toFixed(2)}
											</p>

											{/* === HAMBURGUESA === */}
											{item.categoria === "Hamburguesa" && (
												<>
													{/* CARNES */}
													<div className="mt-1 d-flex align-items-center gap-2">
														<span>🍖 Carnes:</span>
														<Button
															size="sm"
															variant="outline-secondary"
															onClick={() =>
																updateCartItemMeat(item.id, item.meatCount - 1)
															}
															disabled={item.meatCount <= 1}
														>
															-
														</Button>
														<span className="fw-bold">{item.meatCount}</span>
														<Button
															size="sm"
															variant="outline-secondary"
															onClick={() =>
																updateCartItemMeat(item.id, item.meatCount + 1)
															}
														>
															+
														</Button>

														{item.extraMeatPrice > 0 && (
															<span className={styles.extraText}>
																+${item.extraMeatPrice}
															</span>
														)}
													</div>

													{/* PAN */}
													<div className="mt-1">
														<span>🍞 Pan:</span>
														<Form.Select
															className="mt-1"
															value={item.breadType}
															onChange={(e) =>
																updateCartItemBread(item.id, e.target.value)
															}
														>
															<option value="comun">Común</option>
															<option value="papa">
																Pan de papa (+${extrasPanEspecial})
															</option>
															<option value="parmesano">
																Parmesano (+${extrasPanEspecial})
															</option>
														</Form.Select>
													</div>
												</>
											)}

											{/* === SANDWICH === */}
											{item.categoria === "Sandwich" && (
												<div className="mt-1">
													<span>🍞 Pan:</span>
													<Form.Select
														className="mt-1"
														value={item.breadType}
														onChange={(e) =>
															updateCartItemBread(item.id, e.target.value)
														}
													>
														<option value="comun">Común</option>
														<option value="papa">
															Pan de papa (+${extrasPanEspecial})
														</option>
														<option value="parmesano">
															Parmesano (+${extrasPanEspecial})
														</option>
													</Form.Select>
												</div>
											)}

											{/* === CANTIDAD === */}
											<div className="d-flex align-items-center gap-2 mt-2">
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

											{/* === NOTAS === */}
											<Form.Control
												className="mt-2"
												placeholder="Notas (sin cebolla...)"
												value={item.notes}
												onChange={(e) =>
													updateCartItemNotes(item.id, e.target.value)
												}
											/>
										</div>

										<button
											className={styles.delete}
											onClick={() => removeCartItem(item.id)}
										>
											<Icon icon="lucide:trash" width={20} />
										</button>
									</div>
								);
							})}
						</div>

						<hr />

						{/* TOTAL */}
						<div className={styles.totalRow}>
							<h5>Total:</h5>
							<h5>${totalPrice}</h5>
						</div>

						{/* CLIENTE */}
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
