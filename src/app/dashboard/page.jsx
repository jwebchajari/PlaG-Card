"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

const LOCAL = process.env.NEXT_PUBLIC_LOCAL_NAME || "pinto-la-gula";

export default function Dashboard() {
    const [comidas, setComidas] = useState({});
    const [loading, setLoading] = useState(true);

    // Cargar comidas del API
    useEffect(() => {
        async function load() {
            try {
                const res = await fetch("/api/locales/comidas");

                if (!res.ok) {
                    const text = await res.text();
                    console.error("Error GET /api/locales/comidas:", res.status, text);
                    return;
                }

                const data = await res.json();
                setComidas(data || {});
            } catch (err) {
                console.error("Error cargando comidas:", err);
            } finally {
                setLoading(false);
            }
        }

        load();
    }, []);

    // Borrar comida
    async function handleDelete(id) {
        if (!confirm("¿Seguro que querés borrar esta comida?")) return;

        try {
            const res = await fetch(`/api/locales/comidas/${id}`, {
                method: "DELETE",
            });

            if (!res.ok) {
                const text = await res.text();
                console.error("Error DELETE /api/locales/comidas/[id]:", res.status, text);
                alert("Error al borrar la comida");
                return;
            }

            // Actualizar estado sin recargar
            setComidas((prev) => {
                const nuevo = { ...prev };
                delete nuevo[id];
                return nuevo;
            });

        } catch (err) {
            console.error("Error de red al borrar comida:", err);
            alert("Error al borrar la comida");
        }
    }

    if (loading) return <p style={{ padding: 20 }}>Cargando...</p>;

    return (
        <div style={{ padding: 20 }}>
            <h1 style={{ marginBottom: 20 }}>Administrar menú – {LOCAL}</h1>

            <Link
                href="/dashboard/agregar"
                style={{
                    display: "inline-block",
                    padding: "10px 16px",
                    marginBottom: "20px",
                    background: "#0070f3",
                    color: "white",
                    borderRadius: "6px",
                    textDecoration: "none",
                    fontWeight: "500",
                }}
            >
                ➕ Agregar comida
            </Link>

            <div
                style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
                    gap: "20px",
                }}
            >
                {Object.entries(comidas).map(([id, item]) => {
                    const enOferta = item.oferta && item.valorOferta;
                    const imageSrc =
                        item.imagen && item.imagen.trim() !== ""
                            ? item.imagen
                            : "/logo.png";

                    return (
                        <div
                            key={id}
                            style={{
                                border: "1px solid #ddd",
                                borderRadius: "10px",
                                padding: "16px",
                                boxShadow: "0 2px 5px rgba(0,0,0,0.08)",
                                background: "white",
                                display: "flex",
                                flexDirection: "column",
                                justifyContent: "space-between",
                                minHeight: "100%",
                            }}
                        >
                            <img
                                src={imageSrc}
                                alt={item.nombre}
                                style={{
                                    width: "100%",
                                    height: "150px",
                                    objectFit: "cover",
                                    borderRadius: "8px",
                                    marginBottom: "10px",
                                }}
                            />

                            <h2 style={{ margin: "0 0 5px 0" }}>{item.nombre}</h2>

                            {enOferta && (
                                <span
                                    style={{
                                        background: "red",
                                        color: "white",
                                        padding: "2px 6px",
                                        borderRadius: "4px",
                                        fontSize: "12px",
                                        alignSelf: "flex-start",
                                    }}
                                >
                                    OFERTA
                                </span>
                            )}

                            <div style={{ marginTop: 8, marginBottom: 8 }}>
                                {enOferta ? (
                                    <>
                                        <span
                                            style={{
                                                textDecoration: "line-through",
                                                marginRight: 8,
                                                color: "#777",
                                            }}
                                        >
                                            ${item.valor}
                                        </span>
                                        <span style={{ fontWeight: "bold" }}>
                                            ${item.valorOferta}
                                        </span>
                                    </>
                                ) : (
                                    <span style={{ fontWeight: "bold" }}>${item.valor}</span>
                                )}
                            </div>

                            {item.descripcion && (
                                <p style={{ fontSize: "14px", color: "#555" }}>
                                    {item.descripcion}
                                </p>
                            )}

                            <div
                                style={{
                                    marginTop: "10px",
                                    display: "flex",
                                    gap: "8px",
                                }}
                            >
                                <Link
                                    href={`/dashboard/editar/${id}`}
                                    style={{
                                        flex: 1,
                                        textAlign: "center",
                                        background: "#333",
                                        color: "white",
                                        padding: "6px 12px",
                                        borderRadius: "6px",
                                        textDecoration: "none",
                                        fontSize: "14px",
                                    }}
                                >
                                    ✏ Editar
                                </Link>

                                <button
                                    onClick={() => handleDelete(id)}
                                    style={{
                                        flex: 1,
                                        background: "#e00",
                                        color: "white",
                                        padding: "6px 12px",
                                        borderRadius: "6px",
                                        border: "none",
                                        fontSize: "14px",
                                        cursor: "pointer",
                                    }}
                                >
                                    🗑 Borrar
                                </button>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
