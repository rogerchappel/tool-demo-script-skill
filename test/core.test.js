const test = require('node:test');
const assert = require('node:assert/strict');
const { execFileSync, spawnSync } = require('node:child_process');
const { makeScript, renderMarkdown, toPositiveMinutes, validateDemoInput } = require('../src');

test('builds a bounded demo script', () => {
  const script = makeScript({ name: 'Repo Tool', oneLiner: 'turns repos into launch notes', command: 'repo-tool fixtures/demo.json' });
  assert.equal(script.ok, true);
  assert.equal(script.runtimeMinutes, 3);
  assert.match(script.narration, /Repo Tool/);
  assert.ok(script.checklist.includes('avoid live credentials or private data'));
  assert.equal(script.beats[0].startSecond, 0);
  assert.ok(script.artifactPlan.some((item) => item.name === 'safety-note'));
});

test('honors normalized runtimes exactly with positive beats', () => {
  for (const minutes of [1, 3, 5, 15]) {
    const script = makeScript({ name: 'Connector Tool', oneLiner: 'routes actions safely' }, { minutes });
    assert.equal(script.runtimeMinutes, minutes);
    assert.equal(script.beats.at(-1).endSecond, minutes * 60);
    assert.ok(script.beats.every((beat) => beat.seconds > 0));
  }
});

test('uses the clamped runtime for timing', () => {
  const tooLong = makeScript({ name: 'Connector Tool', oneLiner: 'routes actions safely' }, { minutes: 99 });
  const fractional = makeScript({ name: 'Connector Tool', oneLiner: 'routes actions safely' }, { minutes: 2.6 });
  assert.equal(tooLong.beats.at(-1).endSecond, 15 * 60);
  assert.equal(fractional.beats.at(-1).endSecond, 3 * 60);
});

test('validates required input', () => {
  assert.deepEqual(validateDemoInput({ name: 'Only Name' }), ['missing oneLiner']);
  const script = makeScript({ oneLiner: 'missing name' });
  assert.equal(script.ok, false);
  assert.match(script.errors.join('\n'), /missing name/);
});

test('bounds positive minutes', () => {
  assert.equal(toPositiveMinutes(99), 15);
  assert.equal(toPositiveMinutes(0.2), 1);
  assert.throws(() => toPositiveMinutes('never'), /positive number/);
});

