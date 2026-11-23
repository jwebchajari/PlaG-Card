import { cache } from "react";
import { ref, get } from "firebase/database";
import { db } from "@/lib/firebase";
import { LOCAL, CATEGORIES } from "@/lib/site";
import { normalizeProduct } from "@/lib/menu-shared";
import { normalizeHorarios } from "@/utils/horarios";

/**
 * Public data of the local, deduplicated per request. Reads the three public
 * children separately: the rules do not allow reading the whole local node.
 */
export const getLocal = cache(async function getLocal(local = LOCAL) {
	const read = async (child) => (await get(ref(db, `locales/${local}/${child}`))).val();
	const [comidas, datosRaw, horarios] = await Promise.all([read("comidas"), read("datos"), read("horarios")]);
	const raw = { comidas, datos: datosRaw, horarios };

	const products = Object.entries(raw.comidas || {})
		.map(([id, item]) => normalizeProduct(id, item))
		.filter((p) => p.name);

	const sections = CATEGORIES.map((c) => ({
		...c,
		products: products.filter((p) => p.category === c.id),
	})).filter((s) => s.products.length > 0);

	const datos = raw.datos || {};

	return {
		products,
		sections,
		horarios: normalizeHorarios(raw.horarios),
		datos: {
			nombre: datos.nombre || "",
			whatsapp: datos.whatsapp || "",
			direccion: datos.direccion || "",
			alias: datos.alias || "",
			// null = the owner has not set it (confirmed by WhatsApp); 0 = free delivery
			costoEnvio: datos.costoEnvio === null || datos.costoEnvio === undefined || datos.costoEnvio === "" ? null : Number(datos.costoEnvio) || 0,
			// Lo que no está guardado queda activo.
			opciones: {
				envio: datos.opciones?.envio !== false,
				transferencia: datos.opciones?.transferencia !== false,
			},
			extras: {
				carne: Number(datos.extras?.carne) || 0,
				panEspecial: Number(datos.extras?.panEspecial) || 0,
			},
			redes: {
				instagram: datos.redes?.instagram || "",
				facebook: datos.redes?.facebook || "",
			},
		},
	};
});
