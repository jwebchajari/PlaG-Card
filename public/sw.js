self.addEventListener("install", () => {
  console.log("SW instalado");
  self.skipWaiting();
});

self.addEventListener("activate", () => {
  console.log("SW activado");
  clients.claim();
});

self.addEventListener("fetch", () => {
  // modo “network first”
});
