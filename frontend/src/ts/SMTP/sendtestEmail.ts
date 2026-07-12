// src/ts/SMTP/testSmtpEmail.ts
import axios from "axios";

/* =======================
   Request Payload
======================= */
export interface TestSmtpEmailPayload {
  config_id: number;
  to_email: string;
}

/* =======================
   Response Type
======================= */
export interface TestSmtpEmailResponse {
  success: boolean;
  message: string;
}

/* =======================
   API Function
======================= */
export async function testSmtpEmail(
  payload: TestSmtpEmailPayload
): Promise<TestSmtpEmailResponse> {
  const base = globalThis.location.origin;

  try {
    const res = await axios.post<TestSmtpEmailResponse>(
      `${base}/api/send_email`,
      payload,
      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    return res.data;
  } catch (err: any) {
    console.error( err);

    return {
      success: false,
      message:
        err?.response?.data?.message ||
        "Failed to send test email",
    };
  }
}
