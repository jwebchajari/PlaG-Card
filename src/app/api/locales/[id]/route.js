import { db } from "@/lib/firebase";
import { ref, get, update, remove } from "firebase/database";

const LOCAL = process.env.NEXT_PUBLIC_LOCAL_NAME || "pinto-la-gula";

// GET → obtener comida
export async function GET(req, { params }) {
	try {
		const { id } = params;
		const snapshot = await get(ref(db, `locales/${LOCAL}/comidas/${id}`));
		return Response.json(snapshot.val() || {});
	} catch (error) {
		return Response.json({ error: "Error GET" }, { status: 500 });
	}
}

// PUT → actualizar comida
export async function PUT(req, { params }) {
	try {
		const { id } = params;
		const body = await req.json();

		await update(ref(db, `locales/${LOCAL}/comidas/${id}`), {
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
		return Response.json({ error: "Error PUT" }, { status: 500 });
	}
}

// DELETE → borrar comida
export async function DELETE(req, { params }) {
	try {
		const { id } = params;
		await remove(ref(db, `locales/${LOCAL}/comidas/${id}`));
		return Response.json({ ok: true });
	} catch (error) {
		return Response.json({ error: "Error DELETE" }, { status: 500 });
	}
}
