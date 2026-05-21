function getClientIp(req) {
  const forwarded = req.headers["x-forwarded-for"];
  if (forwarded) {
    const first = String(forwarded).split(",")[0].trim();
    if (first) return first;
  }
  return req.ip || req.socket?.remoteAddress || "";
}

function getUserAgent(req) {
  return String(req.headers["user-agent"] || "").slice(0, 512);
}

function parseDeviceLabel(userAgent) {
  const ua = String(userAgent || "");
  if (/iPhone|iPad|iPod/i.test(ua)) return "Apple mobile";
  if (/Android/i.test(ua)) return "Android";
  if (/Windows/i.test(ua)) return "Windows";
  if (/Macintosh|Mac OS/i.test(ua)) return "Mac";
  if (/Linux/i.test(ua)) return "Linux";
  return "Unknown device";
}

function buildLoginMeta(req) {
  const userAgent = getUserAgent(req);
  return {
    ip: getClientIp(req),
    userAgent,
    device: parseDeviceLabel(userAgent),
    at: new Date(),
  };
}

module.exports = {
  getClientIp,
  getUserAgent,
  parseDeviceLabel,
  buildLoginMeta,
};
