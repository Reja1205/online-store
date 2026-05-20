const { resolveCartOwnerFromRequest } = require("../utils/cartOwner");

module.exports = function requireCartOwner(req, res, next) {
  const owner = resolveCartOwnerFromRequest(req);
  if (!owner) {
    return res.status(400).json({
      message: "Guest session missing. Refresh the page and try again.",
    });
  }
  req.cartOwner = owner;
  next();
};
