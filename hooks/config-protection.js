// Block modifications to linter/formatter config files — force fixing source code instead
const path = require('path');
let d = ''; process.stdin.on('data', c => d += c);
process.stdin.on('end', () => {
  try {
    const i = JSON.parse(d);
    const fp = i.tool_input?.file_path || '';
    const bn = path.basename(fp);
    const protectedFiles = new Set([
      '.eslintrc', '.eslintrc.js', '.eslintrc.cjs', '.eslintrc.json',
      'eslint.config.js', 'eslint.config.mjs', 'eslint.config.ts',
      '.prettierrc', '.prettierrc.js', '.prettierrc.json',
      'prettier.config.js', 'prettier.config.mjs',
      'biome.json', 'biome.jsonc',
      '.ruff.toml', 'ruff.toml',
      '.stylelintrc', '.stylelintrc.json',
    ]);
    if (protectedFiles.has(bn)) {
      process.stderr.write(`[Hook] BLOCKED: Modifying ${bn} is not allowed. Fix the source code instead of weakening linter/formatter config.\n`);
      process.exit(2);
    }
  } catch (e) {}
  process.stdout.write(d);
});
