"use client";

import { useEffect, useState } from "react";

export default function DatosDelLocal() {
    const [form, setForm] = useState(null);
    const [bannerPreview, setBannerPreview] = useState("/logo.png");
    const [logoPreview, setLogoPreview] = useState("/logo.png");

    // Cargar datos desde Firebase
    useEffect(() => {
        async function load() {
            const res = await fetch("/api/locales/datos");
            const data = await res.json();

            setForm({
                horarios: data.horarios || "",
                ubicacion: data.ubicacion || "",
                whatsapp: data.whatsapp || "",
                disponibleHoy: data.disponibleHoy || false,
                banner: data.banner || "",
                logo: data.logo || "",
                tiempoEstimado: data.tiempoEstimado || 0,
            });

            setBannerPreview(data.banner && data.banner.trim() ? data.banner : "/logo.png");
            setLogoPreview(data.logo && data.logo.trim() ? data.logo : "/logo.png");
        }

        load();
    }, []);

    if (!form) return <p style={{ padding: 20 }}>Cargando...</p>;

    function handleChange(e) {
        const { name, value, type, checked } = e.target;
        const newValue = type === "checkbox" ? checked : value;

        const updated = { ...form, [name]: newValue };
        setForm(updated);

        if (name === "banner") setBannerPreview(value.trim() ? value : "/logo.png");
        if (name === "logo") setLogoPreview(value.trim() ? value : "/logo.png");
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

            {/* PREVIEW BANNER */}
            <img
                src={bannerPreview}
                alt="banner"
                style={{
                    width: "100%",
                    height: 160,
                    objectFit: "cover",
                    borderRadius: 8,
                    marginBottom: 20,
                }}
            />

            {/* PREVIEW LOGO */}
            <img
                src={logoPreview}
                alt="logo"
                style={{
                    width: 120,
                    height: 120,
                    objectFit: "cover",
                    borderRadius: "50%",
                    margin: "0 auto 20px",
                    display: "block",
                    border: "2px solid #ddd",
                }}
            />

            <form
                onSubmit={handleSubmit}
                style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: 16,
                }}
            >
                <input
                    name="banner"
                    value={form.banner}
                    onChange={handleChange}
                    placeholder="URL del banner"
                />

                <input
                    name="logo"
                    value={form.logo}
                    onChange={handleChange}
                    placeholder="URL del logo"
                />

                <textarea
                    name="horarios"
                    value={form.horarios}
                    onChange={handleChange}
                    placeholder="Horarios de atención"
                    rows={3}
                />

                <input
                    name="ubicacion"
                    value={form.ubicacion}
                    onChange={handleChange}
                    placeholder="Ubicación del local"
                />

                <input
                    name="whatsapp"
                    value={form.whatsapp}
                    onChange={handleChange}
                    placeholder="WhatsApp"
                />

                <label style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <input
                        type="checkbox"
                        name="disponibleHoy"
                        checked={form.disponibleHoy}
                        onChange={handleChange}
                    />
                    ¿Hoy NO trabajamos?
                </label>

                <input
                    name="tiempoEstimado"
                    type="number"
                    value={form.tiempoEstimado}
                    onChange={handleChange}
                    placeholder="Tiempo estimado de preparación (minutos)"
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
                    Guardar datos
                </button>
            </form>
        </div>
    );
}
