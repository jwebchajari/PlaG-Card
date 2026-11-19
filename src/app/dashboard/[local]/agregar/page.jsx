"use client";

import { useParams, useRouter } from "next/navigation";
import ComidaForm from "@/components/dashboard/ComidaForm";
import { createComida } from "@/lib/admin-data";
import styles from "@/components/dashboard/dashboard.module.css";

export default function AgregarComida() {
	const { local } = useParams();
	const router = useRouter();

	async function create(form) {
		try {
			await createComida(local, form);
			router.push(`/dashboard/${local}`);
			return true;
		} catch {
			return false;
		}
	}

	return (
		<div className={styles.page}>
			<div className={styles.pageHead}>
				<h1 className={styles.h1}>Agregar producto</h1>
			</div>
			<ComidaForm local={local} submitLabel="Guardar producto" onSubmit={create} />
		</div>
	);
}
