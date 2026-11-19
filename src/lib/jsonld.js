import { SITE_URL, SITE_NAME, SITE_CITY, SITE_DESCRIPTION, productUrl, waNumber } from "@/lib/site";

const SCHEMA_DAYS = {
	lunes: "Monday",
	martes: "Tuesday",
	"miércoles": "Wednesday",
	jueves: "Thursday",
	viernes: "Friday",
	"sábado": "Saturday",
	domingo: "Sunday",
};

export function restaurantJsonLd({ datos, horarios, sections }) {
	const hours = Object.entries(horarios || {}).flatMap(([dia, info]) =>
		info.cerrado
			? []
			: info.franjas.map((f) => ({
					"@type": "OpeningHoursSpecification",
					dayOfWeek: `https://schema.org/${SCHEMA_DAYS[dia]}`,
					opens: f.desde,
					closes: f.hasta,
				}))
	);

	const phone = waNumber(datos.whatsapp);

	return {
		"@context": "https://schema.org",
		"@type": "Restaurant",
		"@id": `${SITE_URL}/#restaurant`,
		name: SITE_NAME,
		description: SITE_DESCRIPTION,
		url: SITE_URL,
		image: `${SITE_URL}/opengraph-image`,
		logo: `${SITE_URL}/icons/icon-512.png`,
		servesCuisine: ["Hamburguesas", "Sandwiches", "Comida rápida"],
		...(phone && { telephone: `+${phone}` }),
		address: {
			"@type": "PostalAddress",
			...(datos.direccion && { streetAddress: datos.direccion }),
			addressLocality: SITE_CITY,
			addressRegion: "Entre Ríos",
			addressCountry: "AR",
		},
		...(hours.length && { openingHoursSpecification: hours }),
		sameAs: [datos.redes?.instagram, datos.redes?.facebook].filter((v) => v && /^https?:\/\//.test(v)),
		hasMenu: {
			"@type": "Menu",
			name: `Menú de ${SITE_NAME}`,
			hasMenuSection: sections.map((s) => ({
				"@type": "MenuSection",
				name: s.label,
				hasMenuItem: s.products.map((p) => ({
					"@type": "MenuItem",
					name: p.name,
					url: productUrl(p.id),
					...(p.description && { description: p.description }),
					...(p.image && { image: p.image }),
					offers: { "@type": "Offer", price: p.price, priceCurrency: "ARS" },
				})),
			})),
		},
	};
}

export function productJsonLd(product, sectionLabel) {
	return [
		{
			"@context": "https://schema.org",
			"@type": "MenuItem",
			name: product.name,
			url: productUrl(product.id),
			...(product.description && { description: product.description }),
			image: product.image || `${SITE_URL}/producto/${product.id}/opengraph-image`,
			offers: {
				"@type": "Offer",
				price: product.price,
				priceCurrency: "ARS",
				availability: "https://schema.org/InStock",
				seller: { "@id": `${SITE_URL}/#restaurant` },
			},
		},
		{
			"@context": "https://schema.org",
			"@type": "BreadcrumbList",
			itemListElement: [
				{ "@type": "ListItem", position: 1, name: SITE_NAME, item: SITE_URL },
				{ "@type": "ListItem", position: 2, name: sectionLabel, item: `${SITE_URL}/#${product.category}` },
				{ "@type": "ListItem", position: 3, name: product.name, item: productUrl(product.id) },
			],
		},
	];
}

/** Safe inline JSON for <script type="application/ld+json">. */
export function jsonLdHtml(data) {
	return { __html: JSON.stringify(data).replace(/</g, "\\u003c") };
}
