"use client";

export default function AndroidInstallPrompt({ onInstall, onClose }) {
    return (
        <div
            style={{
                position: "fixed",
                bottom: "22px",
                left: "50%",
                transform: "translateX(-50%)",
                width: "92%",
                maxWidth: "420px",
                zIndex: 999999,
                animation: "androidSlideIn 0.35s ease-out",
                fontFamily: "system-ui, sans-serif",
            }}
        >
            <div
                style={{
                    background: "#ffffffee",
                    backdropFilter: "blur(8px)",
                    padding: "20px",
                    borderRadius: "18px",
                    boxShadow: "0 8px 28px rgba(0,0,0,0.25)",
                    position: "relative",
                }}
            >
                {/* Botón cerrar */}
                <button
                    onClick={onClose}
                    style={{
                        position: "absolute",
                        top: "10px",
                        right: "12px",
                        background: "rgba(0,0,0,0.06)",
                        width: "26px",
                        height: "26px",
                        borderRadius: "50%",
                        border: "none",
                        fontSize: "14px",
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        color: "#444",
                    }}
                >
                    ✕
                </button>

                <h3
                    style={{
                        fontSize: "17px",
                        fontWeight: "700",
                        margin: "0 0 10px",
                        textAlign: "center",
                        color: "#111",
                    }}
                >
                    📥 Instalá la app
                </h3>

                <p
                    style={{
                        fontSize: "14px",
                        textAlign: "center",
                        color: "#333",
                        margin: "0 0 14px",
                    }}
                >
                    Añadí Pintó La Gula a tu pantalla de inicio para usarla más
                    rápido y sin conexión.
                </p>

                {/* Botón Instalar */}
                <button
                    onClick={onInstall}
                    style={{
                        width: "100%",
                        background: "#0B0E29",
                        padding: "12px",
                        borderRadius: "12px",
                        border: "none",
                        fontSize: "15px",
                        fontWeight: "700",
                        cursor: "pointer",
                        color: "#FFF",
                    }}
                >
                    Instalar ahora
                </button>

                {/* Botón secundario */}
                <button
                    onClick={onClose}
                    style={{
                        marginTop: "10px",
                        width: "100%",
                        padding: "10px",
                        borderRadius: "10px",
                        border: "none",
                        background: "#f2f2f2",
                        fontSize: "14px",
                        fontWeight: "600",
                        cursor: "pointer",
                    }}
                >
                    Seguir usando la web
                </button>
            </div>

            <style>{`
                @keyframes androidSlideIn {
                    from { opacity: 0; transform: translate(-50%, 20px); }
                    to { opacity: 1; transform: translate(-50%, 0); }
                }
            `}</style>
        </div>
    );
}
