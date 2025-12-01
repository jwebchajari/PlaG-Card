/* ===============================
      PWA INSTALL HANDLER
================================ */

let deferredPrompt = null;

/* Cuando Chrome detecta que la PWA es instalable */
window.addEventListener("beforeinstallprompt", (e) => {
	e.preventDefault(); // Evita que Chrome muestre su popup automático
	deferredPrompt = e; // Guardamos el evento para usarlo después
	console.log("PWA instalable ✔");

	// Mostrar el botón flotante
	const btn = document.getElementById("pwa-install-btn");
	if (btn) btn.style.display = "flex";
});

/* Función global para que puedas llamar desde React */
window.installPWA = async () => {
	if (!deferredPrompt) {
		alert("La app no está lista para instalar todavía.");
		return;
	}

	deferredPrompt.prompt();

	const choice = await deferredPrompt.userChoice;
	console.log("Resultado instalación:", choice.outcome);

	deferredPrompt = null;

	// Ocultar botón
	const btn = document.getElementById("pwa-install-btn");
	if (btn) btn.style.display = "none";
};

/* ===============================
      DETECCIÓN iOS (Safari)
================================ */

const isIos =
	/iphone|ipad|ipod/i.test(window.navigator.userAgent) ||
	(navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);

const isInStandalone = window.matchMedia("(display-mode: standalone)").matches;

window.addEventListener("load", () => {
	if (isIos && !isInStandalone) {
		const msg = document.getElementById("ios-install-hint");
		if (msg) msg.style.display = "block";
	}
});
