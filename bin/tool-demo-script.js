#!/usr/bin/env node
const { makeScript, readJson } = require('../src');

function main(argv) {
  const file = argv[2];
  if (!file || argv.includes('--help')) {
    console.log('Usage: tool-demo-script <fixture.json>');
    process.exit(file ? 0 : 1);
  }
  const minutesArg = argv.find((arg) => arg.startsWith('--minutes='));
  const minutes = minutesArg ? minutesArg.split('=')[1] : undefined;
  const execute = argv.includes('--execute');
  const result = makeScript(readJson(file), { minutes, execute });
  console.log(JSON.stringify(result, null, 2));
}

main(process.argv);
