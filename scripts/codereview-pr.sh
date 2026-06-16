#!/usr/bin/env bash
# Creates a PR from dev→main to trigger CodeRabbit review
# Usage: bash scripts/codereview-pr.sh
#
# Workflow:
#   dev (working branch) → PR → main (protected, org codebase)
#   CodeRabbit reviews all files on every PR (changed_files_only: false)

set -e

BRANCH="dev"

echo "Pushing latest dev branch..."
git push origin dev

echo "Creating PR from dev → main..."
gh pr create \
  --base main \
  --head dev \
  --title "$1" \
  --body "$2" \
  --label "review"

echo "PR created! CodeRabbit will review all files."
