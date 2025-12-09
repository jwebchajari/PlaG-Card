"use client";

import React, { useState, useMemo } from "react";
import dynamic from "next/dynamic";
import ProductCard from "./ProductCard";
import styles from "./ProductList.module.css";

// Modal diferido
const ImageModal = dynamic(() => import("./ImageModal"), {
    ssr: false,
    loading: () => null,
});

export default function ProductList({ products, addToCart, extras }) {
    const [selectedProduct, setSelectedProduct] = useState(null);

    const memoProducts = useMemo(() => products || [], [products]);

    return (
        <>
            <div className={styles.grid}>
                {memoProducts.map((product) => (
                    <ProductCard
                        key={product.id}
                        product={product}
                        category={product.category}
                        addToCart={addToCart}
                        onImageClick={setSelectedProduct}
                        extraCarne={extras?.carne || 0}
                        extraPanEspecial={extras?.panEspecial || 0}
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
