"use client";

import { Modal, Button } from "react-bootstrap";
import styles from "./MapModal.module.css";

export default function MapModal({ show, onClose }) {
    const direccion = "Repetto 2280, Rosario, Argentina";
    const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(direccion)}`;

    return (
        <Modal show={show} onHide={onClose} centered size="lg">
            <Modal.Header closeButton>
                <Modal.Title>Cómo llegar</Modal.Title>
            </Modal.Header>

            <Modal.Body>
                <p className={styles.label}>
                    Dirección: <strong>{direccion}</strong>
                </p>

                <div className={styles.mapContainer}>
                    <iframe
                        width="100%"
                        height="300"
                        style={{ border: 0, borderRadius: "12px" }}
                        loading="lazy"
                        allowFullScreen
                        src={`https://www.google.com/maps/embed/v1/search?q=${encodeURIComponent(
                            direccion
                        )}&key=AIzaSyDUMMYKEY123456789`}
                    ></iframe>
                </div>
            </Modal.Body>

            <Modal.Footer>
                <a href={mapsUrl} target="_blank" className="btn btn-warning">
                    Abrir en Google Maps
                </a>

                <Button variant="secondary" onClick={onClose}>
                    Cerrar
                </Button>
            </Modal.Footer>
        </Modal>
    );
}
