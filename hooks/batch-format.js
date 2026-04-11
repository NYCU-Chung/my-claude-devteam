// Stop hook: Batch format (Prettier) and typecheck (tsc) all JS/TS files edited this response
const crypto = require('crypto');
const { spawnSync } = require('child_process');
const fs = require('fs');
const os = require('os');
const path = require('path');

let d = ''; process.stdin.on('data', c => d += c);
process.stdin.on('end', () => {
  try {
    const sid = (process.env.CLAUDE_SESSION_ID ||
      crypto.createHash('sha1').update(process.cwd()).digest('hex').slice(0, 12))
      .replace(/[^a-zA-Z0-9_-]/g, '_').slice(0, 64);
    const af = path.join(os.tmpdir(), `claude-edited-${sid}.txt`);

    let raw;
    try { raw = fs.readFileSync(af, 'utf8'); } catch (e) { process.stdout.write(d); return; }
    try { fs.unlinkSync(af); } catch (e) {}

    const files = [...new Set(raw.split('\n').map(l => l.trim()).filter(Boolean))]
      .filter(f => /\.(ts|tsx|js|jsx)$/.test(f) && fs.existsSync(f));

    if (files.length === 0) { process.stdout.write(d); return; }

    // Try Prettier
    const isWin = process.platform === 'win32';
    const prettierBin = path.join(process.cwd(), 'node_modules', '.bin', isWin ? 'prettier.cmd' : 'prettier');
    if (fs.existsSync(prettierBin)) {
      try {
        spawnSync(prettierBin, ['--write', ...files], {
          shell: isWin, stdio: 'pipe', timeout: 60000
        });
      } catch (e) {}
    }

    // TypeCheck TS files
    const tsFiles = files.filter(f => /\.(ts|tsx)$/.test(f));
    if (tsFiles.length > 0) {
      try {
        const npx = isWin ? 'npx.cmd' : 'npx';
        const r = spawnSync(npx, ['tsc', '--noEmit', '--pretty', 'false'], {
          shell: isWin, encoding: 'utf8', stdio: ['pipe', 'pipe', 'pipe'], timeout: 120000
        });
        if (r.status !== 0) {
          const lines = ((r.stdout || '') + (r.stderr || '')).split('\n');
          for (const f of tsFiles) {
            const rel = path.relative(process.cwd(), f);
            const relevant = lines.filter(l => l.includes(f) || l.includes(rel)).slice(0, 3);
            if (relevant.length > 0) {
              process.stderr.write(`[Hook] TS errors in ${path.basename(f)}:\n`);
              relevant.forEach(l => process.stderr.write(l + '\n'));
            }
          }
        }
      } catch (e) {}
    }
  } catch (e) {}
  process.stdout.write(d);
});
