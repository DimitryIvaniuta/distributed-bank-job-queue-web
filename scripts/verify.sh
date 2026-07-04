#!/usr/bin/env sh
set -eu

npm ci --ignore-scripts
npm run audit
npm run audit:all
npm run validate
npm run --silent sbom > sbom.cdx.json
npx playwright test --list
