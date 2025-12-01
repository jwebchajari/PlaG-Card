"use client";
import styles from "./Loading.module.css";

export default function LoadingScreen() {
    return (
        <div className={styles.loadingContainer}>
            <div className={styles.spinner}></div>
            <p className={styles.text}>Cargando menú...</p>
        </div>
    );
}
