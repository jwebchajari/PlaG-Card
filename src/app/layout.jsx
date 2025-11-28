export const metadata = {
  title: "Pintó la gula",
  description: "Las mejores hamburguesas",
};


import "bootstrap/dist/css/bootstrap.min.css";
import "./globals.css";


export default function RootLayout({ children }) {
  return (
    <html lang="es">

      <body>
        {children}
        
        
        </body>
        
    </html>
  );
}
