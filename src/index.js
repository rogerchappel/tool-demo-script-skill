const fs = require('node:fs');

function readJson(file) {
  return JSON.parse(fs.readFileSync(file, 'utf8'));
}

function toPositiveMinutes(value, fallback = 3) {
  const minutes = Number(value ?? fallback);
  if (!Number.isFinite(minutes) || minutes <= 0) {
    throw new Error('minutes must be a positive number');
  }
  return Math.min(Math.max(Math.round(minutes), 1), 15);
}

function compactList(items = [], fallback = 'local-first workflow') {
  return Array.isArray(items) && items.length ? items.join(', ') : fallback;
}

function validateDemoInput(input = {}) {
  if (input === null || typeof input !== 'object' || Array.isArray(input)) {
    return ['input must be an object'];
  }
  const errors = [];
  if (!input.name) errors.push('missing name');
  if (!input.oneLiner) errors.push('missing oneLiner');
  if (input.outputs && !Array.isArray(input.outputs)) errors.push('outputs must be an array');
  if (input.shots && !Array.isArray(input.shots)) errors.push('shots must be an array');
  return errors;
}

function makeRunOfShow(beats) {
  let cursor = 0;
  return beats.map((beat) => {
    const start = cursor;
    cursor += beat.seconds;
    return { ...beat, startSecond: start, endSecond: cursor };
  });
}

function allocateBeatSeconds(totalSeconds, weights) {
  const weightTotal = weights.reduce((sum, weight) => sum + weight, 0);
  const allocations = weights.map((weight) => Math.floor(totalSeconds * weight / weightTotal));
  let remaining = totalSeconds - allocations.reduce((sum, seconds) => sum + seconds, 0);
  const remainderOrder = weights
    .map((weight, index) => ({ index, remainder: totalSeconds * weight % weightTotal }))
    .sort((left, right) => right.remainder - left.remainder || left.index - right.index);
  for (let index = 0; index < remaining; index += 1) {
    allocations[remainderOrder[index].index] += 1;
  }
  return allocations;
}

function makeArtifactPlan(input) {
  return [
    { name: 'fixture', required: true, source: input.fixture || 'checked-in JSON fixture' },
    { name: 'command', required: true, source: input.command || 'documented smoke command' },
    { name: 'output', required: true, source: compactList(input.outputs, 'generated JSON or Markdown') },
    { name: 'safety-note', required: true, source: input.sideEffects || 'dry-run boundary statement' }
  ];
}

function makeScript(input, options = {}) {
  const errors = validateDemoInput(input);
  if (errors.length) {
    return { ok: false, errors, sideEffects: 'No files, accounts, or external systems were changed.' };
  }
  const minutes = toPositiveMinutes(options.minutes ?? input.minutes ?? 3);
  const [hookSeconds, problemSeconds, demoSeconds, safetySeconds, closeSeconds] =
    allocateBeatSeconds(minutes * 60, [20, 30, 45, 25, 20]);
  const beats = [
    { label: 'hook', seconds: hookSeconds, line: 'Today I am showing ' + input.name + ': ' + input.oneLiner + '.' },
    { label: 'problem', seconds: problemSeconds, line: 'It helps when ' + (input.problem || 'an agent needs a repeatable workflow with evidence and safety checks') + '.' },
    { label: 'demo', seconds: demoSeconds, line: 'Run ' + (input.command || 'the CLI against a fixture') + ' and inspect ' + compactList(input.outputs, 'the generated output') + '.' },
    { label: 'safety', seconds: safetySeconds, line: 'Side effects: ' + (input.sideEffects || 'dry-run by default; review before external writes') + '.' },
    { label: 'close', seconds: closeSeconds, line: 'Try it locally with ' + (input.quickstart || 'npm test && npm run smoke') + '.' }
  ];
  const checklist = [
    'verify fixture command works',
    'show generated artifact on screen',
    'state limitation plainly',
    'avoid live credentials or private data'
  ];
  const runOfShow = makeRunOfShow(beats);
  return {
    ok: true,
    title: input.name + ' demo script',
    runtimeMinutes: minutes,
    audience: input.audience || 'agent builders',
    beats: runOfShow,
    narration: beats.map((beat) => '[' + beat.label + '] ' + beat.line).join('\n'),
    shotList: input.shots || ['terminal command', 'fixture input', 'generated output', 'README quickstart'],
    checklist,
    artifactPlan: makeArtifactPlan(input),
    approvalGate: {
      requiredBeforeExternalWrites: true,
      allowedWithoutApproval: ['read fixture input', 'generate script artifact', 'run local smoke command']
    }
  };
}

function renderMarkdown(script) {
  if (!script.ok) {
    return '# Demo script validation failed\n\n' + script.errors.map((error) => '- ' + error).join('\n') + '\n';
  }
  const beats = script.beats.map((beat) => '- ' + beat.startSecond + '-' + beat.endSecond + 's: **' + beat.label + '** - ' + beat.line).join('\n');
  const shots = script.shotList.map((shot) => '- ' + shot).join('\n');
  const checklist = script.checklist.map((item) => '- [ ] ' + item).join('\n');
  return '# ' + script.title + '\n\nAudience: ' + script.audience + '\nRuntime: ' + script.runtimeMinutes + ' minutes\n\n## Run Of Show\n\n' + beats + '\n\n## Shot List\n\n' + shots + '\n\n## Checklist\n\n' + checklist + '\n';
}

module.exports = { makeScript, readJson, renderMarkdown, toPositiveMinutes, validateDemoInput };
