import { Button } from "react-bootstrap";
import { Icon } from "@iconify/react";
import styles from "../ComprarPage.module.css";

export default function WhatsappButton({ sendWhatsappOrder, sending }) {
    return (
        <Button
            className={styles.whatsappBtn}
            onClick={sendWhatsappOrder}
            disabled={sending}
        >
            {sending ? (
                <>
                    <span className="spinner-border spinner-border-sm me-2" />
                    Enviando...
                </>
            ) : (
                <>
                    <Icon icon="logos:whatsapp-icon" width={22} className="me-2" />
                    Enviar pedido por WhatsApp
                </>
            )}
        </Button>
    );
}
