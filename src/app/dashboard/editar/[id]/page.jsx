"use client";

import { useEffect, useState } from "react";

export default function EditarComida({ params }) {
    const { id } = params;
    const [form, setForm] = useState(null);
    const [preview, setPreview] = useState("/logo.png");

    useEffect(() => {
        async function load() {
            try {
                const res = await fetch(`/api/locales/${id}`);
                const data = await res.json();

                setForm(data);

                // Preview inicial
                setPreview(data.imagen && data.imagen.trim() !== "" ? data.imagen : "/logo.png");

            } catch (err) {
                console.error("Error cargando comida:", err);
            }
        }

        load();
    }, [id]);

    function handleChange(e) {
        const { name, value, type, checked } = e.target;
        const newValue = type === "checkbox" ? checked : value;

        const updated = { ...form, [name]: newValue };
        setForm(updated);

        if (name === "imagen") {
            setPreview(value.trim() !== "" ? value : "/logo.png");
        }
    }

    async function handleSubmit(e) {
        e.preventDefault();

        await fetch(`/api/locales/${id}`, {
            method: "PUT",
            body: JSON.stringify(form),
        });

        alert("Cambios guardados");
        window.location.href = "/dashboard";
    }

    async function handleDelete() {
        if (!confirm("¿Eliminar esta comida?")) return;

        await fetch(`/api/locales/${id}`, {
            method: "DELETE",
        });

        alert("Producto eliminado");
        window.location.href = "/dashboard";
    }

    if (!form) return <p style={{ padding: 20 }}>Cargando...</p>;

    return (
        <div style={{ padding: 20, maxWidth: 480, margin: "0 auto" }}>

            <h1>Editando: {form.nombre}</h1>

            {/* PREVIEW */}
            <img
                src={preview}
                alt="preview"
                style={{
                    width: "100%",
                    height: 200,
                    objectFit: "cover",
                    borderRadius: 8,
                    marginBottom: 20,
                }}
            />

            {/* FORM */}
            <form
                onSubmit={handleSubmit}
                style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: 12,
                }}
            >
                <input
                    name="nombre"
                    value={form.nombre}
                    onChange={handleChange}
                    placeholder="Nombre"
                />

                {/* Categoría */}
                <select name="categoria" value={form.categoria} onChange={handleChange}>
                    <option>Hamburguesa</option>
                    <option>Sandwich</option>
                    <option>Papas</option>
                    <option>Bebidas</option>
                    <option>Otros</option>
                </select>

                <input
                    name="valor"
                    type="number"
                    value={form.valor}
                    onChange={handleChange}
                    placeholder="Precio"
                />

                <textarea
                    name="descripcion"
                    value={form.descripcion}
                    onChange={handleChange}
                    placeholder="Descripción"
                />

                <label>
                    <input
                        type="checkbox"
                        name="oferta"
                        checked={form.oferta}
                        onChange={handleChange}
                    />{" "}
                    ¿En oferta?
                </label>

                {form.oferta && (
                    <input
                        name="valorOferta"
                        type="number"
                        value={form.valorOferta || ""}
                        onChange={handleChange}
                        placeholder="Precio oferta"
                    />
                )}

                <input
                    name="imagen"
                    value={form.imagen}
                    onChange={handleChange}
                    placeholder="URL Imagen"
                />

                <button
                    type="submit"
                    style={{
                        background: "#0070f3",
                        color: "white",
                        padding: 10,
                        borderRadius: 6,
                        marginTop: 10,
                    }}
                >
                    Guardar cambios
                </button>
            </form>

            <button
                onClick={handleDelete}
                style={{
                    marginTop: 20,
                    padding: 10,
                    width: "100%",
                    background: "red",
                    color: "white",
                    borderRadius: 6,
                }}
            >
                Eliminar comida
            </button>
        </div>
    );
}
