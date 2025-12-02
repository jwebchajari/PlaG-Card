"use client";

import { useEffect, useState } from "react";
import { Modal, Button } from "react-bootstrap";
import styles from "./MapModal.module.css";

export default function MapModal({ show, onClose }) {
    const [direccion, setDireccion] = useState("");
    const [loading, setLoading] = useState(true);

    // 🔥 Cargar dirección desde API cuando se abre el modal
    useEffect(() => {
        if (!show) return;

        async function loadDireccion() {
            setLoading(true);

            try {
                const res = await fetch("/api/locales/datos");
                const data = await res.json();

                setDireccion(data?.direccion || "Dirección no disponible");
            } catch (err) {
                console.error("Error al cargar dirección:", err);
                setDireccion("Error al obtener dirección");
            }

            setLoading(false);
        }

        loadDireccion();
    }, [show]);

    // URL para abrir en Google Maps
    const mapsUrl = direccion
        ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(direccion)}`
        : "#";

    return (
        <Modal show={show} onHide={onClose} centered size="lg">
            <Modal.Header closeButton className={styles.header}>
                <Modal.Title className={styles.title}>Cómo llegar</Modal.Title>
            </Modal.Header>

            <Modal.Body className={styles.body}>
                {loading ? (
                    <p>Cargando dirección...</p>
                ) : (
                    <>
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
                                    direccion
                                )}&output=embed`}
                            ></iframe>
                        </div>
                    </>
                )}
            </Modal.Body>

            <Modal.Footer className={styles.footer}>
                <a
                    href={mapsUrl}
                    target="_blank"
                    className={styles.mapsBtn}
                    rel="noopener noreferrer"
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
