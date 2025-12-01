"use client";

import Link from "next/link";
import styles from "./DashboardProductCard.module.css";
import { Icon } from "@iconify/react";

export default function DashboardProductCard({ item, id, onDelete }) {
    const enOferta = item.oferta && item.valorOferta;

    const precioOriginal = Number(item.valor) || 0;
    const precioOferta = Number(item.valorOferta) || precioOriginal;

    const descuento =
        enOferta && precioOriginal > precioOferta
            ? Math.round(((precioOriginal - precioOferta) / precioOriginal) * 100)
            : 0;

    return (
        <div className={styles.card}>
            {enOferta && (
                <div className={styles.offerBadge}>-{descuento}%</div>
            )}

            <img
                src={item.imagen || "/logo.png"}
                alt={item.nombre}
                className={styles.img}
            />

            <div className={styles.info}>
                <h3 className={styles.title}>{item.nombre}</h3>
                <p className={styles.desc}>{item.descripcion}</p>

                <div className={styles.priceBox}>
                    {enOferta ? (
                        <>
                            <span className={styles.oldPrice}>${precioOriginal}</span>
                            <span className={styles.offerPrice}>${precioOferta}</span>
                        </>
                    ) : (
                        <span className={styles.price}>${precioOriginal}</span>
                    )}
                </div>

                {/* Botones de acción */}
                <div className={styles.actions}>
                    <Link href={`/dashboard/editar/${id}`} className={styles.editBtn}>
                        <Icon icon="lucide:edit" width={18} /> Editar
                    </Link>

                    <button className={styles.deleteBtn} onClick={() => onDelete(id)}>
                        <Icon icon="lucide:trash" width={18} /> Borrar
                    </button>
                </div>
            </div>
        </div>
    );
}
