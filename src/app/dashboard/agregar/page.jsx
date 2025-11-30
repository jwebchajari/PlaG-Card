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
        <div
            style={{
                padding: "20px",
                maxWidth: "480px",
                margin: "0 auto",
            }}
        >
            <h1 style={{ textAlign: "center", marginBottom: "20px" }}>
                Agregar comida
            </h1>

            <form
                onSubmit={handleSubmit}
                style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "15px",
                }}
            >
                {/* Campo Nombre */}
                <div style={{ display: "flex", flexDirection: "column" }}>
                    <label style={{ marginBottom: "5px" }}>Nombre</label>
                    <input
                        name="nombre"
                        placeholder="Ej: Doble queso"
                        onChange={handleChange}
                        style={{
                            padding: "12px",
                            borderRadius: "8px",
                            border: "1px solid #ccc",
                            fontSize: "16px",
                        }}
                        required
                    />
                </div>

                {/* Valor Normal */}
                <div style={{ display: "flex", flexDirection: "column" }}>
                    <label style={{ marginBottom: "5px" }}>Valor normal</label>
                    <input
                        name="valor"
                        type="number"
                        placeholder="Ej: 15000"
                        onChange={handleChange}
                        style={{
                            padding: "12px",
                            borderRadius: "8px",
                            border: "1px solid #ccc",
                            fontSize: "16px",
                        }}
                        required
                    />
                </div>

                {/* Descripción */}
                <div style={{ display: "flex", flexDirection: "column" }}>
                    <label style={{ marginBottom: "5px" }}>Descripción</label>
                    <textarea
                        name="descripcion"
                        placeholder="Ej: lechuga, tomate, queso..."
                        onChange={handleChange}
                        style={{
                            padding: "12px",
                            borderRadius: "8px",
                            border: "1px solid #ccc",
                            fontSize: "16px",
                            minHeight: "90px",
                        }}
                    />
                </div>

                {/* Switch de oferta */}
                <label
                    style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "10px",
                        fontSize: "16px",
                        fontWeight: "500",
                    }}
                >
                    <input
                        type="checkbox"
                        name="oferta"
                        onChange={handleChange}
                        style={{ transform: "scale(1.4)" }}
                    />
                    ¿Está en oferta?
                </label>

                {/* Campo valorOferta (solo si oferta = true) */}
                {form.oferta && (
                    <div style={{ display: "flex", flexDirection: "column" }}>
                        <label style={{ marginBottom: "5px" }}>Valor oferta</label>
                        <input
                            name="valorOferta"
                            type="number"
                            placeholder="Ej: 12000"
                            onChange={handleChange}
                            style={{
                                padding: "12px",
                                borderRadius: "8px",
                                border: "1px solid #ccc",
                                fontSize: "16px",
                            }}
                        />
                    </div>
                )}

                {/* Imagen */}
                <div style={{ display: "flex", flexDirection: "column" }}>
                    <label style={{ marginBottom: "5px" }}>URL de imagen</label>
                    <input
                        name="imagen"
                        placeholder="https://imagen.jpg"
                        onChange={handleChange}
                        style={{
                            padding: "12px",
                            borderRadius: "8px",
                            border: "1px solid #ccc",
                            fontSize: "16px",
                        }}
                    />
                </div>

                {/* Botón */}
                <button
                    type="submit"
                    style={{
                        backgroundColor: "#0070f3",
                        color: "white",
                        padding: "14px",
                        borderRadius: "8px",
                        fontSize: "18px",
                        border: "none",
                        cursor: "pointer",
                        marginTop: "10px",
                    }}
                >
                    Guardar comida
                </button>
            </form>
        </div>
    );
}
