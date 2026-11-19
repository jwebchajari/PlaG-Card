import { SITE_NAME, breadLabel, formatPrice, envioLabel } from "@/lib/site";

/** Plain-text WhatsApp order. Encoding happens once, in whatsappOrderUrl. */
export function buildOrderMessage({ lines, buyer, subtotal, envio, total }) {
	const out = [];
	out.push(`*Nuevo pedido - ${SITE_NAME}*`, "");
	out.push(`*Cliente:* ${buyer.nombre.trim()}`);
	out.push(`*Entrega:* ${buyer.entrega === "envio" ? "Envío a domicilio" : "Retiro en el local"}`);
	if (buyer.entrega === "envio") {
		out.push(`*Dirección:* ${buyer.direccion.trim()}`);
		if (buyer.referencia.trim()) out.push(`*Referencia:* ${buyer.referencia.trim()}`);
	}
	out.push(`*Pago:* ${buyer.pago === "transferencia" ? "Transferencia" : "Efectivo"}`, "");

	out.push("*Pedido:*");
	lines.forEach((l) => {
		const qty = Number(l.quantity) || 1;
		out.push(`- ${qty} x ${l.name}: ${formatPrice(l.unit * qty)}`);
		if (l.category === "hamburguesas") out.push(`   Medallones: ${l.meatCount || 1}`);
		if (l.category === "hamburguesas" || l.category === "sandwich") out.push(`   Pan: ${breadLabel(l.breadType || "Berly")}`);
		if (l.notes?.trim()) out.push(`   Aclaración: ${l.notes.trim()}`);
	});
	out.push("");
	if (buyer.entrega === "envio") {
		out.push(`Productos: ${formatPrice(subtotal)}`);
		out.push(`Envío: ${envioLabel(envio)}`);
	}
	out.push(`*Total${buyer.entrega === "envio" && envio === null ? " sin envío" : ""}: ${formatPrice(total)}*`);
	return out.join("\n");
}
