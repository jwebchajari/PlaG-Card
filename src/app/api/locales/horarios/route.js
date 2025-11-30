import { db } from "@/lib/firebase";
import { ref, get, set } from "firebase/database";

const LOCAL = process.env.NEXT_PUBLIC_LOCAL_NAME || "pinto-la-gula";

// GET → obtener horarios completos
export async function GET() {
	try {
		const snapshot = await get(ref(db, `locales/${LOCAL}/horarios`));
		return Response.json(snapshot.val() || {});
	} catch (error) {
		console.error("GET /api/locales/horarios ERROR:", error);
		return Response.json(
			{ error: "No se pudieron obtener horarios" },
			{ status: 500 }
		);
	}
}

// PUT → guardar horarios
export async function PUT(req) {
	try {
		const body = await req.json();

		await set(ref(db, `locales/${LOCAL}/horarios`), body);

		return Response.json({ ok: true });
	} catch (error) {
		console.error("PUT /api/locales/horarios ERROR:", error);
		return Response.json(
			{ error: "No se pudieron guardar los horarios" },
			{ status: 500 }
		);
	}
}
