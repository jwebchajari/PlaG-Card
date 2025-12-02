import { db } from "@/lib/firebase";
import { ref, get, update } from "firebase/database";

const LOCAL = process.env.NEXT_PUBLIC_LOCAL_NAME || "pinto-la-gula";

/* ============================================
   GET → Obtener datos del local
============================================ */
export async function GET() {
    try {
        const snapshot = await get(ref(db, `locales/${LOCAL}/datos`));

        if (!snapshot.exists()) {
            return Response.json({});
        }

        return Response.json(snapshot.val());
    } catch (error) {
        console.error("GET /api/locales/datos ERROR:", error);
        return Response.json({ error: "Error al obtener datos" }, { status: 500 });
    }
}

/* ============================================
   PUT → Guardar datos del local
============================================ */
export async function PUT(req) {
    try {
        const body = await req.json(); // ❗ AHORA FUNCIONA porque enviamos headers

        const data = {
            whatsapp: body.whatsapp ?? "",
            direccion: body.direccion ?? "",
            alias: body.alias ?? "",
            extras: {
                carne: body.extras?.carne ?? 1500,
                panEspecial: body.extras?.panEspecial ?? 500,
            },
            redes: {
                instagram: body.redes?.instagram ?? "",
                facebook: body.redes?.facebook ?? "",
                twitter: body.redes?.twitter ?? "",
            },
        };

        await update(ref(db, `locales/${LOCAL}/datos`), data);

        return Response.json({ ok: true });
    } catch (error) {
        console.error("PUT /api/locales/datos ERROR:", error);
        return Response.json({ error: "Error al guardar datos" }, { status: 500 });
    }
}
