"use client";

import { useEffect } from "react";

const KEY = "pg-visit";

/** Counts one visit per browser session. Automated browsers (navigator.webdriver) are skipped. */
export default function VisitTracker() {
	useEffect(() => {
		if (navigator.webdriver) return;
		try {
			if (sessionStorage.getItem(KEY)) return;
			sessionStorage.setItem(KEY, "1");
		} catch {
			/* storage blocked: still count this page view */
		}
		fetch("/api/locales/visitas", { method: "POST", keepalive: true }).catch(() => {});
	}, []);

	return null;
}
