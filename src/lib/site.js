export const SITE_URL = "https://pla-g-card.vercel.app";
export const SITE_NAME = "Pintó la Gula";
export const SITE_CITY = "Chajarí";
export const SITE_DESCRIPTION =
	"Hamburguesas, sandwiches y papas en Chajarí. Mirá el menú del día y pedí por WhatsApp, con delivery o retiro.";
export const LOCAL = process.env.NEXT_PUBLIC_LOCAL_NAME || "pinto-la-gula";

export const CATEGORIES = [
	{ id: "hamburguesas", label: "Hamburguesas" },
	{ id: "sandwich", label: "Sandwiches" },
	{ id: "papas", label: "Papas" },
	{ id: "bebidas", label: "Bebidas" },
	{ id: "otros", label: "Otros" },
];

const CATEGORY_ALIASES = {
	hamburguesa: "hamburguesas",
	hamburguesas: "hamburguesas",
	sandwich: "sandwich",
	sandwiches: "sandwich",
	papas: "papas",
	bebida: "bebidas",
	bebidas: "bebidas",
	otros: "otros",
};

export function categoryOf(raw) {
	return CATEGORY_ALIASES[String(raw || "").trim().toLowerCase()] || "otros";
}

export const BREADS = [
	{ id: "Berly", label: "Pan Berly", extra: false },
	{ id: "papa", label: "Pan de papa", extra: true },
	{ id: "parmesano", label: "Pan parmesano", extra: true },
];

export const MAX_MEATS = 5;

export function breadLabel(id) {
	return BREADS.find((b) => b.id === id)?.label || id;
}

export function isBurger(product) {
	return product?.category === "hamburguesas";
}

export function isCustomizable(product) {
	return product?.category === "hamburguesas" || product?.category === "sandwich";
}

const priceFormatter = new Intl.NumberFormat("es-AR", { maximumFractionDigits: 0 });

export function formatPrice(n) {
	return `$${priceFormatter.format(Number(n) || 0)}`;
}

/** Unit price of a cart line or a customized product, extras included. */
export function linePrice({ basePrice, meatCount = 1, breadType = "Berly", category }, extras = {}) {
	const meat = category === "hamburguesas" ? Math.max(0, meatCount - 1) * (Number(extras.carne) || 0) : 0;
	const bread =
		(category === "hamburguesas" || category === "sandwich") && breadType !== "Berly"
			? Number(extras.panEspecial) || 0
			: 0;
	return (Number(basePrice) || 0) + meat + bread;
}

export function productUrl(id) {
	return `${SITE_URL}/producto/${encodeURIComponent(id)}`;
}

export function whatsappShareUrl(text) {
	return `https://wa.me/?text=${encodeURIComponent(text)}`;
}

/**
 * wa.me needs the international number. Argentine mobiles: 54 + 9 + area + number.
 * Accepts what owners usually type: 3456529321, 03456 15529321, +54 9 3456 529321...
 */
export function waNumber(phone) {
	let d = String(phone || "").replace(/\D/g, "");
	if (!d) return "";
	if (d.startsWith("54")) return d.startsWith("549") ? d : `549${d.slice(2)}`;
	d = d.replace(/^0/, "");
	// Local format with "15" after a 2-4 digit area code: 3456 15 529321 -> 3456 529321
	if (d.length === 12) d = d.replace(/^(\d{2,4})15(\d+)$/, "$1$2");
	return d.length === 10 ? `549${d}` : d;
}

export function whatsappOrderUrl(phone, text) {
	return `https://wa.me/${waNumber(phone)}?text=${encodeURIComponent(text)}`;
}

/** Delivery cost label: null = not set by the owner, 0 = free. */
export function envioLabel(costo) {
	if (costo === null || costo === undefined) return "A confirmar";
	return costo === 0 ? "Gratis" : formatPrice(costo);
}

export function instagramUrl(value) {
	if (!value) return null;
	const v = value.trim();
	if (/^https?:\/\//i.test(v)) return v;
	return `https://instagram.com/${v.replace(/^@/, "")}`;
}

export function facebookUrl(value) {
	if (!value) return null;
	const v = value.trim();
	if (/^https?:\/\//i.test(v)) return v;
	return `https://facebook.com/${v.replace(/^@/, "")}`;
}

/** The owner may or may not type the city; add it only when missing. */
export function fullAddress(address) {
	if (!address) return "";
	return /chajar[ií]/i.test(address) ? address : `${address}, ${SITE_CITY}, Entre Ríos`;
}

export function mapsUrl(address) {
	if (!address) return null;
	return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(fullAddress(address))}`;
}
