import axios from "axios";

export async function checkPasswordUpdated(): Promise<boolean> {
  const base = globalThis.location.origin;

  try {
    const res = await axios.get(`${base}/api/check_password_updated`);
    return res.data?.updated === true;
  } catch {
    return false; // fail-safe
  }
}
