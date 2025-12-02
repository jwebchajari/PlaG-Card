export const dynamic = "force-dynamic";

import { db } from "@/lib/firebase";
import { ref, get, set } from "firebase/database";

const LOCAL = process.env.NEXT_PUBLIC_LOCAL_NAME || "pinto-la-gula";

export async function GET() {
    try {
        const snap = await get(ref(db, `locales/${LOCAL}/horarios`));
        return Response.json(snap.val() || {});
    } catch (e) {
        console.error("GET horarios ERROR:", e);
        return Response.json({ error: "Error al obtener horarios" }, { status: 500 });
    }
}

export async function PUT(req) {
    try {
        const body = await req.json();

        const diasValidos = [
            "lunes", "martes", "miércoles",
            "jueves", "viernes", "sábado", "domingo"
        ];

        for (const dia of diasValidos) {
            body[dia].cerrado = Boolean(body[dia].cerrado);
            body[dia].franjas = Array.isArray(body[dia].franjas)
                ? body[dia].franjas
                : [];
        }

        await set(ref(db, `locales/${LOCAL}/horarios`), body);

        return Response.json({ ok: true });
    } catch (error) {
        console.error("PUT horarios ERROR:", error);
        return Response.json(
            { error: "Error al guardar horarios" },
            { status: 500 }
        );
    }
}
