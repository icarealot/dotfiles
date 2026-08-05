#!/bin/sh
input=$(cat)

printf '%s' "$input" | node -e '
const data = JSON.parse(require("fs").readFileSync(0, "utf8"));

function resetStr(resetsAt, weekly) {
  if (resetsAt == null) return "";
  const diff = resetsAt - Math.floor(Date.now() / 1000);
  if (diff <= 0) return "";
  if (weekly) {
    const d = Math.floor(diff / 86400);
    const h = Math.floor((diff % 86400) / 3600);
    return d > 0 ? " (~" + d + "d" + h + "h)" : " (~" + h + "h)";
  }
  const h = Math.floor(diff / 3600);
  const m = Math.floor((diff % 3600) / 60);
  return " (~" + h + "h" + m + "m)";
}

const model = (data.model && data.model.display_name) || "no-model";
const effort = (data.effort && data.effort.level) || "N/A";
const ctx = data.context_window || {};
let remainingPct = ctx.remaining_percentage;
if (remainingPct == null && ctx.used_percentage != null) {
  remainingPct = 100 - ctx.used_percentage;
}
if (remainingPct == null && ctx.context_window_size) {
  remainingPct = 100 - (ctx.total_input_tokens || 0) / ctx.context_window_size * 100;
}
const ctxRemaining = remainingPct != null ? Math.round(remainingPct) + "%" : "N/A";

const fiveHourRaw = data.rate_limits && data.rate_limits.five_hour ? data.rate_limits.five_hour.used_percentage : undefined;
const sevenDayRaw = data.rate_limits && data.rate_limits.seven_day ? data.rate_limits.seven_day.used_percentage : undefined;
const fiveResetTs = data.rate_limits && data.rate_limits.five_hour ? data.rate_limits.five_hour.resets_at : undefined;
const sevenResetTs = data.rate_limits && data.rate_limits.seven_day ? data.rate_limits.seven_day.resets_at : undefined;

const fiveHour = fiveHourRaw != null ? Math.round(fiveHourRaw) + "%" + resetStr(fiveResetTs, false) : "N/A";
const sevenDay = sevenDayRaw != null ? Math.round(sevenDayRaw) + "%" + resetStr(sevenResetTs, true) : "N/A";

console.log(model + " | " + effort + " | " + ctxRemaining + " | " + fiveHour + " | " + sevenDay);
'
