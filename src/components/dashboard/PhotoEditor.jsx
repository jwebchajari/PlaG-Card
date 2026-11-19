"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { RotateCw, ZoomIn, ZoomOut, Undo2, Sun, Contrast, Droplet, Move, Shrink, Expand } from "lucide-react";
import Sheet from "@/components/ui/Sheet";
import { cldUrl } from "@/lib/cloudinary-url";
import PublishPreview from "./PublishPreview";
import styles from "./editor.module.css";

// Saved photo: 4:3. Works for the square menu thumb, the 16:10 detail and the share card.
const OUT_W = 1600;
const OUT_H = 1200;

const DEFAULTS = { zoom: 1, x: 0, y: 0, rotation: 0, brightness: 100, contrast: 100, saturation: 100, bg: "blur" };
const MAX_ZOOM = 3;
// Always keep at least this much of the photo inside the frame while dragging.
const KEEP_VISIBLE = 120;

const BACKGROUNDS = [
	{ id: "blur", label: "Foto difuminada" },
	{ id: "white", label: "Blanco" },
	{ id: "navy", label: "Azul" },
];

function loadImage({ file, src }) {
	return new Promise((resolve, reject) => {
		const img = new Image();
		let objectUrl = null;
		if (file) {
			objectUrl = URL.createObjectURL(file);
			img.src = objectUrl;
		} else {
			img.crossOrigin = "anonymous";
			img.src = cldUrl(src, "f_jpg,q_auto,c_limit,w_2400");
		}
		img.onload = () => resolve({ img, objectUrl });
		img.onerror = () => {
			if (objectUrl) URL.revokeObjectURL(objectUrl);
			reject(new Error(file ? "No se pudo leer la imagen. Probá con JPG o PNG." : "Esta foto no se puede editar desde acá. Subila de nuevo desde tu celular o compu."));
		};
	});
}

function dims(img, rotation) {
	const turned = rotation % 180 !== 0;
	return { iw: turned ? img.height : img.width, ih: turned ? img.width : img.height };
}

/** zoom = 1 fills the frame (cover). Below 1 the photo shrinks inside it. */
function coverSize(img, s) {
	const { iw, ih } = dims(img, s.rotation);
	const k = Math.max(OUT_W / iw, OUT_H / ih) * s.zoom;
	return { w: iw * k, h: ih * k, k };
}

/** Zoom at which the whole photo is visible (contain). */
export function fitZoom(img, rotation) {
	const { iw, ih } = dims(img, rotation);
	return Math.min(OUT_W / iw, OUT_H / ih) / Math.max(OUT_W / iw, OUT_H / ih);
}

function minZoom(img, rotation) {
	return Math.max(0.15, fitZoom(img, rotation) * 0.6);
}

/** Free movement: the photo can go anywhere as long as part of it stays in the frame. */
function clampState(img, s) {
	const zoom = Math.min(MAX_ZOOM, Math.max(minZoom(img, s.rotation), s.zoom));
	const { w, h } = coverSize(img, { ...s, zoom });
	const mx = Math.max((w - OUT_W) / 2, (OUT_W + w) / 2 - KEEP_VISIBLE);
	const my = Math.max((h - OUT_H) / 2, (OUT_H + h) / 2 - KEEP_VISIBLE);
	return { ...s, zoom, x: Math.min(mx, Math.max(-mx, s.x)), y: Math.min(my, Math.max(-my, s.y)) };
}

function paintBackground(ctx, img, s) {
	if (s.bg === "navy" || s.bg === "white") {
		ctx.fillStyle = s.bg === "navy" ? "#0b0e29" : "#ffffff";
		ctx.fillRect(0, 0, OUT_W, OUT_H);
		return;
	}
	// Blurred copy of the same photo filling the frame.
	const { iw, ih } = dims(img, s.rotation);
	const k = Math.max(OUT_W / iw, OUT_H / ih) * 1.15;
	ctx.fillStyle = "#ffffff";
	ctx.fillRect(0, 0, OUT_W, OUT_H);
	ctx.save();
	ctx.filter = `blur(40px) brightness(${Math.round(s.brightness * 0.85)}%) saturate(${s.saturation}%)`;
	ctx.translate(OUT_W / 2, OUT_H / 2);
	ctx.rotate((s.rotation * Math.PI) / 180);
	ctx.scale(k, k);
	ctx.drawImage(img, -img.width / 2, -img.height / 2);
	ctx.restore();
}

