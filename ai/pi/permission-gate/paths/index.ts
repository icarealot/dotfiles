// Exposes path blocking decisions by combining global and project-specific policies.

import { isGloballyProtectedPath } from "./global-policy.js";
import { isUnityProtectedPath } from "./unity-policy.js";

export function isProtectedPath(path: string, cwd = process.cwd()): boolean {
  return isGloballyProtectedPath(path) || isUnityProtectedPath(path, cwd);
}
