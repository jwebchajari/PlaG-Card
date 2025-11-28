"use client";

import Image from "next/image";
import { Icon } from "@iconify/react";
import styles from "./TopNavbar.module.css";

export default function TopNavbar({ totalItems, openCart }) {
    return (
        <header className={styles.header}>
            <div className={styles.left}>
                <Image
                    src="/logo.jpg"
                    alt="Pintó la Gula"
                    width={44}
                    height={44}
                    className={styles.logo}
                    priority
                />
                <h1 className={styles.brand}>Pintó la gula</h1>
            </div>

            <button className={styles.cartBtn} onClick={openCart}>
                <Icon icon="lucide:shopping-cart" width={22} />
                {totalItems > 0 && <span className={styles.badge}>{totalItems}</span>}
            </button>
        </header>
    );
}
