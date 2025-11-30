"use client";

import { useState } from "react";
import ProductCard from "./ProductCard";
import ImageModal from "./ImageModal";
import styles from "./ProductList.module.css";

export default function ProductList({ products, addToCart }) {
    const [selectedProduct, setSelectedProduct] = useState(null);

    return (
        <>
            <div className={styles.grid}>
                {products.map(product => (
                    <ProductCard
                        key={product.id}
                        product={product}
                        addToCart={addToCart}
                        onImageClick={setSelectedProduct}
                    />
                ))}
            </div>

            <ImageModal
                selectedProduct={selectedProduct}
                onClose={() => setSelectedProduct(null)}
            />
        </>
    );
}
