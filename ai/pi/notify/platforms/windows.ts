import { execFile } from "node:child_process";

function createWindowsToastScript(title: string, message: string): string {
  const commands: string[] = [
    '[Windows.UI.Notifications.ToastNotificationManager, Windows.UI.Notifications, ContentType = WindowsRuntime] | Out-Null',
    '$toastXml = [Windows.UI.Notifications.ToastNotificationManager]::GetTemplateContent([Windows.UI.Notifications.ToastTemplateType]::ToastText01)',
    '$domXml = New-Object Windows.Data.Xml.Dom.XmlDocument',
    `$domXml.LoadXml($toastXml.GetXml())`,
    `$domXml.SelectSingleNode("//text").InnerText = '${message}'`,
    '$toast = [Windows.UI.Notifications.ToastNotification]::new($domXml)',
    `[Windows.UI.Notifications.ToastNotificationManager]::CreateToastNotifier('${title}').Show($toast)`,
  ];

  return commands.join("; ");
}

export function notifyWindows(title: string, message: string): void {
  const script = createWindowsToastScript(title, message);

  execFile("powershell.exe", ["-NoProfile", "-Command", script]);
}
