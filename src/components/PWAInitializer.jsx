"use client";

import { useEffect, useState } from "react";
import IOSInstallPrompt from "./iOSInstallPrompt";

export default function PWAInitializer() {
    const [deferredPrompt, setDeferredPrompt] = useState(null);
    const [showInstallButton, setShowInstallButton] = useState(false);
    const [isIOS, setIsIOS] = useState(false);
    const [isStandalone, setIsStandalone] = useState(false);

    useEffect(() => {
        // Detectar instalación previa
        const standaloneCheck =
            window.matchMedia("(display-mode: standalone)").matches ||
            window.navigator.standalone === true;

        setIsStandalone(standaloneCheck);

        // Registrar SW
        if ("serviceWorker" in navigator) {
            navigator.serviceWorker
                .register("/sw.js")
                .then(() => console.log("✔ SW registrado"))
                .catch((e) => console.error("❌ Error SW", e));
        }

        // Detectar iOS
        const userAgent = window.navigator.userAgent.toLowerCase();
        const iOS =
            /iphone|ipad|ipod/.test(userAgent) && !standaloneCheck;
        setIsIOS(iOS);

        // Evento Android
        window.addEventListener("beforeinstallprompt", (e) => {
            e.preventDefault();
            console.log("📌 beforeinstallprompt disparado");
            setDeferredPrompt(e);
            setShowInstallButton(true);
        });
    }, []);

    const installPWA = async () => {
        if (!deferredPrompt) return;
        deferredPrompt.prompt();
        const result = await deferredPrompt.userChoice;
        console.log("➡ Resultado instalación:", result.outcome);
        setDeferredPrompt(null);
        setShowInstallButton(false);
    };

    // 🔥 iOS no usa prompt, usa banner propio
    if (isIOS && !isStandalone) {
        return <IOSInstallPrompt />;
    }

    if (!showInstallButton || isIOS) return null;

    return (
        <button
            onClick={installPWA}
            style={{
                position: "fixed",
                bottom: "20px",
                right: "20px",
                background: "#facc15",
                padding: "12px 18px",
                borderRadius: "14px",
                fontWeight: "bold",
                border: "none",
                boxShadow: "0 4px 12px rgba(0,0,0,0.25)",
                zIndex: 99999,
            }}
        >
            📥 Instalar App
        </button>
    );
}
