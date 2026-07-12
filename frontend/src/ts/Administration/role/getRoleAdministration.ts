import axios from "axios";

const BASE = globalThis.location.origin;

/**
 * Fetch a single role assignment (for edit)
 */
export async function fetchAssignmentById(assignmentId: number) {
  try {
    const res = await axios.get(`${BASE}/api/get_assignment/${assignmentId}`);

    if (!res.data?.success) {
      console.error( res.data);
      return null;
    }

    return res.data.data; 
  } catch (err) {
    console.error( err);
    return null;
  }
}
