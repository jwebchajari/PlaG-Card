let deferredPrompt;

window.addEventListener("beforeinstallprompt", (e) => {
	e.preventDefault();
	deferredPrompt = e;

	const installBtn = document.getElementById("install-app-btn");
	if (installBtn) installBtn.style.display = "block";
});

export function installPWA() {
	if (!deferredPrompt) return;
	deferredPrompt.prompt();
}

<button
	id="pwa-install-btn"
	onClick={() => installPWA()}
	style={{ display: "none" }}
>
	Agregar al inicio
</button>;
