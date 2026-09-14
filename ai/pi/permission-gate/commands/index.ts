// Exposes command blocking decisions by evaluating declared policies against shell input.

import { DANGEROUS_COMMAND_PATTERNS } from "./policy.js";
import { invokesBlockedGitCommand } from "./shell.js";

export function isDangerousCommand(command: string): boolean {
  return (
    DANGEROUS_COMMAND_PATTERNS.some(({ pattern }) => pattern.test(command)) ||
    invokesBlockedGitCommand(command)
  );
}
