const User = require("../models/User");
const { emailVerificationRequired, isAdminRole } = require("../utils/userPublic");

module.exports = async function requireVerified(req, res, next) {
  if (!emailVerificationRequired()) return next();
  if (!req.user?.id) return res.status(401).json({ message: "Not logged in" });

  if (isAdminRole(req.user.role)) return next();

  if (req.user.emailVerified === true) return next();

  const user = await User.findById(req.user.id).select("emailVerified role").lean();
  if (!user) return res.status(401).json({ message: "Not logged in" });
  if (isAdminRole(user.role) || user.emailVerified) {
    req.user.emailVerified = true;
    return next();
  }

  return res.status(403).json({
    message: "Please verify your email to access this feature.",
    code: "EMAIL_NOT_VERIFIED",
  });
};
