"use client";

import { useEffect } from "react";
import { Poppins } from "next/font/google";
import "bootstrap/dist/css/bootstrap.min.css";
import "./globals.css";

/* ======================= 
   METADATA PWA + SEO 
======================= */
export const metadata = {
  title: "Pintó la Gula",
  description:
    "Las mejores hamburguesas de Chajarí. Pedí fácil, rápido y por WhatsApp.",
  manifest: "/manifest.json",

  icons: {
    icon: "/icons/icon-192.png",
    apple: "/icons/icon-192.png",
    shortcut: "/icons/icon-192.png",
  },

  openGraph: {
    title: "Pintó la Gula – Las mejores hamburguesas de Chajarí",
    description:
      "Pedí por WhatsApp. Delivery o retiro. Menú actualizado todos los días.",
    url: "https://pla-g-card.vercel.app/",
    siteName: "Pintó la Gula",
    images: [
      {
        url: "/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "Pintó la Gula – Hamburguesas artesanales",
      },
    ],
    locale: "es_AR",
    type: "website",
  },

  twitter: {
    card: "summary_large_image",
    title: "Pintó la Gula",
    description:
      "Las mejores hamburguesas de Chajarí. Pedido rápido por WhatsApp.",
    images: ["/og-image.jpg"],
  },

  keywords: [
    "hamburguesas",
    "comida rápida",
    "Chajarí",
    "delivery",
    "pintó la gula",
    "take away",
    "hamburguesería",
  ],
  authors: [{ name: "Pintó la Gula" }],
};

export const viewport = {
  themeColor: "#101336",
};

/* ======================= 
   FUENTE 
======================= */
const poppins = Poppins({
  subsets: ["latin"],
  weight: ["400", "600", "700"],
});

/* ======================= 
   ROOTLAYOUT 
======================= */
export default function RootLayout({ children }) {
  useEffect(() => {
    /* ====== REGISTRAR SERVICE WORKER ====== */
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker
        .register("/sw.js")
        .then(() => console.log("SW registrado correctamente ✔"))
        .catch((err) => console.log("Error registrando SW:", err));
    }
  }, []);

  return (
    <html lang="es">
      <head>
        {/* Vincular manifest */}
        <link rel="manifest" href="/manifest.json" />

        {/* Script PWA (manejo de instalación) */}
        <script src="/pwa.js" defer></script>
      </head>

      <body className={poppins.className}>
        {children}
      </body>
    </html>
  );
}
