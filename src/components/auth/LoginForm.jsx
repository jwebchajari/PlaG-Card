"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Eye, EyeOff, LoaderCircle } from "lucide-react";
import { login, resetPassword, useSession, authErrorMessage } from "@/lib/session";
import styles from "./auth.module.css";

export default function LoginForm() {
	const router = useRouter();
	const params = useSearchParams();
	const session = useSession();
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [show, setShow] = useState(false);
	const [busy, setBusy] = useState(false);
	const [error, setError] = useState("");
	const [info, setInfo] = useState("");

	// Only same-site dashboard paths are accepted as a return target.
	const next = params.get("next");
	const target = next && /^\/dashboard(\/[a-z0-9-]+)*\/?$/.test(next) ? next : "/dashboard";

	useEffect(() => {
		if (session.status === "ready") router.replace(target);
	}, [session.status, router, target]);

	async function submit(e) {
		e.preventDefault();
		setError("");
		setInfo("");
		if (!email.trim() || !password) {
			setError("Completá email y contraseña.");
			return;
		}
		setBusy(true);
		try {
			await login(email, password);
			// the effect above redirects once the profile loads
		} catch (err) {
			setError(authErrorMessage(err?.code));
			setBusy(false);
		}
	}

	async function forgot() {
		setError("");
		setInfo("");
		if (!email.trim()) {
			setError("Escribí tu email y tocá de nuevo “Olvidé mi contraseña”.");
			return;
		}
		try {
			await resetPassword(email);
		} catch {
			/* same message either way: do not reveal whether the email exists */
		}
		setInfo("Si el email está registrado, te llega un correo para crear una contraseña nueva.");
	}

	return (
		<div className={styles.page}>
			<form className={styles.card} onSubmit={submit} noValidate>
				<p className={styles.wordmark}>CardCloud</p>
				<h1 className={styles.title}>Ingresá a tu panel</h1>
				<p className={styles.lead}>Administrá el menú, los precios y los horarios de tu local.</p>

				<div className={styles.field}>
					<label htmlFor="email">Email</label>
					<input
						id="email"
						type="email"
						autoComplete="username"
						inputMode="email"
						value={email}
						onChange={(e) => setEmail(e.target.value)}
						className={styles.input}
						aria-invalid={error ? "true" : undefined}
					/>
				</div>

				<div className={styles.field}>
					<label htmlFor="password">Contraseña</label>
					<div className={styles.passwordWrap}>
						<input
							id="password"
							type={show ? "text" : "password"}
							autoComplete="current-password"
							value={password}
							onChange={(e) => setPassword(e.target.value)}
							className={styles.input}
							aria-invalid={error ? "true" : undefined}
						/>
						<button
							type="button"
							className={styles.eye}
							onClick={() => setShow((v) => !v)}
							aria-label={show ? "Ocultar contraseña" : "Mostrar contraseña"}
						>
							{show ? <EyeOff size={20} aria-hidden="true" /> : <Eye size={20} aria-hidden="true" />}
						</button>
					</div>
				</div>

				{error && (
					<p className={styles.error} role="alert">
						{error}
					</p>
				)}
				{info && (
					<p className={styles.info} role="status">
						{info}
					</p>
				)}

				<button type="submit" className={styles.submit} disabled={busy || session.status === "ready"}>
					{(busy || session.status === "ready") && <LoaderCircle size={18} className={styles.spin} aria-hidden="true" />}
					{busy || session.status === "ready" ? "Entrando..." : "Ingresar"}
				</button>

				<button type="button" className={styles.linkBtn} onClick={forgot}>
					Olvidé mi contraseña
				</button>
			</form>
		</div>
	);
}
