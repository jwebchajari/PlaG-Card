export const metadata = {
  title: "Pintó la Gula",
  description: "Las mejores hamburguesas de Rosario, pedí fácil y rápido.",
  manifest: "/manifest.json",
  themeColor: "#facc15",
  icons: {
    icon: "/icons/icon-192.png",
    apple: "/icons/icon-192.png",
    shortcut: "/icons/icon-192.png"
  }
};



import { Poppins } from "next/font/google";

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["400", "600", "700"],
});


import "bootstrap/dist/css/bootstrap.min.css";
import "./globals.css";


export default function RootLayout({ children }) {
  return (
    <html lang="es">
      <head>
        <link rel="manifest" href="/manifest.json" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar" content="black-translucent" />
        <meta name="theme-color" content="#facc15" />

      </head>
      <body className={poppins.className}>
        {children}
      </body>
    </html>

  );
}
