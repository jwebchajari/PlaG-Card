export const dynamic = "force-dynamic";

import { revalidatePath } from "next/cache";
import { verifyRequest, canManage } from "@/lib/auth-server";
import { LOCAL } from "@/lib/site";

// POST { local } con Authorization: Bearer <idToken>
// Regenera el menú publicado apenas el dueño guarda un cambio (si no, se actualiza solo en 1 minuto).
export async function POST(req) {
	const session = await verifyRequest(req);
	if (!session) return Response.json({ error: "No autorizado" }, { status: 401 });

	const { local } = await req.json().catch(() => ({}));
	if (!canManage(session.perfil, local)) return Response.json({ error: "Sin acceso a este local" }, { status: 403 });

	// This deployment only publishes one local's menu.
	if (local === LOCAL) revalidatePath("/", "layout");
	return Response.json({ ok: true, revalidated: local === LOCAL });
}
