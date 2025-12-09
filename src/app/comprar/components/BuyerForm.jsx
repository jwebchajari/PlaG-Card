"use client";
import { Form, Button } from "react-bootstrap";
import styles from "../ComprarPage.module.css";

export default function BuyerForm({
    nombre,
    setNombre,
    metodo,
    setMetodo,
    direccion,
    setDireccion,
    obsEntrega,
    setObsEntrega,
    metodoPago,
    setMetodoPago,
    localAlias
}) {
    return (
        <div className={styles.buyerFormBox}>

            <h5 className={styles.buyerFormTitle}> Tus datos</h5>

            <Form.Label className="mt-2 fw-bold">Tu nombre</Form.Label>
            <Form.Control
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
            />

            <Form.Label className="mt-3 fw-bold">Método de entrega</Form.Label>
            <div className={styles.radioRow}>
                <Form.Check
                    type="radio"
                    label="Retiro en el local"
                    checked={metodo === "retiro"}
                    onChange={() => setMetodo("retiro")}
                />
                <Form.Check
                    type="radio"
                    label="Envío a domicilio"
                    checked={metodo === "envio"}
                    onChange={() => setMetodo("envio")}
                />
            </div>

            {metodo === "envio" && (
                <>
                    <Form.Label className="mt-3 fw-bold">Dirección</Form.Label>
                    <Form.Control
                        value={direccion}
                        onChange={(e) => setDireccion(e.target.value)}
                    />

                    <Form.Label className="mt-3 fw-bold">Observaciones</Form.Label>
                    <Form.Control
                        value={obsEntrega}
                        onChange={(e) => setObsEntrega(e.target.value)}
                    />
                </>
            )}

            <Form.Label className="mt-3 fw-bold">Método de pago</Form.Label>
            <div className={styles.radioRow}>
                <Form.Check
                    type="radio"
                    label="Efectivo"
                    checked={metodoPago === "efectivo"}
                    onChange={() => setMetodoPago("efectivo")}
                />
                <Form.Check
                    type="radio"
                    label="Transferencia"
                    checked={metodoPago === "transferencia"}
                    onChange={() => setMetodoPago("transferencia")}
                />
            </div>

            {metodoPago === "transferencia" && localAlias && (
                <div className={styles.aliasBox}>
                    <p className={styles.aliasLabel}>Alias para transferir</p>

                    <div className={styles.aliasRow}>
                        <span className={styles.aliasText}>{localAlias}</span>

                        <Button
                            size="sm"
                            className={styles.copyBtn}
                            onClick={async () => {
                                await navigator.clipboard.writeText(localAlias);
                            }}
                        >
                            Copiar
                        </Button>
                    </div>

                    <small className="text-muted">
                        Enviá el pedido por WhatsApp y luego mandá el comprobante.
                    </small>
                </div>
            )}
        </div>
    );
}
