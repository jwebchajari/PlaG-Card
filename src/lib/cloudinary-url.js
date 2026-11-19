/**
 * Ruta: src/lib/cloudinary-url.js
 * Helpers de URL de Cloudinary sin SDK: sirven en cliente, servidor y edge.
 */

export const CLOUDINARY_ROOT = "CardCloude";

/** Carpeta del local: CardCloude/<nombre-del-local> */
export function cloudinaryFolder(local) {
	return `${CLOUDINARY_ROOT}/${local}`;
}

const UPLOAD_RE = /^https:\/\/res\.cloudinary\.com\/([^/]+)\/image\/upload\/(.+)$/;

export function isCloudinaryUrl(url) {
	return UPLOAD_RE.test(url || "");
}

/** Cloud name que aparece en la URL (para no tocar imágenes de otras cuentas). */
export function cloudNameFromUrl(url) {
	return (url || "").match(UPLOAD_RE)?.[1] || null;
}

/**
 * Agrega una transformación a una URL de Cloudinary.
 * Ej: cldUrl(url, "f_auto,q_auto,w_480"). Las URLs de otros hosts vuelven iguales.
 */
export function cldUrl(url, transformation) {
	if (!isCloudinaryUrl(url) || !transformation) return url;
	return url.replace("/image/upload/", `/image/upload/${transformation}/`);
}

/**
 * public_id a partir de la URL de entrega, sin transformaciones, versión ni extensión.
 * https://res.cloudinary.com/demo/image/upload/f_auto/v123/CardCloude/local/foto.jpg -> CardCloude/local/foto
 */
export function publicIdFromUrl(url) {
	const rest = (url || "").match(UPLOAD_RE)?.[2];
	if (!rest) return null;
	const segments = rest.split("/");
	// Las transformaciones van antes de la versión (vNNN) o del public_id.
	let i = 0;
	while (i < segments.length - 1 && /^[a-z]{1,3}_[^/]*$/.test(segments[i]) && !/^v\d+$/.test(segments[i])) i++;
	if (/^v\d+$/.test(segments[i])) i++;
	return decodeURIComponent(segments.slice(i).join("/")).replace(/\.[a-z0-9]+$/i, "") || null;
}
