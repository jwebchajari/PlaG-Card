import { db } from "@/lib/firebase";
import { ref, get, push, set } from "firebase/database";

const LOCAL = process.env.NEXT_PUBLIC_LOCAL_NAME || "pinto-la-gula";

// GET → obtener todas las comidas
export async function GET() {
	try {
		const snapshot = await get(ref(db, `locales/${LOCAL}/comidas`));
		return Response.json(snapshot.val() || {});
	} catch (err) {
		console.error("ERROR GET /api/locales:", err);
		return Response.json({ error: "No se pudo obtener" }, { status: 500 });
	}
}

// POST → agregar comida
export async function POST(req) {
	try {
		const body = await req.json();

		const newRef = push(ref(db, `locales/${LOCAL}/comidas`));

		await set(newRef, {
			nombre: body.nombre ?? "",
			categoria: body.categoria ?? "Otros",
			valor: Number(body.valor) || 0,
			descripcion: body.descripcion ?? "",
			oferta: Boolean(body.oferta),
			valorOferta: body.valorOferta ? Number(body.valorOferta) : null,
			imagen: body.imagen ?? "",
		});

		return Response.json({ ok: true });
	} catch (error) {
		console.error("POST /api/locales ERROR:", error);
		return Response.json({ error: "No se pudo agregar" }, { status: 500 });
	}
}
