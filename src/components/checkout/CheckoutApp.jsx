"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { ChevronLeft, ShoppingBag, Clock } from "lucide-react";
import { cart, useCart } from "@/lib/cart";
import { formatPrice, linePrice, whatsappOrderUrl, envioLabel, waNumber } from "@/lib/site";
import { getEstadoLocal } from "@/utils/horarios";
import { WhatsappIcon } from "@/components/BrandIcons";
import CartLine from "./CartLine";
import BuyerForm from "./BuyerForm";
import { buildOrderMessage } from "./message";
import styles from "./checkout.module.css";

const BUYER_KEY = "pg-buyer";

function readBuyer() {
	try {
		return JSON.parse(localStorage.getItem(BUYER_KEY)) || {};
	} catch {
		return {};
	}
}

export default function CheckoutApp({ menu, datos, horarios }) {
	const stored = useCart();
	const [ready, setReady] = useState(false);
	const [estado, setEstado] = useState(null);
	const [buyer, setBuyer] = useState({ nombre: "", entrega: "retiro", direccion: "", referencia: "", pago: "efectivo" });
	const [errors, setErrors] = useState({});
	const [sent, setSent] = useState(false);
	const formRef = useRef(null);

	useEffect(() => {
		setReady(true);
		setEstado(getEstadoLocal(horarios));
		const saved = readBuyer();
		setBuyer((b) => ({ ...b, nombre: saved.nombre || "", direccion: saved.direccion || "", referencia: saved.referencia || "" }));
	}, [horarios]);

	// Re-price every line with today's menu and extras.
	const lines = useMemo(
		() =>
			stored.map((item) => {
				const product = menu[item.productId];
				if (!product) return { ...item, unavailable: true, unit: 0 };
				const live = { ...item, name: product.name, image: product.image, category: product.category, basePrice: product.price };
				return { ...live, unit: linePrice(live, datos.extras) };
			}),
		[stored, menu, datos.extras]
	);

	const available = lines.filter((l) => !l.unavailable);
	const subtotal = available.reduce((n, l) => n + l.unit * (Number(l.quantity) || 1), 0);
	const conEnvio = buyer.entrega === "envio";
	const envio = conEnvio ? datos.costoEnvio : null; // null = a confirmar
	const total = subtotal + (conEnvio && envio ? envio : 0);
	const count = available.reduce((n, l) => n + (Number(l.quantity) || 1), 0);

	function updateBuyer(patch) {
		setBuyer((b) => ({ ...b, ...patch }));
		setErrors((e) => {
			const next = { ...e };
			Object.keys(patch).forEach((k) => delete next[k]);
			return next;
		});
	}

	function send(e) {
		e.preventDefault();
		const errs = {};
		if (!buyer.nombre.trim()) errs.nombre = "Escribí tu nombre para que sepamos de quién es el pedido.";
		if (buyer.entrega === "envio" && !buyer.direccion.trim()) errs.direccion = "Necesitamos la dirección para el envío.";
		setErrors(errs);
		if (Object.keys(errs).length) {
			const first = formRef.current?.querySelector(`[name="${Object.keys(errs)[0]}"]`);
			first?.focus();
			first?.scrollIntoView({ block: "center", behavior: "smooth" });
			return;
		}

		try {
			localStorage.setItem(
				BUYER_KEY,
				JSON.stringify({ nombre: buyer.nombre.trim(), direccion: buyer.direccion.trim(), referencia: buyer.referencia.trim() })
			);
		} catch {
			/* optional convenience */
		}

		const text = buildOrderMessage({ lines: available, buyer, subtotal, envio, total });
		window.open(whatsappOrderUrl(datos.whatsapp, text), "_blank", "noopener");
		setSent(true);
	}

	const header = (
		<header className={styles.topbar}>
			<Link href="/" className={styles.back}>
				<ChevronLeft size={22} aria-hidden="true" />
				Menú
			</Link>
			<h1 className={styles.title}>Tu pedido</h1>
			<span className={styles.topbarSpacer} aria-hidden="true" />
		</header>
	);

	if (!ready) {
		return (
			<div className={styles.page}>
				{header}
				<div className={styles.skeleton} aria-hidden="true" />
			</div>
		);
	}

	if (sent) {
		return (
			<div className={styles.page}>
				{header}
				<section className={styles.done} aria-labelledby="done-title">
					<span className={styles.doneIcon}>
						<WhatsappIcon size={32} />
					</span>
					<h2 id="done-title">Te abrimos WhatsApp con tu pedido</h2>
					<p>Enviá el mensaje desde el chat para confirmarlo. Si pagás con transferencia, mandá el comprobante ahí mismo.</p>
					<div className={styles.doneActions}>
						<Link
							href="/"
							className={styles.primaryBtn}
							onClick={() => {
								cart.clear();
							}}
						>
							Ya lo envié, volver al menú
						</Link>
						<button type="button" className={styles.ghostBtn} onClick={() => setSent(false)}>
							Volver al pedido
						</button>
					</div>
				</section>
			</div>
		);
	}

	if (lines.length === 0) {
		return (
			<div className={styles.page}>
				{header}
				<section className={styles.done} aria-labelledby="empty-title">
					<span className={styles.emptyIcon}>
						<ShoppingBag size={32} aria-hidden="true" />
					</span>
					<h2 id="empty-title">Tu pedido está vacío</h2>
					<p>Elegí algo del menú y lo vas a ver acá.</p>
					<div className={styles.doneActions}>
						<Link href="/" className={styles.primaryBtn}>
							Ver el menú
						</Link>
					</div>
				</section>
			</div>
		);
	}

	const noPhone = !waNumber(datos.whatsapp);

	return (
		<div className={styles.page}>
			{header}

			<form ref={formRef} className={styles.content} onSubmit={send} noValidate>
				{estado && !estado.abierto && (
					<p className={styles.notice}>
						<Clock size={18} aria-hidden="true" />
						<span>
							<strong>Ahora estamos cerrados.</strong> {estado.detalle}.
						</span>
					</p>
				)}

				<section aria-labelledby="items-title">
					<h2 id="items-title" className={styles.sectionTitle}>
						{count} {count === 1 ? "producto" : "productos"}
					</h2>
					<ul className={styles.lines}>
						{lines.map((line) => (
							<li key={line.id}>
								<CartLine line={line} extras={datos.extras} />
							</li>
						))}
					</ul>
					<Link href="/" className={styles.addMore}>
						Agregar más productos
					</Link>
				</section>

				<BuyerForm buyer={buyer} onChange={updateBuyer} errors={errors} alias={datos.alias} costoEnvio={datos.costoEnvio} />

				<dl className={styles.summary}>
					{conEnvio && (
						<>
							<div className={styles.summaryRow}>
								<dt>Productos</dt>
								<dd>{formatPrice(subtotal)}</dd>
							</div>
							<div className={styles.summaryRow}>
								<dt>Envío</dt>
								<dd className={envio === null ? styles.summaryMuted : envio === 0 ? styles.summaryFree : undefined}>
									{envioLabel(envio)}
								</dd>
							</div>
						</>
					)}
					<div className={`${styles.summaryRow} ${styles.summaryTotal}`}>
						<dt>Total{conEnvio && envio === null ? " sin envío" : ""}</dt>
						<dd>{formatPrice(total)}</dd>
					</div>
					{conEnvio && envio === null && <p className={styles.summaryNote}>El costo del envío te lo confirma el local por WhatsApp.</p>}
				</dl>

				<div className={styles.sendBar}>
					{noPhone && <p className={styles.fieldError}>El local todavía no cargó su WhatsApp.</p>}
					<button type="submit" className={styles.sendBtn} disabled={noPhone || available.length === 0}>
						<WhatsappIcon size={22} />
						<span>Enviar pedido</span>
						<span className={styles.sendTotal}>{formatPrice(total)}</span>
					</button>
				</div>
			</form>
		</div>
	);
}
