import { categoryOf } from "@/lib/site";

/** Firebase "comida" -> menu product. Runtime-agnostic (used by the edge OG image too). */
export function normalizeProduct(id, item = {}) {
	const valor = Number(item.valor) || 0;
	const valorOferta = item.valorOferta ? Number(item.valorOferta) : null;
	const enOferta = Boolean(item.oferta) && valorOferta > 0 && valorOferta < valor;
	return {
		id,
		category: categoryOf(item.categoria),
		name: item.nombre || "",
		description: item.descripcion || "",
		price: enOferta ? valorOferta : valor,
		originalPrice: enOferta ? valor : null,
		image: item.imagen || "",
	};
}
