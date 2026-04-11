// Pre-commit quality check: block debugger statements and hardcoded secrets in staged files
const { spawnSync } = require('child_process');
let d = ''; process.stdin.on('data', c => d += c);
process.stdin.on('end', () => {
  try {
    const i = JSON.parse(d);
    const cmd = i.tool_input?.command || '';
    if (!/git commit/.test(cmd) || /--amend/.test(cmd)) { process.stdout.write(d); return; }

    const r = spawnSync('git', ['diff', '--cached', '--name-only', '--diff-filter=ACMR'], { encoding: 'utf8' });
    const files = (r.stdout || '').trim().split('\n').filter(Boolean);
    let blocked = false;

    for (const f of files) {
      if (!/\.(js|jsx|ts|tsx|py)$/.test(f)) continue;
      const cr = spawnSync('git', ['show', ':' + f], { encoding: 'utf8' });
      const c = cr.stdout || '';

      if (/\bdebugger\b/.test(c)) {
        process.stderr.write(`[Hook] ERROR: debugger statement in ${f}\n`);
        blocked = true;
      }

      const secrets = [
        /sk-[a-zA-Z0-9]{20,}/,
        /ghp_[a-zA-Z0-9]{36}/,
        /gho_[a-zA-Z0-9]{36}/,
        /AKIA[A-Z0-9]{16}/,
        /AIza[a-zA-Z0-9_-]{35}/,
      ];
      for (const p of secrets) {
        if (p.test(c)) {
          process.stderr.write(`[Hook] ERROR: potential secret in ${f}\n`);
          blocked = true;
        }
      }
    }

    if (blocked) {
      process.stderr.write('[Hook] Commit blocked. Fix issues above.\n');
      process.exit(2);
    }
  } catch (e) {}
  process.stdout.write(d);
});
