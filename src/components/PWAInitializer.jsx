"use client";

import { useEffect, useState } from "react";
import IOSInstallPrompt from "./iOSInstallPrompt";
import AndroidInstallPrompt from "./AndroidInstallPrompt";

export default function PWAInitializer() {
    const [deferredPrompt, setDeferredPrompt] = useState(null);
    const [showAndroidPrompt, setShowAndroidPrompt] = useState(false);
    const [isIOS, setIsIOS] = useState(false);
    const [isStandalone, setIsStandalone] = useState(false);

    useEffect(() => {
        // Detectar si ya está instalada
        const standalone =
            window.matchMedia("(display-mode: standalone)").matches ||
            window.navigator.standalone === true;
        setIsStandalone(standalone);

        // Registrar SW
        if ("serviceWorker" in navigator) {
            navigator.serviceWorker.register("/sw.js").catch(() => {});
        }

        // Detectar iOS
        const ua = navigator.userAgent.toLowerCase();
        const isIOSDevice = /iphone|ipad|ipod/.test(ua);
        setIsIOS(isIOSDevice && !standalone);

        // Android → beforeinstallprompt
        window.addEventListener("beforeinstallprompt", (e) => {
            e.preventDefault();
            setDeferredPrompt(e);
            setShowAndroidPrompt(true);
        });
    }, []);

    /* -------------------
       Android: instalar
    --------------------- */
    const installAndroid = async () => {
        if (!deferredPrompt) return;

        deferredPrompt.prompt();
        const result = await deferredPrompt.userChoice;
        console.log("Instalación Android:", result);

        setShowAndroidPrompt(false);
        setDeferredPrompt(null);
    };

    const closeAndroidPrompt = () => {
        setShowAndroidPrompt(false);
    };

    /* -------------------
       iOS → banner propio
    --------------------- */
    if (isIOS && !isStandalone) {
        return <IOSInstallPrompt />;
    }

    /* -------------------
       Android
    --------------------- */
    if (showAndroidPrompt && deferredPrompt) {
        return (
            <AndroidInstallPrompt
                onInstall={installAndroid}
                onClose={closeAndroidPrompt}
            />
        );
    }

    return null;
}
