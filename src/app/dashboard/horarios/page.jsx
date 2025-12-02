"use client";

import LoadingScreen from "@/components/Loading";
import { useEffect, useState } from "react";

const DIAS = [
    "lunes",
    "martes",
    "miércoles",
    "jueves",
    "viernes",
    "sábado",
    "domingo",
];

export default function Horarios() {
    const [horarios, setHorarios] = useState(null);
    const [loading, setLoading] = useState(true);

    // ==========================
    // FUNCIÓN PARA OBTENER HORARIOS
    // ==========================
    async function load() {
        setLoading(true);
        const res = await fetch("/api/locales/horarios");
        const data = await res.json();

        const inicial = {};
        DIAS.forEach((dia) => {
            const diaData = data[dia] || {};

            inicial[dia] = {
                cerrado: diaData.cerrado ?? false,
                franjas: Array.isArray(diaData.franjas) ? diaData.franjas : [],
            };
        });

        setHorarios(inicial);
        setLoading(false);
    }

    useEffect(() => {
        load();
    }, []);

    if (loading || !horarios) return <LoadingScreen />;

    // GUARDA COMO SEGURIDAD: franjas siempre array
    DIAS.forEach((dia) => {
        if (!Array.isArray(horarios[dia].franjas)) {
            horarios[dia].franjas = [];
        }
    });

    // ==========================
    // HANDLERS
    // ==========================

    function toggleCerrado(dia) {
        setHorarios((prev) => ({
            ...prev,
            [dia]: {
                ...prev[dia],
                cerrado: !prev[dia].cerrado,
            },
        }));
    }

    function cambiarFranja(dia, index, campo, valor) {
        setHorarios((prev) => {
            const nuevasFranjas = [...prev[dia].franjas];
            nuevasFranjas[index][campo] = valor;

            return {
                ...prev,
                [dia]: { ...prev[dia], franjas: nuevasFranjas },
            };
        });
    }

    function agregarFranja(dia) {
        setHorarios((prev) => ({
            ...prev,
            [dia]: {
                ...prev[dia],
                franjas: [
                    ...prev[dia].franjas,
                    { desde: "08:00", hasta: "12:00" },
                ],
            },
        }));
    }

    function eliminarFranja(dia, index) {
        setHorarios((prev) => ({
            ...prev,
            [dia]: {
                ...prev[dia],
                franjas: prev[dia].franjas.filter((_, i) => i !== index),
            },
        }));
    }

    async function guardar() {
        const res = await fetch("/api/locales/horarios", {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(horarios),
        });

        if (res.ok) {
            alert("Horarios guardados correctamente");
            load(); // recarga después de guardar
        } else {
            alert("Error al guardar");
        }
    }

    return (
        <div style={{ padding: 20, maxWidth: 700, margin: "0 auto" }}>
            <h1 style={{ marginBottom: 20 }}>Horarios del local</h1>

            {DIAS.map((dia) => (
                <div
                    key={dia}
                    style={{
                        padding: 16,
                        border: "1px solid #ccc",
                        borderRadius: 8,
                        marginBottom: 20,
                    }}
                >
                    <h2 style={{ textTransform: "capitalize" }}>{dia}</h2>

                    <label style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        <input
                            type="checkbox"
                            checked={horarios[dia].cerrado}
                            onChange={() => toggleCerrado(dia)}
                        />
                        No se trabaja este día
                    </label>

                    {!horarios[dia].cerrado && (
                        <>
                            {horarios[dia].franjas.map((f, index) => (
                                <div
                                    key={index}
                                    style={{
                                        display: "flex",
                                        gap: 10,
                                        alignItems: "center",
                                        marginTop: 10,
                                    }}
                                >
                                    <input
                                        type="time"
                                        value={f.desde}
                                        onChange={(e) =>
                                            cambiarFranja(dia, index, "desde", e.target.value)
                                        }
                                    />
                                    <span>a</span>
                                    <input
                                        type="time"
                                        value={f.hasta}
                                        onChange={(e) =>
                                            cambiarFranja(dia, index, "hasta", e.target.value)
                                        }
                                    />

                                    <button
                                        onClick={() => eliminarFranja(dia, index)}
                                        style={{
                                            background: "red",
                                            color: "white",
                                            padding: "4px 8px",
                                            borderRadius: 4,
                                        }}
                                    >
                                        X
                                    </button>
                                </div>
                            ))}

                            <button
                                onClick={() => agregarFranja(dia)}
                                style={{
                                    marginTop: 10,
                                    background: "#0070f3",
                                    color: "white",
                                    padding: "6px 12px",
                                    borderRadius: 6,
                                }}
                            >
                                + Agregar franja
                            </button>
                        </>
                    )}
                </div>
            ))}

            <button
                onClick={guardar}
                style={{
                    background: "#28a745",
                    color: "white",
                    padding: 12,
                    borderRadius: 8,
                    width: "100%",
                }}
            >
                Guardar horarios
            </button>
        </div>
    );
}
