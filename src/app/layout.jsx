export const metadata = {
  title: "Pintó la Gula",
  description: "Las mejores hamburguesas de Chajarí. Pedí fácil, rápido y por WhatsApp.",
  manifest: "/manifest.json",

  icons: {
    icon: "/icons/icon-192.png",
    apple: "/icons/icon-192.png",
    shortcut: "/icons/icon-192.png",
  },

  openGraph: {
    title: "Pintó la Gula – Las mejores hamburguesas de Chajarí",
    description: "Pedí por WhatsApp. Delivery o retiro. Menú actualizado todos los días.",
    url: "https://pla-g-card.vercel.app/",
    siteName: "Pintó la Gula",
    images: [
      {
        url: "/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "Pintó la Gula – Hamburguesas artesanales",
      }
    ],
    locale: "es_AR",
    type: "website"
  },

  twitter: {
    card: "summary_large_image",
    title: "Pintó la Gula",
    description: "Las mejores hamburguesas de Chajarí. Pedido rápido por WhatsApp.",
    images: ["/og-image.jpg"],
  }
};

export const viewport = {
  themeColor: "#facc15",
};

import { Poppins } from "next/font/google";
import "bootstrap/dist/css/bootstrap.min.css";
import "./globals.css";

// 📌 IMPORTA TU CLIENT COMPONENT (NO rompe SSR)
import PWAInitializer from "@/components/PWAInitializer";

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["400", "600", "700"],
});

export default function RootLayout({ children }) {
  return (
    <html lang="es">
      <body className={poppins.className}>
        {/* Inicializador PWA - ahora sí funciona */}
        <PWAInitializer />

        {children}
      </body>
    </html>
  );
}
