// src/ts/utils/admin/checkLocalAdminGate.ts
import axios from "axios";

export interface LocalAdminGateResult {
  hasAdmin: boolean;
  admins: any[];
}

/**
 * Checks whether at least one local admin exists.
 * PURE LOGIC ONLY — no UI, no Swal, no redirects.
 */
export async function checkLocalAdminGate(): Promise<LocalAdminGateResult> {
  const base = globalThis.location.origin;

  try {
    const res = await axios.get(`${base}/api/check_first_local_admin`);

    const admins = Array.isArray(res.data) ? res.data : [];

    return {
      hasAdmin: admins.length > 0,
      admins,
    };
  } catch (error) {
    console.error("checkLocalAdminGate failed:", error);

    // Fail-safe: treat as no admin
    return {
      hasAdmin: false,
      admins: [],
    };
  }
}
