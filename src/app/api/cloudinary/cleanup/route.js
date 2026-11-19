export const dynamic = "force-dynamic";

import { verifyRequest, canManage } from "@/lib/auth-server";
import { destroyProductImageIfUnused } from "@/lib/cloudinary-server";

const SLUG = /^[a-z0-9-]{2,60}$/;

// POST { local, url } con Authorization: Bearer <idToken>
// Borra de Cloudinary una foto reemplazada o de un producto borrado, si nadie más la usa.
export async function POST(req) {
	const session = await verifyRequest(req);
	if (!session) return Response.json({ error: "No autorizado" }, { status: 401 });

	let body;
	try {
		body = await req.json();
	} catch {
		return Response.json({ error: "Pedido inválido" }, { status: 400 });
	}

	const local = String(body?.local || "");
	const url = String(body?.url || "");
	if (!SLUG.test(local) || !url.startsWith("https://res.cloudinary.com/")) {
		return Response.json({ error: "Pedido inválido" }, { status: 400 });
	}
	if (!canManage(session.perfil, local)) {
		return Response.json({ error: "Sin acceso a este local" }, { status: 403 });
	}

	const result = await destroyProductImageIfUnused(local, url);
	return Response.json({ ok: true, result });
}
