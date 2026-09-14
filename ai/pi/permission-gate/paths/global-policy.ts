// Declares and evaluates protections that apply in every project; add global path rules here.

import { posix } from "node:path";
import { normalizedToolPath } from "./path-utils.js";

const PROTECTED_DIRECTORIES = new Set([".git", "node_modules"]);

type GlobalPathRule = (segments: string[]) => boolean;

function isDotEnvFile(segments: string[]): boolean {
  return segments.at(-1) === ".env";
}

function isInsideProtectedDirectory(segments: string[]): boolean {
  return segments.some((segment) => PROTECTED_DIRECTORIES.has(segment));
}

const GLOBAL_PATH_RULES: GlobalPathRule[] = [isDotEnvFile, isInsideProtectedDirectory];

export function isGloballyProtectedPath(path: string): boolean {
  const normalizedPath = posix.normalize(normalizedToolPath(path).replace(/\\/g, "/"));
  const segments = normalizedPath
    .split("/")
    .filter((segment) => segment !== "" && segment !== ".")
    .map((segment) => (process.platform === "win32" ? segment.toLowerCase() : segment));

  return GLOBAL_PATH_RULES.some((rule) => rule(segments));
}
