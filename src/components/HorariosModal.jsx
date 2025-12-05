"use client";

import { Modal } from "react-bootstrap";
import styles from "./HorariosModal.module.css";

export default function HorariosModal({ show, onClose, horarios = {} }) {
    const dias = [
        "domingo", "lunes", "martes", "miércoles",
        "jueves", "viernes", "sábado"
    ];

    const now = new Date();
    const diaActual = dias[now.getDay()];
    const horaActual = now.getHours();
    const minutoActual = now.getMinutes();
    const minutosAhora = horaActual * 60 + minutoActual;

    // Normalizar franjas del día actual
    const infoDia = horarios[diaActual] || {};
    const cerradoDia = Boolean(infoDia.cerrado);

    let franjas = [];
    if (Array.isArray(infoDia.franjas)) {
        franjas = infoDia.franjas;
    } else if (infoDia.franjas && typeof infoDia.franjas === "object") {
        franjas = Object.values(infoDia.franjas);
    }

    // Normalizar cada franja
    const franjasNormalizadas = franjas.map(f => {
        const inicio = f.inicio || f.desde;
        const fin = f.fin || f.hasta;

        return {
            inicio,
            fin,
            inicioMin: parseHora(inicio),
            finMin: parseHora(fin)
        };
    });

    // Función para convertir "HH:MM" → minutos totales
    function parseHora(hora) {
        if (!hora) return null;
        const [h, m] = hora.split(":").map(Number);
        return h * 60 + m;
    }

    // Determinar si está abierto ahora
    let estaAbierto = false;
    let cierraA = null;
    let proximaApertura = null;

    for (const fr of franjasNormalizadas) {
        if (fr.inicioMin <= minutosAhora && minutosAhora < fr.finMin) {
            estaAbierto = true;
            cierraA = fr.fin;
            break;
        }
        if (fr.inicioMin > minutosAhora) {
            if (!proximaApertura || fr.inicioMin < proximaApertura.inicioMin) {
                proximaApertura = fr;
            }
        }
    }

    // Si no abre más hoy → buscar mañana
    if (!estaAbierto && !proximaApertura) {
        const idxHoy = now.getDay();
        const idxManiana = (idxHoy + 1) % 7;
        const diaManiana = dias[idxManiana];

        const infoManiana = horarios[diaManiana] || {};
        const frManiana = Array.isArray(infoManiana.franjas)
            ? infoManiana.franjas
            : infoManiana.franjas
            ? Object.values(infoManiana.franjas)
            : [];

        const primero = frManiana[0];
        if (primero) {
            proximaApertura = {
                inicio: primero.inicio || primero.desde,
                inicioMin: parseHora(primero.inicio || primero.desde),
                maniana: true
            };
        }
    }

    // Calcular en cuánto tiempo abre
    let abrirEnTexto = "";
    if (!estaAbierto && proximaApertura) {
        const minutosObjetivo = proximaApertura.maniana
            ? proximaApertura.inicioMin + 1440 // sumar 24h
            : proximaApertura.inicioMin;

        const diff = minutosObjetivo - minutosAhora;
        const h = Math.floor(diff / 60);
        const m = diff % 60;

        abrirEnTexto = `Abrimos en ${h}h ${m}m`;
    }

    return (
        <Modal show={show} onHide={onClose} centered>
            <Modal.Header closeButton>
                <Modal.Title>Horarios de Atención</Modal.Title>
            </Modal.Header>

            <Modal.Body>
                {/* ESTADO ACTUAL */}
                <div className={styles.statusBox}>
                    {estaAbierto ? (
                        <div className={styles.openStatus}>
                            🟢 Abierto — cerramos a {cierraA}
                        </div>
                    ) : (
                        <div className={styles.closedStatus}>
                            🔴 Cerrado
                            <div className={styles.subMsg}>{abrirEnTexto}</div>
                        </div>
                    )}
                </div>

                {/* LISTADO DE DÍAS */}
                <div className={styles.list}>
                    {dias.map((dia) => {
                        const info = horarios[dia] || {};
                        const cerrado = Boolean(info.cerrado);

                        let frs = [];
                        if (Array.isArray(info.franjas)) frs = info.franjas;
                        else if (info.franjas) frs = Object.values(info.franjas);

                        return (
                            <div key={dia} className={styles.item}>
                                <span className={styles.day}>
                                    {dia.charAt(0).toUpperCase() + dia.slice(1)}
                                </span>

                                {cerrado ? (
                                    <span className={styles.closed}>Cerrado</span>
                                ) : frs.length === 0 ? (
                                    <span className={styles.noHours}>
                                        Sin horarios
                                    </span>
                                ) : (
                                    <div className={styles.hours}>
                                        {frs.map((f, i) => {
                                            const ini = f.inicio || f.desde;
                                            const fin = f.fin || f.hasta;
                                            return (
                                                <span key={i} className={styles.chip}>
                                                    {ini} – {fin}
                                                </span>
                                            );
                                        })}
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