test('renders markdown run of show', () => {
  const script = makeScript({ name: 'Connector Tool', oneLiner: 'routes actions safely' });
  const markdown = renderMarkdown(script);
  assert.match(markdown, /^# Connector Tool demo script/);
  assert.match(markdown, /## Run Of Show/);
});

test('cli emits script JSON', () => {
  const out = execFileSync(process.execPath, ['bin/tool-demo-script.js', 'fixtures/repo-card.json'], { cwd: process.cwd(), encoding: 'utf8' });
  const parsed = JSON.parse(out);
  assert.equal(parsed.ok, true);
  assert.match(parsed.title, /demo script/);
});

test('cli exposes help and rejects missing fixture input', () => {
  const help = execFileSync(process.execPath, ['bin/tool-demo-script.js', '--help'], { cwd: process.cwd(), encoding: 'utf8' });
  assert.match(help, /Usage: tool-demo-script/);

  const result = spawnSync(process.execPath, ['bin/tool-demo-script.js'], { cwd: process.cwd(), encoding: 'utf8' });
  assert.equal(result.status, 1);
  assert.match(result.stdout, /Usage: tool-demo-script/);
});

test('cli exposes help and version for package smoke checks', () => {
  const help = execFileSync(process.execPath, ['bin/tool-demo-script.js', '--help'], { cwd: process.cwd(), encoding: 'utf8' });
  assert.match(help, /Usage: tool-demo-script/);
  assert.match(help, /--format=json\|markdown/);

  const version = execFileSync(process.execPath, ['bin/tool-demo-script.js', '--version'], { cwd: process.cwd(), encoding: 'utf8' }).trim();
  assert.match(version, /^\d+\.\d+\.\d+/);
});

test('cli emits markdown and validation exit codes', () => {
  const out = execFileSync(process.execPath, ['bin/tool-demo-script.js', 'fixtures/connector-card.json', '--format=markdown'], { cwd: process.cwd(), encoding: 'utf8' });
  assert.match(out, /## Shot List/);
  const result = spawnSync(process.execPath, ['bin/tool-demo-script.js', 'fixtures/invalid-card.json'], { cwd: process.cwd(), encoding: 'utf8' });
  assert.equal(result.status, 2);
  assert.match(result.stdout, /missing oneLiner/);
});

test('cli rejects unsupported output formats', () => {
  const result = spawnSync(
    process.execPath,
    ['bin/tool-demo-script.js', 'fixtures/repo-card.json', '--format=yaml'],
    { cwd: process.cwd(), encoding: 'utf8' }
  );
  assert.equal(result.status, 1);
  assert.equal(result.stdout, '');
  assert.match(result.stderr, /Unsupported format "yaml".*json or markdown/);
});

test('cli accepts options before or after the fixture', () => {
  for (const args of [
    ['--format=markdown', '--minutes=5', 'fixtures/repo-card.json'],
    ['fixtures/repo-card.json', '--minutes=5', '--format=markdown']
  ]) {
    const result = spawnSync(process.execPath, ['bin/tool-demo-script.js', ...args], {
      cwd: process.cwd(),
      encoding: 'utf8'
    });
    assert.equal(result.status, 0);
    assert.match(result.stdout, /Runtime: 5 minutes/);
    assert.equal(result.stderr, '');
  }
});

test('cli rejects unknown and malformed options', () => {
  for (const [args, diagnostic] of [
    [['fixtures/repo-card.json', '--bogus'], /Unknown option "--bogus"/],
    [['fixtures/repo-card.json', '--format'], /Malformed option "--format"/],
    [['fixtures/repo-card.json', '--format='], /Malformed option "--format="/],
    [['fixtures/repo-card.json', '--minutes='], /Malformed option "--minutes="/],
    [['fixtures/repo-card.json', '--minutes=soon'], /minutes must be a positive number/]
  ]) {
    const result = spawnSync(process.execPath, ['bin/tool-demo-script.js', ...args], {
      cwd: process.cwd(),
      encoding: 'utf8'
    });
    assert.equal(result.status, 1);
    assert.equal(result.stdout, '');
    assert.match(result.stderr, diagnostic);
    assert.doesNotMatch(result.stderr, /\n\s+at /);
  }
});

test('cli rejects extra positional arguments', () => {
  const result = spawnSync(
    process.execPath,
    ['bin/tool-demo-script.js', 'fixtures/repo-card.json', 'fixtures/connector-card.json'],
    { cwd: process.cwd(), encoding: 'utf8' }
  );
  assert.equal(result.status, 1);
  assert.equal(result.stdout, '');
  assert.match(result.stderr, /Unexpected positional argument "fixtures\/connector-card.json"/);
});

test('cli reports fixture read and JSON errors without stack traces', () => {
  for (const [fixture, diagnostic] of [
    ['fixtures/missing-card.json', /Could not read fixture "fixtures\/missing-card.json"/],
    ['package.json', null]
  ]) {
    const args = fixture === 'package.json' ? ['test/invalid-json.fixture'] : [fixture];
    const result = spawnSync(process.execPath, ['bin/tool-demo-script.js', ...args], {
      cwd: process.cwd(),
      encoding: 'utf8'
    });
    assert.equal(result.status, 1);
    assert.equal(result.stdout, '');
    assert.match(result.stderr, diagnostic || /Fixture "test\/invalid-json.fixture" contains invalid JSON/);
    assert.doesNotMatch(result.stderr, /\n\s+at /);
  }
});
