const { writeAudit } = require("../services/auth.service");

function audit(action, resource = "") {
  return function auditMiddleware(req, res, next) {
    const originalJson = res.json.bind(res);

    res.json = function auditJson(body) {
      if (res.statusCode >= 200 && res.statusCode < 300) {
        writeAudit({
          actor: { id: req.user?.id, email: req.user?.email },
          action,
          resource,
          resourceId: req.params?.id,
          req,
          meta: { method: req.method, path: req.originalUrl },
        }).catch(() => {});
      }
      return originalJson(body);
    };

    next();
  };
}

module.exports = audit;
