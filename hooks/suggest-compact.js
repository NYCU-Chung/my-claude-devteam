// Suggest /compact at logical intervals (every ~50 tool calls)
const fs = require('fs');
const os = require('os');
const path = require('path');
let d = ''; process.stdin.on('data', c => d += c);
process.stdin.on('end', () => {
  const sid = (process.env.CLAUDE_SESSION_ID || 'default').replace(/[^a-zA-Z0-9_-]/g, '');
  const cf = path.join(os.tmpdir(), `claude-tool-count-${sid}`);
  let count = 1;
  try {
    count = parseInt(fs.readFileSync(cf, 'utf8').trim(), 10) + 1;
    if (isNaN(count) || count < 1) count = 1;
  } catch (e) {}
  try { fs.writeFileSync(cf, String(count)); } catch (e) {}

  if (count === 50) {
    process.stderr.write('[Hook] 50 tool calls reached — consider /compact if context is getting large\n');
  } else if (count > 50 && (count - 50) % 25 === 0) {
    process.stderr.write(`[Hook] ${count} tool calls — good checkpoint for /compact\n`);
  }
  process.stdout.write(d);
});
