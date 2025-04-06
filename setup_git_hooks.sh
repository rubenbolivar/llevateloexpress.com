#!/bin/bash
# Script para configurar los Git Hooks de sincronización automática

echo "🔄 Configurando Git Hooks para sincronización automática..."

# Crear directorio de hooks si no existe
if [ ! -d ".git/hooks" ]; then
    mkdir -p .git/hooks
fi

# Crear hook post-commit
cat > .git/hooks/post-commit << 'EOL'
#!/bin/bash
# Hook post-commit para sincronizar automáticamente todos los repositorios

echo "🔄 Iniciando sincronización automática tras commit..."

# Obtener la rama actual
BRANCH=$(git symbolic-ref --short HEAD)

# Solo sincronizar si estamos en la rama principal
if [ "$BRANCH" = "main" ]; then
    # 1. Enviar el commit a GitHub
    echo "📤 Enviando a GitHub..."
    git push origin $BRANCH
    
    if [ $? -ne 0 ]; then
        echo "❌ Error al enviar a GitHub. Verifica tu conexión o permisos."
        exit 1
    fi
    
    # 2. Sincronizar con el VPS
    echo "🖥️ Sincronizando con el VPS..."
    ssh root@llevateloexpress.com "cd /var/www/llevateloexpress.com && git fetch origin && git reset --hard origin/$BRANCH"
    
    if [ $? -ne 0 ]; then
        echo "❌ Error al sincronizar con el VPS. Verifica la conexión SSH."
        exit 1
    fi
    
    # 3. Verificar que todos estén sincronizados
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
        exit 1
    fi
else
    echo "ℹ️ No se realizó sincronización automática porque no estás en la rama main."
    echo "ℹ️ Rama actual: $BRANCH"
fi
EOL

# Crear hook pre-push
cat > .git/hooks/pre-push << 'EOL'
#!/bin/bash
# Hook pre-push para verificar archivos críticos antes de enviar cambios

echo "🔍 Verificando archivos críticos antes de enviar cambios..."

# Lista de archivos críticos desde CRITICAL_FILES.md
CRITICAL_FILES=(
  "backend/llevateloexpress/settings.py"
  "frontend/src/app/dashboard/"
  "deploy.sh"
  "nginx_fix.conf"
)

# Obtener los archivos que han cambiado
CHANGED_FILES=$(git diff --name-only HEAD@{1} HEAD)

# Buscar si hay archivos críticos entre los cambios
CRITICAL_CHANGES=0
for file in "${CRITICAL_FILES[@]}"; do
  if echo "$CHANGED_FILES" | grep -q "$file"; then
    echo "⚠️ Archivo crítico modificado: $file"
    CRITICAL_CHANGES=$((CRITICAL_CHANGES + 1))
  fi
done

# Si hay archivos críticos modificados, solicitar confirmación
if [ $CRITICAL_CHANGES -gt 0 ]; then
  echo "⚠️ Se han detectado cambios en $CRITICAL_CHANGES archivo(s) crítico(s)."
  echo "⚠️ Estos archivos son importantes para el funcionamiento del sistema."
  echo "⚠️ Asegúrate de que los cambios sean intencionados y no afecten la funcionalidad."
  
  # No bloqueamos el push, pero mostramos una advertencia clara
  echo ""
  echo "✅ Los cambios serán enviados, pero verifica que todo funcione correctamente después del despliegue."
  echo "✅ Especialmente comprueba las rutas /admin/ y /dashboard/ en el VPS."
fi

exit 0
EOL

# Hacer ejecutables los hooks
chmod +x .git/hooks/post-commit
chmod +x .git/hooks/pre-push

echo "✅ Git Hooks configurados correctamente."
echo "🚀 A partir de ahora, cada commit en la rama main será automáticamente sincronizado con GitHub y el VPS."
echo "⚠️ Asegúrate de tener acceso SSH configurado al VPS para que la sincronización funcione correctamente." 