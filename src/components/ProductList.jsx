"use client";

import { useState } from "react";
import ProductCard from "./ProductCard";
import ImageModal from "./ImageModal";
import styles from "./ProductList.module.css";

export default function ProductList({ addToCart }) {
    const [selectedProduct, setSelectedProduct] = useState(null);
    const dummyProducts = [
        {
            id: 1,
            name: "Hamburguesa Clásica",
            description: "Carne jugosa, lechuga, tomate, cebolla y queso cheddar.",
            price: 9.99,
            image: "https://images.unsplash.com/photo-1550547660-d9450f859349?fit=crop&w=400&q=80",
        },
        {
            id: 2,
            name: "Doble Queso",
            description: "Doble carne, doble cheddar, cebolla caramelizada y BBQ.",
            price: 11.99,
            image: "https://www.recetasnestle.com.ec/sites/default/files/styles/recipe_detail_desktop_new/public/srh_recipes/681c719667d572276a1507aea71de9ca.jpg?itok=BXa7wk3U",
        },
        {
            id: 3,
            name: "Veggie Deluxe",
            description: "Hamburguesa vegetal con palta, lechuga y tomate.",
            price: 10.49,
            image: "https://www.recetasnestle.com.ec/sites/default/files/styles/recipe_detail_desktop_new/public/srh_recipes/681c719667d572276a1507aea71de9ca.jpg?itok=BXa7wk3U",
        },
        {
            id: 4,
            name: "Picante Mex",
            description: "Carne con jalapeños, cheddar, nachos y salsa picante.",
            price: 12.49,
            image: "https://upload.wikimedia.org/wikipedia/commons/6/62/NCI_Visuals_Food_Hamburger.jpg",
        },
        {
            id: 5,
            name: "Crispy Pollo",
            description: "Pollo crujiente, mayonesa de ajo, tomate y lechuga.",
            price: 10.99,
            image: "https://queondaus.com/wp-content/uploads/2024/04/Hamburguesas-Smash-con-MSG.webp",
        },
        {
            id: 6,
            name: "Cheddar Lover",
            description: "Triple cheddar, carne, panceta crocante y cebolla.",
            price: 13.49,
            image: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?fit=crop&w=400&q=80",
        },
    ];

    return (
        <>
            <div className={styles.grid}>
                {dummyProducts.map(product => (
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
