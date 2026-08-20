#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
VERSION="${1:-0.0.3-beta}"
OUT="$ROOT/vendor/sue-design-web-react"
TMP="$(mktemp -d)"

cleanup() { rm -rf "$TMP"; rm -f "$ROOT/sue-design-web-react-${VERSION}.tgz"; }
trap cleanup EXIT

cd "$ROOT"
npm pack "@sue/design-web-react@${VERSION}" -s
tar -xzf "sue-design-web-react-${VERSION}.tgz" -C "$TMP"
rm -rf "$OUT"
mv "$TMP/package" "$OUT"

node -e "
const fs = require('fs');
const pkgPath = process.argv[1];
const p = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));
const versions = {
  dayjs: '^1.11.13',
  '@ant-design/colors': '^8.0.1',
  '@ant-design/fast-color': '^3.0.1',
};
for (const [k, v] of Object.entries(p.dependencies || {})) {
  if (String(v).startsWith('catalog:')) {
    if (!versions[k]) throw new Error('missing mapping for ' + k + '=' + v);
    p.dependencies[k] = versions[k];
    console.log('patched ' + k + ' -> ' + versions[k]);
  }
}
fs.writeFileSync(pkgPath, JSON.stringify(p, null, 2) + '\n');
" "$OUT/package.json"

echo "Vendored to $OUT"
