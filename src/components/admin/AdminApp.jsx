"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, LogOut, Plus, Store, UserPlus, Users, Inbox, ShieldCheck, ExternalLink, LoaderCircle } from "lucide-react";
import { useSession, logout, localLabel } from "@/lib/session";
import {
	listLocales,
	createLocal,
	listUsuarios,
	saveUsuario,
	removeUsuario,
	listSolicitudes,
	deleteSolicitud,
	crearUsuario,
	crearUsuarioError,
	slugify,
	SLUG_RE,
} from "@/lib/admin-data";
import LoadingScreen from "@/components/Loading";
import styles from "./admin.module.css";

const UID_RE = /^[A-Za-z0-9]{10,128}$/;

function LocalChecks({ locales, value, onChange, idPrefix }) {
	if (!locales.length) return <p className={styles.muted}>Todavía no hay locales. Creá uno abajo.</p>;
	return (
		<fieldset className={styles.checks}>
			<legend className={styles.label}>Locales que puede administrar</legend>
			{locales.map((l) => (
				<label key={l.slug} className={styles.check} htmlFor={`${idPrefix}-${l.slug}`}>
					<input
						id={`${idPrefix}-${l.slug}`}
						type="checkbox"
						checked={value.includes(l.slug)}
						onChange={(e) => onChange(e.target.checked ? [...value, l.slug] : value.filter((x) => x !== l.slug))}
					/>
					<span>{l.nombre || localLabel(l.slug)}</span>
				</label>
			))}
		</fieldset>
	);
}

function UserEditor({ user, locales, isSelf, onSaved, onRemoved }) {
	const [open, setOpen] = useState(false);
	const [form, setForm] = useState(user);
	const [busy, setBusy] = useState(false);
	const [msg, setMsg] = useState("");

	async function save() {
		setBusy(true);
		setMsg("");
		try {
			await saveUsuario(user.uid, { ...form, superadmin: isSelf ? true : form.superadmin });
			onSaved();
			setOpen(false);
		} catch {
			setMsg("No se pudo guardar.");
		}
		setBusy(false);
	}

	async function quitar() {
		if (!confirm(`¿Quitarle todo el acceso a ${user.email || user.uid}? Su cuenta sigue existiendo pero no va a poder entrar a ningún panel.`)) return;
		try {
			await removeUsuario(user.uid);
			onRemoved();
		} catch {
			setMsg("No se pudo quitar el acceso.");
		}
	}

	return (
		<li className={styles.item}>
			<div className={styles.itemHead}>
				<div className={styles.itemMain}>
					<p className={styles.itemTitle}>
						{user.nombre || user.email || "Sin nombre"}
						{user.superadmin && (
							<span className={styles.badge}>
								<ShieldCheck size={14} aria-hidden="true" /> Superroot
							</span>
						)}
						{isSelf && <span className={styles.badgeMuted}>Vos</span>}
					</p>
					{user.email && user.nombre && <p className={styles.itemSub}>{user.email}</p>}
					<div className={styles.chips}>
						{user.locales.length ? (
							user.locales.map((l) => (
								<span key={l} className={styles.chip}>
									{locales.find((x) => x.slug === l)?.nombre || localLabel(l)}
								</span>
							))
						) : (
							<span className={styles.muted}>Sin locales</span>
						)}
					</div>
				</div>
				<button type="button" className={styles.smallBtn} aria-expanded={open} onClick={() => setOpen((v) => !v)}>
					{open ? "Cerrar" : "Editar"}
				</button>
			</div>

			{open && (
				<div className={styles.editor}>
					<div className={styles.row2}>
						<label className={styles.field}>
							<span className={styles.label}>Nombre</span>
							<input className={styles.input} value={form.nombre} onChange={(e) => setForm({ ...form, nombre: e.target.value })} />
						</label>
						<label className={styles.field}>
							<span className={styles.label}>Email</span>
							<input className={styles.input} type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
						</label>
					</div>
					<LocalChecks locales={locales} value={form.locales} onChange={(v) => setForm({ ...form, locales: v })} idPrefix={`u-${user.uid}`} />
					<label className={styles.check}>
						<input type="checkbox" checked={isSelf || form.superadmin} disabled={isSelf} onChange={(e) => setForm({ ...form, superadmin: e.target.checked })} />
						<span>Superroot (entra a todos los locales y a esta pantalla)</span>
					</label>
					<p className={styles.uid}>UID: {user.uid}</p>
					{msg && <p className={styles.error}>{msg}</p>}
					<div className={styles.actions}>
						<button type="button" className={styles.primary} onClick={save} disabled={busy}>
							{busy && <LoaderCircle size={16} className={styles.spin} aria-hidden="true" />}
							Guardar
						</button>
						{!isSelf && (
							<button type="button" className={styles.danger} onClick={quitar}>
								Quitar acceso
							</button>
						)}
					</div>
				</div>
			)}
		</li>
	);
}