function draw(ctx, img, s) {
	const { k } = coverSize(img, s);
	paintBackground(ctx, img, s);
	ctx.save();
	ctx.filter = `brightness(${s.brightness}%) contrast(${s.contrast}%) saturate(${s.saturation}%)`;
	ctx.translate(OUT_W / 2 + s.x, OUT_H / 2 + s.y);
	ctx.rotate((s.rotation * Math.PI) / 180);
	ctx.scale(k, k);
	ctx.drawImage(img, -img.width / 2, -img.height / 2);
	ctx.restore();
}

export default function PhotoEditor({ source, product, onCancel, onDone }) {
	const canvasRef = useRef(null);
	const imgRef = useRef(null);
	const drag = useRef(null);
	const previewTimer = useRef(null);
	const [s, setS] = useState(DEFAULTS);
	const [ready, setReady] = useState(false);
	const [error, setError] = useState("");
	const [previewUrl, setPreviewUrl] = useState("");
	const [busy, setBusy] = useState(false);

	// Load the source once.
	useEffect(() => {
		let alive = true;
		let objectUrl = null;
		setReady(false);
		setError("");
		loadImage(source)
			.then((r) => {
				objectUrl = r.objectUrl;
				if (!alive) return;
				imgRef.current = r.img;
				setS(DEFAULTS);
				setReady(true);
			})
			.catch((e) => alive && setError(e.message));
		return () => {
			alive = false;
			if (objectUrl) URL.revokeObjectURL(objectUrl);
		};
	}, [source]);

	// Draw on every change; refresh the published-look preview shortly after.
	useEffect(() => {
		const canvas = canvasRef.current;
		const img = imgRef.current;
		if (!ready || !canvas || !img) return;
		draw(canvas.getContext("2d"), img, s);

		clearTimeout(previewTimer.current);
		previewTimer.current = setTimeout(() => {
			try {
				canvas.toBlob(
					(blob) => {
						if (!blob) return;
						setPreviewUrl((old) => {
							if (old) URL.revokeObjectURL(old);
							return URL.createObjectURL(blob);
						});
					},
					"image/jpeg",
					0.8
				);
			} catch {
				setError("Esta foto no se puede editar desde acá. Subila de nuevo desde tu celular o compu.");
			}
		}, 150);
	}, [s, ready]);

	useEffect(
		() => () => {
			clearTimeout(previewTimer.current);
			setPreviewUrl((old) => {
				if (old) URL.revokeObjectURL(old);
				return "";
			});
		},
		[]
	);

	const update = useCallback((patch) => {
		setS((prev) => {
			const next = { ...prev, ...(typeof patch === "function" ? patch(prev) : patch) };
			return imgRef.current ? clampState(imgRef.current, next) : next;
		});
	}, []);

	function onPointerDown(e) {
		if (!ready) return;
		e.currentTarget.setPointerCapture(e.pointerId);
		drag.current = { px: e.clientX, py: e.clientY, x: s.x, y: s.y };
	}

	function onPointerMove(e) {
		if (!drag.current) return;
		const ratio = OUT_W / e.currentTarget.clientWidth;
		update({ x: drag.current.x + (e.clientX - drag.current.px) * ratio, y: drag.current.y + (e.clientY - drag.current.py) * ratio });
	}

	function onPointerUp() {
		drag.current = null;
	}

	function onKeyDown(e) {
		const step = e.shiftKey ? 80 : 20;
		const moves = { ArrowLeft: [step, 0], ArrowRight: [-step, 0], ArrowUp: [0, step], ArrowDown: [0, -step] };
		const m = moves[e.key];
		if (!m) return;
		e.preventDefault();
		update((p) => ({ x: p.x + m[0], y: p.y + m[1] }));
	}

	function finish() {
		const canvas = canvasRef.current;
		if (!canvas) return;
		setBusy(true);
		try {
			canvas.toBlob(
				(blob) => {
					setBusy(false);
					if (!blob) {
						setError("No se pudo preparar la foto. Probá de nuevo.");
						return;
					}
					onDone(new File([blob], "foto.jpg", { type: "image/jpeg" }));
				},
				"image/jpeg",
				0.86
			);
		} catch {
			setBusy(false);
			setError("Esta foto no se puede editar desde acá. Subila de nuevo desde tu celular o compu.");
		}
	}

	const sliders = [
		{ key: "brightness", label: "Brillo", Icon: Sun },
		{ key: "contrast", label: "Contraste", Icon: Contrast },
		{ key: "saturation", label: "Color", Icon: Droplet },
	];

	return (
		<Sheet
			open
			onClose={onCancel}
			title="Editar foto"
			titleId="photo-editor-title"
			footer={
				<div className={styles.footer}>
					<button type="button" className={styles.secondary} onClick={onCancel}>
						Cancelar
					</button>
					<button type="button" className={styles.primary} onClick={finish} disabled={!ready || busy || Boolean(error)}>
						{busy ? "Preparando..." : "Usar esta foto"}
					</button>
				</div>
			}
		>
			{error ? (
				<p className={styles.error} role="alert">
					{error}
				</p>
			) : (
				<>
					<div className={styles.frameWrap}>
						<canvas
							ref={canvasRef}
							width={OUT_W}
							height={OUT_H}
							className={styles.canvas}
							tabIndex={0}
							aria-label="Foto. Arrastrá para encuadrar o usá las flechas del teclado."
							onPointerDown={onPointerDown}
							onPointerMove={onPointerMove}
							onPointerUp={onPointerUp}
							onPointerCancel={onPointerUp}
							onKeyDown={onKeyDown}
							onWheel={(e) => update((p) => ({ zoom: p.zoom - e.deltaY * 0.0015 }))}
						/>
						{/* Square guide: the part shown in the menu list */}
						<span className={styles.squareGuide} aria-hidden="true" />
						{!ready && <span className={styles.loading}>Cargando foto...</span>}
					</div>
					<p className={styles.hint}>
						<Move size={14} aria-hidden="true" /> Arrastrá la foto para moverla. El recuadro marca lo que se ve en la lista del menú.
					</p>

					<div className={styles.controls}>
						<div className={styles.toolRow}>
							<button
								type="button"
								className={styles.tool}
								aria-pressed={ready ? Math.abs(s.zoom - fitZoom(imgRef.current, s.rotation)) < 0.01 : false}
								onClick={() => update((p) => ({ zoom: fitZoom(imgRef.current, p.rotation), x: 0, y: 0 }))}
							>
								<Shrink size={18} aria-hidden="true" />
								Foto completa
							</button>
							<button type="button" className={styles.tool} aria-pressed={Math.abs(s.zoom - 1) < 0.01} onClick={() => update({ zoom: 1, x: 0, y: 0 })}>
								<Expand size={18} aria-hidden="true" />
								Llenar el cuadro
							</button>
						</div>

						<div className={styles.zoomRow}>
							<button type="button" className={styles.iconBtn} onClick={() => update((p) => ({ zoom: p.zoom - 0.1 }))} aria-label="Alejar">
								<ZoomOut size={20} aria-hidden="true" />
							</button>
							<input
								type="range"
								min={ready ? minZoom(imgRef.current, s.rotation) : 0.15}
								max={MAX_ZOOM}
								step="0.01"
								value={s.zoom}
								onChange={(e) => update({ zoom: Number(e.target.value) })}
								className={styles.range}
								aria-label="Zoom"
							/>
							<button type="button" className={styles.iconBtn} onClick={() => update((p) => ({ zoom: p.zoom + 0.1 }))} aria-label="Acercar">
								<ZoomIn size={20} aria-hidden="true" />
							</button>
						</div>

						<fieldset className={styles.bgField}>
							<legend className={styles.sliderLabel}>Fondo de los espacios vacíos</legend>
							<div className={styles.bgOptions}>
								{BACKGROUNDS.map((b) => (
									<label key={b.id} className={styles.bgOption}>
										<input type="radio" name="bg" checked={s.bg === b.id} onChange={() => update({ bg: b.id })} />
										<span className={`${styles.swatch} ${styles[`swatch_${b.id}`]}`} aria-hidden="true" />
										{b.label}
									</label>
								))}
							</div>
						</fieldset>

						<div className={styles.toolRow}>
							<button type="button" className={styles.tool} onClick={() => update((p) => ({ rotation: (p.rotation + 90) % 360, x: 0, y: 0 }))}>
								<RotateCw size={18} aria-hidden="true" />
								Rotar
							</button>
							<button type="button" className={styles.tool} onClick={() => update(DEFAULTS)}>
								<Undo2 size={18} aria-hidden="true" />
								Restablecer
							</button>
						</div>

						{sliders.map(({ key, label, Icon }) => (
							<label key={key} className={styles.slider}>
								<span className={styles.sliderLabel}>
									<Icon size={16} aria-hidden="true" />
									{label}
								</span>
								<input
									type="range"
									min="50"
									max="150"
									step="1"
									value={s[key]}
									onChange={(e) => update({ [key]: Number(e.target.value) })}
									className={styles.range}
								/>
								<output className={styles.sliderValue}>{s[key] - 100 > 0 ? `+${s[key] - 100}` : s[key] - 100}</output>
							</label>
						))}
					</div>

					<h3 className={styles.previewTitle}>Así se va a ver</h3>
					<PublishPreview product={{ ...product, image: previewUrl }} compact />
				</>
			)}
		</Sheet>
	);
}
