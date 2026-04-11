// Stop hook: Track token usage and estimated cost per response
const fs = require('fs');
const os = require('os');
const path = require('path');

let d = ''; process.stdin.on('data', c => d += c);
process.stdin.on('end', () => {
  try {
    const i = d.trim() ? JSON.parse(d) : {};
    const usage = i.usage || i.token_usage || {};
    const inp = Number(usage.input_tokens || usage.prompt_tokens || 0);
    const out = Number(usage.output_tokens || usage.completion_tokens || 0);

    if (inp > 0 || out > 0) {
      const model = String(i.model || process.env.CLAUDE_MODEL || 'unknown').toLowerCase();
      let rateIn = 3, rateOut = 15; // sonnet default
      if (model.includes('haiku')) { rateIn = 0.8; rateOut = 4; }
      if (model.includes('opus')) { rateIn = 15; rateOut = 75; }

      const cost = Math.round(((inp / 1e6) * rateIn + (out / 1e6) * rateOut) * 1e6) / 1e6;
      const dir = path.join(os.homedir(), '.claude', 'metrics');
      fs.mkdirSync(dir, { recursive: true });
      fs.appendFileSync(
        path.join(dir, 'costs.jsonl'),
        JSON.stringify({ ts: new Date().toISOString(), model, in: inp, out, cost_usd: cost }) + '\n'
      );
    }
  } catch (e) {}
  process.stdout.write(d);
});
