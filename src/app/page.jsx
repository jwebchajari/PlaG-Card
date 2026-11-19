import MenuApp from "@/components/menu/MenuApp";
import { getLocal } from "@/lib/menu";
import { restaurantJsonLd, jsonLdHtml } from "@/lib/jsonld";

export const revalidate = 60;

export default async function Home() {
	const data = await getLocal();

	return (
		<>
			<script type="application/ld+json" dangerouslySetInnerHTML={jsonLdHtml(restaurantJsonLd(data))} />
			<MenuApp sections={data.sections} datos={data.datos} horarios={data.horarios} />
		</>
	);
}
