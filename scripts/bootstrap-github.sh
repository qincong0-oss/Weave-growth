#!/usr/bin/env bash
set -euo pipefail
project_root="$(cd "$(dirname "$0")/.." && pwd)"
cd "$project_root"
command -v gh >/dev/null || { echo 'Install GitHub CLI and run gh auth login first.'; exit 1; }
actual_login="$(gh api user --jq .login)"
expected_login='qincong0-oss'
repository='qincong0-oss/weave-growth'
if [ "$actual_login" != "$expected_login" ]; then
  echo "Expected GitHub account $expected_login. Current account is $actual_login."
  exit 1
fi
npm test
npm run build
if [ ! -d .git ] && [ ! -f .git ]; then
  git init -b main
  git add .
  git -c user.name='Weave project setup' -c user.email='weave-local@localhost' commit -m 'Create continuous presales demo and shared project context'
fi
if gh repo view "$repository" >/dev/null 2>&1; then
  echo 'Repository already exists. No existing remote or repository was modified.'
  echo 'Ask the coordinator to review the target repository before pushing.'
  exit 1
fi
gh repo create "$repository" --private --description 'Weave textile presales demo and shared project context' --source=. --remote=origin --push
gh api --method PUT "repos/$repository/collaborators/0xrelander" -f permission=push --silent
echo "Created https://github.com/$repository and submitted the collaborator invitation to 0xrelander."
echo 'The recipient must accept. Pages publication and required review rules are not enabled by this script.'
