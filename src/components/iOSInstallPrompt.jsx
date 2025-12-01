"use client";

export default function IOSInstallPrompt() {
    return (
        <div
            style={{
                position: "fixed",
                bottom: "20px",
                left: "50%",
                transform: "translateX(-50%)",
                background: "#ffffff",
                padding: "14px 18px",
                borderRadius: "12px",
                boxShadow: "0 4px 15px rgba(0,0,0,0.25)",
                maxWidth: "90%",
                zIndex: 99999,
                textAlign: "center",
            }}
        >
            <b>📲 Instalá la app</b>
            <p style={{ marginTop: 6 }}>
                Tocá <b>Compartir</b> → <b>Añadir a pantalla de inicio</b>
            </p>
        </div>
    );
}
