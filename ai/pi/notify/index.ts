import type { ExtensionAPI } from "@earendil-works/pi-coding-agent";
import { notifyMac } from "./macos.js";
import { notifyWindows } from "./windows.js";

const NOTIFICATION_TITLE = "Pi";
const NOTIFICATION_MESSAGE = "Ready for input";

function notify(title: string, message: string): void {
  if (process.platform === "darwin") {
    notifyMac(title, message);
    return;
  }

  if (process.platform === "win32") {
    notifyWindows(title, message);
  }
}

export default function notifyExtension(pi: ExtensionAPI): void {
  pi.on("agent_end", () => {
    notify(NOTIFICATION_TITLE, NOTIFICATION_MESSAGE);
  });
}
