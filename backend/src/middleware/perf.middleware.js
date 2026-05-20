/**
 * Logs slow API requests. Enable with PERF_LOG=1 (always on in development).
 * Helps identify cold starts and slow MongoDB queries on free-tier hosts.
 */
function perfMiddleware(req, res, next) {
  const shouldLog =
    process.env.PERF_LOG === "1" || process.env.NODE_ENV === "development";
  if (!shouldLog) return next();

  const start = process.hrtime.bigint();
  res.on("finish", () => {
    const ms = Number(process.hrtime.bigint() - start) / 1e6;
    if (ms >= 200 || req.path.startsWith("/api/products")) {
      console.log(
        `[PERF] ${req.method} ${req.originalUrl} ${res.statusCode} ${ms.toFixed(1)}ms`
      );
    }
  });
  next();
}

module.exports = perfMiddleware;
