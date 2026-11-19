"use client";

/**
 * Lecturas y escrituras del panel, directo a Firebase con el usuario logueado.
 * Las reglas (database.rules.json) rechazan cualquier escritura de quien no
 * tenga ese local asignado, y validan tipos y largos.
 */
import { ref, get, push, set, update, remove } from "firebase/database";
import { initializeApp, getApps } from "firebase/app";
import {
	initializeAuth,
	inMemoryPersistence,
	createUserWithEmailAndPassword,
	signOut,
	sendPasswordResetEmail,
} from "firebase/auth";
import { app, db } from "@/lib/firebase";
import { auth } from "@/lib/session";
import { DIAS } from "@/utils/horarios";

const base = (local) => `locales/${local}`;

const text = (v, max) => String(v ?? "").trim().slice(0, max);
const money = (v) => {
	const n = Number(v);
	return Number.isFinite(n) && n >= 0 ? Math.round(n) : 0;
};
const HORA = /^([01]\d|2[0-3]):[0-5]\d$/;

export function cleanComida(form) {
	const valor = money(form.valor);
	const oferta = Boolean(form.oferta) && money(form.valorOferta) > 0 && money(form.valorOferta) < valor;
	const imagen = text(form.imagen, 600);
	return {
		nombre: text(form.nombre, 120),
		descripcion: text(form.descripcion, 600),
		categoria: text(form.categoria || "Otros", 40),
		valor,
		oferta,
		// null removes the field in Firebase
		valorOferta: oferta ? money(form.valorOferta) : null,
		imagen: imagen.startsWith("https://") ? imagen : "",
	};
}

/* ---------- Productos ---------- */

export async function listComidas(local) {
	const snap = await get(ref(db, `${base(local)}/comidas`));
	return snap.val() || {};
}

export async function getComida(local, id) {
	const snap = await get(ref(db, `${base(local)}/comidas/${id}`));
	return snap.val();
}

export async function createComida(local, form) {
	const r = push(ref(db, `${base(local)}/comidas`));
	await set(r, cleanComida(form));
	publish(local);
	return r.key;
}

export async function updateComida(local, id, form) {
	const prev = await getComida(local, id);
	const data = cleanComida(form);
	await update(ref(db, `${base(local)}/comidas/${id}`), data);
	publish(local);
	if (prev?.imagen && prev.imagen !== data.imagen) cleanupImage(local, prev.imagen);
}

export async function deleteComida(local, id) {
	const prev = await getComida(local, id);
	await remove(ref(db, `${base(local)}/comidas/${id}`));
	publish(local);
	if (prev?.imagen) cleanupImage(local, prev.imagen);
}

async function authedPost(path, body) {
	try {
		const token = await auth.currentUser?.getIdToken();
		if (!token) return;
		await fetch(path, {
			method: "POST",
			headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
			body: JSON.stringify(body),
		});
	} catch {
		/* best effort */
	}
}

/** Refreshes the published menu right away (otherwise it updates within a minute). */
function publish(local) {
	authedPost("/api/revalidar", { local });
}

/** Asks the server to delete a replaced photo from Cloudinary. Never blocks the save. */
function cleanupImage(local, url) {
	if (url.includes("res.cloudinary.com")) authedPost("/api/cloudinary/cleanup", { local, url });
}

/* ---------- Datos ---------- */

export async function getDatos(local) {
	const snap = await get(ref(db, `${base(local)}/datos`));
	return snap.val() || {};
}

export async function saveDatos(local, form) {
	const costo = form.costoEnvio === "" || form.costoEnvio === null || form.costoEnvio === undefined ? null : money(form.costoEnvio);
	await update(ref(db, `${base(local)}/datos`), {
		nombre: text(form.nombre, 80),
		whatsapp: text(form.whatsapp, 30).replace(/[^\d+\s-]/g, ""),
		direccion: text(form.direccion, 200),
		alias: text(form.alias, 80),
		costoEnvio: costo,
		extras: { carne: money(form.extras?.carne), panEspecial: money(form.extras?.panEspecial) },
		redes: {
			instagram: text(form.redes?.instagram, 200),
			facebook: text(form.redes?.facebook, 200),
			twitter: text(form.redes?.twitter, 200),
		},
	});
	publish(local);
}

/* ---------- Horarios ---------- */

export async function getHorarios(local) {
	const snap = await get(ref(db, `${base(local)}/horarios`));
	return snap.val() || {};
}

export async function saveHorarios(local, horarios) {
	const limpio = {};
	for (const dia of DIAS) {
		const info = horarios?.[dia] || {};
		limpio[dia] = {
			cerrado: Boolean(info.cerrado),
			franjas: (info.franjas || [])
				.map((f) => ({ desde: String(f.desde || ""), hasta: String(f.hasta || "") }))
				.filter((f) => HORA.test(f.desde) && HORA.test(f.hasta) && f.desde !== f.hasta)
				.slice(0, 4),
		};
	}
	await set(ref(db, `${base(local)}/horarios`), limpio);
	publish(local);
}

/* ---------- Visitas ---------- */

export async function getVisitas(local) {
	const snap = await get(ref(db, `${base(local)}/visitas`));
	return snap.val() || {};
}

/* ---------- Superroot: locales, usuarios y solicitudes ---------- */

export const SLUG_RE = /^[a-z0-9-]{2,60}$/;
const RESERVED = new Set(["admin", "login", "api", "nuevo"]);

