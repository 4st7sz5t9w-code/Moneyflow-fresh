#!/usr/bin/env bash
set -euo pipefail
OUT=".vercel/output/static"
rm -rf .vercel/output
mkdir -p "$OUT"
for f in index.html app-clean.js app-clean.css moneyflow-enhancements.js moneyflow-design.css moneyflow-pro.css moneyflow-pro.js manifest.webmanifest icon-512.png icon-180.png apple-touch-icon.png sw.js; do
  test -f "$f" && cp "$f" "$OUT/"
done
printf '{"version":3,"routes":[{"handle":"filesystem"}]}' > .vercel/output/config.json
