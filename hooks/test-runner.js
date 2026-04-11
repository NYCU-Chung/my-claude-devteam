// PostToolUse on Write|Edit: find related test files and run them with vitest/jest.
// Non-blocking — failures are reported to stderr but don't stop the conversation.
const { spawnSync } = require('child_process');
const fs = require('fs');
const path = require('path');

let d = '';
process.stdin.on('data', c => d += c);
process.stdin.on('end', () => {
  try {
    const i = JSON.parse(d);
    const fp = i.tool_input?.file_path || '';
    if (!fp || !/\.(ts|tsx|js|jsx)$/.test(fp)) { process.stdout.write(d); return; }
    if (/\.(test|spec)\.[jt]sx?$/.test(fp)) { process.stdout.write(d); return; }
    if (!fs.existsSync(fp)) { process.stdout.write(d); return; }

    // Find related test file
    const dir = path.dirname(fp);
    const base = path.basename(fp).replace(/\.(ts|tsx|js|jsx)$/, '');
    const candidates = [
      path.join(dir, `${base}.test.ts`),
      path.join(dir, `${base}.test.tsx`),
      path.join(dir, `${base}.test.js`),
      path.join(dir, `${base}.spec.ts`),
      path.join(dir, `${base}.spec.tsx`),
      path.join(dir, `${base}.spec.js`),
      path.join(dir, '__tests__', `${base}.test.ts`),
      path.join(dir, '__tests__', `${base}.test.tsx`),
    ];
    const testFile = candidates.find(f => fs.existsSync(f));
    if (!testFile) { process.stdout.write(d); return; }

    // Detect runner: vitest preferred, fall back to jest
    const cwd = process.cwd();
    const isWin = process.platform === 'win32';
    const binDir = path.join(cwd, 'node_modules', '.bin');
    const vitestBin = path.join(binDir, isWin ? 'vitest.cmd' : 'vitest');
    const jestBin = path.join(binDir, isWin ? 'jest.cmd' : 'jest');

    let cmd, args;
    if (fs.existsSync(vitestBin)) {
      cmd = vitestBin;
      args = ['run', testFile, '--reporter=basic'];
    } else if (fs.existsSync(jestBin)) {
      cmd = jestBin;
      args = [testFile, '--no-coverage', '--silent'];
    } else {
      process.stdout.write(d);
      return;
    }

    const r = spawnSync(cmd, args, { shell: isWin, encoding: 'utf8', timeout: 60000, cwd });
    if (r.status !== 0) {
      const out = ((r.stdout || '') + (r.stderr || '')).split('\n').slice(0, 30).join('\n');
      process.stderr.write(`[Hook] Tests failing in ${path.basename(testFile)}:\n${out}\n`);
    }
  } catch (e) {}
  process.stdout.write(d);
});
