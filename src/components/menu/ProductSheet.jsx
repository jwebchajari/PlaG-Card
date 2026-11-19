"use client";

import { useState } from "react";
import Sheet from "@/components/ui/Sheet";
import Stepper from "@/components/ui/Stepper";
import ShareButton from "@/components/ui/ShareButton";
import { BREADS, MAX_MEATS, SITE_NAME, formatPrice, isBurger, isCustomizable, linePrice, productUrl } from "@/lib/site";
import ProductImage from "./ProductImage";
import { discount } from "./ProductRow";
import styles from "./menu.module.css";

export default function ProductSheet({ product, extras, onClose, onAdd }) {
	if (!product) return <Sheet open={false} onClose={onClose} titleId="product-sheet-title" />;
	// `key` resets the options whenever another product opens.
	return <ProductSheetOpen key={product.id} product={product} extras={extras} onClose={onClose} onAdd={onAdd} />;
}

function ProductSheetOpen({ product, extras, onClose, onAdd }) {
	const [meatCount, setMeatCount] = useState(1);
	const [breadType, setBreadType] = useState("Berly");
	const [notes, setNotes] = useState("");
	const [quantity, setQuantity] = useState(1);

	const burger = isBurger(product);
	const custom = isCustomizable(product);
	const unit = linePrice({ basePrice: product.price, meatCount, breadType, category: product.category }, extras);
	const extraBread = Number(extras?.panEspecial) || 0;
	const extraMeat = Number(extras?.carne) || 0;
	const off = discount(product);

	function submit(e) {
		e.preventDefault();
		onAdd({
			productId: product.id,
			name: product.name,
			image: product.image,
			category: product.category,
			basePrice: product.price,
			meatCount: burger ? meatCount : 1,
			breadType: custom ? breadType : "Berly",
			notes: notes.trim(),
			quantity,
		});
	}

	return (
		<Sheet
			open
			onClose={onClose}
			title={product.name}
			titleId="product-sheet-title"
			media={<ProductImage src={product.image} alt={product.name} className={styles.sheetImg} eager width={800} height={500} />}
			footer={
				<div className={styles.addRow}>
					<Stepper value={quantity} onChange={setQuantity} min={1} max={20} label="Cantidad" size="s" />
					<button type="submit" form="product-form" className={styles.addBtn}>
						<span>Agregar</span>
						<span className={styles.addPrice}>{formatPrice(unit * quantity)}</span>
					</button>
				</div>
			}
		>
			{product.description && <p className={styles.sheetDesc}>{product.description}</p>}

			<div className={styles.sheetMeta}>
				<p className={styles.priceLine}>
					<span className={styles.priceLg}>{formatPrice(product.price)}</span>
					{off > 0 && (
						<>
							<s className={styles.oldPrice}>{formatPrice(product.originalPrice)}</s>
							<span className={styles.offBadge}>-{off}%</span>
						</>
					)}
				</p>
				<ShareButton
					className={styles.shareInline}
					label="Compartir"
					text={`${product.name} en ${SITE_NAME}:`}
					url={productUrl(product.id)}
				/>
			</div>

			<form id="product-form" className={styles.optionsForm} onSubmit={submit}>
				{burger && (
					<div className={styles.optionRow}>
						<div>
							<p className={styles.optionLabel}>Medallones</p>
							<p className={styles.optionHint}>
								{extraMeat > 0 ? `${formatPrice(extraMeat)} cada medallón extra` : `Hasta ${MAX_MEATS}`}
							</p>
						</div>
						<Stepper value={meatCount} onChange={setMeatCount} min={1} max={MAX_MEATS} label="Medallones" size="s" />
					</div>
				)}

				{custom && (
					<fieldset className={styles.fieldset}>
						<legend className={styles.optionLabel}>Pan</legend>
						<div className={styles.choiceGrid}>
							{BREADS.map((b) => (
								<label key={b.id} className={styles.choice}>
									<input
										type="radio"
										name="bread"
										value={b.id}
										checked={breadType === b.id}
										onChange={() => setBreadType(b.id)}
									/>
									<span className={styles.choiceText}>{b.label}</span>
									<span className={styles.choiceExtra}>
										{b.extra && extraBread > 0 ? `+${formatPrice(extraBread)}` : "Incluido"}
									</span>
								</label>
							))}
						</div>
					</fieldset>
				)}

				<div>
					<label className={styles.optionLabel} htmlFor="line-notes">
						Aclaraciones <span className={styles.optional}>(opcional)</span>
					</label>
					<input
						id="line-notes"
						className={styles.input}
						value={notes}
						onChange={(e) => setNotes(e.target.value)}
						placeholder="Sin cebolla, extra salsa..."
						maxLength={140}
						autoComplete="off"
					/>
				</div>
			</form>
		</Sheet>
	);
}
