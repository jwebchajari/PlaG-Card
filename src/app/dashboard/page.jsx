"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import DashboardProductCard from "@/components/DashboardProductCard";
import LoadingScreen from "@/components/Loading";

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
                    console.error("Error GET /api/locales/comidas:", res.status);
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
                console.error("Error DELETE:", res.status);
                alert("Error al borrar la comida");
                return;
            }

            // Actualizar estado sin recargar
            setComidas(prev => {
                const nuevo = { ...prev };
                delete nuevo[id];
                return nuevo;
            });

        } catch (err) {
            console.error("Error de red al borrar comida:", err);
            alert("Error al borrar la comida");
        }
    }

    if (loading) return      <LoadingScreen />;

    return (
        <div style={{ padding: 20, maxWidth: "1200px", margin: "0 auto" }}>
            {/* GRID MODERNO */}
            <div
                style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fill, minmax(230px, 1fr))",
                    gap: "20px",
                }}
            >
                {Object.entries(comidas).map(([id, item]) => (
                    <DashboardProductCard
                        key={id}
                        id={id}
                        item={item}
                        onDelete={handleDelete}
                    />
                ))}
            </div>
        </div>
    );
}
