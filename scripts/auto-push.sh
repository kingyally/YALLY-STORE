#!/bin/bash

REPO="kingyally/YALLY-STORE"
BRANCH="main"

# Configure git with token
git config --global user.email "seif83470@gmail.com"
git config --global user.name "YALLY BET Auto"
git config --global push.default current

# Set remote with new token
git remote remove github 2>/dev/null || true
git remote add github "https://${GITHUB_TOKEN}@github.com/${REPO}.git"

# Stage all new changes
git add -A

# Commit if there are staged changes
if ! git diff --cached --quiet; then
  COMMIT_MSG="auto: mabadiliko $(date '+%Y-%m-%d %H:%M:%S')"
  git commit -m "$COMMIT_MSG"
  echo "[$(date '+%H:%M:%S')] Commit mpya: $COMMIT_MSG"
fi

# Always try to push (handles both new commits and unpushed old commits)
UNPUSHED=$(git log github/${BRANCH}..HEAD --oneline 2>/dev/null | wc -l)
if [ "$UNPUSHED" -gt "0" ] 2>/dev/null || ! git ls-remote --exit-code github ${BRANCH} >/dev/null 2>&1; then
  if git push github HEAD:${BRANCH} 2>&1; then
    echo "[$(date '+%H:%M:%S')] Imepushwa GitHub vizuri!"
  else
    echo "[$(date '+%H:%M:%S')] Hitilafu ya push - angalia token yako"
  fi
else
  echo "[$(date '+%H:%M:%S')] Hakuna mabadiliko mapya ya kupush."
fi
