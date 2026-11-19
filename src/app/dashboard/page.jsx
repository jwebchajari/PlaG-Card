"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ChevronRight, LogOut, Store, ShieldCheck } from "lucide-react";
import { useSession, logout, localLabel } from "@/lib/session";
import { listLocales, requestAccess } from "@/lib/admin-data";
import LoadingScreen from "@/components/Loading";
import styles from "@/components/auth/auth.module.css";

/**
 * After login:
 * - one local and not superroot -> straight to its panel
 * - several locales -> picker
 * - superroot -> every local + Administración
 * - no locales -> leaves an access request for the superroot
 */
export default function DashboardHome() {
	const router = useRouter();
	const session = useSession();
	const perfil = session.perfil;
	const [locales, setLocales] = useState(null); // [{ slug, nombre }]
	const [pedido, setPedido] = useState("idle"); // idle | sent | error

	useEffect(() => {
		if (session.status === "anon") router.replace("/login");
		if (session.status !== "ready") return;

		if (perfil.superadmin) {
			listLocales()
				.then((all) => setLocales(all))
				.catch(() => setLocales(perfil.locales.map((slug) => ({ slug, nombre: "" }))));
			return;
		}
		if (perfil.locales.length === 1) {
			router.replace(`/dashboard/${perfil.locales[0]}`);
			return;
		}
		setLocales(perfil.locales.map((slug) => ({ slug, nombre: "" })));
		if (perfil.locales.length === 0) {
			requestAccess(session.user)
				.then(() => setPedido("sent"))
				.catch(() => setPedido("error"));
		}
	}, [session.status, session.user, perfil, router]);

	if (session.status !== "ready" || !locales) return <LoadingScreen label="Entrando..." />;

	return (
		<div className={styles.page}>
			<div className={styles.card}>
				<p className={styles.wordmark}>CardCloud</p>
				<h1 className={styles.title}>{perfil.nombre ? `Hola, ${perfil.nombre}` : "Tus locales"}</h1>

				{locales.length === 0 ? (
					<p className={styles.lead}>
						Tu usuario ({session.user.email}) todavía no tiene locales asignados.{" "}
						{pedido === "sent" && "Ya le avisamos al administrador de CardCloud: cuando te dé acceso, volvé a entrar."}
						{pedido === "error" && "Pedile al administrador de CardCloud que te dé acceso."}
					</p>
				) : (
					<>
						<p className={styles.lead}>Elegí qué local querés administrar.</p>
						<ul className={styles.localList}>
							{locales.map((l) => (
								<li key={l.slug}>
									<Link href={`/dashboard/${l.slug}`} className={styles.localItem}>
										<span className={styles.localIcon}>
											<Store size={20} aria-hidden="true" />
										</span>
										<span className={styles.localName}>{l.nombre || localLabel(l.slug)}</span>
										<ChevronRight size={20} aria-hidden="true" />
									</Link>
								</li>
							))}
						</ul>
					</>
				)}

				{perfil.superadmin && (
					<Link href="/dashboard/admin" className={`${styles.localItem} ${styles.adminItem}`}>
						<span className={styles.localIcon}>
							<ShieldCheck size={20} aria-hidden="true" />
						</span>
						<span className={styles.localName}>Administración</span>
						<ChevronRight size={20} aria-hidden="true" />
					</Link>
				)}

				<button type="button" className={styles.linkBtn} onClick={() => logout()}>
					<LogOut size={16} aria-hidden="true" />
					Cerrar sesión
				</button>
			</div>
		</div>
	);
}
