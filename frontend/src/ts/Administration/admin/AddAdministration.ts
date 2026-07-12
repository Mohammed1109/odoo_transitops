// src/ts/Configuration/Administration/AddAdministration.ts

import axios from "axios";
import { toast } from "sonner";
import { countryMap } from "../../../data/countryCodeWithRegex";

export interface AdminFormData {
    accountType: string;
    username: string;
    email: string;
    password: string;
    confirmPassword: string;
    securityQ1: string;
    securityA1: string;
    securityQ2: string;
    securityA2: string;
    countryCode?: string;
    mobileNumber?: string;
}

export async function handleAdminSubmit(
    form: AdminFormData,
    editMode: boolean,
    editAdminId: number | null,
    onSuccess: () => void
) {
    // ----------------------------------------------------------
    // Loading Toast
    // ----------------------------------------------------------
    const loadingToastId = toast.loading(
        editMode
            ? "Updating administrator..."
            : "Creating administrator..."
    );

    try {
        // ----------------------------------------------------------
        // 1. Normalize Country Code
        // ----------------------------------------------------------
        let formattedCountryCode = "";

        if (form.countryCode?.trim()) {
            formattedCountryCode = form.countryCode.startsWith("+")
                ? form.countryCode.trim()
                : `+${form.countryCode.trim()}`;
        }

        // ----------------------------------------------------------
        // 2. Validate Mobile Number
        // ----------------------------------------------------------
        if (formattedCountryCode && form.mobileNumber?.trim()) {
            const entry = Object.values(countryMap).find(
                (c: any) => c.code === formattedCountryCode
            );

            if (!entry) {
                toast.dismiss(loadingToastId);
                toast.error("Invalid Country Code", {
                    description: `Unsupported code: ${formattedCountryCode}`,
                });
                return;
            }

            if (!entry.regex.test(String(form.mobileNumber).trim())) {
                toast.dismiss(loadingToastId);
                toast.error("Invalid Mobile Number", {
                    description: `Invalid mobile number format for ${formattedCountryCode}`,
                });
                return;
            }
        }

        // ----------------------------------------------------------
        // 3. Validate Passwords (only in Add mode)
        // ----------------------------------------------------------
        if (!editMode) {
            if (!form.password?.trim() || !form.confirmPassword?.trim()) {
                toast.dismiss(loadingToastId);
                toast.warning("Missing Password", {
                    description: "Password and Confirm Password are required.",
                });
                return;
            }

            if (form.password !== form.confirmPassword) {
                toast.dismiss(loadingToastId);
                toast.error("Password Mismatch", {
                    description: "Passwords do not match.",
                });
                return;
            }
        }

        // ----------------------------------------------------------
        // 4. Build Payload
        // ----------------------------------------------------------
        const payload = {
            accountType: form.accountType || "local",
            username: form.username?.trim(),
            email: form.email?.trim().toLowerCase(),
            password: form.password,
            confirmPassword: form.confirmPassword,
            countryCode: form.countryCode?.replace("+", "").trim() || "",
            mobileNumber: form.mobileNumber?.trim() || "",
            // These already contain full question text
            securityQ1: form.securityQ1?.trim(),
            securityA1: form.securityA1?.trim(),

            securityQ2: form.securityQ2?.trim(),
            securityA2: form.securityA2?.trim(),

        };

        console.log(
            "Submitting payload:",
            JSON.stringify(payload, null, 2)
        );

        // ----------------------------------------------------------
        // 5. API URL + Method
        // ----------------------------------------------------------
        const url = editMode
            ? `${globalThis.location.origin}/api/edit_local_admin/${editAdminId}`
            : `${globalThis.location.origin}/api/add_local_admin`;

        const method = editMode ? "put" : "post";

        // ----------------------------------------------------------
        // 6. Send Request
        // ----------------------------------------------------------
        const response = await axios({
            url,
            method,
            data: payload,
            headers: {
                "Content-Type": "application/json",
            },
        });


        if (response.data.logout) {
            toast.success("Credentials Updated", {
                description: response.data.message,
            });
            logout();
            return;
        }
        // Remove loading toast
        toast.dismiss(loadingToastId);

        // ----------------------------------------------------------
        // 7. Success Toast
        // ----------------------------------------------------------
        toast.success(
            editMode ? "Administrator Updated" : "Administrator Added",
            {
                description:
                    response.data?.message ||
                    (editMode
                        ? "Administrator updated successfully."
                        : "Administrator created successfully."),
            }
        );

        // ----------------------------------------------------------
        // 8. Success Callback
        // ----------------------------------------------------------
        await onSuccess();

    } catch (error: any) {
        // Remove loading toast
        toast.dismiss(loadingToastId);

        const status = error.response?.status;
        const backendData = error.response?.data || {};

        // Extract exact backend message
        let message =
            backendData.message ||
            backendData.error ||
            backendData.detail ||
            error.message ||
            "Failed to save administrator.";

        // FastAPI 422 returns detail as an array
        if (Array.isArray(backendData.detail)) {
            message = backendData.detail
                .map((item: any) => item.msg)
                .join(", ");
        }

        // Convert object to string if needed
        if (typeof message === "object") {
            message = JSON.stringify(message);
        }

        // Special handling for license restriction
        if (status === 403 && backendData.license_limit) {
            toast.warning("Feature Not Available", {
                description:
                    backendData.message ||
                    "This feature is available only in Standard Version.",
            });
            return;
        }

        toast.error(String(message));
    }
}




function logout() {
    fetch(`${globalThis.location.origin}/logout`, {
        method: "GET",
        credentials: "include"
    }).finally(() => {
        globalThis.location.href = `${globalThis.location.origin}/login`;
    });
}