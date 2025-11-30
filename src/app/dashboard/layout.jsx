export default function DashboardLayout({ children }) {
    return (
        <div>
            <header style={{ padding: 20, background: "#efefef" }}>
                <h2>Panel de Administración</h2>
            </header>
            <main>{children}</main>
        </div>
    );
}
