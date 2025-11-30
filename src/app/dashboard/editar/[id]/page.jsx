"use client";

import { useEffect, useState } from "react";

export default function EditarComida({ params }) {
    const { id } = params;
    const [form, setForm] = useState(null);

    useEffect(() => {
        async function fetchData() {
            try {
                const res = await fetch("/api/locales/comidas");
                const data = await res.json();
                setForm(data[id]);
            } catch (err) {
                console.error("Error cargando comida:", err);
            }
        }

        fetchData();
    }, [id]);

    function handleChange(e) {
        setForm({ ...form, [e.target.name]: e.target.value });
    }

    async function handleSubmit(e) {
        e.preventDefault();

        await fetch(`/api/locales/comidas/${id}`, {
            method: "PUT",
            body: JSON.stringify(form),
        });

        alert("Comida actualizada");
        window.location.href = "/dashboard";
    }

    async function handleDelete() {
        if (!confirm("¿Eliminar esta comida?")) return;

        await fetch(`/api/locales/comidas/${id}`, {
            method: "DELETE",
        });

        window.location.href = "/dashboard";
    }

    if (!form) return <p style={{ padding: 20 }}>Cargando...</p>;

    return (
        <div style={{ padding: 20 }}>
            <h1>Editando: {form.nombre}</h1>

            <form onSubmit={handleSubmit}>
                <input name="nombre" value={form.nombre} onChange={handleChange} />
                <br />

                <input
                    name="precio"
                    value={form.precio}
                    type="number"
                    onChange={handleChange}
                />
                <br />

                <textarea
                    name="descripcion"
                    value={form.descripcion}
                    onChange={handleChange}
                />
                <br />

                <input name="imagen" value={form.imagen} onChange={handleChange} />
                <br />

                <button type="submit">Guardar cambios</button>
            </form>

            <button
                style={{ marginTop: 20, color: "red" }}
                onClick={handleDelete}
            >
                Eliminar comida
            </button>
        </div>
    );
}
