/**
 * Shared Auth Header Helper
 * --------------------------------------------------
 * Reads the JWT stored by loginService.ts (key: "access_token")
 * and returns the Authorization header object to spread/pass
 * into any axios request config.
 *
 * Usage:
 *   import { authHeaders } from "../../../ts/utils/authHeaders";
 *
 *   axios.get(url, { headers: authHeaders() });
 *   axios.post(url, body, { headers: authHeaders() });
 */

const ACCESS_TOKEN_KEY = "access_token";

export function authHeaders(): Record<string, string> {
    const token = localStorage.getItem(ACCESS_TOKEN_KEY);
    return token ? { Authorization: `Bearer ${token}` } : {};
}