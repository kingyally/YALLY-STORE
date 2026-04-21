#!/bin/bash

REPO="kingyally/YALLY-STORE"
BRANCH="main"
USERNAME="kingyally"

# Clear any git locks that might exist
rm -f /home/runner/workspace/.git/config.lock 2>/dev/null || true

# Configure git identity
git config --global user.email "seif83470@gmail.com"
git config --global user.name "YALLY BET Auto"
git config --global credential.helper ""

# Use username:token format (required for fine-grained PATs)
git remote remove github 2>/dev/null || true
git remote add github "https://${USERNAME}:${GITHUB_TOKEN}@github.com/${REPO}.git"

# Stage all changes
git add -A

# Commit if there are staged changes
if ! git diff --cached --quiet; then
  COMMIT_MSG="auto: mabadiliko $(date '+%Y-%m-%d %H:%M:%S')"
  git commit -m "$COMMIT_MSG"
  echo "[$(date '+%H:%M:%S')] Commit: $COMMIT_MSG"
fi

# Pull remote changes first (rebase to keep history linear) — handles
# the case where GitHub has commits we don't (e.g. from web edits or deploys).
GIT_TERMINAL_PROMPT=0 git fetch github ${BRANCH} 2>&1 | tail -3
GIT_TERMINAL_PROMPT=0 git pull --rebase --autostash github ${BRANCH} 2>&1 | tail -5 || {
  echo "[$(date '+%H:%M:%S')] Rebase imeshindwa, najaribu merge..."
  git rebase --abort 2>/dev/null || true
  GIT_TERMINAL_PROMPT=0 git pull --no-rebase --no-edit --strategy-option=theirs github ${BRANCH} 2>&1 | tail -5
}

# Push using environment variable for token
PUSH_OUTPUT=$(GIT_TERMINAL_PROMPT=0 git push github HEAD:${BRANCH} 2>&1)
PUSH_EXIT=$?

if [ $PUSH_EXIT -eq 0 ]; then
  echo "[$(date '+%H:%M:%S')] Imepushwa GitHub vizuri!"
  echo "$PUSH_OUTPUT"
else
  echo "[$(date '+%H:%M:%S')] Hitilafu (exit $PUSH_EXIT): $PUSH_OUTPUT"
fi
