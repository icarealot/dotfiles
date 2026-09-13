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
  let finalRunWasAborted = false;

  pi.on("agent_start", () => {
    finalRunWasAborted = false;
  });

  pi.on("agent_end", (event) => {
    for (let index = event.messages.length - 1; index >= 0; index--) {
      const message = event.messages[index];
      if (message.role !== "assistant") continue;

      finalRunWasAborted = message.stopReason === "aborted";
      return;
    }
  });

  pi.on("agent_settled", () => {
    const shouldNotify = !finalRunWasAborted;
    finalRunWasAborted = false;

    if (shouldNotify) {
      notify(NOTIFICATION_TITLE, NOTIFICATION_MESSAGE);
    }
  });
}
