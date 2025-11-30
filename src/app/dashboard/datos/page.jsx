"use client";

import { useEffect, useState } from "react";

export default function DatosDelLocal() {
    const [form, setForm] = useState(null);

    useEffect(() => {
        async function load() {
            const res = await fetch("/api/locales/datos");
            const data = await res.json();

            setForm({
                whatsapp: data.whatsapp || "",
                direccion: data.direccion || "",
                redes: {
                    instagram: data.redes?.instagram || "",
                    facebook: data.redes?.facebook || "",
                    twitter: data.redes?.twitter || "",
                }
            });
        }

        load();
    }, []);

    if (!form) return <p style={{ padding: 20 }}>Cargando...</p>;

    function handleChange(e) {
        const { name, value } = e.target;

        // redes sociales
        if (name === "instagram" || name === "facebook" || name === "twitter") {
            setForm({
                ...form,
                redes: {
                    ...form.redes,
                    [name]: value
                }
            });
            return;
        }

        // resto
        setForm({ ...form, [name]: value });
    }

    async function handleSubmit(e) {
        e.preventDefault();

        const res = await fetch("/api/locales/datos", {
            method: "PUT",
            body: JSON.stringify(form),
        });

        if (res.ok) {
            alert("Datos guardados correctamente");
        } else {
            alert("Error al guardar");
        }
    }

    return (
        <div style={{ padding: 20, maxWidth: 500, margin: "0 auto" }}>
            <h1>Datos del Local</h1>

            <form
                onSubmit={handleSubmit}
                style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: 16,
                    marginTop: 20
                }}
            >
                <input
                    name="whatsapp"
                    value={form.whatsapp}
                    onChange={handleChange}
                    placeholder="Número de WhatsApp"
                />

                <input
                    name="direccion"
                    value={form.direccion}
                    onChange={handleChange}
                    placeholder="Dirección del local"
                />

                <h3>Redes sociales</h3>

                <input
                    name="instagram"
                    value={form.redes.instagram}
                    onChange={handleChange}
                    placeholder="Instagram (URL o usuario)"
                />

                <input
                    name="facebook"
                    value={form.redes.facebook}
                    onChange={handleChange}
                    placeholder="Facebook (URL)"
                />

                <input
                    name="twitter"
                    value={form.redes.twitter}
                    onChange={handleChange}
                    placeholder="Twitter (URL)"
                />

                <button
                    type="submit"
                    style={{
                        background: "#0070f3",
                        color: "white",
                        padding: 12,
                        borderRadius: 6,
                    }}
                >
                    Guardar
                </button>
            </form>
        </div>
    );
}
