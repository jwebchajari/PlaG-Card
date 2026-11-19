import { LoaderCircle } from "lucide-react";
import styles from "./Loading.module.css";

export default function LoadingScreen({ label = "Cargando..." }) {
	return (
		<div className={styles.wrap} role="status">
			<LoaderCircle size={28} className={styles.spin} aria-hidden="true" />
			<p>{label}</p>
		</div>
	);
}
