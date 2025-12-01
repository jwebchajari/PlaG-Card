import { db } from "@/lib/firebase";
import { ref, update, remove, get } from "firebase/database";

const LOCAL = process.env.NEXT_PUBLIC_LOCAL_NAME || "pinto-la-gula";

// -------------------------------------------------------------
// GET → Obtener UNA comida
// -------------------------------------------------------------
export async function GET(req, { params }) {
	try {
		const snap = await get(
			ref(db, `locales/${LOCAL}/comidas/${params.id}`)
		);

		return Response.json(snap.val() || {});
	} catch (error) {
		console.error("GET /api/locales/comidas/[id] ERROR:", error);
		return Response.json(
			{ error: "Error al obtener comida" },
			{ status: 500 }
		);
	}
}

// -------------------------------------------------------------
// PUT → Actualizar comida
// -------------------------------------------------------------
export async function PUT(req, { params }) {
	try {
		const body = await req.json();

		const data = {
			nombre: body.nombre ?? "",
			valor: Number(body.valor) || 0,
			descripcion: body.descripcion ?? "",
			categoria: body.categoria ?? "otros",
			oferta: Boolean(body.oferta),
			valorOferta: body.valorOferta ? Number(body.valorOferta) : null,
			imagen: body.imagen ?? "",
		};

		await update(
			ref(db, `locales/${LOCAL}/comidas/${params.id}`),
			data
		);

		return Response.json({ ok: true });
	} catch (error) {
		console.error("PUT /api/locales/comidas/[id] ERROR:", error);
		return Response.json(
			{ error: "No se pudo actualizar" },
			{ status: 500 }
		);
	}
}

// -------------------------------------------------------------
// DELETE → Eliminar comida
// -------------------------------------------------------------
export async function DELETE(req, { params }) {
	try {
		await remove(ref(db, `locales/${LOCAL}/comidas/${params.id}`));
		return Response.json({ ok: true });
	} catch (error) {
		console.error("DELETE /api/locales/comidas/[id] ERROR:", error);
		return Response.json(
			{ error: "No se pudo eliminar" },
			{ status: 500 }
		);
	}
}
