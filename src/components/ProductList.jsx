"use client";

import React, { useState, useMemo } from "react";
import dynamic from "next/dynamic";
import ProductCard from "./ProductCard";
import styles from "./ProductList.module.css";

// Cargar modal de forma diferida → más rápido el primer render
const ImageModal = dynamic(() => import("./ImageModal"), {
    ssr: false,
    loading: () => null,
});

function ProductList({ products, addToCart }) {
    const [selectedProduct, setSelectedProduct] = useState(null);

    // Memorizar lista para evitar renders innecesarios
    const memoProducts = useMemo(() => products || [], [products]);

    return (
        <>
            <div className={styles.grid}>
                {memoProducts.map((product) => (
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

// Evita renders repetidos si las props no cambian
export default React.memo(ProductList);
