"use client";

import { useEffect, useState } from "react";

export default function DatosDelLocal() {
    const [form, setForm] = useState(null);

    // Cargar datos desde Firebase
    useEffect(() => {
        async function load() {
            const res = await fetch("/api/locales/datos");
            const data = await res.json();

            setForm({
                direccion: data.direccion || "",
                whatsapp: data.whatsapp || "",
                alias: data.alias || "",
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

        // Campos de redes
        if (name.startsWith("redes.")) {
            const key = name.split(".")[1];
            setForm((prev) => ({
                ...prev,
                redes: { ...prev.redes, [key]: value }
            }));
            return;
        }

        // Campos comunes
        setForm({ ...form, [name]: value });
    }

    async function handleSubmit(e) {
        e.preventDefault();

        const res = await fetch("/api/locales/datos", {
            method: "PUT",
            body: JSON.stringify(form),
        });

        if (res.ok) alert("Datos actualizados correctamente");
        else alert("Error al guardar");
    }

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
                    placeholder="Ej: Av. Siempre Viva 742"
                />

                {/* WhatsApp */}
                <label style={{ fontWeight: 600 }}>WhatsApp del local</label>
                <input
                    name="whatsapp"
                    value={form.whatsapp}
                    onChange={handleChange}
                    placeholder="Ej: 5491122334455"
                />

                {/* Alias */}
                <label style={{ fontWeight: 600 }}>Alias o CBU (transferencias)</label>
                <input
                    name="alias"
                    value={form.alias}
                    onChange={handleChange}
                    placeholder="Ej: panaderia.lagula.mp"
                />

                <hr style={{ margin: "20px 0", opacity: 0.3 }} />

                <h3 style={{ margin: "0 0 10px 0" }}>Redes sociales</h3>

                {/* Instagram */}
                <label>Instagram</label>
                <input
                    name="redes.instagram"
                    value={form.redes.instagram}
                    onChange={handleChange}
                    placeholder="@username"
                />

                {/* Facebook */}
                <label>Facebook</label>
                <input
                    name="redes.facebook"
                    value={form.redes.facebook}
                    onChange={handleChange}
                    placeholder="Página o perfil"
                />

                {/* Twitter */}
                <label>Twitter / X</label>
                <input
                    name="redes.twitter"
                    value={form.redes.twitter}
                    onChange={handleChange}
                    placeholder="@usuario"
                />

                <button
                    type="submit"
                    style={{
                        background: "#0070f3",
                        color: "white",
                        padding: 12,
                        borderRadius: 6,
                        marginTop: 20
                    }}
                >
                    Guardar datos
                </button>
            </form>
        </div>
    );
}
