/**
 * Free a TCP port by stopping listening process(es).
 * Windows: netstat + taskkill. macOS/Linux: lsof + kill.
 */
import { execSync } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";

/**
 * @param {number} port
 * @returns {string[]} PIDs that were terminated
 */
export function killPort(port) {
  if (!Number.isInteger(port) || port < 1 || port > 65535) {
    throw new Error(`Invalid port: ${port}`);
  }

  if (process.platform === "win32") {
    return killPortWindows(port);
  }
  return killPortUnix(port);
}

/** @param {number} port */
function killPortWindows(port) {
  const killed = [];
  try {
    const out = execSync(`netstat -ano | findstr ":${port}"`, {
      encoding: "utf8",
      stdio: ["pipe", "pipe", "ignore"]
    });
    const pids = new Set();
    for (const line of out.split(/\r?\n/)) {
      if (!line.includes("LISTENING")) continue;
      const parts = line.trim().split(/\s+/);
      const pid = parts[parts.length - 1];
      if (pid && /^\d+$/.test(pid) && pid !== "0") pids.add(pid);
    }
    for (const pid of pids) {
      try {
        execSync(`taskkill /PID ${pid} /F`, { stdio: "ignore" });
        killed.push(pid);
      } catch {
        // process may have already exited
      }
    }
  } catch {
    // findstr exits 1 when no matches — port is free
  }
  return killed;
}

/** @param {number} port */
function killPortUnix(port) {
  const killed = [];
  try {
    const out = execSync(`lsof -ti tcp:${port} -sTCP:LISTEN`, {
      encoding: "utf8",
      stdio: ["pipe", "pipe", "ignore"]
    });
    for (const pid of out.split(/\r?\n/).filter(Boolean)) {
      try {
        execSync(`kill -9 ${pid}`, { stdio: "ignore" });
        killed.push(pid);
      } catch {
        // ignore
      }
    }
  } catch {
    // nothing listening
  }
  return killed;
}

const isDirectRun =
  process.argv[1] &&
  path.resolve(fileURLToPath(import.meta.url)) ===
    path.resolve(process.argv[1]);

if (isDirectRun) {
  const port = Number(process.argv[2] ?? "3003");
  const killed = killPort(port);
  if (killed.length) {
    console.log(`Freed port ${port} (stopped PID: ${killed.join(", ")})`);
  } else {
    console.log(`Port ${port} is already free.`);
  }
}
