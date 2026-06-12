#!/usr/bin/env bash
# (Re)install version-controlled git hooks as symlinks into .git/hooks.
# Only manages pre-commit — graphify owns post-commit/post-checkout
# (reinstall those with: graphify hook install).
set -e

cd "$(git rev-parse --show-toplevel)"
ln -sf ../../scripts/pre-commit .git/hooks/pre-commit
echo "pre-commit hook installed (-> scripts/pre-commit)."
