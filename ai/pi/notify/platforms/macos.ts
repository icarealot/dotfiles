import { execFile } from "node:child_process";

export function notifyMac(title: string, message: string): void {
  execFile("terminal-notifier", ["-message", message, "-title", title]);
}
