"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { ref, get } from "firebase/database";
import { db } from "@/lib/firebase";
import { usePathname, useRouter } from "next/navigation";
import { UtensilsCrossed, Plus, Store, Clock, ExternalLink, LogOut, ArrowLeftRight, ShieldCheck } from "lucide-react";
import { useSession, canAccess, logout, localLabel } from "@/lib/session";
import LoadingScreen from "@/components/Loading";
import logo from "../../../public/brand/logo-96.png";
import styles from "./dashboard.module.css";

export default function DashboardShell({ local, children }) {
	const path = usePathname();
	const router = useRouter();
	const session = useSession();
	const root = `/dashboard/${local}`;
	const [nombre, setNombre] = useState("");

	useEffect(() => {
		get(ref(db, `locales/${local}/datos/nombre`))
			.then((snap) => setNombre(snap.val() || ""))
			.catch(() => {});
	}, [local]);

	useEffect(() => {
		if (session.status === "anon") router.replace(`/login?next=${encodeURIComponent(path)}`);
	}, [session.status, router, path]);

	if (session.status === "loading" || session.status === "anon") return <LoadingScreen label="Verificando sesión..." />;

	if (session.status === "error") {
		return (
			<div className={styles.gate}>
				<p className={styles.errorBox}>{session.error}</p>
				<button type="button" className={styles.ghostBtn} onClick={() => location.reload()}>
					Reintentar
				</button>
			</div>
		);
	}

	if (!canAccess(session.perfil, local)) {
		return (
			<div className={styles.gate}>
				<h1 className={styles.h1}>No tenés acceso a este local</h1>
				<p className={styles.lead}>Entraste como {session.user.email}.</p>
				<div className={styles.gateActions}>
					<Link href="/dashboard" className={styles.primaryBtn}>
						Ir a mis locales
					</Link>
					<button type="button" className={styles.ghostBtn} onClick={() => logout()}>
						Cerrar sesión
					</button>
				</div>
			</div>
		);
	}

	const nav = [
		{ href: root, label: "Productos", Icon: UtensilsCrossed, active: path === root || path.startsWith(`${root}/editar`) },
		{ href: `${root}/agregar`, label: "Agregar", Icon: Plus },
		{ href: `${root}/datos`, label: "Datos", Icon: Store },
		{ href: `${root}/horarios`, label: "Horarios", Icon: Clock },
	].map((n) => ({ ...n, active: n.active ?? path.startsWith(n.href) }));

	const multi = session.perfil.superadmin || session.perfil.locales.length > 1;

	return (
		<div className={styles.shell}>
			<header className={styles.header}>
				<Link href={root} className={styles.brand}>
					<Image src={logo} alt="" width={36} height={37} />
					<span>
						<span className={styles.brandName}>{nombre || localLabel(local)}</span>
						<span className={styles.brandSub}>Panel CardCloud</span>
					</span>
				</Link>
				<div className={styles.headerActions}>
					<a href="/" className={styles.headerIcon} target="_blank" rel="noopener noreferrer" aria-label="Ver el menú publicado">
						<ExternalLink size={18} aria-hidden="true" />
					</a>
					{session.perfil.superadmin && (
						<Link href="/dashboard/admin" className={styles.headerIcon} aria-label="Administración de CardCloud">
							<ShieldCheck size={18} aria-hidden="true" />
						</Link>
					)}
					{multi && (
						<Link href="/dashboard" className={styles.headerIcon} aria-label="Cambiar de local">
							<ArrowLeftRight size={18} aria-hidden="true" />
						</Link>
					)}
					<button type="button" className={styles.headerIcon} onClick={() => logout()} aria-label="Cerrar sesión">
						<LogOut size={18} aria-hidden="true" />
					</button>
				</div>
			</header>

			<nav className={styles.nav} aria-label="Secciones del panel">
				<ul>
					{nav.map(({ href, label, Icon, active }) => (
						<li key={href}>
							<Link href={href} className={styles.navLink} aria-current={active ? "page" : undefined}>
								<Icon size={20} aria-hidden="true" />
								<span>{label}</span>
							</Link>
						</li>
					))}
				</ul>
			</nav>

			<main className={styles.main}>{children}</main>
		</div>
	);
}
