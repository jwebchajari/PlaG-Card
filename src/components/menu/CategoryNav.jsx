"use client";

import { useEffect, useRef, useState } from "react";
import styles from "./menu.module.css";

export default function CategoryNav({ sections }) {
	const [active, setActive] = useState(sections[0]?.id);
	const listRef = useRef(null);
	const lock = useRef(false);

	// Scrollspy: the section crossing the upper third of the viewport is active.
	useEffect(() => {
		const els = sections.map((s) => document.getElementById(s.id)).filter(Boolean);
		if (!els.length) return;
		const obs = new IntersectionObserver(
			(entries) => {
				if (lock.current) return;
				const hit = entries.filter((e) => e.isIntersecting).sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top)[0];
				if (hit) setActive(hit.target.id);
			},
			{ rootMargin: "-120px 0px -60% 0px" }
		);
		els.forEach((el) => obs.observe(el));
		return () => obs.disconnect();
	}, [sections]);

	// Keep the active chip visible inside the horizontal list.
	useEffect(() => {
		const chip = listRef.current?.querySelector(`[data-id="${active}"]`);
		chip?.scrollIntoView({ block: "nearest", inline: "center", behavior: "smooth" });
	}, [active]);

	function go(e, id) {
		e.preventDefault();
		const el = document.getElementById(id);
		if (!el) return;
		setActive(id);
		lock.current = true;
		el.scrollIntoView({ behavior: "smooth", block: "start" });
		history.replaceState(null, "", `#${id}`);
		setTimeout(() => (lock.current = false), 700);
	}

	if (sections.length < 2) return null;

	return (
		<nav className={styles.catnav} aria-label="Categorías del menú">
			<ul ref={listRef} className={styles.catList}>
				{sections.map((s) => (
					<li key={s.id}>
						<a
							href={`#${s.id}`}
							data-id={s.id}
							className={`${styles.catChip} ${active === s.id ? styles.catChipActive : ""}`}
							aria-current={active === s.id ? "true" : undefined}
							onClick={(e) => go(e, s.id)}
						>
							{s.label}
						</a>
					</li>
				))}
			</ul>
		</nav>
	);
}
