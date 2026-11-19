"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { ChevronLeft } from "lucide-react";
import ComidaForm from "@/components/dashboard/ComidaForm";
import LoadingScreen from "@/components/Loading";
import { getComida, updateComida, deleteComida } from "@/lib/admin-data";
import styles from "@/components/dashboard/dashboard.module.css";

export default function EditarComida() {
	const { local, id } = useParams();
	const router = useRouter();
	const [initial, setInitial] = useState(null);
	const [missing, setMissing] = useState(false);
	const back = `/dashboard/${local}`;

	useEffect(() => {
		getComida(local, id)
			.then((data) => {
				if (!data || !data.nombre) setMissing(true);
				else setInitial({ ...data, valor: String(data.valor ?? ""), valorOferta: data.valorOferta ? String(data.valorOferta) : "" });
			})
			.catch(() => setMissing(true));
	}, [local, id]);

	async function save(form) {
		try {
			await updateComida(local, id, form);
			router.push(back);
			return true;
		} catch {
			return false;
		}
	}

	async function remove() {
		if (!confirm(`¿Borrar "${initial.nombre}" del menú? No se puede deshacer.`)) return;
		try {
			await deleteComida(local, id);
			router.push(back);
		} catch {
			alert("No se pudo borrar. Probá de nuevo.");
		}
	}

	if (missing) {
		return (
			<div className={styles.page}>
				<p className={styles.errorBox}>Este producto ya no existe.</p>
				<Link href={back} className={styles.ghostBtn}>
					Volver a productos
				</Link>
			</div>
		);
	}

	if (!initial) return <LoadingScreen label="Cargando producto..." />;

	return (
		<div className={styles.page}>
			<Link href={back} className={styles.backLink}>
				<ChevronLeft size={18} aria-hidden="true" />
				Productos
			</Link>
			<div className={styles.pageHead}>
				<h1 className={styles.h1}>Editar {initial.nombre}</h1>
			</div>
			<ComidaForm local={local} initial={initial} submitLabel="Guardar cambios" onSubmit={save} onDelete={remove} />
		</div>
	);
}
