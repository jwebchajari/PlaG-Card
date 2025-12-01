import { db } from "@/lib/firebase";
import { ref, get, push, set } from "firebase/database";

const LOCAL = process.env.NEXT_PUBLIC_LOCAL_NAME || "pinto-la-gula";

// GET => obtener todas las comidas
export async function GET() {
    try {
        const snap = await get(ref(db, `locales/${LOCAL}/comidas`));
        return Response.json(snap.val() || {});
    } catch (error) {
        console.error("GET /api/comidas ERROR:", error);
        return Response.json({ error: "Error al obtener comidas" }, { status: 500 });
    }
}

// POST => crear comida
export async function POST(req) {
    try {
        const body = await req.json();
        const newRef = push(ref(db, `locales/${LOCAL}/comidas`));

        const data = {
           nombre: body.nombre ?? "",
           valor: Number(body.valor) || 0,
           descripcion: body.descripcion ?? "",
           categoria: body.categoria ?? "otros",
           oferta: Boolean(body.oferta),
           valorOferta: body.valorOferta ? Number(body.valorOferta) : null,
           imagen: body.imagen ?? "",
        };

        await set(newRef, data);
        return Response.json({ ok: true });
    } catch (error) {
        console.error("POST /api/comidas ERROR:", error);
        return Response.json({ error: "No se pudo crear" }, { status: 500 });
    }
}
