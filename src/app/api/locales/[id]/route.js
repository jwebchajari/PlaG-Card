import { db } from "@/lib/firebase";
import { ref, update, remove } from "firebase/database";

const LOCAL = process.env.NEXT_PUBLIC_LOCAL_NAME || "pinto-la-gula";

export async function PUT(req, { params }) {
	try {
		const { id } = params;
		const body = await req.json();

		const data = {
			nombre: body.nombre ?? "",
			valor: Number(body.valor) || 0,
			descripcion: body.descripcion ?? "",
			oferta: Boolean(body.oferta),
			valorOferta: body.valorOferta ? Number(body.valorOferta) : null,
			imagen: body.imagen ?? "",
		};

		await update(ref(db, `locales/${LOCAL}/${id}`), data);

		return Response.json({ ok: true });
	} catch (error) {
		console.error("Error PUT /api/locales/[id]:", error);
		return Response.json(
			{ error: "Error actualizando comida" },
			{ status: 500 }
		);
	}
}

export async function DELETE(req, { params }) {
	try {
		const { id } = params;

		await remove(ref(db, `locales/${LOCAL}/${id}`));

		return Response.json({ ok: true });
	} catch (error) {
		console.error("Error DELETE /api/locales/[id]:", error);
		return Response.json(
			{ error: "Error eliminando comida" },
			{ status: 500 }
		);
	}
}
