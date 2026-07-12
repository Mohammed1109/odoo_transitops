// src/ts/Configuration/Administration/FetchAdministrationForm.ts

import axios from "axios";

/* ------------------------------------------------------
   ADMINISTRATION FORM DATA
------------------------------------------------------ */
export interface AdministrationFormData {
  id: number;
  username: string;
  email: string;
  Mnumber: string;
  accountType: string;

  // Security Questions & Answers
  ques1: string | null;
  answer1: string | null;
  ques2: string | null;
  answer2: string | null;

}

/* ------------------------------------------------------
   BACKEND RESPONSE TYPE
------------------------------------------------------ */
export interface AdministrationFormResponse {
  success: boolean;
  data?: AdministrationFormData;
  message?: string;
}

/* ------------------------------------------------------
   FETCH SINGLE ADMIN FOR EDIT FORM
------------------------------------------------------ */
export async function fetchAdministrationForm(
  adminId: number
): Promise<AdministrationFormResponse> {
  try {
    const response = await axios.get(
      `${globalThis.location.origin}/api/get_local_admin/${adminId}`
    );


    console.log(".......",response)
    if (response.data?.success && response.data?.data) {
      return {
        success: true,
        data: response.data.data as AdministrationFormData,
      };
    }

    return {
      success: false,
      message:
        response.data?.message || "Invalid backend response format",
    };
  } catch (error: any) {
    return {
      success: false,
      message:
        error.response?.data?.message ||
        error.response?.data?.error ||
        "Failed to fetch administrator data",
    };
  }
}