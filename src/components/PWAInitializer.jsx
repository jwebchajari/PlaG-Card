"use client";

import { useEffect } from "react";

export default function PWAInitializer() {
    useEffect(() => {
        if ("serviceWorker" in navigator) {
            window.addEventListener("load", () => {
                navigator.serviceWorker
                    .register("/sw.js")
                    .then(() => console.log("SW registrado ✔"))
                    .catch((err) => console.warn("Error SW:", err));
            });
        }
    }, []);

    return null;
}
