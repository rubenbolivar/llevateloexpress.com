#!/bin/bash

# Script para actualizar el código desde GitHub sin afectar archivos sensibles

echo "===== DESPLIEGE DESDE GITHUB ====="
echo "Fecha: $(date)"

# 1. Guardar cambios locales no comprometidos (si existen)
if [[ -n $(git status -s | grep -v "\.env") ]]; then
  echo "Se encontraron cambios locales no relacionados con archivos sensibles."
  echo "Guardando en stash..."
  git stash save "Cambios automáticos antes de despliegue - $(date)"
fi

# 2. Obtener los últimos cambios
echo "Obteniendo últimos cambios de GitHub..."
git fetch origin

# 3. Resetear a la versión remota, pero mantener archivos ignorados
echo "Aplicando cambios..."
git reset --hard origin/main

# 4. Restaurar cambios locales si existían
if [[ -n $(git stash list | head -n 1) && $(git stash list | head -n 1) == *"Cambios automáticos antes de despliegue"* ]]; then
  echo "Restaurando cambios locales..."
  git stash pop
fi

# 5. Reconstruir frontend
echo "Reconstruyendo aplicación frontend..."
cd frontend
npm install
npm run build

# 6. Reiniciar servicios
echo "Reiniciando servicios..."
systemctl restart llevateloexpress-frontend
systemctl restart nginx

echo ""
echo "===== DESPLIEGE COMPLETADO ====="
echo "La aplicación debería estar actualizada y funcionando."
