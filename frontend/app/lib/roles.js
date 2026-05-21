export function isAdminRole(role) {
  return role === "admin" || role === "superadmin";
}

export function isAdminUser(user) {
  return isAdminRole(user?.role);
}
