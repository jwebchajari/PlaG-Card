"use client";

import styles from "./ImageModal.module.css";

export default function ImageModal({ selectedProduct, onClose }) {
    if (!selectedProduct) return null;

    return (
        <div className={styles.overlay} onClick={onClose}>
            <div
                className={styles.modal}
                onClick={(e) => e.stopPropagation()}
            >
                <button className={styles.closeBtn} onClick={onClose}>
                    ✕
                </button>

                <img
                    src={selectedProduct.image}
                    alt={selectedProduct.name}
                    className={styles.modalImg}
                />

                <h3 className={styles.title}>{selectedProduct.name}</h3>
                <p className={styles.desc}>{selectedProduct.description}</p>
            </div>
        </div>
    );
}
