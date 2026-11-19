/**
 * Ruta: src/lib/auth-server.js
 * Verifica el ID token de Firebase sin service account: Realtime Database
 * rechaza (401) cualquier token inválido o vencido, así que leer el perfil del
 * usuario con ese token es la verificación.
 */

const DB_URL = process.env.NEXT_PUBLIC_FIREBASE_DATABASE_URL;

function payloadOf(token) {
	try {
		const part = token.split(".")[1];
		return JSON.parse(Buffer.from(part.replace(/-/g, "+").replace(/_/g, "/"), "base64").toString("utf8"));
	} catch {
		return null;
	}
}

/** @returns {Promise<{uid:string, perfil:{superadmin:boolean, locales:string[]}}|null>} */
export async function verifyRequest(req) {
	const header = req.headers.get("authorization") || "";
	const token = header.startsWith("Bearer ") ? header.slice(7) : "";
	const payload = token && payloadOf(token);
	const uid = payload?.user_id || payload?.sub;
	if (!uid || !/^[A-Za-z0-9]{10,128}$/.test(uid)) return null;

	const res = await fetch(`${DB_URL}/usuarios/${uid}.json?auth=${encodeURIComponent(token)}`, { cache: "no-store" });
	if (!res.ok) return null; // invalid, expired or forged token

	const raw = (await res.json()) || {};
	return {
		uid,
		perfil: {
			superadmin: raw.superadmin === true,
			locales: Object.keys(raw.locales || {}).filter((k) => raw.locales[k] === true),
		},
	};
}

export function canManage(perfil, local) {
	return Boolean(perfil && (perfil.superadmin || perfil.locales.includes(local)));
}
