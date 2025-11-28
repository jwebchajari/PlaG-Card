"use client";

import Image from "next/image";
import Link from "next/link";
import { Icon } from "@iconify/react";
import styles from "./TopNavbar.module.css";

export default function TopNavbar({ totalItems }) {
    return (
        <header className={styles.header}>
            <div className={styles.left}>
                <Image
                    src="/logo.png"
                    alt="Pintó la Gula"
                    width={80}
                    height={80}
                    className={styles.logo}
                    priority
                />
                <h3 className={styles.title}>Pintó la gula</h3>
            </div>

            {/* 🔥 SIEMPRE NAVEGA A /comprar */}
            <Link href="/comprar" className={styles.cartBtn}>
                <Icon icon="lucide:shopping-cart" width={24} />
                {totalItems > 0 && <span className={styles.badge}>{totalItems}</span>}
            </Link>
        </header>
    );
}
