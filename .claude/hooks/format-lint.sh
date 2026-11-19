#!/usr/bin/env bash
# PostToolUse (Edit/Write): formata com Prettier e roda o ESLint no arquivo editado.
# Erros de lint saem com código 2: o Claude Code devolve a mensagem ao agente para corrigir.
set -u
file=$(jq -r '.tool_response.filePath // .tool_input.file_path // empty')
case "$file" in
  *.ts|*.tsx|*.js|*.jsx) ;;
  *) exit 0 ;;
esac
root="${CLAUDE_PROJECT_DIR:-$(pwd)}"
case "$file" in
  "$root"/node_modules/*|"$root"/ios/*|"$root"/android/*) exit 0 ;;
esac
[ -f "$file" ] || exit 0
cd "$root" || exit 0

./node_modules/.bin/prettier --write --log-level warn "$file" >/dev/null 2>&1

if ! out=$(./node_modules/.bin/eslint --quiet "$file" 2>&1); then
  echo "ESLint encontrou erros em ${file#"$root"/}:" >&2
  echo "$out" >&2
  exit 2
fi
exit 0