export function slugify(nombre) {
	return String(nombre || "")
		.normalize("NFD")
		.replace(/[\u0300-\u036f]/g, "")
		.toLowerCase()
		.replace(/[^a-z0-9]+/g, "-")
		.replace(/^-|-$/g, "")
		.slice(0, 60);
}

/** All locales with their display name and product count (superadmin can read `locales`). */
export async function listLocales() {
	const snap = await get(ref(db, "locales"));
	const all = snap.val() || {};
	return Object.entries(all)
		.map(([slug, l]) => ({
			slug,
			nombre: l?.datos?.nombre || "",
			productos: Object.keys(l?.comidas || {}).length,
			visitas: Number(l?.visitas?.total) || 0,
		}))
		.sort((a, b) => a.slug.localeCompare(b.slug));
}

export async function createLocal(nombre, slug) {
	if (!SLUG_RE.test(slug) || RESERVED.has(slug)) throw new Error("slug");
	const existing = await get(ref(db, `locales/${slug}/datos`));
	if (existing.exists()) throw new Error("exists");
	await set(ref(db, `locales/${slug}/datos`), { nombre: text(nombre, 80) });
}

export async function listUsuarios() {
	const snap = await get(ref(db, "usuarios"));
	const all = snap.val() || {};
	return Object.entries(typeof all === "object" ? all : {}).map(([uid, u]) => ({
		uid,
		nombre: u?.nombre || "",
		email: u?.email || "",
		superadmin: u?.superadmin === true,
		locales: Object.keys(u?.locales || {}).filter((k) => u.locales[k] === true),
	}));
}

/** Creates or replaces a user's access. `locales` is an array of slugs. */
export async function saveUsuario(uid, { nombre, email, superadmin, locales }) {
	const map = {};
	(locales || []).forEach((l) => {
		if (SLUG_RE.test(l)) map[l] = true;
	});
	await set(ref(db, `usuarios/${uid}`), {
		nombre: text(nombre, 80),
		email: text(email, 120),
		superadmin: Boolean(superadmin),
		...(Object.keys(map).length && { locales: map }),
	});
	await remove(ref(db, `solicitudes/${uid}`));
}

export function removeUsuario(uid) {
	return remove(ref(db, `usuarios/${uid}`));
}

export async function listSolicitudes() {
	const snap = await get(ref(db, "solicitudes"));
	return Object.entries(snap.val() || {})
		.map(([uid, s]) => ({ uid, email: s.email || "", nombre: s.nombre || "", fecha: s.fecha || 0 }))
		.sort((a, b) => b.fecha - a.fecha);
}

export function deleteSolicitud(uid) {
	return remove(ref(db, `solicitudes/${uid}`));
}

/** A signed-in user without locales leaves a request the superroot sees in the admin panel. */
export function requestAccess(user) {
	return set(ref(db, `solicitudes/${user.uid}`), {
		email: user.email || "",
		nombre: text(user.displayName, 80),
		fecha: Date.now(),
	});
}

/* ---------- Superroot: crear cuentas ---------- */

const CREATOR_APP = "cardcloud-creador";
let creatorAuth = null;

/**
 * Second Firebase app used only to create accounts. Creating a user signs in
 * as that user; doing it here keeps the superroot's own session untouched.
 * In-memory persistence: nothing of the new user is stored in the browser.
 */
function getCreatorAuth() {
	if (creatorAuth) return creatorAuth;
	const second = getApps().find((a) => a.name === CREATOR_APP) || initializeApp(app.options, CREATOR_APP);
	creatorAuth = initializeAuth(second, { persistence: inMemoryPersistence });
	return creatorAuth;
}

function randomPassword() {
	const bytes = new Uint8Array(18);
	crypto.getRandomValues(bytes);
	return btoa(String.fromCharCode(...bytes)).replace(/[^A-Za-z0-9]/g, "").slice(0, 20) + "!9a";
}

/**
 * Crea la cuenta en Firebase Authentication y guarda usuarios/{uid} con sus locales.
 * Si no se pasa contraseña, se genera una al azar y se le manda el mail para que elija la suya.
 * @returns {Promise<{uid:string, mailEnviado:boolean}>}
 */
export async function crearUsuario({ email, password, nombre, locales, enviarMail = true }) {
	const correo = text(email, 120).toLowerCase();
	const pass = password || randomPassword();
	const creator = getCreatorAuth();

	const cred = await createUserWithEmailAndPassword(creator, correo, pass);
	const uid = cred.user.uid;
	await signOut(creator);

	// Written with the superroot's session (main app), which the rules allow.
	await saveUsuario(uid, { nombre, email: correo, superadmin: false, locales });

	let mailEnviado = false;
	if (enviarMail || !password) {
		try {
			await sendPasswordResetEmail(auth, correo);
			mailEnviado = true;
		} catch {
			/* the account exists anyway; the mail can be resent with "Olvidé mi contraseña" */
		}
	}
	return { uid, mailEnviado };
}

export function crearUsuarioError(code) {
	switch (code) {
		case "auth/email-already-in-use":
			return "Ya existe una cuenta con ese email. Pedile que entre a /login: va a aparecer en Pedidos de acceso, o agregala por UID.";
		case "auth/invalid-email":
			return "El email no es válido.";
		case "auth/weak-password":
			return "La contraseña tiene que tener al menos 6 caracteres.";
		case "auth/operation-not-allowed":
			return "El ingreso con email no está activado en Firebase.";
		case "auth/too-many-requests":
			return "Demasiados intentos seguidos. Esperá unos minutos.";
		default:
			return "No se pudo crear el usuario.";
	}
}
