#!/bin/bash

REPO="kingyally/YALLY-STORE"
BRANCH="main"

# Configure git with token
git config --global user.email "seif83470@gmail.com"
git config --global user.name "YALLY BET Auto"
git config --global push.default current

# Set remote with token
git remote remove github 2>/dev/null || true
git remote add github "https://${GITHUB_TOKEN}@github.com/${REPO}.git"

# Stage all changes
git add -A

# Check if there are changes to commit
if git diff --cached --quiet; then
  echo "[$(date '+%H:%M:%S')] Hakuna mabadiliko mapya."
else
  COMMIT_MSG="auto: mabadiliko $(date '+%Y-%m-%d %H:%M:%S')"
  git commit -m "$COMMIT_MSG"
  
  # Push to GitHub
  if git push github HEAD:${BRANCH} 2>&1; then
    echo "[$(date '+%H:%M:%S')] ✅ Imepushwa GitHub: $COMMIT_MSG"
  else
    # Try pushing with upstream set
    git push --set-upstream github ${BRANCH} 2>&1 || \
    git push github HEAD:${BRANCH} --force 2>&1
    echo "[$(date '+%H:%M:%S')] ✅ Imepushwa (first time)"
  fi
fi
