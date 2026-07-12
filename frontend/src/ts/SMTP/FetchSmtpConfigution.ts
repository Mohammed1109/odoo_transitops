// src/ts/Configuration/SMTP/FetchSmtpConfiguration.ts
import axios from "axios";

export interface SMTPConfigRow {
  id: number;
  provider: string;
  from_email: string;
  smtp_server: string | null;
  smtp_port: string | null;
  smtp_username: string | null;
  created_at: string;
}

export async function fetchSmtpConfigurations(): Promise<SMTPConfigRow[]> {
  try {
    const { data } = await axios.get(
      `${globalThis.location.origin}/api/get_email_configurations`
    );

    // backend must return array
    if (!Array.isArray(data)) return [];

    return data;
  } catch (err) {
    console.error( err);
    return [];
  }
}
