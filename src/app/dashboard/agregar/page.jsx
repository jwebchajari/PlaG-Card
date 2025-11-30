"use client";

import { useState } from "react";

export default function AgregarComida() {
    const [form, setForm] = useState({
        nombre: "",
        valor: "",
        descripcion: "",
        oferta: false,
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

        const res = await fetch("/api/locales", {
            method: "POST",
            body: JSON.stringify(form),
        });

        if (res.ok) {
            alert("Comida agregada");
            window.location.href = "/dashboard";
        } else {
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
                <br /><br />

                <input
                    name="valor"
                    placeholder="Valor"
                    type="number"
                    onChange={handleChange}
                    style={{ width: "100%", padding: 8 }}
                />
                <br /><br />

                <textarea
                    name="descripcion"
                    placeholder="Descripción"
                    onChange={handleChange}
                    style={{ width: "100%", padding: 8 }}
                />
                <br /><br />

                <label>
                    <input
                        type="checkbox"
                        name="oferta"
                        onChange={handleChange}
                    />
                    {" "}Oferta
                </label>
                <br /><br />

                <input
                    name="imagen"
                    placeholder="URL imagen"
                    onChange={handleChange}
                    style={{ width: "100%", padding: 8 }}
                />
                <br /><br />

                <button type="submit" style={{ padding: "8px 16px" }}>
                    Guardar
                </button>
            </form>
        </div>
    );
}
