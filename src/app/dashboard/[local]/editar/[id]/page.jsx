"use client";

import { useEffect, useState } from "react";

export default function Editar({ params }) {
    const { local, id } = params;
    const [form, setForm] = useState(null);

    useEffect(() => {
        async function fetchData() {
            const res = await fetch(`/api/locales/${local}/comidas`);
            const data = await res.json();
            setForm(data[id]);
        }
        fetchData();
    }, []);

    function handleChange(e) {
        setForm({ ...form, [e.target.name]: e.target.value });
    }

    async function handleSubmit(e) {
        e.preventDefault();

        await fetch(`/api/locales/${local}/comidas/${id}`, {
            method: "PUT",
            body: JSON.stringify(form),
        });

        alert("Comida actualizada");
        window.location.href = `/dashboard/${local}`;
    }

    async function handleDelete() {
        if (!confirm("¿Seguro que deseas eliminar esta comida?")) return;

        await fetch(`/api/locales/${local}/comidas/${id}`, {
            method: "DELETE",
        });

        window.location.href = `/dashboard/${local}`;
    }

    if (!form) return <p>Cargando...</p>;

    return (
        <div style={{ padding: 20 }}>
            <h1>Editando: {form.nombre}</h1>

            <form onSubmit={handleSubmit}>
                <input
                    name="nombre"
                    value={form.nombre}
                    onChange={handleChange}
                />
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

                <input
                    name="imagen"
                    value={form.imagen}
                    onChange={handleChange}
                />
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
