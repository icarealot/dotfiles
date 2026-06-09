#!/bin/sh
input=$(cat)

# Helper to format context window size (e.g., 200k, 1M)
fmt_context() {
  local n=$1
  if [ "$n" -ge 1000000 ]; then
    local m=$((n / 1000000))
    if [ "$m" -ge 10 ]; then
      printf "%dM" "$m"
    else
      local frac=$((n / 100000 % 10))
      printf "%d.%dM" "$m" "$frac"
    fi
  elif [ "$n" -ge 1000 ]; then
    local k=$((n / 1000))
    if [ "$k" -ge 10 ]; then
      printf "%dK" "$k"
    else
      local frac=$((n / 100 % 10))
      printf "%d.%dK" "$k" "$frac"
    fi
  else
    printf "%d" "$n"
  fi
}

now=$(date +%s)
model=$(echo "$input" | jq -r '.model.display_name // "no-model"')
total_ctx=$(echo "$input" | jq -r '.context_window.context_window_size // 0')
used_tokens=$(echo "$input" | jq -r '.context_window.total_input_tokens // 0')
five_hour_raw=$(echo "$input" | jq -r '.rate_limits.five_hour.used_percentage // empty')
seven_day_raw=$(echo "$input" | jq -r '.rate_limits.seven_day.used_percentage // empty')
five_reset_ts=$(echo "$input" | jq -r '.rate_limits.five_hour.resets_at // empty')
seven_reset_ts=$(echo "$input" | jq -r '.rate_limits.seven_day.resets_at // empty')

# Format reset countdown for 5h session
if [ -n "$five_reset_ts" ]; then
  diff=$((five_reset_ts - now))
  if [ "$diff" -gt 0 ]; then
    h=$((diff / 3600))
    m=$(((diff % 3600) / 60))
    five_reset_str=" (~${h}h${m}m)"
  else
    five_reset_str=""
  fi
else
  five_reset_str=""
fi

# Format reset countdown for 7d weekly
if [ -n "$seven_reset_ts" ]; then
  diff=$((seven_reset_ts - now))
  if [ "$diff" -gt 0 ]; then
    d=$((diff / 86400))
    h=$(((diff % 86400) / 3600))
    if [ "$d" -gt 0 ]; then
      seven_reset_str=" (~${d}d${h}h)"
    else
      seven_reset_str=" (~${h}h)"
    fi
  else
    seven_reset_str=""
  fi
else
  seven_reset_str=""
fi

five_hour=$([ -n "$five_hour_raw" ] && printf "%.0f%%%s" "$five_hour_raw" "$five_reset_str" || echo "N/A")
seven_day=$([ -n "$seven_day_raw" ] && printf "%.0f%%%s" "$seven_day_raw" "$seven_reset_str" || echo "N/A")

# Format context window
ctx_fmt=$(fmt_context "$total_ctx")
used_fmt=$(fmt_context "$used_tokens")

# Output: model | used/total | 5h: X% | 7d: X%
usage_part="${five_hour} | ${seven_day}"
if [ "$used_tokens" -eq 0 ]; then
  printf "%s | N/A | %s\n" "$model" "$usage_part"
else
  printf "%s | %s/%s | %s\n" "$model" "$used_fmt" "$ctx_fmt" "$usage_part"
fi
