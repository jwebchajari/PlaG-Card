import { SITE_NAME } from "@/lib/site";

export default function manifest() {
	return {
		name: `${SITE_NAME} · Hamburguesas en Chajarí`,
		short_name: SITE_NAME,
		description: "Mirá el menú del día y pedí por WhatsApp.",
		start_url: "/",
		scope: "/",
		display: "standalone",
		orientation: "portrait",
		lang: "es-AR",
		background_color: "#0b0e29",
		theme_color: "#0b0e29",
		icons: [
			{ src: "/icons/icon-192.png", sizes: "192x192", type: "image/png" },
			{ src: "/icons/icon-512.png", sizes: "512x512", type: "image/png" },
			{ src: "/icons/icon-maskable.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
		],
	};
}
