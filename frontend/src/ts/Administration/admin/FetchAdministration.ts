// src/ts/Configuration/Administration/FetchAdministration.ts

import axios from "axios";

/* ------------------------------------------------------
   TYPE FOR EACH ADMIN ROW
------------------------------------------------------ */
export interface AdministrationInfo {
  id: number;
  username: string;
  email: string;
  Mnumber: string;
  accountType: string;
  ques1: string | null;
  answer1: string | null;
  ques2: string | null;
  answer2: string | null;
}

/* ------------------------------------------------------
   FETCH LOCAL ADMIN LIST
------------------------------------------------------ */
export async function fetchAdministrationInfo(): Promise<AdministrationInfo[]> {
  try {
    const response = await axios.get(
      `${globalThis.location.origin}/api/fetch_local_admins`
    );

    console.log("fetch_local_admins response:", response.data);

    if (
      response.data?.success === true &&
      Array.isArray(response.data.data)
    ) {
      return response.data.data as AdministrationInfo[];
    }

    return [];
  } catch (error: any) {
    console.error("fetchAdministrationInfo error:", error);
    console.log("Backend Error Response:", error.response?.data);

    return [];
  }
}