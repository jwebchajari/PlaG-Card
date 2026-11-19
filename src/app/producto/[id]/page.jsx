import { notFound } from "next/navigation";
import MenuApp from "@/components/menu/MenuApp";
import { getLocal } from "@/lib/menu";
import { productJsonLd, jsonLdHtml } from "@/lib/jsonld";
import { SITE_NAME, CATEGORIES, formatPrice } from "@/lib/site";

export const revalidate = 60;

async function findProduct(id) {
	const data = await getLocal();
	const product = data.products.find((p) => p.id === decodeURIComponent(id));
	return { data, product };
}

export async function generateStaticParams() {
	const { products } = await getLocal();
	return products.map((p) => ({ id: p.id }));
}

export async function generateMetadata({ params }) {
	const { product } = await findProduct(params.id);
	if (!product) return { title: "Producto no encontrado", robots: { index: false } };

	const price = formatPrice(product.price);
	const description = product.description
		? `${product.description} ${price}. Pedilo por WhatsApp en ${SITE_NAME}, Chajarí.`
		: `${price}. Pedilo por WhatsApp en ${SITE_NAME}, Chajarí.`;
	const path = `/producto/${product.id}`;

	return {
		title: product.name,
		description: description.slice(0, 155),
		alternates: { canonical: path },
		openGraph: {
			type: "website",
			url: path,
			title: `${product.name} · ${price}`,
			description,
		},
		twitter: { card: "summary_large_image", title: `${product.name} · ${price}`, description },
	};
}

export default async function ProductPage({ params }) {
	const { data, product } = await findProduct(params.id);
	if (!product) notFound();

	const section = CATEGORIES.find((c) => c.id === product.category)?.label || "Menú";

	return (
		<>
			<script type="application/ld+json" dangerouslySetInnerHTML={jsonLdHtml(productJsonLd(product, section))} />
			<MenuApp sections={data.sections} datos={data.datos} horarios={data.horarios} focusProduct={product} />
		</>
	);
}
