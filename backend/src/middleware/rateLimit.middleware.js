const buckets = new Map();

function rateLimit({ windowMs = 15 * 60 * 1000, max = 20, keyPrefix = "rl" }) {
  return function rateLimitMiddleware(req, res, next) {
    const ip = req.ip || req.socket?.remoteAddress || "unknown";
    const key = `${keyPrefix}:${ip}`;
    const now = Date.now();
    let entry = buckets.get(key);

    if (!entry || entry.resetAt <= now) {
      entry = { count: 0, resetAt: now + windowMs };
      buckets.set(key, entry);
    }

    entry.count += 1;

    if (entry.count > max) {
      const retryAfter = Math.ceil((entry.resetAt - now) / 1000);
      res.setHeader("Retry-After", String(retryAfter));
      return res.status(429).json({
        message: "Too many requests. Please try again later.",
      });
    }

    next();
  };
}

const authLimiter = rateLimit({
  windowMs: Number(process.env.RATE_LIMIT_AUTH_WINDOW_MS || 15 * 60 * 1000),
  max: Number(process.env.RATE_LIMIT_AUTH_MAX || 30),
  keyPrefix: "auth",
});

const strictAuthLimiter = rateLimit({
  windowMs: Number(process.env.RATE_LIMIT_STRICT_WINDOW_MS || 15 * 60 * 1000),
  max: Number(process.env.RATE_LIMIT_STRICT_MAX || 10),
  keyPrefix: "auth-strict",
});

module.exports = { rateLimit, authLimiter, strictAuthLimiter };
