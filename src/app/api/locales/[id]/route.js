import { db } from "@/lib/firebase";
import { ref, update, remove, get } from "firebase/database";

const LOCAL = process.env.NEXT_PUBLIC_LOCAL_NAME || "pinto-la-gula";

/**
 * GET — opcional pero evita errores en Vercel
 */
export async function GET(req, { params }) {
    try {
        const { id } = params;
        const snapshot = await get(ref(db, `locales/${LOCAL}/comidas/${id}`));
        return Response.json(snapshot.val() || {});
    } catch (error) {
        console.error("GET /api/locales/[id] ERROR:", error);
        return Response.json({ error: "Error en GET" }, { status: 500 });
    }
}

/**
 * PUT — actualizar comida
 */
export async function PUT(req, { params }) {
    try {
        const { id } = params;
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

        await update(ref(db, `locales/${LOCAL}/comidas/${id}`), data);

        return Response.json({ ok: true });
    } catch (error) {
        console.error("PUT /api/locales/[id] ERROR:", error);
        return Response.json({ error: "Error al actualizar" }, { status: 500 });
    }
}

/**
 * DELETE — eliminar comida
 */
export async function DELETE(req, { params }) {
    try {
        const { id } = params;

        await remove(ref(db, `locales/${LOCAL}/comidas/${id}`));

        return Response.json({ ok: true });
    } catch (error) {
        console.error("DELETE /api/locales/[id] ERROR:", error);
        return Response.json({ error: "Error al eliminar" }, { status: 500 });
    }
}
