"use client";

import LoadingScreen from "@/components/Loading";
import { useEffect, useState } from "react";

export default function EditarComida({ params }) {
    const { id } = params;

    const [form, setForm] = useState(null);
    const [loading, setLoading] = useState(true);

    const [preview, setPreview] = useState("/logo.png");
    const [imgStatus, setImgStatus] = useState(null); // null | "loading" | "ok" | "error"

    /* ============================================
       🔎 Convertir link de Google Drive
    ============================================ */
    function parseGoogleDriveURL(url) {
        if (!url) return "";

        const clean = url.trim();

        // Solo ID directo
        if (/^[a-zA-Z0-9_-]{20,}$/.test(clean)) {
            return `https://drive.google.com/uc?export=view&id=${clean}`;
        }

        // /file/d/ID/view
        const fileMatch = clean.match(/\/file\/d\/([a-zA-Z0-9_-]+)/);
        if (fileMatch) {
            return `https://drive.google.com/uc?export=view&id=${fileMatch[1]}`;
        }

        // open?id=ID
        const openMatch = clean.match(/open\?id=([a-zA-Z0-9_-]+)/);
        if (openMatch) {
            return `https://drive.google.com/uc?export=view&id=${openMatch[1]}`;
        }

        // uc?id=ID
        const ucMatch = clean.match(/uc\?id=([a-zA-Z0-9_-]+)/);
        if (ucMatch) {
            return `https://drive.google.com/uc?export=view&id=${ucMatch[1]}`;
        }

        return clean;
    }

    /* ============================================
       🖼 Validar imagen
    ============================================ */
    function validateImage(url) {
        if (!url || url.trim() === "") {
            setImgStatus(null);
            setPreview("/logo.png");
            return;
        }

        const img = new Image();
        setImgStatus("loading");

        img.onload = () => {
            setImgStatus("ok");
            setPreview(url);
        };

        img.onerror = () => {
            setImgStatus("error");
            setPreview("/logo.png");
        };

        img.src = url;
    }

    /* ============================================
       🟦 Cargar comida
    ============================================ */
    useEffect(() => {
        async function fetchData() {
            try {
                const res = await fetch(`/api/locales/comidas/${id}`);
                const data = await res.json();

                setForm(data);

                const parsed = parseGoogleDriveURL(data.imagen || "");
                setForm((prev) => ({ ...prev, imagen: parsed }));

                validateImage(parsed);
            } catch (err) {
                console.error("Error cargando comida:", err);
            } finally {
                setLoading(false);
            }
        }

        fetchData();
    }, [id]);

    /* ============================================
       📝 Manejar cambios
    ============================================ */
    function handleChange(e) {
        const { name, value, type, checked } = e.target;
        let finalValue = type === "checkbox" ? checked : value;

        if (name === "imagen") {
            finalValue = parseGoogleDriveURL(value);
            validateImage(finalValue);
        }

        setForm((prev) => ({
            ...prev,
            [name]: finalValue,
        }));
    }

    /* ============================================
       💾 Guardar cambios
    ============================================ */
    async function handleSubmit(e) {
        e.preventDefault();

        if (!form.nombre.trim()) return alert("Falta el nombre");
        if (!form.valor) return alert("Falta el precio");
        if (imgStatus === "error") return alert("La imagen es inválida");

        const res = await fetch(`/api/locales/comidas/${id}`, {
            method: "PUT",
            body: JSON.stringify(form),
        });

        if (res.ok) {
            alert("Comida actualizada");
            window.location.href = "/dashboard";
        } else {
            alert("Error al actualizar");
        }
    }

    /* ============================================
       ❌ Eliminar
    ============================================ */
    async function handleDelete() {
        if (!confirm("¿Eliminar esta comida?")) return;

        const res = await fetch(`/api/locales/comidas/${id}`, {
            method: "DELETE",
        });

        if (res.ok) {
            alert("Comida eliminada");
            window.location.href = "/dashboard";
        } else {
            alert("Error al eliminar");
        }
    }

    /* ============================================
       ⏳ Loading
    ============================================ */
    if (loading || !form) return <LoadingScreen />;

    /* ============================================
       UI
    ============================================ */
    return (
        <div style={{ padding: 20, maxWidth: 480, margin: "0 auto" }}>
            <h1 style={{ marginBottom: 20 }}>Editar {form.nombre}</h1>

            <form
                onSubmit={handleSubmit}
                style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: 16,
                }}
            >
                {/* Nombre */}
                <div>
                    <label>Nombre</label>
                    <input
                        name="nombre"
                        value={form.nombre}
                        onChange={handleChange}
                        style={input}
                    />
                </div>

                {/* Precio */}
                <div>
                    <label>Precio</label>
                    <input
                        name="valor"
                        type="number"
                        value={form.valor}
                        onChange={handleChange}
                        style={input}
                    />
                </div>

                {/* Oferta */}
                <label style={{ display: "flex", gap: 10, alignItems: "center" }}>
                    <input
                        type="checkbox"
                        name="oferta"
                        checked={form.oferta}
                        onChange={handleChange}
                    />
                    ¿En oferta?
                </label>

                {form.oferta && (
                    <div>
                        <label>Precio oferta</label>
                        <input
                            name="valorOferta"
                            type="number"
                            value={form.valorOferta || ""}
                            onChange={handleChange}
                            style={input}
                        />
                    </div>
                )}

                {/* Descripción */}
                <div>
                    <label>Descripción</label>
                    <textarea
                        name="descripcion"
                        value={form.descripcion}
                        onChange={handleChange}
                        style={{ ...input, height: 80 }}
                    />
                </div>

                {/* Imagen */}
                <div>
                    <label>URL Imagen</label>
                    <input
                        name="imagen"
                        value={form.imagen || ""}
                        onChange={handleChange}
                        style={input}
                    />

                    <small style={{ color: "#555" }}>
                        Se aceptan links de Google Drive, Dropbox, Cloudinary, ImgBB, etc.
                    </small>

                    {/* Estado de la imagen */}
                    {imgStatus === "loading" && (
                        <p style={fade}>🔄 Verificando imagen…</p>
                    )}
                    {imgStatus === "ok" && (
                        <p style={{ ...fade, color: "green" }}>✔ Imagen válida</p>
                    )}
                    {imgStatus === "error" && (
                        <p style={{ ...fade, color: "red" }}>
                            ❌ La imagen no pudo cargarse
                        </p>
                    )}
                </div>

                {/* PREVIEW */}
                <div
                    style={{
                        border: "1px solid #ddd",
                        borderRadius: 10,
                        overflow: "hidden",
                        boxShadow: "0 2px 5px rgba(0,0,0,0.08)",
                    }}
                >
                    <img
                        src={preview}
                        alt="preview"
                        style={{
                            width: "100%",
                            height: 220,
                            objectFit: "cover",
                        }}
                    />
                </div>

                {/* Botón guardar */}
                <button
                    type="submit"
                    style={{
                        background: "#0070f3",
                        color: "white",
                        padding: 12,
                        borderRadius: 6,
                        border: "none",
                        cursor: "pointer",
                        fontSize: 16,
                    }}
                    disabled={imgStatus === "error"}
                >
                    Guardar cambios
                </button>

                {/* Borrar */}
                <button
                    type="button"
                    onClick={handleDelete}
                    style={{
                        background: "red",
                        color: "white",
                        padding: 12,
                        borderRadius: 6,
                        border: "none",
                        cursor: "pointer",
                        marginTop: 10,
                    }}
                >
                    Eliminar comida
                </button>
            </form>
        </div>
    );
}

const input = {
    width: "100%",
    padding: "10px 12px",
    borderRadius: 6,
    border: "1px solid #ccc",
    fontSize: "1rem",
    marginTop: 4,
};

const fade = {
    animation: "fadeIn 0.3s ease-in-out",
    marginTop: 6,
};
