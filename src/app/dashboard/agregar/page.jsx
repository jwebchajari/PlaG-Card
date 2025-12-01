"use client";

import { useState } from "react";

export default function AgregarComida() {
    const [preview, setPreview] = useState("/logo.png");
    const [imgStatus, setImgStatus] = useState(null); // null | "ok" | "error" | "loading"

    const [form, setForm] = useState({
        nombre: "",
        categoria: "Hamburguesa",
        valor: "",
        descripcion: "",
        oferta: false,
        valorOferta: "",
        imagen: "",
    });

    /* ============================================
       🔎 Convertir link de Google Drive a image URL
    ============================================ */
    function parseGoogleDriveURL(url) {
        if (!url) return "";

        const clean = url.trim();

        // Solo ID
        if (/^[a-zA-Z0-9_-]{20,}$/.test(clean)) {
            return `https://drive.google.com/uc?export=view&id=${clean}`;
        }

        // file/d/ID/view
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

        // fallback
        const generalID = clean.match(/\/d\/([a-zA-Z0-9_-]+)/);
        if (generalID) {
            return `https://drive.google.com/uc?export=view&id=${generalID[1]}`;
        }

        return clean;
    }

    /* ============================================
       🖼 Validar imagen y actualizar preview
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
       Manejo de inputs
    ============================================ */
    function handleChange(e) {
        const { name, value, type, checked } = e.target;
        const newValue = type === "checkbox" ? checked : value;

        let finalValue = newValue;

        if (name === "imagen") {
            const parsedURL = parseGoogleDriveURL(value);
            finalValue = parsedURL;
            validateImage(parsedURL);
        }

        setForm((prev) => ({
            ...prev,
            [name]: finalValue,
        }));
    }

    /* ============================================
       Enviar formulario
    ============================================ */
    async function handleSubmit(e) {
        e.preventDefault();

        if (!form.nombre.trim()) return alert("Falta el nombre del producto");
        if (!form.valor.trim()) return alert("Falta el precio");
        if (imgStatus === "error") return alert("La imagen no es válida");

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
            <h1 style={{ marginBottom: 25 }}>Agregar Comida</h1>

            <form
                onSubmit={handleSubmit}
                style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: 16,
                    fontFamily: "system-ui",
                }}
            >

                <div>
                    <label>Nombre</label>
                    <input name="nombre" onChange={handleChange} style={input} />
                </div>

                <div>
                    <label>Categoría</label>
                    <select name="categoria" onChange={handleChange} style={input}>
                        <option>Hamburguesa</option>
                        <option>Sandwich</option>
                        <option>Papas</option>
                        <option>Bebidas</option>
                        <option>Otros</option>
                    </select>
                </div>

                <div>
                    <label>Precio</label>
                    <input type="number" name="valor" onChange={handleChange} style={input} />
                </div>

                <div>
                    <label>Descripción</label>
                    <textarea
                        name="descripcion"
                        onChange={handleChange}
                        style={{ ...input, height: 80 }}
                    />
                </div>

                <label style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <input type="checkbox" name="oferta" onChange={handleChange} />
                    ¿En oferta?
                </label>

                {form.oferta && (
                    <div>
                        <label>Precio oferta</label>
                        <input
                            type="number"
                            name="valorOferta"
                            onChange={handleChange}
                            style={input}
                        />
                    </div>
                )}

                {/* Imagen */}
                <div>
                    <label>URL Imagen</label>
                    <input
                        name="imagen"
                        placeholder="Link directo o Google Drive"
                        onChange={handleChange}
                        style={input}
                    />

                    <small style={{ color: "#555" }}>
                        Soporta Google Drive, Dropbox, Cloudinary, ImgBB y más.
                    </small>

                    {/* Estado de validación */}
                    {imgStatus === "loading" && (
                        <p style={fadeText}>🔄 Verificando imagen...</p>
                    )}
                    {imgStatus === "ok" && (
                        <p style={{ ...fadeText, color: "green" }}>✔ Imagen válida</p>
                    )}
                    {imgStatus === "error" && (
                        <p style={{ ...fadeText, color: "red" }}>
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
                        style={{ width: "100%", height: 220, objectFit: "cover" }}
                    />
                </div>

                <button
                    type="submit"
                    style={{
                        background: "#0070f3",
                        color: "white",
                        padding: 12,
                        borderRadius: 6,
                        border: "none",
                        fontSize: 16,
                        cursor: "pointer",
                    }}
                >
                    Guardar
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

const fadeText = {
    fontSize: "0.9rem",
    marginTop: 6,
    animation: "fadeIn 0.3s ease-in-out",
};
