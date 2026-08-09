#!/bin/sh
title="Claude Code"
message="Claude is waiting for input"

case "$(uname)" in
  Darwin)
    terminal-notifier -message "$message" -title "$title"
    ;;
  *)
    powershell.exe -NoProfile -Command "
      [Windows.UI.Notifications.ToastNotificationManager, Windows.UI.Notifications, ContentType = WindowsRuntime] | Out-Null;
      \$toastXml = [Windows.UI.Notifications.ToastNotificationManager]::GetTemplateContent([Windows.UI.Notifications.ToastTemplateType]::ToastText01);
      \$domXml = New-Object Windows.Data.Xml.Dom.XmlDocument;
      \$domXml.LoadXml(\$toastXml.GetXml());
      \$domXml.SelectSingleNode('//text').InnerText = '$message';
      \$toast = [Windows.UI.Notifications.ToastNotification]::new(\$domXml);
      [Windows.UI.Notifications.ToastNotificationManager]::CreateToastNotifier('$title').Show(\$toast);
    "
    ;;
esac
