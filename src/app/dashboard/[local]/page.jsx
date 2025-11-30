async function getComidas(local) {
    const res = await fetch(`/api/locales/${local}/comidas`, { cache: "no-store" });
    return res.json();
}

export default async function LocalDashboard({ params }) {
    const { local } = params;
    const comidas = await getComidas(local);

    return (
        <div style={{ padding: 20 }}>
            <h1>{local.toUpperCase()}</h1>

            <a href={`/dashboard/${local}/agregar`}>➕ Agregar comida</a>

            <ul>
                {comidas &&
                    Object.entries(comidas).map(([id, comida]) => (
                        <li key={id}>
                            {comida.nombre} – ${comida.precio}
                            {" | "}
                            <a href={`/dashboard/${local}/editar/${id}`}>Editar</a>
                        </li>
                    ))}
            </ul>
        </div>
    );
}
