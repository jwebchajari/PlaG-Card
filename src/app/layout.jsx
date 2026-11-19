import { Poppins } from "next/font/google";
import { SITE_URL, SITE_NAME, SITE_DESCRIPTION } from "@/lib/site";
import "./globals.css";

const poppins = Poppins({
	subsets: ["latin"],
	weight: ["400", "500", "600", "700", "800"],
	display: "swap",
	variable: "--font-poppins",
});

export const metadata = {
	metadataBase: new URL(SITE_URL),
	title: {
		default: `${SITE_NAME} | Hamburguesas en Chajarí`,
		template: `%s | ${SITE_NAME}`,
	},
	description: SITE_DESCRIPTION,
	applicationName: SITE_NAME,
	alternates: { canonical: "/" },
	openGraph: {
		type: "website",
		locale: "es_AR",
		siteName: SITE_NAME,
		url: "/",
		title: `${SITE_NAME} | Hamburguesas en Chajarí`,
		description: SITE_DESCRIPTION,
	},
	twitter: {
		card: "summary_large_image",
		title: `${SITE_NAME} | Hamburguesas en Chajarí`,
		description: SITE_DESCRIPTION,
	},
	appleWebApp: { capable: true, title: SITE_NAME, statusBarStyle: "black-translucent" },
	formatDetection: { telephone: false },
};

export const viewport = {
	themeColor: "#0b0e29",
	width: "device-width",
	initialScale: 1,
	viewportFit: "cover",
};

export default function RootLayout({ children }) {
	return (
		<html lang="es-AR" className={poppins.variable}>
			<body>{children}</body>
		</html>
	);
}
