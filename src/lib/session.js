"use client";

/**
 * Sesión de CardCloud (Firebase Auth) y perfil del usuario.
 * Perfil en la base: usuarios/{uid} = { nombre?, superadmin?, locales: { "<slug>": true } }
 * La seguridad real está en database.rules.json; esto solo arma la UI.
 */
import { useEffect, useState } from "react";
import {
	getAuth,
	onAuthStateChanged,
	signInWithEmailAndPassword,
	signOut,
	sendPasswordResetEmail,
	setPersistence,
	browserLocalPersistence,
} from "firebase/auth";
import { ref, get } from "firebase/database";
import { app, db } from "@/lib/firebase";

export const auth = getAuth(app);

export async function login(email, password) {
	await setPersistence(auth, browserLocalPersistence);
	return signInWithEmailAndPassword(auth, email.trim(), password);
}

export function logout() {
	return signOut(auth);
}

export function resetPassword(email) {
	return sendPasswordResetEmail(auth, email.trim());
}

export async function loadPerfil(uid) {
	const snap = await get(ref(db, `usuarios/${uid}`));
	const raw = snap.val() || {};
	return {
		nombre: raw.nombre || "",
		email: raw.email || "",
		superadmin: raw.superadmin === true,
		locales: Object.keys(raw.locales || {}).filter((k) => raw.locales[k] === true),
	};
}

export function canAccess(perfil, local) {
	return Boolean(perfil && (perfil.superadmin || perfil.locales.includes(local)));
}

/** "pinto-la-gula" -> "Pinto La Gula" when the local has no display name yet. */
export function localLabel(slug) {
	return String(slug || "")
		.split("-")
		.filter(Boolean)
		.map((w) => w.charAt(0).toUpperCase() + w.slice(1))
		.join(" ");
}

/**
 * status: "loading" | "anon" | "ready" | "error"
 */
export function useSession() {
	const [state, setState] = useState({ status: "loading", user: null, perfil: null, error: "" });

	useEffect(() => {
		return onAuthStateChanged(auth, async (user) => {
			if (!user) {
				setState({ status: "anon", user: null, perfil: null, error: "" });
				return;
			}
			try {
				const perfil = await loadPerfil(user.uid);
				setState({ status: "ready", user, perfil, error: "" });
			} catch {
				setState({ status: "error", user, perfil: null, error: "No pudimos leer tu perfil. Probá de nuevo." });
			}
		});
	}, []);

	return state;
}

/** Messages in Spanish for the auth errors people actually hit. */
export function authErrorMessage(code) {
	switch (code) {
		case "auth/invalid-credential":
		case "auth/wrong-password":
		case "auth/user-not-found":
		case "auth/invalid-email":
			return "Email o contraseña incorrectos.";
		case "auth/too-many-requests":
			return "Demasiados intentos. Esperá unos minutos o recuperá la contraseña.";
		case "auth/network-request-failed":
			return "Sin conexión. Revisá internet y probá de nuevo.";
		case "auth/configuration-not-found":
		case "auth/operation-not-allowed":
			return "El ingreso con email todavía no está activado en Firebase (Authentication > Sign-in method).";
		case "auth/unauthorized-domain":
			return "Este dominio no está autorizado en Firebase (Authentication > Settings > Authorized domains).";
		case "auth/user-disabled":
			return "Esta cuenta está desactivada. Escribinos para reactivarla.";
		default:
			return "No pudimos iniciar sesión. Probá de nuevo.";
	}
}
