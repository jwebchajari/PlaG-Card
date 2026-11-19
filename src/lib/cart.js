"use client";

import { useSyncExternalStore } from "react";

const KEY = "cartData";
const TTL = 3 * 60 * 60 * 1000;

let items = [];
let loaded = false;
const listeners = new Set();

function read() {
	try {
		const raw = localStorage.getItem(KEY);
		if (!raw) return [];
		const { items: stored, timestamp } = JSON.parse(raw);
		if (!Array.isArray(stored) || Date.now() - timestamp > TTL) {
			localStorage.removeItem(KEY);
			return [];
		}
		return stored;
	} catch {
		return [];
	}
}

function write() {
	try {
		if (items.length) localStorage.setItem(KEY, JSON.stringify({ items, timestamp: Date.now() }));
		else localStorage.removeItem(KEY);
	} catch {
		/* storage unavailable: cart lives in memory for this visit */
	}
}

function ensureLoaded() {
	if (!loaded && typeof window !== "undefined") {
		items = read();
		loaded = true;
	}
}

function set(next) {
	items = next;
	write();
	listeners.forEach((l) => l());
}

function subscribe(listener) {
	listeners.add(listener);
	const onStorage = (e) => {
		if (e.key === KEY) {
			items = read();
			listener();
		}
	};
	window.addEventListener("storage", onStorage);
	return () => {
		listeners.delete(listener);
		window.removeEventListener("storage", onStorage);
	};
}

const EMPTY = [];

function getSnapshot() {
	ensureLoaded();
	return items;
}

function getServerSnapshot() {
	return EMPTY;
}

function newId() {
	return typeof crypto !== "undefined" && crypto.randomUUID
		? crypto.randomUUID()
		: `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

export const cart = {
	add(line) {
		ensureLoaded();
		set([...items, { ...line, id: newId() }]);
	},
	update(id, patch) {
		set(items.map((it) => (it.id === id ? { ...it, ...patch } : it)));
	},
	remove(id) {
		set(items.filter((it) => it.id !== id));
	},
	replaceAll(next) {
		set(next);
	},
	clear() {
		set([]);
	},
};

export function useCart() {
	return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}
