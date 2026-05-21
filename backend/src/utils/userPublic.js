function toPublicUser(user) {
  if (!user) return null;
  return {
    id: user._id || user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    emailVerified: Boolean(user.emailVerified),
    shippingAddress: user.shippingAddress || {},
    lastLogin: user.lastLogin || null,
  };
}

function isAdminRole(role) {
  return role === "admin" || role === "superadmin";
}

function emailVerificationRequired() {
  return process.env.REQUIRE_EMAIL_VERIFICATION === "true";
}

module.exports = { toPublicUser, isAdminRole, emailVerificationRequired };
