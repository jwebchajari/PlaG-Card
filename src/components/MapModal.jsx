"use client";

import { Modal, Button } from "react-bootstrap";
import styles from "./MapModal.module.css";

export default function MapModal({ show, onClose }) {
    const direccion = "repetto 2255, Chajari, Entre Ríos, Argentina";
    const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
        direccion
    )}`;

    return (
        <Modal show={show} onHide={onClose} centered size="lg">
            <Modal.Header closeButton className={styles.header}>
                <Modal.Title className={styles.title}>Cómo llegar</Modal.Title>
            </Modal.Header>

            <Modal.Body className={styles.body}>
                <p className={styles.label}>
                    Dirección: <strong>{direccion}</strong>
                </p>

                <div className={styles.mapContainer}>
                    <iframe
                        width="100%"
                        height="300"
                        loading="lazy"
                        allowFullScreen
                        style={{ border: 0, borderRadius: "12px" }}
                        src={`https://www.google.com/maps?q=${encodeURIComponent(
                            "Adolfo Repetto 2255, E3228ALY Chajarí, Entre Ríos"
                        )}&output=embed`}
                    ></iframe>
                </div>

            </Modal.Body>

            <Modal.Footer className={styles.footer}>
                <a
                    href={mapsUrl}
                    target="_blank"
                    className={styles.mapsBtn}
                >
                    Abrir en Google Maps
                </a>

                <Button variant="secondary" className={styles.closeBtn} onClick={onClose}>
                    Cerrar
                </Button>
            </Modal.Footer>
        </Modal>
    );
}
