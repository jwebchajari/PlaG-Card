"use client";

import { useState } from "react";

export default function Agregar({ params }) {
    const { local } = params;
    const [form, setForm] = useState({
        nombre: "",
        precio: "",
        descripcion: "",
        imagen: ""
    });

    function handleChange(e) {
        setForm({ ...form, [e.target.name]: e.target.value });
    }

    async function handleSubmit(e) {
        e.preventDefault();

        const res = await fetch(`/api/locales/${local}/comidas`, {
            method: "POST",
            body: JSON.stringify(form)
        });

        if (res.ok) {
            alert("Comida agregada");
            window.location.href = `/dashboard/${local}`;
        }
    }

    return (
        <div style={{ padding: 20 }}>
            <h1>Agregar comida a {local}</h1>

            <form onSubmit={handleSubmit}>
                <input
                    name="nombre"
                    placeholder="Nombre"
                    onChange={handleChange}
                />
                <br />

                <input
                    name="precio"
                    placeholder="Precio"
                    type="number"
                    onChange={handleChange}
                />
                <br />

                <textarea
                    name="descripcion"
                    placeholder="Descripción"
                    onChange={handleChange}
                />
                <br />

                <input
                    name="imagen"
                    placeholder="URL de imagen"
                    onChange={handleChange}
                />
                <br />

                <button type="submit">Agregar</button>
            </form>
        </div>
    );
}
