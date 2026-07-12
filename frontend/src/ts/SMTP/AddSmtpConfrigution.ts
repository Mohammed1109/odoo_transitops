// src/ts/Configuration/SMTP/AddSmtpConfiguration.ts
import axios from "axios";
const Swal = (await import("sweetalert2")).default;
import { toast } from "sonner";


/** Response shape for checking config */
export interface EmailConfig {
    id: number;
    provider: string;
    from_email: string;
}

/**
 * =====================================================
 * 1. CHECK EMAIL CONFIGURATION (Show Popup if Missing)
 * =====================================================
 * RETURNS:
 *   true  → allow opening React modal
 *   false → do nothing (or redirected)
 */
export type EmailCheckResult = "no-config" | "has-config" | "cancel";

export async function checkEmailConfiguration(): Promise<EmailCheckResult> {
    try {
        const { data } = await axios.get(
            `${globalThis.location.origin}/api/check_email_configuration`
        );

        // No existing configs → show popup
        if (!data || data.length === 0) {
            return "no-config";
        }

        return "has-config";

    } catch (error) {
        if (axios.isAxiosError(error)) {
            console.error("Status:", error.response?.status);
            console.error("Data:", error.response?.data);
        } else {
            console.error(error);
        }

        Swal.fire(
            "Error",
            "Failed to check email configuration.",
            "error"
        );

        return "cancel";
    }
}



/**
 * =====================================================
 * 2. SUBMIT SMTP CONFIGURATION
 * =====================================================
 */
export interface SMTPPayload {
    provider: string;
    from_email: string;

    smtp_server?: string;
    smtp_port?: string;
    smtp_username?: string;
    smtp_password?: string | null;

    sendgrid_api_key?: string;
}

export async function saveSMTPConfiguration(payload: SMTPPayload) {
    try {
        const { data } = await axios.post(
            `${globalThis.location.origin}/api/add_email_configuration`,
            payload
        );

        if (data.success) {
            toast.success(data.message || "Success!", {
                duration: 1500,   // closes after 1.5s
            });

            return { success: true };
        } else {
            toast.error(data.message || "Error occurred.", {
                duration: 1500,
            });

            return { success: false };
        }


    } catch (err: unknown) {
        let msg = "Failed to save SMTP configuration.";

        if (axios.isAxiosError(err)) {
            msg = err.response?.data?.message || msg;
        }

        setTimeout(() => {
            toast.error(msg || "Error occurred.");
        }, 1500);
        return { success: false };
    }
}
