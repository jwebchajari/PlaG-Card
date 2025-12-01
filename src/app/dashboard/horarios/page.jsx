"use client";

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

    // Cargar horarios desde Firebase
    useEffect(() => {
        async function load() {
            const res = await fetch("/api/locales/horarios");
            const data = await res.json();

            // Si no existen horarios, los inicializamos
            const inicial = {};
            DIAS.forEach((dia) => {
                inicial[dia] = data[dia] || {
                    cerrado: false,
                    franjas: [],
                };
            });

            setHorarios(inicial);
        }

        load();
    }, []);

    if (!horarios) return <p style={{ padding: 20 }}>Cargando...</p>;

    function toggleCerrado(dia) {
        setHorarios({
            ...horarios,
            [dia]: {
                ...horarios[dia],
                cerrado: !horarios[dia].cerrado,
            },
        });
    }

    function cambiarFranja(dia, index, campo, valor) {
        const nuevasFranjas = [...horarios[dia].franjas];
        nuevasFranjas[index][campo] = valor;

        setHorarios({
            ...horarios,
            [dia]: {
                ...horarios[dia],
                franjas: nuevasFranjas,
            },
        });
    }

    function agregarFranja(dia) {
        const nuevasFranjas = [
            ...horarios[dia].franjas,
            { desde: "08:00", hasta: "12:00" },
        ];

        setHorarios({
            ...horarios,
            [dia]: {
                ...horarios[dia],
                franjas: nuevasFranjas,
            },
        });
    }

    function eliminarFranja(dia, index) {
        const nuevasFranjas = horarios[dia].franjas.filter((_, i) => i !== index);

        setHorarios({
            ...horarios,
            [dia]: {
                ...horarios[dia],
                franjas: nuevasFranjas,
            },
        });
    }

    async function guardar() {
        const res = await fetch("/api/locales/horarios", {
            method: "PUT",
            body: JSON.stringify(horarios),
        });

        if (res.ok) {
            alert("Horarios guardados correctamente");
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

                    {/* Cerrar día */}
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
                            {/* Lista de franjas */}
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

                            {/* Botón agregar franja */}
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
