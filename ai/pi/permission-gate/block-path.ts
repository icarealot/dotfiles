/* 
- .env 
- .git
- node_modules directories
*/

import { posix } from "node:path";

const PROTECTED_DIRECTORIES = new Set([".git", "node_modules"]);

export function isProtectedPath(path: string): boolean {
  const toolPath = path.startsWith("@") ? path.slice(1) : path;
  const normalizedPath = posix.normalize(toolPath.replace(/\\/g, "/"));
  const segments = normalizedPath
    .split("/")
    .filter((segment) => segment !== "" && segment !== ".")
    .map((segment) => (process.platform === "win32" ? segment.toLowerCase() : segment));

  return segments.at(-1) === ".env" || segments.some((segment) => PROTECTED_DIRECTORIES.has(segment));
}
