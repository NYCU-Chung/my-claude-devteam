// Stop hook: write a session summary to ~/.claude/sessions/<date>-<sid>.md
// for later searching ("how did we solve that bug last week?").
const crypto = require('crypto');
const fs = require('fs');
const os = require('os');
const path = require('path');
const { spawnSync } = require('child_process');

let d = '';
process.stdin.on('data', c => d += c);
process.stdin.on('end', () => {
  try {
    const sid = (process.env.CLAUDE_SESSION_ID ||
      crypto.createHash('sha1').update(process.cwd() + Date.now()).digest('hex').slice(0, 12))
      .replace(/[^a-zA-Z0-9_-]/g, '_').slice(0, 64);

    const sessionsDir = path.join(os.homedir(), '.claude', 'sessions');
    fs.mkdirSync(sessionsDir, { recursive: true });

    const today = new Date().toISOString().slice(0, 10);
    const file = path.join(sessionsDir, `${today}-${sid}.md`);

    // Best-effort: capture cwd, git status, recent commits
    let cwd = process.cwd();
    let gitStatus = '';
    let gitLog = '';
    try {
      const r1 = spawnSync('git', ['status', '--short'], { encoding: 'utf8', timeout: 3000 });
      gitStatus = (r1.stdout || '').trim();
    } catch (e) {}
    try {
      const r2 = spawnSync('git', ['log', '--oneline', '-10'], { encoding: 'utf8', timeout: 3000 });
      gitLog = (r2.stdout || '').trim();
    } catch (e) {}

    // Append rather than overwrite — multiple Stop events in one session
    // produce one entry per significant pause. The latest entry is at the bottom.
    const exists = fs.existsSync(file);
    let content = '';
    if (!exists) {
      content += `# Session ${today} ${sid}\n\n`;
      content += `**CWD**: \`${cwd}\`\n\n`;
    }
    content += `## ${new Date().toISOString().slice(11, 19)}\n\n`;
    if (gitStatus) {
      content += `**Working tree**:\n\`\`\`\n${gitStatus}\n\`\`\`\n\n`;
    }
    if (gitLog && !exists) {
      content += `**Recent commits**:\n\`\`\`\n${gitLog}\n\`\`\`\n\n`;
    }
    content += `---\n\n`;

    fs.appendFileSync(file, content);
  } catch (e) {}
  process.stdout.write(d);
});
