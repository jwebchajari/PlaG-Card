"use client";

import { WhatsappIcon } from "@/components/BrandIcons";
import { whatsappShareUrl } from "@/lib/site";

/** Opens WhatsApp with a message that ends in the URL, so the chat shows the link preview. */
export default function ShareButton({ text, url, className, label = "Compartir", iconOnly = false }) {
	const href = whatsappShareUrl(`${text}\n${url}`);
	return (
		<a
			href={href}
			target="_blank"
			rel="noopener noreferrer"
			className={className}
			aria-label={iconOnly ? `${label} por WhatsApp` : undefined}
		>
			<WhatsappIcon size={18} />
			{!iconOnly && <span>{label}</span>}
		</a>
	);
}
