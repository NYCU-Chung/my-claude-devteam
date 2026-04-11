// Stop hook: Check for console.log in modified files
const { spawnSync } = require('child_process');
const fs = require('fs');
let d = ''; process.stdin.on('data', c => d += c);
process.stdin.on('end', () => {
  try {
    const r = spawnSync('git', ['diff', '--name-only', '--diff-filter=ACMR', 'HEAD'], { encoding: 'utf8' });
    if (r.status !== 0) { process.stdout.write(d); return; }

    const excluded = [/\.test\.[jt]sx?$/, /\.spec\.[jt]sx?$/, /\.config\.[jt]s$/, /scripts\//, /__tests__\//];
    const files = r.stdout.trim().split('\n')
      .filter(f => f && /\.[jt]sx?$/.test(f) && !excluded.some(p => p.test(f)) && fs.existsSync(f));

    let found = false;
    for (const f of files) {
      const c = fs.readFileSync(f, 'utf8');
      const lines = c.split('\n');
      const matches = [];
      lines.forEach((line, i) => {
        if (/console\.log\b/.test(line) && !/\/\//.test(line.split('console.log')[0])) {
          matches.push(i + 1);
        }
      });
      if (matches.length > 0) {
        process.stderr.write(`[Hook] console.log in ${f} (lines: ${matches.slice(0, 5).join(', ')})\n`);
        found = true;
      }
    }
    if (found) process.stderr.write('[Hook] Remove console.log before committing\n');
  } catch (e) {}
  process.stdout.write(d);
});
