// MCP health check — block calls to known-unhealthy servers (PreToolUse)
// Track failures with exponential backoff (PostToolUseFailure)
const fs = require('fs');
const os = require('os');
const path = require('path');

const CACHE_FILE = path.join(os.homedir(), '.claude', 'mcp-health-cache.json');

function loadState() {
  try { return JSON.parse(fs.readFileSync(CACHE_FILE, 'utf8')); }
  catch (e) { return { servers: {} }; }
}

function saveState(state) {
  fs.mkdirSync(path.dirname(CACHE_FILE), { recursive: true });
  fs.writeFileSync(CACHE_FILE, JSON.stringify(state, null, 2));
}

let d = ''; process.stdin.on('data', c => d += c);
process.stdin.on('end', () => {
  try {
    const i = JSON.parse(d);
    const tn = i.tool_name || '';
    if (!tn.startsWith('mcp__')) { process.stdout.write(d); return; }

    const server = tn.slice(5).split('__')[0];
    const mode = process.argv[2] || 'pre'; // 'pre' or 'failure'

    if (mode === 'pre') {
      // Check if server is unhealthy
      const state = loadState();
      const s = state.servers?.[server];
      if (s && s.status === 'unhealthy' && s.nextRetryAt > Date.now()) {
        const wait = Math.round((s.nextRetryAt - Date.now()) / 1000);
        process.stderr.write(`[Hook] MCP ${server} is unhealthy, retry in ${wait}s. Skipping.\n`);
        process.exit(2);
      }
      // If past retry time, clear the unhealthy status
      if (s && s.status === 'unhealthy' && s.nextRetryAt <= Date.now()) {
        delete state.servers[server];
        saveState(state);
      }
    } else if (mode === 'failure') {
      // Mark server as unhealthy on infrastructure failures
      const errText = [i.error, i.message, i.tool_response,
        typeof i.tool_output === 'string' ? i.tool_output : i.tool_output?.output,
        i.tool_output?.stderr].filter(Boolean).join(' ');

      const infraPatterns = [
        /ECONNREFUSED|ENOTFOUND|timed? out|socket hang up|connection (?:failed|lost|reset|closed)/i,
        /\b(401|403|429|503)\b/i,
        /disconnected|unavailable/i,
      ];
      if (infraPatterns.some(p => p.test(errText))) {
        const state = loadState();
        const prev = state.servers[server] || {};
        const fc = (prev.failureCount || 0) + 1;
        const backoff = Math.min(30000 * (2 ** (fc - 1)), 600000); // 30s → 10min max
        state.servers[server] = {
          status: 'unhealthy',
          checkedAt: Date.now(),
          failureCount: fc,
          nextRetryAt: Date.now() + backoff,
          lastError: errText.slice(0, 200),
        };
        saveState(state);
        process.stderr.write(`[Hook] MCP ${server} marked unhealthy (attempt ${fc}), retry after ${Math.round(backoff / 1000)}s\n`);
      }
    }
  } catch (e) {}
  process.stdout.write(d);
});
