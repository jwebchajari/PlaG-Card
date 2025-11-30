"use client";

import { useEffect, useState } from "react";

export default function EditarComida({ params }) {
    const { id } = params;
    const [form, setForm] = useState(null);
    const [loading, setLoading] = useState(true);

    // Cargar comida específica
    useEffect(() => {
        async function fetchData() {
            try {
                const res = await fetch(`/api/locales/${id}`);

                if (!res.ok) {
                    const text = await res.text();
                    console.error("Error GET /api/locales/[id]:", res.status, text);
                    return;
                }

                const data = await res.json();
                setForm(data);
            } catch (err) {
                console.error("Error cargando comida:", err);
            } finally {
                setLoading(false);
            }
        }

        fetchData();
    }, [id]);

    function handleChange(e) {
        const { name, value, type, checked } = e.target;

        setForm({
            ...form,
            [name]: type === "checkbox" ? checked : value,
        });
    }

    // Guardar cambios
    async function handleSubmit(e) {
        e.preventDefault();

        const res = await fetch(`/api/locales/${id}`, {
            method: "PUT",
            body: JSON.stringify(form),
        });

        if (res.ok) {
            alert("Comida actualizada");
            window.location.href = "/dashboard";
        } else {
            alert("Error al actualizar");
        }
    }

    // Eliminar comida
    async function handleDelete() {
        if (!confirm("¿Eliminar esta comida?")) return;

        const res = await fetch(`/api/locales/${id}`, {
            method: "DELETE",
        });

        if (res.ok) {
            alert("Comida eliminada");
            window.location.href = "/dashboard";
        } else {
            alert("Error al eliminar");
        }
    }

    if (loading || !form) return <p style={{ padding: 20 }}>Cargando...</p>;

    return (
        <div style={{ padding: 20 }}>
            <h1>Editando: {form.nombre}</h1>

            <form
                onSubmit={handleSubmit}
                style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "12px",
                    maxWidth: "400px",
                }}
            >
                <input
                    name="nombre"
                    value={form.nombre}
                    onChange={handleChange}
                    placeholder="Nombre"
                />

                <input
                    name="valor"
                    value={form.valor}
                    type="number"
                    onChange={handleChange}
                    placeholder="Precio"
                />

                <label style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    <input
                        type="checkbox"
                        name="oferta"
                        checked={form.oferta}
                        onChange={handleChange}
                    />
                    ¿En oferta?
                </label>

                {form.oferta && (
                    <input
                        name="valorOferta"
                        type="number"
                        value={form.valorOferta || ""}
                        onChange={handleChange}
                        placeholder="Precio en oferta"
                    />
                )}

                <textarea
                    name="descripcion"
                    value={form.descripcion}
                    onChange={handleChange}
                    placeholder="Descripción"
                />

                <input
                    name="imagen"
                    value={form.imagen}
                    onChange={handleChange}
                    placeholder="URL imagen"
                />

                <button
                    type="submit"
                    style={{
                        background: "#0070f3",
                        color: "white",
                        padding: "10px",
                        borderRadius: "6px",
                    }}
                >
                    Guardar cambios
                </button>
            </form>


        </div>
    );
}
