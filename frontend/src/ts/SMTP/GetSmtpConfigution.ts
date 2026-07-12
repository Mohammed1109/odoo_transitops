import axios from "axios";

export interface SmtpConfig {
  id: number;
  provider: "SMTP" | "INTERNAL_SMTP" | "SENDGRID";
  from_email: string;
  smtp_server?: string;
  smtp_port?: string;
  smtp_username?: string;
  sendgrid_api_key?: string;
  created_at?: string;
}

/** ======================================================
 *  FETCH SINGLE SMTP CONFIGURATION FOR EDIT
 * ====================================================== */
export async function getSingleSmtpConfiguration(id: number) {
  try {
    const { data } = await axios.get(
      `${globalThis.location.origin}/api/get_email_configuration/${id}`
    );

    if (!data.success) {
      return { success: false, message: data.message };
    }

    return { success: true, config: data.data as SmtpConfig };

  } catch (error: any) {
    return {
      success: false,
      message: error.response?.data?.message || "Failed to fetch SMTP details",
    };
  }
}
