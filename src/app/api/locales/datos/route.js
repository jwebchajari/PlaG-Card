import { db } from "@/lib/firebase";
import { ref, get, update } from "firebase/database";

const LOCAL = process.env.NEXT_PUBLIC_LOCAL_NAME || "pinto-la-gula";

/* ===========================================================
   GET → Obtener datos generales del local
   Ruta: /api/locales/datos
=========================================================== */
export async function GET() {
	try {
		const snapshot = await get(ref(db, `locales/${LOCAL}/datos`));

		if (!snapshot.exists()) {
			return Response.json({});
		}

		return Response.json(snapshot.val());
	} catch (error) {
		console.error("GET /api/locales/datos ERROR:", error);
		return Response.json(
			{ error: "No se pudieron obtener los datos" },
			{ status: 500 }
		);
	}
}

/* ===========================================================
   PUT → Actualizar datos del local
   Ruta: /api/locales/datos
=========================================================== */
export async function PUT(req) {
	try {
		const body = await req.json();

		const data = {
			whatsapp: body.whatsapp ?? "",
			direccion: body.direccion ?? "",
			alias: body.alias ?? "", // 👈 NUEVO CAMPO PARA TRANSFERENCIAS

			redes: {
				instagram: body.redes?.instagram ?? "",
				facebook: body.redes?.facebook ?? "",
				twitter: body.redes?.twitter ?? "",
			},
		};

		// UPDATE mantiene otros datos existentes (banner, horarios, etc)
		await update(ref(db, `locales/${LOCAL}/datos`), data);

		return Response.json({ ok: true });
	} catch (error) {
		console.error("PUT /api/locales/datos ERROR:", error);
		return Response.json(
			{ error: "Error al actualizar los datos" },
			{ status: 500 }
		);
	}
}
