// Declares command policy data; add blocked patterns, subcommands, or option metadata here.

export const DANGEROUS_COMMAND_PATTERNS = [
  { name: "recursive remove", pattern: /\brm\s+(-rf?|--recursive)/i },
  { name: "sudo", pattern: /\bsudo\b/i },
  { name: "world-accessible permissions", pattern: /\b(chmod|chown)\b.*777/i },
] as const;

export const BLOCKED_GIT_SUBCOMMANDS = new Set(["add", "push"]);

export const GIT_OPTIONS_WITH_ARGUMENTS = new Set([
  "-C",
  "-c",
  "--git-dir",
  "--work-tree",
  "--namespace",
  "--config-env",
]);

export const SUDO_OPTIONS_WITH_ARGUMENTS = new Set([
  "-C",
  "-D",
  "-g",
  "-h",
  "-p",
  "-R",
  "-r",
  "-t",
  "-T",
  "-U",
  "-u",
  "--chdir",
  "--close-from",
  "--group",
  "--host",
  "--prompt",
  "--role",
  "--type",
  "--other-user",
  "--user",
]);

export const ENV_OPTIONS_WITH_ARGUMENTS = new Set([
  "-a",
  "-C",
  "-S",
  "-u",
  "--argv0",
  "--chdir",
  "--split-string",
  "--unset",
]);
