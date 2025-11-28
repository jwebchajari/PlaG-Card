import styles from "./Footer.module.css";

export default function Footer() {
    return (
        <footer className={styles.footer}>
            <div className="container py-4">

                <p className={styles.title}>Pintó la Gula</p>
                <p className={styles.text}>Comidas rápidas con sabor artesanal.</p>

                <p className={styles.copy}>© 2025 Pintó la Gula</p>

            </div>
        </footer>
    );
}
