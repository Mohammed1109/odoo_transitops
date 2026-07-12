import axios from "axios";
const Swal = (await import("sweetalert2")).default;
import { toast } from "sonner";

export async function deleteSmtpConfigurations(ids: number[]) {
    try {
        const result = await Swal.fire({
            title: `Delete ${ids.length} Email Configuration(s)?`,
            text: "This action cannot be undone.",
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: "#d33",
            cancelButtonColor: "#3085d6",
            confirmButtonText: "Yes, delete",
        });

        if (!result.isConfirmed) return { success: false };

        // POST to backend
        const { data } = await axios.post(
            `${globalThis.location.origin}/api/delete_multiple_email_configurations`,
            { ids }
        );

        if (data.success) {
            toast.success(data.message || "Success!", {
                duration: 1500,   // closes after 1.5s
            });

            return { success: true };
        } else {
            toast.error(data.message || "Error Delete.", {
                duration: 1500,
            });

            return { success: false };
        }

    } catch (error: any) {

        toast.error(
            error.response?.data?.message || "Unknown error occurred."
        );

        return { success: false };
    }
}
