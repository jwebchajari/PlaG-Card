"use client";

import { useEffect, useRef, useState } from "react";
import { ImagePlus, Link2, LoaderCircle, RefreshCw, X, SlidersHorizontal } from "lucide-react";
import { uploadImage, cloudinaryReady } from "@/lib/cloudinary-client";
import { cldUrl } from "@/lib/cloudinary-url";
import PhotoEditor from "./PhotoEditor";
import styles from "./dashboard.module.css";

/**
 * Foto del producto: elegir (tocar o arrastrar), editar y subir a Cloudinary, o pegar un link.
 * `value` es la URL guardada en Firebase. `product` alimenta la vista previa del editor.
 */
export default function ImageUploader({ local, value, onChange, productName, product, parseLink, error }) {
	const [editing, setEditing] = useState(null); // { file } | { src } | null
	const inputRef = useRef(null);
	const abortRef = useRef(null);
	const [progress, setProgress] = useState(null); // null | 0-100
	const [uploadError, setUploadError] = useState("");
	const [dragging, setDragging] = useState(false);
	const [showLink, setShowLink] = useState(!cloudinaryReady);
	const [broken, setBroken] = useState(false);

	useEffect(() => setBroken(false), [value]);
	useEffect(() => () => abortRef.current?.abort(), []);

	/** A picked or dropped file goes through the editor first. */
	function pickFile(file) {
		if (inputRef.current) inputRef.current.value = "";
		if (!file) return;
		if (!file.type?.startsWith("image/")) {
			setUploadError("El archivo tiene que ser una imagen (JPG, PNG o WebP).");
			return;
		}
		setUploadError("");
		setEditing({ file });
	}

	async function handleFile(file) {
		if (!file) return;
		setUploadError("");
		setProgress(0);
		const controller = new AbortController();
		abortRef.current = controller;
		try {
			const res = await uploadImage(file, { local, name: productName, onProgress: setProgress, signal: controller.signal });
			onChange(res.url);
		} catch (e) {
			setUploadError(e.message);
		} finally {
			setProgress(null);
			abortRef.current = null;
			if (inputRef.current) inputRef.current.value = "";
		}
	}

	const uploading = progress !== null;
	const preview = value && !broken ? cldUrl(value, "f_auto,q_auto,c_limit,w_640") : null;

	return (
		<div className={styles.field}>
			<span className={styles.fieldLabel} id="foto-label">
				Foto
			</span>

			<div
				className={`${styles.dropzone} ${dragging ? styles.dropzoneActive : ""}`}
				onDragOver={(e) => {
					e.preventDefault();
					setDragging(true);
				}}
				onDragLeave={() => setDragging(false)}
				onDrop={(e) => {
					e.preventDefault();
					setDragging(false);
					if (cloudinaryReady) pickFile(e.dataTransfer.files?.[0]);
				}}
			>
				{preview ? (
					// eslint-disable-next-line @next/next/no-img-element
					<img src={preview} alt="Foto del producto" className={styles.dropImg} referrerPolicy="no-referrer" onError={() => setBroken(true)} />
				) : (
					<div className={styles.dropEmpty}>
						<ImagePlus size={32} aria-hidden="true" />
						<p>{cloudinaryReady ? "Tocá para elegir una foto o arrastrala acá" : "Pegá el link de la foto abajo"}</p>
					</div>
				)}

				{uploading && (
					<div className={styles.dropOverlay} role="status">
						<LoaderCircle size={24} className={styles.spin} aria-hidden="true" />
						<span>Subiendo {progress}%</span>
						<span className={styles.progress}>
							<span style={{ width: `${progress}%` }} />
						</span>
						<button type="button" className={styles.overlayCancel} onClick={() => abortRef.current?.abort()}>
							Cancelar
						</button>
					</div>
				)}
			</div>

			<input
				ref={inputRef}
				type="file"
				accept="image/jpeg,image/png,image/webp,image/heic,image/heif"
				className="visually-hidden"
				aria-labelledby="foto-label"
				tabIndex={-1}
				onChange={(e) => pickFile(e.target.files?.[0])}
			/>

			<div className={styles.uploadActions}>
				{cloudinaryReady && (
					<button type="button" className={styles.ghostBtn} onClick={() => inputRef.current?.click()} disabled={uploading}>
						{value ? <RefreshCw size={18} aria-hidden="true" /> : <ImagePlus size={18} aria-hidden="true" />}
						{value ? "Cambiar foto" : "Subir foto"}
					</button>
				)}
				{cloudinaryReady && value && !broken && !uploading && (
					<button type="button" className={styles.ghostBtn} onClick={() => setEditing({ src: value })}>
						<SlidersHorizontal size={18} aria-hidden="true" />
						Editar
					</button>
				)}
				{value && !uploading && (
					<button type="button" className={styles.ghostBtn} onClick={() => onChange("")}>
						<X size={18} aria-hidden="true" />
						Quitar
					</button>
				)}
				{cloudinaryReady && !showLink && (
					<button type="button" className={styles.linkBtn} onClick={() => setShowLink(true)}>
						<Link2 size={16} aria-hidden="true" />
						Usar un link
					</button>
				)}
			</div>

			{showLink && (
				<div className={styles.field}>
					<label htmlFor="imagen">Link de la foto</label>
					<input
						id="imagen"
						name="imagen"
						className={styles.input}
						value={value}
						onChange={(e) => onChange(parseLink(e.target.value))}
						placeholder="https://..."
						aria-invalid={error ? "true" : undefined}
						aria-describedby={error ? "imagen-error" : undefined}
					/>
					<p className={styles.hint}>Los links de Google Drive se convierten solos. El archivo tiene que estar compartido como público.</p>
				</div>
			)}

			{editing && (
				<PhotoEditor
					source={editing}
					product={product}
					onCancel={() => setEditing(null)}
					onDone={(file) => {
						setEditing(null);
						handleFile(file);
					}}
				/>
			)}

			{(uploadError || error || (value && broken)) && (
				<p id="imagen-error" className={styles.fieldError} role="alert">
					{uploadError || error || "La foto no carga. Revisá el link o subila de nuevo."}
				</p>
			)}
		</div>
	);
}
