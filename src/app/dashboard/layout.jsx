export default function DashboardLayout({ children }) {
    return (
        <div style={{ minHeight: "100vh", background: "#fafafa" }}>
            {/* Header */}
            <header
                style={{
                    padding: "20px",
                    background: "#0070f3",
                    color: "white",
                    textAlign: "center",
                }}
            >
                <h2 style={{ margin: 0 }}>Panel de Administración</h2>
            </header>

            {/* Navigation */}
            <nav
                style={{
                    display: "flex",
                    gap: "10px",
                    padding: "15px",
                    overflowX: "auto",
                    background: "#ffffff",
                    borderBottom: "1px solid #ddd",
                }}
            >
                <a
                    href="/dashboard"
                    style={linkStyle}
                >
                    📋 Productos
                </a>

                <a
                    href="/dashboard/agregar"
                    style={linkStyle}
                >
                    ➕ Agregar Producto
                </a>

                <a
                    href="/dashboard/datos-local"
                    style={linkStyle}
                >
                    🏠 Datos del Local
                </a>

                <a
                    href="/dashboard/horarios"
                    style={linkStyle}
                >
                    🕒 Horarios
                </a>
            </nav>

            {/* Content */}
            <main style={{ padding: "20px" }}>{children}</main>
        </div>
    );
}

// 🎨 Estilo reusable para los botones del nav
const linkStyle = {
    padding: "10px 15px",
    background: "#efefef",
    borderRadius: "8px",
    textDecoration: "none",
    color: "#333",
    fontSize: "14px",
    whiteSpace: "nowrap",
    fontWeight: "500",
};
