"use client";

import LoadingScreen from "@/components/Loading";
import { useEffect, useState } from "react";

export default function DatosDelLocal() {
    const [form, setForm] = useState(null);

    // Cargar datos desde API
    useEffect(() => {
        async function load() {
            const res = await fetch("/api/locales/datos");
            const data = await res.json();

            setForm({
                direccion: data.direccion || "",
                whatsapp: data.whatsapp || "",
                alias: data.alias || "",

                extras: {
                    carne: data.extras?.carne || 1500,
                    panEspecial: data.extras?.panEspecial || 500,
                },

                redes: {
                    instagram: data.redes?.instagram || "",
                    facebook: data.redes?.facebook || "",
                    twitter: data.redes?.twitter || "",
                },
            });
        }

        load();
    }, []);

    if (!form) return <LoadingScreen />;

    /* ==========================
       HANDLERS
    ========================== */

    function handleChange(e) {
        const { name, value } = e.target;

        // Redes sociales
        if (name.startsWith("redes.")) {
            const key = name.split(".")[1];
            setForm((prev) => ({
                ...prev,
                redes: { ...prev.redes, [key]: value },
            }));
            return;
        }

        // Extras
        if (name.startsWith("extras.")) {
            const key = name.split(".")[1];
            setForm((prev) => ({
                ...prev,
                extras: { ...prev.extras, [key]: Number(value) },
            }));
            return;
        }

        // Datos simples
        setForm({ ...form, [name]: value });
    }

    async function handleSubmit(e) {
        e.preventDefault();

        const res = await fetch("/api/locales/datos", {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",   // ← 🔥 NECESARIO
            },
            body: JSON.stringify(form),
        });

        if (res.ok) alert("Datos actualizados correctamente");
        else alert("Error al guardar");
    }

    /* ==========================
       UI
    ========================== */

    return (
        <div style={{ padding: 20, maxWidth: 600, margin: "0 auto" }}>
            <h1 style={{ marginBottom: 20 }}>Datos del Local</h1>

            <form
                onSubmit={handleSubmit}
                style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: 16,
                }}
            >

                {/* Dirección */}
                <label style={{ fontWeight: 600 }}>Dirección del local</label>
                <input
                    name="direccion"
                    value={form.direccion}
                    onChange={handleChange}
                />

                {/* WhatsApp */}
                <label style={{ fontWeight: 600 }}>WhatsApp del local</label>
                <input
                    name="whatsapp"
                    value={form.whatsapp}
                    onChange={handleChange}
                />

                {/* Alias */}
                <label style={{ fontWeight: 600 }}>Alias o CBU</label>
                <input
                    name="alias"
                    value={form.alias}
                    onChange={handleChange}
                />

                <hr style={{ margin: "20px 0", opacity: 0.3 }} />

                {/* Extras */}
                <h3>Extras del menú</h3>

                <label>Carne extra (₲)</label>
                <input
                    type="number"
                    name="extras.carne"
                    value={form.extras.carne}
                    onChange={handleChange}
                    min={0}
                />

                <label>Pan especial (₲)</label>
                <input
                    type="number"
                    name="extras.panEspecial"
                    value={form.extras.panEspecial}
                    onChange={handleChange}
                    min={0}
                />

                <hr style={{ margin: "20px 0", opacity: 0.3 }} />

                {/* Redes */}
                <h3>Redes sociales</h3>

                <label>Instagram</label>
                <input
                    name="redes.instagram"
                    value={form.redes.instagram}
                    onChange={handleChange}
                />

                <label>Facebook</label>
                <input
                    name="redes.facebook"
                    value={form.redes.facebook}
                    onChange={handleChange}
                />

                <label>Twitter / X</label>
                <input
                    name="redes.twitter"
                    value={form.redes.twitter}
                    onChange={handleChange}
                />

                <button
                    type="submit"
                    style={{
                        background: "#0070f3",
                        color: "white",
                        padding: 12,
                        borderRadius: 6,
                        marginTop: 20,
                        fontSize: "1rem",
                        fontWeight: "600",
                    }}
                >
                    Guardar datos
                </button>
            </form>
        </div>
    );
}
