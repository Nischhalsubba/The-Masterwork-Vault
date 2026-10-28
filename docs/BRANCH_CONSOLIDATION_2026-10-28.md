# Branch history consolidation — October 28, 2026

## Scope and safety
Requested cleanup of all non-default branches, preserving the working Masterwork V4 app.

At the time of inventory: **38 branch refs** (1 `main`, 37 non-main).
- **21 historical branches** are already fully reachable from the existing `main` history.
- **16 divergent branches**, listed below, have unique Git ancestry. Some were previously squash-merged, others contain older experiments and old paths incompatible with the current app.

This reconciliation uses a **history-only merge**: each divergent branch head is recorded as an additional parent of a merge commit, while the working tree is taken from the already reviewed `main` and this audit file. Thus all old commits remain recoverable in Git after deletion of their branch refs, but **obsolete versions of files are not activated or blindly copied over newer code**. Do not misrepresent this as each historical source variant being included in the current app.

Earlier PRs #48, #54–58, #64, #67, #69 and #70 were already reviewed/merged and validated. PR #70's six head CI workflows were all successful before its merge.

## Divergent branch heads incorporated in history

| Branch | Historical head SHA |
| --- | --- |
| `agent/full-e2e-seo-fixes` | `5b15cbdaa426cc9bc4dbd0b925f9b3c9c7e375b7` |
| `agent/modern-masterwork-progression` | `fc7eb08fbbb9fb39ed074933684bb601d8869e5e` |
| `agent/unified-crafting-knowledge-pool` | `a9bb1e99feb17243225f418973c874210a3474f6` |
| `chore/netlify-policy-guard` | `3239b86eb876928a600c9dbf0bd8798e1e70f423` |
| `chore/2026-security-baseline` | `999a5898b669f455adf2828d853cce4e52592fff` |
| `dependabot/github_actions/actions/setup-node-7.1.0` | `faf7b217f50b5870068c81e089937310dc8c409e` |
| `feat/design-system-density` | `12afd374553ac8f46875417eb40ce4d5119a8e85` |
| `feat/masterwork-completion-pass` | `3d3ef548fc0adc0f7d34da374f26f5502947641c` |
| `feat/purposeful-app-redesign` | `f496e8560e1152ea9b847a8e3f1ea26c8feb6e1d` |
| `feature/ui-revamp-completion` | `34e5fa8e6f63c5a4800b6438efd8ce68a21106a3` |
| `fix/complete-masterwork-backlog` | `bccb4a73b4536f8d9b605cafcd5771c73191fa33` |
| `fix/crux-field-data-reliability-20261028` | `cdc2125a26750c3a179b88ab093162f665b55cf5` |
| `fix/local-neverwinter-icons` | `083c7257a4144d20e085168c714780647ff518f2` |
| `fix/mobile-lcp-seo-hardening-20261028` | `8048a0abcb0e7c39a590643d3cee10c72fe9abc2` |
| `fix/potion-raw-material-icons` | `d2c17cf93fe93bc78d07b8226f100a07cc5957d6` |
| `fix/visual-consistency-audit-20261028` | `eb1f0ce4fe885b6adf8bd5607a8c388b19fe9725` |

## Final cleanup gate

Delete a branch ref only after confirming that its exact tip is an ancestor of the current `main`. Never delete `main` or delete a branch with unpreserved commits. Preserve this audit and the multi-parent merge commit as the recovery path.

**Important:** This is historical consolidation. Product feature completeness, Neverwinter data correctness, current Search Console ownership, and mobile Core Web Vitals are separate from Git branch cleanup.
