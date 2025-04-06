#!/bin/bash

# Script para sincronizar automáticamente los repositorios
# Uso: ./sync_repos.sh [mensaje-commit]

# Valores por defecto
COMMIT_MSG=${1:-"Actualización automática de sincronización"}
BRANCH="main"

echo "🔄 Iniciando sincronización de repositorios..."

# 1. Asegurar que estamos en la rama principal
git checkout $BRANCH

# 2. Obtener cambios remotos
echo "📥 Obteniendo cambios remotos..."
git fetch origin
git fetch vps

# 3. Verificar cambios locales
if [[ -n $(git status -s) ]]; then
    echo "💾 Guardando cambios locales..."
    git add -A
    git commit -m "$COMMIT_MSG"
fi

# 4. Verificar si hay cambios en GitHub que necesitan ser incorporados
LOCAL=$(git rev-parse HEAD)
REMOTE=$(git rev-parse origin/$BRANCH)

if [ "$LOCAL" != "$REMOTE" ]; then
    echo "🔀 Incorporando cambios de GitHub..."
    git pull origin $BRANCH
fi

# 5. Enviar cambios a GitHub
echo "📤 Enviando cambios a GitHub..."
git push origin $BRANCH

# 6. Sincronizar con el VPS
echo "🖥️ Sincronizando con el VPS..."
ssh root@llevateloexpress.com "cd /var/www/llevateloexpress.com && git fetch origin && git reset --hard origin/$BRANCH"

# 7. Verificar que todos los repositorios están sincronizados
echo "✅ Verificando sincronización..."
LOCAL=$(git rev-parse HEAD)
GITHUB=$(git rev-parse origin/$BRANCH)
VPS=$(ssh root@llevateloexpress.com "cd /var/www/llevateloexpress.com && git rev-parse HEAD")

echo "📋 Estado final:"
echo "Local: $LOCAL"
echo "GitHub: $GITHUB"
echo "VPS: $VPS"

if [ "$LOCAL" = "$GITHUB" ] && [ "$GITHUB" = "$VPS" ]; then
    echo "✨ ¡Sincronización completa! Todos los repositorios están alineados."
else
    echo "⚠️ ¡Alerta! Los repositorios no están completamente sincronizados."
fi 