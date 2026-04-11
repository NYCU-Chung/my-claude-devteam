// Accumulate edited JS/TS file paths for batch format+typecheck at Stop
const crypto = require('crypto');
const fs = require('fs');
const os = require('os');
const path = require('path');
let d = ''; process.stdin.on('data', c => d += c);
process.stdin.on('end', () => {
  try {
    const i = JSON.parse(d);
    const sid = (process.env.CLAUDE_SESSION_ID ||
      crypto.createHash('sha1').update(process.cwd()).digest('hex').slice(0, 12))
      .replace(/[^a-zA-Z0-9_-]/g, '_').slice(0, 64);
    const af = path.join(os.tmpdir(), `claude-edited-${sid}.txt`);
    const files = [];
    if (i.tool_input?.file_path) files.push(i.tool_input.file_path);
    if (Array.isArray(i.tool_input?.edits))
      for (const e of i.tool_input.edits) if (e?.file_path) files.push(e.file_path);
    for (const fp of files) {
      if (/\.(ts|tsx|js|jsx)$/.test(fp)) {
        fs.appendFileSync(af, fp + '\n');
      }
    }
  } catch (e) {}
  process.stdout.write(d);
});
