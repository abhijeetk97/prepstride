#!/usr/bin/env bash
# Build & publish PrepStride to GitHub Pages via the gh-pages branch (no CI needed).
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

if [ ! -d dist ]; then
  echo "dist/ not found — run 'npm run build' first." >&2
  exit 1
fi

REPO_URL="$(git remote get-url origin)"
TMP="$(mktemp -d)"
trap 'rm -rf "$TMP"' EXIT

git clone --quiet "$REPO_URL" "$TMP"
cd "$TMP"
git checkout --quiet gh-pages
# Replace branch content with the fresh build
find . -mindepth 1 -maxdepth 1 ! -name '.git' -exec rm -rf {} +
cp -R "$ROOT/dist/." .
touch .nojekyll
git add -A
git commit --quiet --allow-empty -m "deploy: $(date -u +%Y-%m-%dT%H:%M:%SZ)"
git push --quiet origin gh-pages

echo "✅ Deployed to GitHub Pages"
