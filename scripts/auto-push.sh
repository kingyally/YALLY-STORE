#!/bin/bash

REPO="kingyally/YALLY-STORE"
BRANCH="main"

# Configure git identity
git config --global user.email "seif83470@gmail.com"
git config --global user.name "YALLY BET Auto"

# Use correct format for fine-grained PAT authentication
git remote remove github 2>/dev/null || true
git remote add github "https://oauth2:${GITHUB_TOKEN}@github.com/${REPO}.git"

# Stage all changes
git add -A

# Commit if there are staged changes
if ! git diff --cached --quiet; then
  COMMIT_MSG="auto: mabadiliko $(date '+%Y-%m-%d %H:%M:%S')"
  git commit -m "$COMMIT_MSG"
  echo "[$(date '+%H:%M:%S')] Commit: $COMMIT_MSG"
fi

# Push to GitHub
PUSH_RESULT=$(git push github HEAD:${BRANCH} 2>&1)
if echo "$PUSH_RESULT" | grep -q "Everything up-to-date\|HEAD -> main\| -> main"; then
  echo "[$(date '+%H:%M:%S')] Imepushwa GitHub vizuri!"
elif echo "$PUSH_RESULT" | grep -q "rejected\|error\|403\|Permission"; then
  # Try alternate format
  git remote remove github 2>/dev/null || true
  git remote add github "https://x-token-auth:${GITHUB_TOKEN}@github.com/${REPO}.git"
  PUSH_RESULT2=$(git push github HEAD:${BRANCH} 2>&1)
  if echo "$PUSH_RESULT2" | grep -q "error\|403\|Permission"; then
    echo "[$(date '+%H:%M:%S')] Bado hitilafu: $PUSH_RESULT2"
  else
    echo "[$(date '+%H:%M:%S')] Imepushwa GitHub vizuri!"
  fi
else
  echo "[$(date '+%H:%M:%S')] $PUSH_RESULT"
fi
