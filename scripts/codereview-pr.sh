#!/usr/bin/env bash
# Creates a PR to trigger CodeRabbit full codebase review
# Usage: bash scripts/codereview-pr.sh

set -e

BRANCH="codereview/initial-scan-$(date +%s)"

git checkout -b "$BRANCH"
git commit --allow-empty -m "ci: trigger full codebase review"
git push origin "$BRANCH"

gh pr create \
  --base main \
  --head "$BRANCH" \
  --title "Full codebase review" \
  --body "Triggering CodeRabbit to review the entire codebase." \
  --label "review"

echo "PR created! CodeRabbit will review all files."
echo "After review is done, close the PR without merging:"
echo "  gh pr close $BRANCH"
echo "  git checkout main && git branch -D $BRANCH"
