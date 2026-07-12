export function formatRoleName(role: string) {
  const mapping: Record<string, string> = {
    softwareAdmin: "Principal",
    superAdmin: "Office Admin",
  };

  return mapping[role] || role;
}
