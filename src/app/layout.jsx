export const metadata = {
  title: "Pintó la gula",
  description: "Las mejores hamburguesas",
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
      <body className={poppins.className}>
        {children}
      </body>
    </html>

  );
}
