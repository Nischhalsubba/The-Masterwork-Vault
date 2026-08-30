# Production Deployment Policy

## Goal
Preserve Netlify free-tier usage by making production deploys deliberate, batched, and predictable.

## Rules
- `main` is the only branch eligible for production deployment.
- Pull requests and non-main branches are ignored before the real build runs.
- Normal commits and merges to `main` are also ignored.
- Production deploys only when the latest `main` commit message contains `[deploy]`.
- Batch and validate changes before releasing.
- Never trigger a second manual/API deploy after a Git-triggered release.

## Release
```bash
git commit --allow-empty -m "release: production [deploy]"
git push origin main
```

The release commit publishes the full accumulated `main` state.

## Normal work
Commits without `[deploy]` remain in `main` but do not consume a Netlify production build/deploy.

## Recovery
Prefer an existing deployment/rollback over rebuilding. Use a new `[deploy]` release only when new code must be published.
