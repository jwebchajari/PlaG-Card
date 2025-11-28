"use client";

import { Icon } from "@iconify/react";
import styles from "./ExpandedMenu.module.css";

export default function ExpandedMenu({ show, onClose }) {
    if (!show) return null;

    const direccion = "Repetto 2280";
    const mapsUrl = "https://www.google.com/maps/search/?api=1&query=Repetto+2280";

    return (
        <div className={styles.overlay} onClick={onClose}>
            <div className={styles.sheet} onClick={(e) => e.stopPropagation()}>
                <div className={styles.handle}></div>

                <h3 className={styles.title}>Opciones</h3>

                <button className={styles.btn}>
                    <Icon icon="mdi:map-marker" width={24} />
                    Dirección: {direccion}
                </button>

                <a href={mapsUrl} target="_blank" className={styles.btn}>
                    <Icon icon="mdi:google-maps" width={24} />
                    Llegar con Google Maps
                </a>
            </div>
        </div>
    );
}
