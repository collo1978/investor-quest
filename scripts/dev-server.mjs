/**
 * Dev server launcher — port 3003, binds all interfaces for phone/LAN access.
 * Next.js Fast Refresh (hot reload) runs while this process stays open.
 */
import { spawn } from "node:child_process";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

import { getLanIPv4 } from "./lan-ip.mjs";
import { killPort } from "./kill-port.mjs";

const PORT = 3003;
/** Listen on all interfaces so phones on the same Wi‑Fi can connect. */
const HOSTNAME = "0.0.0.0";
const LOCAL = `http://localhost:${PORT}`;
const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, "..");

const lanIp = getLanIPv4();
const lanBase = lanIp ? `http://${lanIp}:${PORT}` : null;

const phoneLine = lanBase
  ? `║  Phone (LAN):      ${`${lanBase}/admin/game-health`.padEnd(42)}║`
  : `║  Phone (LAN):      ${"(no LAN IP detected — use ipconfig)".padEnd(42)}║`;

const banner = `
╔══════════════════════════════════════════════════════════════╗
║  Investor Quest — dev server (npm run dev)                     ║
╠══════════════════════════════════════════════════════════════╣
║  This computer:    ${LOCAL.padEnd(42)}║
${phoneLine}
║  Quest map:        ${`${LOCAL}/map`.padEnd(42)}║
╠══════════════════════════════════════════════════════════════╣
║  LAN: bound to 0.0.0.0:${PORT} (same Wi‑Fi as your phone)       ║
║  Keep this terminal open until you press Ctrl+C to stop      ║
╠══════════════════════════════════════════════════════════════╣
║  Phone blocked? Allow port ${PORT} in Windows Firewall (private) ║
║  Port busy?  npm run dev:kill-port                           ║
╚══════════════════════════════════════════════════════════════╝
`;

const freed = killPort(PORT);
if (freed.length > 0) {
  console.log(`\n  Freed port ${PORT} (stopped PID: ${freed.join(", ")})\n`);
}

console.log(banner);
if (lanBase) {
  console.log(`  Mission Control on your phone: ${lanBase}/admin/game-health\n`);
}

const nextBin = join(
  root,
  "node_modules",
  "next",
  "dist",
  "bin",
  "next"
);

const child = spawn(
  process.execPath,
  [nextBin, "dev", "-H", HOSTNAME, "-p", String(PORT)],
  {
    cwd: root,
    stdio: "inherit",
    env: { ...process.env, FORCE_COLOR: "1" }
  }
);

child.on("exit", (code, signal) => {
  if (signal) {
    process.kill(process.pid, signal);
    return;
  }
  process.exit(code ?? 0);
});

process.on("SIGINT", () => child.kill("SIGINT"));
process.on("SIGTERM", () => child.kill("SIGTERM"));
