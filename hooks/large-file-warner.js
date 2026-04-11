// PreToolUse on Read: warn at 500KB, block at 2MB.
// Forces use of offset/limit for large files instead of swallowing them whole.
const fs = require('fs');

const WARN_BYTES = 500 * 1024;
const BLOCK_BYTES = 2 * 1024 * 1024;

let d = '';
process.stdin.on('data', c => d += c);
process.stdin.on('end', () => {
  try {
    const i = JSON.parse(d);
    const fp = i.tool_input?.file_path;
    if (!fp) { process.stdout.write(d); return; }

    // Skip if offset/limit already used (caller knows what they're doing)
    if (i.tool_input?.offset != null || i.tool_input?.limit != null) {
      process.stdout.write(d);
      return;
    }

    let stat;
    try { stat = fs.statSync(fp); } catch (e) { process.stdout.write(d); return; }
    if (!stat.isFile()) { process.stdout.write(d); return; }

    const size = stat.size;
    if (size >= BLOCK_BYTES) {
      process.stderr.write(
        `[Hook] BLOCKED: ${fp} is ${(size / 1024 / 1024).toFixed(1)} MB. ` +
        `Reading the whole file would burn context. ` +
        `Use Read with offset/limit, or Grep to find the relevant section first.\n`
      );
      process.exit(2);
    }
    if (size >= WARN_BYTES) {
      process.stderr.write(
        `[Hook] WARNING: ${fp} is ${(size / 1024).toFixed(0)} KB. ` +
        `Consider using offset/limit if you only need a portion.\n`
      );
    }
  } catch (e) {}
  process.stdout.write(d);
});
