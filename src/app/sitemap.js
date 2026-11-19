import { getLocal } from "@/lib/menu";
import { SITE_URL, productUrl } from "@/lib/site";

export const revalidate = 3600;

export default async function sitemap() {
	const { products } = await getLocal();
	const now = new Date();
	return [
		{ url: SITE_URL, lastModified: now, changeFrequency: "daily", priority: 1 },
		...products.map((p) => ({ url: productUrl(p.id), lastModified: now, changeFrequency: "weekly", priority: 0.7 })),
	];
}
