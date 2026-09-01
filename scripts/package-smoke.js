const { spawnSync } = require('node:child_process');
const { copyFileSync, mkdtempSync, readFileSync, rmSync, writeFileSync } = require('node:fs');
const { join } = require('node:path');
const { tmpdir } = require('node:os');
const { version } = require('../package.json');

const temporaryDirectory = mkdtempSync(join(tmpdir(), 'tool-demo-script-package-smoke-'));

function run(command, args, options = {}) {
  const result = spawnSync(command, args, {
    encoding: 'utf8',
    ...options
  });

  if (result.status !== 0) {
    process.stderr.write(`${result.stdout || ''}${result.stderr || ''}`);
    throw new Error(`${command} ${args.join(' ')} exited with status ${result.status}`);
  }

  return result.stdout;
}

try {
  const packOutput = run('npm', ['pack', '--json', '--pack-destination', temporaryDirectory]);
  const [packageDetails] = JSON.parse(packOutput);
  const packagedFiles = new Set(packageDetails.files.map(({ path }) => path));
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
  const missing = required.filter((entry) => !packagedFiles.has(entry));

  if (missing.length > 0) {
    throw new Error(`package smoke missing entries:\n${missing.join('\n')}`);
  }

  const consumerDirectory = join(temporaryDirectory, 'consumer');
  require('node:fs').mkdirSync(consumerDirectory);
  writeFileSync(join(consumerDirectory, 'package.json'), '{"private":true}\n');
  const tarball = join(temporaryDirectory, packageDetails.filename);
  run('npm', ['install', '--ignore-scripts', '--no-audit', '--no-fund', tarball], {
    cwd: consumerDirectory
  });

  const cli = join(consumerDirectory, 'node_modules', '.bin', 'tool-demo-script');
  const installedFixture = join(
    consumerDirectory,
    'node_modules',
    'tool-demo-script-skill',
    'fixtures',
    'repo-card.json'
  );
  const fixture = join(consumerDirectory, 'repo-card.json');
  copyFileSync(installedFixture, fixture);

  const jsonOutput = JSON.parse(run(cli, [fixture], { cwd: consumerDirectory }));
  if (jsonOutput.ok !== true || jsonOutput.title !== 'Repo Launch Skill demo script') {
    throw new Error('package smoke failed: installed CLI did not parse the packed fixture as JSON');
  }

  const markdown = run(cli, [fixture, '--format=markdown'], { cwd: consumerDirectory });
  if (!markdown.includes('# Repo Launch Skill demo script') || !markdown.includes('## Run Of Show')) {
    throw new Error('package smoke failed: installed CLI did not render the packed fixture as Markdown');
  }

  const help = run(cli, ['--help'], { cwd: consumerDirectory });
  if (!help.includes('Usage: tool-demo-script')) {
    throw new Error('package smoke failed: installed CLI --help omitted usage');
  }

  const installedVersion = run(cli, ['--version'], { cwd: consumerDirectory }).trim();
  if (installedVersion !== version) {
    throw new Error(`package smoke failed: expected version ${version}, received ${installedVersion}`);
  }

  const installedPackage = JSON.parse(
    readFileSync(join(consumerDirectory, 'node_modules', 'tool-demo-script-skill', 'package.json'), 'utf8')
  );
  if (installedPackage.version !== version) {
    throw new Error('package smoke failed: installed artifact version did not match package.json');
  }

  console.log(`package smoke passed: installed ${packageDetails.filename}; verified fixture JSON, Markdown, --help, and --version`);
} finally {
  rmSync(temporaryDirectory, { recursive: true, force: true });
}
