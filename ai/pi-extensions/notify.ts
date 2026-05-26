/**
 * Pi Notify Extension
 *
 * Sends a native Windows toast notification when Pi agent is done and waiting for input.
 */

import type { ExtensionAPI } from "@earendil-works/pi-coding-agent";

function windowsToastScript(title: string, body: string): string {
	return [
		'[Windows.UI.Notifications.ToastNotificationManager, Windows.UI.Notifications, ContentType = WindowsRuntime] | Out-Null',
		'$toastXml = [Windows.UI.Notifications.ToastNotificationManager]::GetTemplateContent([Windows.UI.Notifications.ToastTemplateType]::ToastText01)',
		'$domXml = New-Object Windows.Data.Xml.Dom.XmlDocument',
		`$domXml.LoadXml($toastXml.GetXml())`,
		`$domXml.SelectSingleNode("//text").InnerText = '${body}'`,
		'$toast = [Windows.UI.Notifications.ToastNotification]::new($domXml)',
		`[Windows.UI.Notifications.ToastNotificationManager]::CreateToastNotifier('${title}').Show($toast)`,
	].join("; ");
}

function notifyWindows(title: string, body: string): void {
	const { execFile } = require("child_process");
	execFile("powershell.exe", ["-NoProfile", "-Command", windowsToastScript(title, body)]);
}

function notify(title: string, body: string): void {
	notifyWindows(title, body);
}

export default function (pi: ExtensionAPI) {
	pi.on("agent_end", async () => {
		notify("Pi", "Ready for input");
	});
}
