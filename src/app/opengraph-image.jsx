import { ImageResponse } from "next/og";
import { OG_SIZE, NAVY, ORANGE, MUTED, loadOgAssets, SpaceBackdrop } from "@/lib/og";

export const runtime = "edge";
export const alt = "Pintó la Gula: hamburguesas en Chajarí. Pedí por WhatsApp.";
export const size = OG_SIZE;
export const contentType = "image/png";

export default async function OpengraphImage() {
	const { logo, fonts } = await loadOgAssets();

	return new ImageResponse(
		(
			<div
				style={{
					position: "relative",
					width: "100%",
					height: "100%",
					display: "flex",
					alignItems: "center",
					padding: "0 72px",
					backgroundColor: NAVY,
					fontFamily: "Poppins",
					color: "#fff",
				}}
			>
				<SpaceBackdrop />
				<div style={{ display: "flex", flexDirection: "column", flex: 1 }}>
					<div style={{ fontSize: 104, fontWeight: 800, lineHeight: 1, letterSpacing: -3 }}>Pintó la Gula</div>
					<div style={{ fontSize: 46, fontWeight: 600, color: ORANGE, marginTop: 18 }}>Hamburguesas en Chajarí</div>
					<div style={{ display: "flex", fontSize: 30, fontWeight: 600, color: MUTED, marginTop: 44 }}>
						Mirá el menú y pedí por WhatsApp
					</div>
				</div>
				{/* eslint-disable-next-line @next/next/no-img-element, jsx-a11y/alt-text */}
				<img src={logo} width={400} height={414} style={{ marginRight: -12 }} />
			</div>
		),
		{ ...size, fonts }
	);
}
