// Provides shared path normalization, filesystem probes, and containment checks for path policies.

import { statSync } from "node:fs";
import { isAbsolute, relative, sep } from "node:path";

export function normalizedToolPath(path: string): string {
  return path.startsWith("@") ? path.slice(1) : path;
}

export function isDirectory(path: string): boolean {
  try {
    return statSync(path).isDirectory();
  } catch {
    return false;
  }
}

export function isFile(path: string): boolean {
  try {
    return statSync(path).isFile();
  } catch {
    return false;
  }
}

export function isInsideRoot(root: string, path: string): boolean {
  const relativePath = relative(root, path);
  return (
    relativePath === "" ||
    (!relativePath.startsWith(`..${sep}`) && relativePath !== ".." && !isAbsolute(relativePath))
  );
}
