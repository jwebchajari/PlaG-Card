"use client";

import { useState } from "react";

export default function AgregarComida() {
    const [form, setForm] = useState({
        nombre: "",
        valor: "",
        descripcion: "",
        oferta: false,
        valorOferta: "",
        imagen: "",
    });

    function handleChange(e) {
        const { name, value, type, checked } = e.target;
        setForm({
            ...form,
            [name]: type === "checkbox" ? checked : value,
        });
    }

    async function handleSubmit(e) {
        e.preventDefault();

        try {
            const res = await fetch("/api/locales", {
                method: "POST",
                body: JSON.stringify(form),
            });

            if (!res.ok) {
                const text = await res.text();
                console.error("Error POST /api/locales:", res.status, text);
                alert("Error al agregar comida");
                return;
            }

            alert("Comida agregada");
            window.location.href = "/dashboard";
        } catch (err) {
            console.error("Error de red al agregar comida:", err);
            alert("Error al agregar comida");
        }
    }

    return (
        <div style={{ padding: 20 }}>
            <h1>Agregar comida</h1>

            <form onSubmit={handleSubmit} style={{ maxWidth: "400px" }}>
                <input
                    name="nombre"
                    placeholder="Nombre"
                    onChange={handleChange}
                    style={{ width: "100%", padding: 8 }}
                />
                <br />
                <br />

                <input
                    name="valor"
                    placeholder="Valor normal"
                    type="number"
                    onChange={handleChange}
                    style={{ width: "100%", padding: 8 }}
                />
                <br />
                <br />

                <textarea
                    name="descripcion"
                    placeholder="Descripción"
                    onChange={handleChange}
                    style={{ width: "100%", padding: 8 }}
                />
                <br />
                <br />

                <label style={{ display: "block", marginBottom: 8 }}>
                    <input
                        type="checkbox"
                        name="oferta"
                        onChange={handleChange}
                        style={{ marginRight: 6 }}
                    />
                    Oferta
                </label>

                {form.oferta && (
                    <>
                        <input
                            name="valorOferta"
                            placeholder="Valor en oferta"
                            type="number"
                            onChange={handleChange}
                            style={{ width: "100%", padding: 8 }}
                        />
                        <br />
                        <br />
                    </>
                )}

                <input
                    name="imagen"
                    placeholder="URL imagen"
                    onChange={handleChange}
                    style={{ width: "100%", padding: 8 }}
                />
                <br />
                <br />

                <button type="submit" style={{ padding: "8px 16px" }}>
                    Guardar
                </button>
            </form>
        </div>
    );
}
