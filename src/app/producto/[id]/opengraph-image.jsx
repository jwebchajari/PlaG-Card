import { ImageResponse } from "next/og";
import { NAVY, ORANGE, MUTED, loadOgAssets, fetchPhoto, SpaceBackdrop } from "@/lib/og";
import { LOCAL, formatPrice } from "@/lib/site";
import { normalizeProduct } from "@/lib/menu-shared";

export const runtime = "edge";
export const alt = "Producto de Pintó la Gula";
// 1.91:1 like the site card, but smaller: the photo makes the PNG heavy and WhatsApp skips large previews.
export const size = { width: 900, height: 472 };
export const contentType = "image/png";
export const revalidate = 300;

const k = size.width / 1200;
const px = (n) => Math.round(n * k);

async function getProduct(id) {
	const base = process.env.NEXT_PUBLIC_FIREBASE_DATABASE_URL;
	const res = await fetch(`${base}/locales/${LOCAL}/comidas/${encodeURIComponent(id)}.json`, {
		next: { revalidate: 300 },
	});
	if (!res.ok) return null;
	const raw = await res.json();
	return raw ? normalizeProduct(id, raw) : null;
}

export default async function ProductOgImage({ params }) {
	const id = decodeURIComponent(params.id);
	const [{ logo, fonts }, product] = await Promise.all([loadOgAssets(), getProduct(id)]);
	const photo = await fetchPhoto(product?.image);
	const name = product?.name || "Pintó la Gula";
	const half = size.width / 2;

	return new ImageResponse(
		(
			<div style={{ width: "100%", height: "100%", display: "flex", backgroundColor: NAVY, fontFamily: "Poppins", color: "#fff" }}>
				{photo ? (
					// eslint-disable-next-line @next/next/no-img-element, jsx-a11y/alt-text
					<img src={photo} width={half} height={size.height} style={{ objectFit: "cover" }} />
				) : (
					<div style={{ width: half, height: size.height, display: "flex", alignItems: "center", justifyContent: "center", backgroundColor: "#f3f4f9" }}>
						{/* eslint-disable-next-line @next/next/no-img-element, jsx-a11y/alt-text */}
						<img src={logo} width={px(380)} height={px(393)} />
					</div>
				)}

				<div
					style={{
						position: "relative",
						flex: 1,
						display: "flex",
						flexDirection: "column",
						justifyContent: "center",
						padding: `0 ${px(56)}px`,
						overflow: "hidden",
					}}
				>
					<SpaceBackdrop />
					<div style={{ display: "flex", alignItems: "center" }}>
						{/* eslint-disable-next-line @next/next/no-img-element, jsx-a11y/alt-text */}
						<img src={logo} width={px(64)} height={px(66)} />
						<div style={{ fontSize: px(30), fontWeight: 800, marginLeft: px(14) }}>Pintó la Gula</div>
					</div>
					<div
						style={{
							display: "flex",
							fontSize: px(name.length > 24 ? 52 : 64),
							fontWeight: 800,
							lineHeight: 1.08,
							letterSpacing: -1,
							marginTop: px(40),
						}}
					>
						{name}
					</div>
					{product && (
						<div style={{ display: "flex", fontSize: px(60), fontWeight: 800, color: ORANGE, marginTop: px(20) }}>
							{formatPrice(product.price)}
						</div>
					)}
					<div style={{ display: "flex", fontSize: px(26), fontWeight: 600, color: MUTED, marginTop: px(36) }}>
						Pedilo por WhatsApp · Chajarí
					</div>
				</div>
			</div>
		),
		{ ...size, fonts }
	);
}