function Solicitud({ s, locales, onDone }) {
	const [sel, setSel] = useState([]);
	const [busy, setBusy] = useState(false);

	async function aprobar() {
		setBusy(true);
		try {
			await saveUsuario(s.uid, { nombre: s.nombre, email: s.email, superadmin: false, locales: sel });
			onDone();
		} catch {
			setBusy(false);
			alert("No se pudo dar acceso.");
		}
	}

	return (
		<li className={styles.item}>
			<p className={styles.itemTitle}>{s.email}</p>
			<p className={styles.itemSub}>Pidió acceso el {new Date(s.fecha).toLocaleString("es-AR", { dateStyle: "short", timeStyle: "short" })}</p>
			<LocalChecks locales={locales} value={sel} onChange={setSel} idPrefix={`s-${s.uid}`} />
			<div className={styles.actions}>
				<button type="button" className={styles.primary} onClick={aprobar} disabled={busy || !sel.length}>
					Dar acceso
				</button>
				<button
					type="button"
					className={styles.ghost}
					onClick={async () => {
						await deleteSolicitud(s.uid);
						onDone();
					}}
				>
					Descartar
				</button>
			</div>
		</li>
	);
}

export default function AdminApp() {
	const router = useRouter();
	const session = useSession();
	const [data, setData] = useState(null);
	const [error, setError] = useState("");

	const [nuevoLocal, setNuevoLocal] = useState({ nombre: "", slug: "", slugTocado: false });
	const [localMsg, setLocalMsg] = useState("");
	const [nuevoUser, setNuevoUser] = useState({ uid: "", email: "", nombre: "", locales: [] });
	const [userMsg, setUserMsg] = useState("");
	const [alta, setAlta] = useState({ email: "", nombre: "", password: "", locales: [], enviarMail: true });
	const [altaState, setAltaState] = useState({ busy: false, ok: "", error: "" });

	const load = useCallback(async () => {
		try {
			const [locales, usuarios, solicitudes] = await Promise.all([listLocales(), listUsuarios(), listSolicitudes()]);
			setData({ locales, usuarios, solicitudes });
		} catch {
			setError("No pudimos leer la base. ¿Publicaste las reglas nuevas?");
		}
	}, []);

	useEffect(() => {
		if (session.status === "anon") router.replace("/login?next=/dashboard/admin");
		if (session.status === "ready" && session.perfil.superadmin) load();
	}, [session.status, session.perfil, router, load]);

	if (session.status !== "ready") return <LoadingScreen label="Verificando sesión..." />;

	if (!session.perfil.superadmin) {
		return (
			<div className={styles.page}>
				<div className={styles.content}>
					<h1 className={styles.h1}>Solo para el administrador de CardCloud</h1>
					<Link href="/dashboard" className={styles.ghost}>
						Ir a mis locales
					</Link>
				</div>
			</div>
		);
	}

	async function crearLocal(e) {
		e.preventDefault();
		setLocalMsg("");
		const slug = nuevoLocal.slug || slugify(nuevoLocal.nombre);
		if (!nuevoLocal.nombre.trim()) return setLocalMsg("Poné el nombre del local.");
		if (!SLUG_RE.test(slug)) return setLocalMsg("El identificador solo puede tener minúsculas, números y guiones.");
		try {
			await createLocal(nuevoLocal.nombre, slug);
			setNuevoLocal({ nombre: "", slug: "", slugTocado: false });
			setLocalMsg(`Listo: ${nuevoLocal.nombre} creado.`);
			load();
		} catch (err) {
			setLocalMsg(err.message === "exists" ? "Ya existe un local con ese identificador." : err.message === "slug" ? "Ese identificador está reservado." : "No se pudo crear.");
		}
	}

	async function crearCuenta(e) {
		e.preventDefault();
		setAltaState({ busy: false, ok: "", error: "" });
		if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(alta.email.trim())) return setAltaState({ busy: false, ok: "", error: "Escribí un email válido." });
		if (alta.password && alta.password.length < 6) return setAltaState({ busy: false, ok: "", error: "La contraseña tiene que tener al menos 6 caracteres." });
		if (!alta.locales.length) return setAltaState({ busy: false, ok: "", error: "Elegí al menos un local." });

		setAltaState({ busy: true, ok: "", error: "" });
		try {
			const { uid, mailEnviado } = await crearUsuario(alta);
			setAlta({ email: "", nombre: "", password: "", locales: [], enviarMail: true });
			setAltaState({
				busy: false,
				error: "",
				ok: `Cuenta creada (UID ${uid}). ${mailEnviado ? `Le mandamos un mail a ${alta.email.trim()} para que elija su contraseña.` : "Pasale la contraseña que pusiste."}`,
			});
			load();
		} catch (err) {
			setAltaState({ busy: false, ok: "", error: crearUsuarioError(err?.code) });
		}
	}

	async function agregarUsuario(e) {
		e.preventDefault();
		setUserMsg("");
		const uid = nuevoUser.uid.trim();
		if (!UID_RE.test(uid)) return setUserMsg("Pegá el UID tal cual figura en Firebase > Authentication > Users.");
		if (!nuevoUser.locales.length) return setUserMsg("Elegí al menos un local.");
		try {
			await saveUsuario(uid, { ...nuevoUser, uid, superadmin: false });
			setNuevoUser({ uid: "", email: "", nombre: "", locales: [] });
			setUserMsg("Usuario agregado.");
			load();
		} catch {
			setUserMsg("No se pudo agregar.");
		}
	}

	return (
		<div className={styles.page}>
			<header className={styles.header}>
				<div className={styles.headerInner}>
					<Link href="/dashboard" className={styles.headerBtn} aria-label="Volver a mis locales">
						<ArrowLeft size={20} aria-hidden="true" />
					</Link>
					<div className={styles.headerText}>
						<p className={styles.wordmark}>CardCloud</p>
						<h1 className={styles.headerTitle}>Administración</h1>
					</div>
					<button type="button" className={styles.headerBtn} onClick={() => logout()} aria-label="Cerrar sesión">
						<LogOut size={20} aria-hidden="true" />
					</button>
				</div>
			</header>

			<main className={styles.content}>
				{error && <p className={styles.error}>{error}</p>}
				{!data && !error && <LoadingScreen label="Cargando..." />}

				{data && (
					<>
						{data.solicitudes.length > 0 && (
							<section className={styles.card} aria-labelledby="sol-title">
								<h2 id="sol-title" className={styles.h2}>
									<Inbox size={18} aria-hidden="true" /> Pedidos de acceso <span className={styles.count}>{data.solicitudes.length}</span>
								</h2>
								<p className={styles.muted}>Personas que se registraron e intentaron entrar sin tener un local asignado.</p>
								<ul className={styles.list}>
									{data.solicitudes.map((s) => (
										<Solicitud key={s.uid} s={s} locales={data.locales} onDone={load} />
									))}
								</ul>
							</section>
						)}

						<section className={styles.card} aria-labelledby="loc-title">
							<h2 id="loc-title" className={styles.h2}>
								<Store size={18} aria-hidden="true" /> Locales <span className={styles.count}>{data.locales.length}</span>
							</h2>
							<ul className={styles.list}>
								{data.locales.map((l) => (
									<li key={l.slug} className={`${styles.item} ${styles.itemRow}`}>
										<div className={styles.itemMain}>
											<p className={styles.itemTitle}>{l.nombre || localLabel(l.slug)}</p>
											<p className={styles.itemSub}>
												{l.slug} · {l.productos} productos · {l.visitas} visitas
											</p>
										</div>
										<Link href={`/dashboard/${l.slug}`} className={styles.smallBtn}>
											<ExternalLink size={16} aria-hidden="true" />
											Panel
										</Link>
									</li>
								))}
							</ul>

							<form className={styles.subform} onSubmit={crearLocal}>
								<h3 className={styles.h3}>
									<Plus size={16} aria-hidden="true" /> Crear local
								</h3>
								<div className={styles.row2}>
									<label className={styles.field}>
										<span className={styles.label}>Nombre</span>
										<input
											className={styles.input}
											placeholder="Cruda Burgers"
											value={nuevoLocal.nombre}
											onChange={(e) =>
												setNuevoLocal((p) => ({ ...p, nombre: e.target.value, slug: p.slugTocado ? p.slug : slugify(e.target.value) }))
											}
										/>
									</label>
									<label className={styles.field}>
										<span className={styles.label}>Identificador</span>
										<input
											className={styles.input}
											placeholder="cruda-burgers"
											value={nuevoLocal.slug}
											onChange={(e) => setNuevoLocal((p) => ({ ...p, slug: slugify(e.target.value), slugTocado: true }))}
										/>
										<span className={styles.hint}>Va en la dirección del panel y en la carpeta de fotos. No se puede cambiar después.</span>
									</label>
								</div>
								{localMsg && <p className={styles.note} role="status">{localMsg}</p>}
								<button type="submit" className={styles.primary}>
									Crear local
								</button>
							</form>
						</section>

						<section className={styles.card} aria-labelledby="usr-title">
							<h2 id="usr-title" className={styles.h2}>
								<Users size={18} aria-hidden="true" /> Usuarios <span className={styles.count}>{data.usuarios.length}</span>
							</h2>
							<ul className={styles.list}>
								{data.usuarios.map((u) => (
									<UserEditor
										key={u.uid}
										user={u}
										locales={data.locales}
										isSelf={u.uid === session.user.uid}
										onSaved={load}
										onRemoved={load}
									/>
								))}
							</ul>

							<form className={styles.subform} onSubmit={crearCuenta} noValidate>
								<h3 className={styles.h3}>
									<UserPlus size={16} aria-hidden="true" /> Crear usuario
								</h3>
								<p className={styles.muted}>Crea la cuenta y le da acceso a los locales que marques, en un solo paso.</p>
								<div className={styles.row2}>
									<label className={styles.field}>
										<span className={styles.label}>Email</span>
										<input className={styles.input} type="email" autoComplete="off" value={alta.email} onChange={(e) => setAlta({ ...alta, email: e.target.value })} />
									</label>
									<label className={styles.field}>
										<span className={styles.label}>Nombre</span>
										<input className={styles.input} value={alta.nombre} onChange={(e) => setAlta({ ...alta, nombre: e.target.value })} />
									</label>
								</div>
								<label className={styles.field}>
									<span className={styles.label}>Contraseña (opcional)</span>
									<input
										className={styles.input}
										type="text"
										autoComplete="new-password"
										value={alta.password}
										onChange={(e) => setAlta({ ...alta, password: e.target.value })}
										placeholder="Vacío: se genera una y le llega un mail para elegir la suya"
									/>
								</label>
								<LocalChecks locales={data.locales} value={alta.locales} onChange={(v) => setAlta({ ...alta, locales: v })} idPrefix="alta" />
								{alta.password && (
									<label className={styles.check}>
										<input type="checkbox" checked={alta.enviarMail} onChange={(e) => setAlta({ ...alta, enviarMail: e.target.checked })} />
										<span>Igual mandarle el mail para que cambie la contraseña</span>
									</label>
								)}
								{altaState.error && (
									<p className={styles.error} role="alert">
										{altaState.error}
									</p>
								)}
								{altaState.ok && (
									<p className={styles.note} role="status">
										{altaState.ok}
									</p>
								)}
								<button type="submit" className={styles.primary} disabled={altaState.busy}>
									{altaState.busy && <LoaderCircle size={16} className={styles.spin} aria-hidden="true" />}
									{altaState.busy ? "Creando..." : "Crear usuario"}
								</button>
							</form>

							<details className={styles.more}>
								<summary>La cuenta ya existe en Firebase: agregar por UID</summary>
								<form className={styles.subform} onSubmit={agregarUsuario}>
								<p className={styles.muted}>
									Primero creá la cuenta en Firebase &gt; Authentication &gt; Users y copiá su UID. Si la persona ya intentó entrar, aparece arriba en Pedidos de acceso.
								</p>
								<label className={styles.field}>
									<span className={styles.label}>UID</span>
									<input className={styles.input} value={nuevoUser.uid} onChange={(e) => setNuevoUser({ ...nuevoUser, uid: e.target.value })} autoComplete="off" spellCheck={false} />
								</label>
								<div className={styles.row2}>
									<label className={styles.field}>
										<span className={styles.label}>Email</span>
										<input className={styles.input} type="email" value={nuevoUser.email} onChange={(e) => setNuevoUser({ ...nuevoUser, email: e.target.value })} />
									</label>
									<label className={styles.field}>
										<span className={styles.label}>Nombre</span>
										<input className={styles.input} value={nuevoUser.nombre} onChange={(e) => setNuevoUser({ ...nuevoUser, nombre: e.target.value })} />
									</label>
								</div>
								<LocalChecks locales={data.locales} value={nuevoUser.locales} onChange={(v) => setNuevoUser({ ...nuevoUser, locales: v })} idPrefix="nuevo" />
								{userMsg && <p className={styles.note} role="status">{userMsg}</p>}
								<button type="submit" className={styles.primary}>
									Agregar usuario
								</button>
							</form>
							</details>
						</section>
					</>
				)}
			</main>
		</div>
	);
}
