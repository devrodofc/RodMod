#!/usr/bin/env bash

set -e

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
SOURCE="$ROOT/shared/rodmod-mystera.js"

echo "=== RodMod Sync ==="
echo

echo "[1/3] Validando JavaScript..."
node --check "$SOURCE"
echo "OK: sintaxe válida"

echo
echo "[2/3] Sincronizando plataformas..."

cp "$SOURCE" "$ROOT/android/decoded/assets/www/rodmod-mystera.js"
echo "OK: Android"

cp "$SOURCE" "$ROOT/chrome/rodmod-mystera.js"
echo "OK: Chrome"

cp "$SOURCE" "$ROOT/firefox/rodmod-mystera.js"
echo "OK: Firefox"

cp "$SOURCE" "$ROOT/ios/www/rodmod-mystera.js"
echo "OK: iOS"

echo
echo "[3/3] Conferindo arquivos..."

for arquivo in \
  "$ROOT/android/decoded/assets/www/rodmod-mystera.js" \
  "$ROOT/chrome/rodmod-mystera.js" \
  "$ROOT/firefox/rodmod-mystera.js" \
  "$ROOT/ios/www/rodmod-mystera.js"
do
  if ! cmp -s "$SOURCE" "$arquivo"; then
    echo "ERRO: $arquivo ficou diferente do shared."
    exit 1
  fi
done

echo
echo "Tudo sincronizado com sucesso."
