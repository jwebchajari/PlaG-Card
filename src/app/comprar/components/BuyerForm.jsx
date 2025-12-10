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
    localAlias,
    errors // ⬅ Recibimos errores del padre
}) {
    return (
        <div className={styles.buyerFormBox}>

            <h5 className={styles.buyerFormTitle}>Tus datos</h5>

            {/* ============= NOMBRE ============= */}
            {errors?.nombre && (
                <div className="text-danger mb-1 fw-semibold">{errors.nombre}</div>
            )}
            <Form.Label className="mt-2 fw-bold">Tu nombre</Form.Label>
            <Form.Control
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
                isInvalid={!!errors?.nombre}
            />

            {/* ============= MÉTODO DE ENTREGA ============= */}
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

            {/* ============= DIRECCIÓN (solo si envío) ============= */}
            {metodo === "envio" && (
                <>
                    {errors?.direccion && (
                        <div className="text-danger mb-1 fw-semibold">{errors.direccion}</div>
                    )}

                    <Form.Label className="mt-3 fw-bold">Dirección</Form.Label>
                    <Form.Control
                        value={direccion}
                        onChange={(e) => setDireccion(e.target.value)}
                        isInvalid={!!errors?.direccion}
                    />

                    <Form.Label className="mt-3 fw-bold">Observaciones</Form.Label>
                    <Form.Control
                        value={obsEntrega}
                        onChange={(e) => setObsEntrega(e.target.value)}
                    />
                </>
            )}

            {/* ============= MÉTODO DE PAGO ============= */}
            {errors?.metodoPago && (
                <div className="text-danger mb-1 fw-semibold">{errors.metodoPago}</div>
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

            {/* ============= ALIAS SI ES TRANSFERENCIA ============= */}
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
