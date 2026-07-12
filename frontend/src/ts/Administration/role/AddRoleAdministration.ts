import axios from "axios";
const Swal = (await import("sweetalert2")).default;
import { toast } from "sonner";


export interface RolePayload {
  user_id: number;
  role: string;
  permission: string;
}

export async function submitRoleForm(
  userId: number,
  form: {
    role: string;
    permission: string;
  },
  onSuccess: () => void
) {
  // -------------------------------
  // 1) VALIDATION
  //  -------------------------------
  const missingFields: string[] = [];

  if (!form.role) missingFields.push("Role");
  if (!form.permission) missingFields.push("Permission");

  if (missingFields.length > 0) {
    Swal.fire({
      toast: true,
      position: "center",
      icon: "warning",
      title: `Please select: ${missingFields.join(", ")}`,
      showConfirmButton: false,
      timer: 2500,
      timerProgressBar: true,
    });
    return false;
  }

  // -------------------------------
  // 2) BUILD PAYLOAD
  // ------------------------------- //
  const payload: RolePayload = {
    user_id: userId,
    role: form.role,
    permission: form.permission,
  };

  try {
    // -------------------------------
    // 3) API CALL
    // ------------------------------- //
    const response = await axios.post(
      `${globalThis.location.origin}/api/assign_role_permission`,
      payload,
      { withCredentials: true }
    );

    // -------------------------------
    // 4) SUCCESS
    // ------------------------------- //
    if (response.data.success) {
      toast.success(response.data.message || "Role assigned successfully.", {
        duration: 1600,
      });


      onSuccess(); // close modal + refresh
      return true;
    }

    // -------------------------------
    // 5) FREE LICENSE LIMIT
    // ------------------------------- //
    if (response.data.license_limit) {
      Swal.fire({
        icon: "info",
        title: "Feature Limited",
        html: `
          Free version only allows:<br>
          <b>Software Admin</b> or <b>Super Admin</b> role assignments.<br>
          Upgrade to Standard or Pro for more roles.
        `,
      });
      return false;
    }

    // -------------------------------
    // 6) GENERIC FAILURE
    // ------------------------------- //
    toast.error(response.data.error || "Unable to assign role.", {
      duration: 2000,
    });

    return false;

  } catch (error: any) {
    const status = error.response?.status;
    const data = error.response?.data || {};
    const message = data.message || data.error || "Something went wrong.";

    // -------------------------------
    // 7) LICENSE DENIED (403)
    // ------------------------------- //
    if (status === 403 && data.license_limit) {
      toast.warning("Feature Limited", {
        description: "Free version restricts role assignment. Upgrade for full access.",
        duration: 2200,
      });

      return false;
    }

    // -------------------------------
    // 8) GENERIC ERROR
    // ------------------------------- //
    if (status === 403) {
      toast.warning("Permission Denied!", { description: message, duration: 2000 });
    } else {
      toast.error("Error!", { description: message, duration: 2000 });
    }


    return false;
  }
}
