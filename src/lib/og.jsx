/* Shared pieces for the Open Graph images (edge runtime, rendered by next/og). */

import { cldUrl } from "@/lib/cloudinary-url";

export const OG_SIZE = { width: 1200, height: 630 };

export const NAVY = "#0b0e29";
export const NAVY_2 = "#101336";
export const ORANGE = "#f4a44e";
export const MUTED = "#c3c6e0";

export async function loadOgAssets() {
	const [semibold, extrabold, logo] = await Promise.all([
		fetch(new URL("../assets/og/poppins-600.woff", import.meta.url)).then((r) => r.arrayBuffer()),
		fetch(new URL("../assets/og/poppins-800.woff", import.meta.url)).then((r) => r.arrayBuffer()),
		fetch(new URL("../assets/og/logo.png", import.meta.url)).then((r) => r.arrayBuffer()),
	]);
	return {
		logo: toDataUrl(logo, "image/png"),
		fonts: [
			{ name: "Poppins", data: semibold, weight: 600, style: "normal" },
			{ name: "Poppins", data: extrabold, weight: 800, style: "normal" },
		],
	};
}

export function toDataUrl(buffer, type) {
	const bytes = new Uint8Array(buffer);
	let bin = "";
	const chunk = 0x8000;
	for (let i = 0; i < bytes.length; i += chunk) {
		bin += String.fromCharCode.apply(null, bytes.subarray(i, i + chunk));
	}
	return `data:${type};base64,${btoa(bin)}`;
}

/** Fetches a remote product photo for the card; null when it is not a usable JPEG/PNG. */
export async function fetchPhoto(url) {
	if (!url || !/^https?:\/\//i.test(url)) return null;
	try {
		// Cloudinary: ask for a small JPEG already cropped to the card's photo area.
		const src = cldUrl(url, "f_jpg,q_auto,c_fill,w_450,h_472");
		const res = await fetch(src, { redirect: "follow", signal: AbortSignal.timeout(4000) });
		const type = (res.headers.get("content-type") || "").split(";")[0].trim();
		if (!res.ok || !/^image\/(jpeg|png)$/.test(type)) return null;
		const buf = await res.arrayBuffer();
		if (buf.byteLength > 4_000_000) return null;
		return toDataUrl(buf, type);
	} catch {
		return null;
	}
}

const STARS = [
	[6, 14, 4],
	[22, 82, 3],
	[41, 9, 3],
	[57, 58, 4],
	[70, 22, 3],
	[88, 70, 3],
	[95, 8, 4],
];

/** Starfield and an orange planet rim, drawn as plain shapes (satori has limited gradient parsing). */
export function SpaceBackdrop() {
	return (
		<div style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%", display: "flex" }}>
			<div
				style={{
					position: "absolute",
					right: -260,
					bottom: -420,
					width: 760,
					height: 760,
					borderRadius: 9999,
					backgroundColor: "#1d2257",
					border: "4px solid rgba(244,164,78,0.55)",
				}}
			/>
			{STARS.map(([x, y, s]) => (
				<div
					key={`${x}-${y}`}
					style={{
						position: "absolute",
						left: `${x}%`,
						top: `${y}%`,
						width: s,
						height: s,
						borderRadius: 9999,
						backgroundColor: "rgba(255,255,255,0.7)",
					}}
				/>
			))}
		</div>
	);
}
