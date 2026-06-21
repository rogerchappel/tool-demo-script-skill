#!/usr/bin/env bash
set -euo pipefail
npm test
npm run check
npm run build
node bin/tool-demo-script.js fixtures/repo-card.json >/tmp/tool-demo-script-skill-smoke.json
node -e "JSON.parse(require('fs').readFileSync('/tmp/tool-demo-script-skill-smoke.json','utf8')); console.log('smoke json ok')"
