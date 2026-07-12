import axios from "axios";


const BASE = globalThis.location.origin;

/**
 * Fetch all role & permission assignments for a user
 */
export async function fetchRoleAdministration(userId: number | string) {
  try {
    const res = await axios.get(`${BASE}/api/fetch_user_assignments/${userId}`);

    const result = res.data;

    // console.log("Fetched role data:", result);

    if (!result.success || !Array.isArray(result.data)) {
      return [];
    }

    // Convert backend structure → frontend table structure
    return result.data.map((item: any) => ({
      id: item.assignment_id,
      Role: item.role,
      Permission: capitalize(item.permission),
    }));
  } catch (err) {
    console.error(err);
    return [];
  }
}


/** Helper: capitalize permission */
function capitalize(s: string) {
  if (!s) return s;
  return s.charAt(0).toUpperCase() + s.slice(1).toLowerCase();
}
