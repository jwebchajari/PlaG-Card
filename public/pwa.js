let deferredPrompt;

window.addEventListener("beforeinstallprompt", (event) => {
	event.preventDefault();
	deferredPrompt = event;

	const btn = document.getElementById("installBtn");
	if (btn) btn.style.display = "block";
});

window.installPWA = async function () {
	if (!deferredPrompt) return;

	deferredPrompt.prompt();
	const result = await deferredPrompt.userChoice;
	console.log(result);

	deferredPrompt = null;
};
