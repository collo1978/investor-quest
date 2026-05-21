import os from "node:os";

/** First non-internal IPv4 (typical Wi‑Fi / Ethernet LAN address). */
export function getLanIPv4() {
  const nets = os.networkInterfaces();
  const candidates = [];

  for (const entries of Object.values(nets)) {
    for (const net of entries ?? []) {
      const v4 = net.family === "IPv4" || net.family === 4;
      if (v4 && !net.internal && net.address) {
        candidates.push(net.address);
      }
    }
  }

  // Prefer common private ranges
  const preferred = candidates.find((ip) =>
    ip.startsWith("192.168.") || ip.startsWith("10.") || /^172\.(1[6-9]|2\d|3[01])\./.test(ip)
  );

  return preferred ?? candidates[0] ?? null;
}
