#!/bin/bash

# Script para sincronizar los cambios entre los directorios admin y dashboard

echo "===== SINCRONIZACIÓN ADMIN/DASHBOARD ====="
echo "Fecha: $(date)"

# Verificar si estamos en el directorio raíz del proyecto
if [ ! -d "frontend/src/app/admin" ]; then
  echo "Error: No se encuentra el directorio admin. Ejecuta este script desde el directorio raíz del proyecto."
  exit 1
fi

# Determinar el directorio desde el cual sincronizar
read -p "¿Sincronizar desde admin a dashboard (a->d) o desde dashboard a admin (d->a)? [a->d]: " DIRECTION
DIRECTION=${DIRECTION:-"a->d"}

if [ "$DIRECTION" = "a->d" ]; then
  SOURCE="admin"
  TARGET="dashboard"
elif [ "$DIRECTION" = "d->a" ]; then
  SOURCE="dashboard"
  TARGET="admin"
else
  echo "Opción no válida. Use 'a->d' o 'd->a'."
  exit 1
fi

echo "Sincronizando desde $SOURCE a $TARGET..."

# Crear directorio destino si no existe
mkdir -p "frontend/src/app/$TARGET"

# Copiar archivos, excluyendo node_modules si existiera
rsync -av --exclude 'node_modules' "frontend/src/app/$SOURCE/" "frontend/src/app/$TARGET/"

# Actualizar rutas en los archivos
echo "Actualizando referencias en los archivos..."

# Layout principal
if [ -f "frontend/src/app/$TARGET/layout.tsx" ]; then
  if [ "$TARGET" = "dashboard" ]; then
    sed -i "" 's|LlévateloExpress Admin|LlévateloExpress Dashboard|g' "frontend/src/app/$TARGET/layout.tsx"
    sed -i "" 's|path: .*/admin/|path: "/dashboard/|g' "frontend/src/app/$TARGET/layout.tsx"
    sed -i "" 's|path: .*/admin"|path: "/dashboard"|g' "frontend/src/app/$TARGET/layout.tsx"
  else
    sed -i "" 's|LlévateloExpress Dashboard|LlévateloExpress Admin|g' "frontend/src/app/$TARGET/layout.tsx"
    sed -i "" 's|path: .*/dashboard/|path: "/admin/|g' "frontend/src/app/$TARGET/layout.tsx"
    sed -i "" 's|path: .*/dashboard"|path: "/admin"|g' "frontend/src/app/$TARGET/layout.tsx"
  fi
  echo "  ✓ layout.tsx actualizado"
else
  echo "  ✗ Error: No se encuentra layout.tsx"
fi

# Página principal
if [ -f "frontend/src/app/$TARGET/page.tsx" ]; then
  if [ "$TARGET" = "dashboard" ]; then
    sed -i "" 's|href = .*/admin/|href = "/dashboard/|g' "frontend/src/app/$TARGET/page.tsx"
  else
    sed -i "" 's|href = .*/dashboard/|href = "/admin/|g' "frontend/src/app/$TARGET/page.tsx"
  fi
  echo "  ✓ page.tsx actualizado"
else
  echo "  ✗ Error: No se encuentra page.tsx"
fi

# Otros archivos
find "frontend/src/app/$TARGET" -type f -name "*.tsx" | while read file; do
  if [ "$TARGET" = "dashboard" ]; then
    sed -i "" 's|router.push(.*/admin/|router.push("/dashboard/|g' "$file"
  else
    sed -i "" 's|router.push(.*/dashboard/|router.push("/admin/|g' "$file"
  fi
done

echo "Sincronización completada."
echo "Recuerda reconstruir la aplicación para aplicar los cambios:"
echo "  cd frontend && npm run build" 