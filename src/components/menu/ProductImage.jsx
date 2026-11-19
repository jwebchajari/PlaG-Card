"use client";

import { useState } from "react";
import { cldUrl } from "@/lib/cloudinary-url";
import styles from "./menu.module.css";

/** Owner photos come from arbitrary hosts (Drive, Dropbox...), so a plain lazy <img> with a branded fallback. */
export default function ProductImage({ src, alt, className, eager = false, width = 240, height = 240 }) {
	const [failed, setFailed] = useState(false);

	if (!src || failed) {
		return (
			<span className={`${className} ${styles.imgFallback}`} role="img" aria-label={alt}>
				{/* eslint-disable-next-line @next/next/no-img-element */}
				<img src="/brand/logo-96.png" alt="" width={56} height={58} />
			</span>
		);
	}

	return (
		// eslint-disable-next-line @next/next/no-img-element
		<img
			// Cloudinary photos come resized and in the best format for the browser (WebP/AVIF).
			src={cldUrl(src, `f_auto,q_auto,c_limit,w_${width}`)}
			alt={alt}
			className={className}
			width={width}
			height={height}
			loading={eager ? "eager" : "lazy"}
			decoding="async"
			referrerPolicy="no-referrer"
			onError={() => setFailed(true)}
		/>
	);
}
