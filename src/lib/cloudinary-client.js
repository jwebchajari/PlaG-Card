/**
 * Ruta: src/lib/cloudinary-client.js
 * Subida unsigned a Cloudinary desde el navegador (con progreso).
 * No expone secretos: usa un upload preset unsigned. El borrado lo hace el servidor.
 */
import { cloudinaryFolder } from "@/lib/cloudinary-url";

const CLOUD_NAME = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
const UPLOAD_PRESET = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET;

export const MAX_IMAGE_BYTES = 10 * 1024 * 1024; // límite de imagen del plan gratuito

export const cloudinaryReady = Boolean(CLOUD_NAME && UPLOAD_PRESET);

function slug(s) {
	return String(s || "")
		.normalize("NFD")
		.replace(/[̀-ͯ]/g, "")
		.toLowerCase()
		.replace(/[^a-z0-9]+/g, "-")
		.replace(/^-|-$/g, "")
		.slice(0, 40);
}

/**
 * Sube una imagen a CardCloude/<local>.
 * @param {File} file
 * @param {object} opts
 * @param {string} opts.local slug del local (carpeta)
 * @param {string} [opts.name] nombre legible para el public_id (ej: nombre del producto)
 * @param {(pct:number)=>void} [opts.onProgress]
 * @param {AbortSignal} [opts.signal]
 * @returns {Promise<{publicId:string,url:string,width:number,height:number,bytes:number,format:string}>}
 */
export function uploadImage(file, { local, name, onProgress, signal } = {}) {
	return new Promise((resolve, reject) => {
		if (!local) {
			reject(new Error("Falta el local para guardar la foto."));
			return;
		}
		if (!cloudinaryReady) {
			reject(new Error("Falta configurar Cloudinary (cloud name y upload preset)."));
			return;
		}
		if (!file?.type?.startsWith("image/")) {
			reject(new Error("El archivo tiene que ser una imagen (JPG, PNG o WebP)."));
			return;
		}
		if (file.size > MAX_IMAGE_BYTES) {
			reject(new Error("La imagen pesa más de 10 MB. Probá con una más liviana."));
			return;
		}

		const fd = new FormData();
		fd.append("file", file);
		fd.append("upload_preset", UPLOAD_PRESET);
		// folder: prefix of the public_id (URL). asset_folder: folder shown in the Media Library.
		// A preset with its own asset_folder overrides the latter, so use a preset without one.
		fd.append("folder", cloudinaryFolder(local));
		fd.append("asset_folder", cloudinaryFolder(local));
		fd.append("public_id", `${slug(name) || "producto"}-${Date.now().toString(36)}`);

		const xhr = new XMLHttpRequest();
		xhr.open("POST", `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`);

		xhr.upload.onprogress = (e) => {
			if (e.lengthComputable && onProgress) onProgress(Math.round((e.loaded / e.total) * 100));
		};

		xhr.onload = () => {
			let data = {};
			try {
				data = JSON.parse(xhr.responseText);
			} catch {
				/* handled below */
			}
			if (xhr.status >= 200 && xhr.status < 300 && data.secure_url) {
				resolve({
					publicId: data.public_id,
					url: data.secure_url,
					width: data.width,
					height: data.height,
					bytes: data.bytes,
					format: data.format,
				});
			} else {
				reject(new Error(data.error?.message || `Cloudinary respondió ${xhr.status}`));
			}
		};

		xhr.onerror = () => reject(new Error("Error de red. Revisá tu conexión."));
		xhr.onabort = () => reject(new Error("Subida cancelada."));
		signal?.addEventListener("abort", () => xhr.abort());

		xhr.send(fd);
	});
}
