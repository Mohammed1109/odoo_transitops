// src/ts/Configuration/SMTP/EditSmtpConfrigution.ts
import axios from "axios";
import { toast } from "sonner";

export interface SMTPPayload {
    provider: string;
    from_email: string;

    smtp_server?: string;
    smtp_port?: string;
    smtp_username?: string;
    smtp_password?: string | null;

    sendgrid_api_key?: string;
}

export async function updateSMTPConfiguration(id: number, payload: SMTPPayload) {
    try {
        const { data } = await axios.put(
            `${globalThis.location.origin}/api/update_email_configuration/${id}`,
            payload
        );
        if (data.success) {
            toast.success(data.message || "Updated!");
            return { success: true };
        } else {
            toast.error(data.message || "Error updating configuration.");
            return { success: false };
        }

    } catch (err: any) {
        const msg =
            err.response?.data?.message ||
            "Failed to update SMTP configuration.";

        toast.error(msg || "Error updating configuration.");
        return { success: false };
    }
}
