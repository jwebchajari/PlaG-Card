/**
 * Ruta: src/lib/cloudinary-server.js
 * Cloudinary en el servidor (borrado). Solo Route Handlers: usa el API secret.
 */
import { v2 as cloudinary } from "cloudinary";
import { ref, get } from "firebase/database";
import { db } from "@/lib/firebase";
import { cloudNameFromUrl, publicIdFromUrl } from "@/lib/cloudinary-url";

const CLOUD_NAME = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
// Accepts the key under either name (other projects use the NEXT_PUBLIC_ one).
const API_KEY = process.env.CLOUDINARY_API_KEY || process.env.NEXT_PUBLIC_CLOUDINARY_API_KEY;

cloudinary.config({
	cloud_name: CLOUD_NAME,
	api_key: API_KEY,
	api_secret: process.env.CLOUDINARY_API_SECRET,
	secure: true,
});

const canDelete = Boolean(CLOUD_NAME && API_KEY && process.env.CLOUDINARY_API_SECRET);

/**
 * Borra de Cloudinary la imagen de un producto si:
 * - es de nuestra cuenta (mismo cloud name), y
 * - ningún otro producto del local la sigue usando.
 * Nunca hace fallar el guardado: los errores solo se registran.
 */
export async function destroyProductImageIfUnused(local, url) {
	if (!canDelete || !url || cloudNameFromUrl(url) !== CLOUD_NAME) return { skipped: true };
	const publicId = publicIdFromUrl(url);
	if (!publicId) return { skipped: true };

	try {
		const snap = await get(ref(db, `locales/${local}/comidas`));
		const stillUsed = Object.values(snap.val() || {}).some((c) => publicIdFromUrl(c?.imagen) === publicId);
		if (stillUsed) return { skipped: true };

		return await cloudinary.uploader.destroy(publicId, { resource_type: "image", invalidate: true });
	} catch (error) {
		console.error("[cloudinary-server] No se pudo borrar", publicId, error?.message || error);
		return { error: true };
	}
}
