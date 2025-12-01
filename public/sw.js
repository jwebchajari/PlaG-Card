self.addEventListener("install", () => {
	console.log("Service Worker instalado");
	self.skipWaiting();
});

self.addEventListener("activate", () => {
	console.log("Service Worker activado");
	self.clients.claim();
});

/* Cache básico de recursos estáticos */
const CACHE_NAME = "plagula-v1";

self.addEventListener("fetch", (event) => {
	if (event.request.method !== "GET") return;

	event.respondWith(
		caches.match(event.request).then((cached) => {
			return (
				cached ||
				fetch(event.request).then((res) => {
					if (!res || res.status !== 200) return res;
					const clone = res.clone();
					caches.open(CACHE_NAME).then((cache) => {
						cache.put(event.request, clone);
					});
					return res;
				})
			);
		})
	);
});
