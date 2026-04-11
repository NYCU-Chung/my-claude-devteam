#!/bin/bash
# PostToolUse hook: record tool errors to ~/.claude/error-log.md for post-mortem.
# Triggers on any tool_output containing common error keywords. Input via stdin (JSON).

input=$(cat)

tool_name=$(echo "$input" | jq -r '.tool_name // "Unknown"')
tool_output=$(echo "$input" | jq -r '.tool_output // ""')

# Detect error keywords
if echo "$tool_output" | grep -qiE 'error|failed|ENOENT|EACCES|permission denied|not found|fatal|exception|traceback'; then
    timestamp=$(date '+%Y-%m-%d %H:%M:%S')
    tool_input=$(echo "$input" | jq -r '.tool_input // {}' | head -c 300)
    error_snippet=$(echo "$tool_output" | head -c 500)

    log_file="$HOME/.claude/error-log.md"

    # Ensure file exists
    if [ ! -f "$log_file" ]; then
        echo "# Claude Code Error Log" > "$log_file"
        echo "" >> "$log_file"
    fi

    # Append the error entry
    cat >> "$log_file" << ENTRY

## $timestamp - $tool_name

**Input:**
\`\`\`
$tool_input
\`\`\`

**Error:**
\`\`\`
$error_snippet
\`\`\`

**Solution:** (fill in after fix)

---
ENTRY
fi

exit 0
