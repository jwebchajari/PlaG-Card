import { db } from "@/lib/firebase";
import { ref, get, push, set } from "firebase/database";

const LOCAL = process.env.NEXT_PUBLIC_LOCAL_NAME || "pinto-la-gula";

export async function GET() {
	try {
		const snapshot = await get(ref(db, `locales/${LOCAL}`));
		return Response.json(snapshot.val() || {});
	} catch (error) {
		console.error("Error GET /api/locales:", error);
		return Response.json(
			{ error: "Error obteniendo comidas" },
			{ status: 500 }
		);
	}
}

export async function POST(req) {
	try {
		const body = await req.json();

		const data = {
			nombre: body.nombre ?? "",
			valor: Number(body.valor) || 0,
			descripcion: body.descripcion ?? "",
			oferta: Boolean(body.oferta),
			valorOferta: body.valorOferta ? Number(body.valorOferta) : null,
			imagen: body.imagen ?? "",
		};

		const nuevaRef = push(ref(db, `locales/${LOCAL}`));
		await set(nuevaRef, data);

		return Response.json({ id: nuevaRef.key, ...data }, { status: 201 });
	} catch (error) {
		console.error("Error POST /api/locales:", error);
		return Response.json(
			{ error: "Error creando comida" },
			{ status: 500 }
		);
	}
}
