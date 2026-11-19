export const dynamic = "force-dynamic";

import { db } from "@/lib/firebase";
import { ref, update, increment } from "firebase/database";
import { LOCAL } from "@/lib/site";
import { claveFecha } from "@/utils/horarios";

// POST => suma una visita (total y del día, en hora de Argentina).
// Las reglas solo permiten sumar de a 1; la lectura es solo para el dueño (desde el panel).
export async function POST() {
	try {
		await update(ref(db, `locales/${LOCAL}/visitas`), {
			total: increment(1),
			[`dias/${claveFecha()}`]: increment(1),
		});
		return Response.json({ ok: true });
	} catch (error) {
		console.error("POST /api/locales/visitas ERROR:", error?.message || error);
		return Response.json({ error: "No se pudo registrar la visita" }, { status: 500 });
	}
}
