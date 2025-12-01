"use client";

import { Modal } from "react-bootstrap";
import styles from "./HorariosModal.module.css";

export default function HorariosModal({ show, onClose, horarios = {} }) {
    const dias = [
        "domingo", "lunes", "martes", "miércoles",
        "jueves", "viernes", "sábado"
    ];

    return (
        <Modal show={show} onHide={onClose} centered>
            <Modal.Header closeButton>
                <Modal.Title>Horarios de Atención</Modal.Title>
            </Modal.Header>

            <Modal.Body>
                <div className={styles.list}>
                    {dias.map((dia) => {
                        const info = horarios[dia] || {};
                        const cerrado = Boolean(info.cerrado);

                        let franjas = [];
                        if (Array.isArray(info.franjas)) {
                            franjas = info.franjas;
                        } else if (info.franjas && typeof info.franjas === "object") {
                            franjas = Object.values(info.franjas);
                        }

                        return (
                            <div key={dia} className={styles.item}>
                                <span className={styles.day}>
                                    {dia.charAt(0).toUpperCase() + dia.slice(1)}
                                </span>

                                {cerrado ? (
                                    <span className={styles.closed}>
                                        🔴 Cerrado
                                    </span>
                                ) : franjas.length === 0 ? (
                                    <span className={styles.noHours}>Sin horarios</span>
                                ) : (
                                    <div className={styles.hours}>
                                        <span className={styles.openLabel}>🟢 Abierto</span>
                                        {franjas.map((f, i) => (
                                            <span key={i} className={styles.chip}>
                                                {f.desde || f.inicio} – {f.hasta || f.fin}
                                            </span>
                                        ))}
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>

                <button className={styles.closeBtn} onClick={onClose}>
                    Cerrar
                </button>
            </Modal.Body>
        </Modal>
    );
}
