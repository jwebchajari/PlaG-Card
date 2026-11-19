import { getLocal } from "@/lib/menu";
import CheckoutApp from "@/components/checkout/CheckoutApp";

export const revalidate = 60;

export const metadata = {
	title: "Tu pedido",
	robots: { index: false, follow: true },
	alternates: { canonical: "/comprar" },
};

export default async function ComprarPage() {
	const { products, datos, horarios } = await getLocal();
	// Prices on the client cart are re-read from here, never trusted from localStorage.
	const menu = Object.fromEntries(products.map((p) => [p.id, p]));
	return <CheckoutApp menu={menu} datos={datos} horarios={horarios} />;
}
