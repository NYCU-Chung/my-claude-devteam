// Warn when frontend edits drift toward generic template-looking UI
const fs = require('fs');
const path = require('path');
let d = ''; process.stdin.on('data', c => d += c);
process.stdin.on('end', () => {
  try {
    const i = JSON.parse(d);
    const files = [];
    if (i.tool_input?.file_path) files.push(i.tool_input.file_path);
    if (Array.isArray(i.tool_input?.edits))
      for (const e of i.tool_input.edits) if (e?.file_path) files.push(e.file_path);

    const ext = /\.(tsx|jsx|vue|css|scss|html|svelte|astro)$/i;
    const frontend = files.filter(f => ext.test(f));
    if (frontend.length > 0) {
      const signals = [
        { p: /\bget started\b/i, l: '"Get Started" CTA' },
        { p: /\blearn more\b/i, l: '"Learn More" CTA' },
        { p: /\bgrid-cols-(3|4)\b/, l: 'uniform card grid' },
        { p: /\bbg-gradient-to-[trbl]/, l: 'stock gradient' },
        { p: /\bInter\b/, l: 'Inter font (generic)' },
        { p: /\bRoboto\b/, l: 'Roboto font (generic)' },
      ];
      const found = [];
      for (const f of frontend) {
        try {
          const c = fs.readFileSync(path.resolve(f), 'utf8');
          for (const s of signals) if (s.p.test(c)) found.push(s.l);
        } catch (e) {}
      }
      if (found.length > 0) {
        process.stderr.write(`[Hook] DESIGN: generic UI patterns detected: ${[...new Set(found)].join(', ')}. Ensure intentional design.\n`);
      }
    }
  } catch (e) {}
  process.stdout.write(d);
});
