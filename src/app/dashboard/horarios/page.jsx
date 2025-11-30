"use client";

import { useEffect, useState } from "react";

export default function HorariosPage() {
    const dias = [
        "lunes",
        "martes",
        "miércoles",
        "jueves",
        "viernes",
        "sábado",
        "domingo"
    ];

    // ===========================
    // ESTADO SEGURO (no rompe)
    // ===========================
    const estructuraDia = {
        cerrado: false,
        franjas: []
    };

    const estadoInicial = {
        lunes: { ...estructuraDia },
        martes: { ...estructuraDia },
        miércoles: { ...estructuraDia },
        jueves: { ...estructuraDia },
        viernes: { ...estructuraDia },
        sábado: { ...estructuraDia },
        domingo: { ...estructuraDia }
    };

    const [horarios, setHorarios] = useState(estadoInicial);
    const [loading, setLoading] = useState(true);

    // ===========================
    // CARGAR HORARIOS
    // ===========================
    useEffect(() => {
        async function load() {
            try {
                const res = await fetch("/api/locales/horarios");
                const data = await res.json();

                const formateado = {};

                dias.forEach((dia) => {
                    formateado[dia] = {
                        cerrado: data?.[dia]?.cerrado ?? false,
                        franjas: Array.isArray(data?.[dia]?.franjas)
                            ? data[dia].franjas
                            : []
                    };
                });

                setHorarios(formateado);
            } catch (err) {
                console.error("Error cargando horarios:", err);
            } finally {
                setLoading(false);
            }
        }

        load();
    }, []);

    // ===========================
    // MANEJO DE FRANJAS
    // ===========================
    const agregarFranja = (dia) => {
        setHorarios((prev) => ({
            ...prev,
            [dia]: {
                ...prev[dia],
                franjas: [...prev[dia].franjas, { inicio: "08:00", fin: "16:00" }]
            }
        }));
    };

    const updateFranja = (dia, index, campo, valor) => {
        setHorarios((prev) => ({
            ...prev,
            [dia]: {
                ...prev[dia],
                franjas: prev[dia].franjas.map((f, i) =>
                    i === index ? { ...f, [campo]: valor } : f
                )
            }
        }));
    };

    const borrarFranja = (dia, index) => {
        setHorarios((prev) => ({
            ...prev,
            [dia]: {
                ...prev[dia],
                franjas: prev[dia].franjas.filter((_, i) => i !== index)
            }
        }));
    };

    const toggleCerrado = (dia) => {
        setHorarios((prev) => ({
            ...prev,
            [dia]: {
                ...prev[dia],
                cerrado: !prev[dia].cerrado,
                franjas: !prev[dia].cerrado ? [] : prev[dia].franjas
            }
        }));
    };

    // ===========================
    // GUARDAR EN FIREBASE
    // ===========================
    const guardar = async () => {
        try {
            const res = await fetch("/api/locales/horarios", {
                method: "PUT",
                body: JSON.stringify(horarios)
            });

            if (!res.ok) throw new Error();

            alert("Horarios guardados correctamente ✔");
        } catch (err) {
            console.error(err);
            alert("Error al guardar horarios");
        }
    };

    // ===========================
    // RENDER
    // ===========================
    if (loading) return <p style={{ padding: 20 }}>Cargando horarios…</p>;

    return (
        <div style={{ padding: 20 }}>
            <h1>Horarios del Local</h1>

            {dias.map((dia) => (
                <div
                    key={dia}
                    style={{
                        marginTop: 20,
                        border: "1px solid #ddd",
                        padding: 15,
                        borderRadius: 10
                    }}
                >
                    <h3 style={{ textTransform: "capitalize" }}>{dia}</h3>

                    {/* Toggle cerrado */}
                    <label style={{ display: "flex", gap: 10, marginBottom: 10 }}>
                        <input
                            type="checkbox"
                            checked={horarios[dia].cerrado}
                            onChange={() => toggleCerrado(dia)}
                        />
                        No se trabaja este día
                    </label>

                    {/* Si está cerrado, no mostrar franjas */}
                    {horarios[dia].cerrado ? (
                        <p style={{ color: "red" }}>Día cerrado</p>
                    ) : (
                        <>
                            {/* LISTA DE FRANJAS */}
                            {horarios[dia]?.franjas?.map((f, index) => (
                                <div
                                    key={index}
                                    style={{
                                        marginBottom: 10,
                                        background: "#f8f8f8",
                                        padding: 10,
                                        borderRadius: 8
                                    }}
                                >
                                    <div style={{ display: "flex", gap: 10 }}>
                                        <input
                                            type="time"
                                            value={f.inicio}
                                            onChange={(e) =>
                                                updateFranja(
                                                    dia,
                                                    index,
                                                    "inicio",
                                                    e.target.value
                                                )
                                            }
                                        />
                                        <input
                                            type="time"
                                            value={f.fin}
                                            onChange={(e) =>
                                                updateFranja(
                                                    dia,
                                                    index,
                                                    "fin",
                                                    e.target.value
                                                )
                                            }
                                        />
                                        <button
                                            onClick={() => borrarFranja(dia, index)}
                                            style={{
                                                background: "red",
                                                color: "white",
                                                border: "none",
                                                padding: "5px 10px",
                                                borderRadius: 5
                                            }}
                                        >
                                            Borrar
                                        </button>
                                    </div>
                                </div>
                            ))}

                            <button
                                onClick={() => agregarFranja(dia)}
                                style={{
                                    marginTop: 10,
                                    background: "#333",
                                    color: "white",
                                    padding: "6px 12px",
                                    borderRadius: 6
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
                    marginTop: 30,
                    background: "green",
                    color: "white",
                    padding: "12px 20px",
                    borderRadius: 8,
                    fontSize: 16
                }}
            >
                Guardar horarios
            </button>
        </div>
    );
}
