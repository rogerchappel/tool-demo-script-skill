#!/usr/bin/env node
const { makeScript, readJson, renderMarkdown } = require('../src');
const { version } = require('../package.json');

const usage = [
  'Usage: tool-demo-script [options] <fixture.json>',
  '',
  'Options:',
  '  --minutes=N             Target runtime, clamped from 1 to 15 minutes',
  '  --format=json|markdown  Output JSON by default or Markdown for review',
  '  --version               Print the package version',
  '  --help                  Show this help'
].join('\n');

function fail(message) {
  console.error(message);
  process.exit(1);
}

function parseArguments(args) {
  const options = { format: 'json' };
  let file;

  for (const arg of args) {
    if (arg.startsWith('--minutes=')) {
      const value = arg.slice('--minutes='.length);
      if (!value) fail('Malformed option "' + arg + '". Expected --minutes=N.');
      options.minutes = value;
    } else if (arg.startsWith('--format=')) {
      const value = arg.slice('--format='.length);
      if (!value) fail('Malformed option "' + arg + '". Expected --format=json|markdown.');
      options.format = value;
    } else if (arg === '--minutes' || arg === '--format') {
      fail('Malformed option "' + arg + '". Options require an = value.');
    } else if (arg.startsWith('-')) {
      fail('Unknown option "' + arg + '".');
    } else if (file) {
      fail('Unexpected positional argument "' + arg + '". Provide exactly one fixture.');
    } else {
      file = arg;
    }
  }

  return { file, ...options };
}

function main(argv) {
  if (argv.includes('--version')) {
    console.log(version);
    process.exit(0);
  }

  if (argv.includes('--help')) {
    console.log(usage);
    process.exit(0);
  }

  const { file, minutes, format } = parseArguments(argv.slice(2));
  if (!file) {
    console.log(usage);
    process.exit(1);
  }
  if (!['json', 'markdown'].includes(format)) {
    fail('Unsupported format "' + format + '". Use json or markdown.');
  }

  let input;
  try {
    input = readJson(file);
  } catch (error) {
    if (error instanceof SyntaxError) {
      fail('Fixture "' + file + '" contains invalid JSON.');
    }
    fail('Could not read fixture "' + file + '": ' + error.message);
  }

  let result;
  try {
    result = makeScript(input, { minutes });
  } catch (error) {
    fail(error.message);
  }
  if (format === 'markdown') {
    console.log(renderMarkdown(result));
  } else {
    console.log(JSON.stringify(result, null, 2));
  }
  process.exit(result.ok === false ? 2 : 0);
}

main(process.argv);
