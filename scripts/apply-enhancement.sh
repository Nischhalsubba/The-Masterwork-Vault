#!/usr/bin/env bash
set -euo pipefail
repo=${1:-.}
root=$(cd "$(dirname "$0")/.." && pwd)
mkdir -p "$repo/src/components" "$repo/src/domain" "$repo/src/design" "$repo/scripts" "$repo/tests" "$repo/.github/workflows"
for path in \
  src/components/AmbientVault.tsx \
  src/components/CommandPalette.tsx \
  src/components/CompareWorkbench.tsx \
  src/components/DataHealthPage.tsx \
  src/components/ErrorBoundary.tsx \
  src/components/OverlayDialog.tsx \
  src/components/ReadinessPage.tsx \
  src/design/masterworkDesignDNA.ts \
  src/domain/playerState.ts \
  src/domain/professionMath.ts \
  src/domain/readiness.ts \
  src/domain/verification.ts \
  src/main.tsx src/masterwork-next.css src/types.ts \
  scripts/verify-domain-math.mjs scripts/verify-knowledge.mjs \
  tests/next-level.spec.ts .github/workflows/quality.yml netlify.toml package.json; do
  cp "$root/$path" "$repo/$path"
done
printf 'Enhancement files applied to %s\n' "$repo"
