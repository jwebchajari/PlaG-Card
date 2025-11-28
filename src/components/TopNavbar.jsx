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
                    width={36}
                    height={36}
                    className={styles.logo}
                    priority
                />
                <h3>Pintó la gula</h3>
            </div>

            <button className={styles.cartBtn} onClick={openCart}>
                <Icon icon="lucide:shopping-cart" width={24} />
                {totalItems > 0 && <span className={styles.badge}>{totalItems}</span>}
            </button>
        </header>
    );
}
