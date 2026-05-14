import fs from "node:fs";
import path from "node:path";

/**
 * Server-only: checks files under `public/`.
 * Do not import this module from client components.
 */
export function publicAssetExists(relativeToPublic: string): boolean {
  try {
    return fs.existsSync(
      path.join(process.cwd(), "public", ...relativeToPublic.split(/[/\\]/))
    );
  } catch {
    return false;
  }
}
