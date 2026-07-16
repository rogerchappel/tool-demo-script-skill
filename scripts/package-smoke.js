const { spawnSync } = require('node:child_process');
const { version } = require('../package.json');

const result = spawnSync('npm', ['pack', '--dry-run'], { encoding: 'utf8' });
const output = `${result.stdout || ''}\n${result.stderr || ''}`;

if (result.status !== 0) {
  process.stderr.write(output);
  process.exit(result.status || 1);
}

const required = [
  'bin/tool-demo-script.js',
  'src/index.js',
  'fixtures/repo-card.json',
  'fixtures/connector-card.json',
  'docs/RELEASE_CANDIDATE.md',
  'SKILL.md',
  'README.md',
  'LICENSE',
  'SECURITY.md',
  'CHANGELOG.md'
];

const missing = required.filter((entry) => !output.includes(entry));

if (missing.length > 0) {
  console.error(`package smoke missing entries:\n${missing.join('\n')}`);
  process.exit(1);
}

const versionResult = spawnSync(process.execPath, ['bin/tool-demo-script.js', '--version'], { encoding: 'utf8' });
if (versionResult.status !== 0 || versionResult.stdout.trim() !== version) {
  console.error('package smoke failed: CLI --version did not match package.json');
  process.exit(1);
}

console.log('package smoke passed');
