"use client";

import { useState } from "react";

export default function AgregarComida() {
    const [preview, setPreview] = useState("/logo.png");

    const [form, setForm] = useState({
        nombre: "",
        categoria: "Hamburguesa",
        valor: "",
        descripcion: "",
        oferta: false,
        valorOferta: "",
        imagen: "",
    });

    function handleChange(e) {
        const { name, value, type, checked } = e.target;

        const newValue = type === "checkbox" ? checked : value;

        setForm({
            ...form,
            [name]: newValue,
        });

        if (name === "imagen") {
            setPreview(value.trim() ? value : "/logo.png");
        }
    }

    async function handleSubmit(e) {
        e.preventDefault();

        const res = await fetch("/api/locales/comidas", {
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
        <div style={{ padding: 20, maxWidth: 480, margin: "0 auto" }}>
            <h1>Agregar Comida</h1>

            {/* PREVIEW */}
            <img
                src={preview}
                alt="preview"
                style={{
                    width: "100%",
                    height: 180,
                    objectFit: "cover",
                    marginBottom: 20,
                    borderRadius: 8,
                }}
            />

            <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 12 }}>

                <input name="nombre" placeholder="Nombre" onChange={handleChange} />

                {/* Categoría */}
                <select name="categoria" onChange={handleChange} defaultValue="Hamburguesa">
                    <option>Hamburguesa</option>
                    <option>Sandwich</option>
                    <option>Papas</option>
                    <option>Bebidas</option>
                    <option>Otros</option>
                </select>

                <input name="valor" type="number" placeholder="Precio" onChange={handleChange} />

                <textarea name="descripcion" placeholder="Descripción" onChange={handleChange}></textarea>

                <label>
                    <input type="checkbox" name="oferta" onChange={handleChange} /> ¿En oferta?
                </label>

                {form.oferta && (
                    <input name="valorOferta" type="number" placeholder="Precio oferta" onChange={handleChange} />
                )}

                <input name="imagen" placeholder="URL Imagen" onChange={handleChange} />

                <button type="submit" style={{ background: "#0070f3", color: "white", padding: 10, borderRadius: 6 }}>
                    Guardar
                </button>
            </form>

        </div>
    );
}
