#!/bin/bash

# Script para sincronizar el servidor con el repositorio Git
# Este script debe ejecutarse en el servidor

echo "===== SINCRONIZANDO CAMBIOS DESDE GIT ====="
echo "Fecha: $(date)"

# Variables
REPO_URL="https://github.com/USUARIO/llevateloexpress.com.git"  # Reemplaza con tu URL de GitHub
PROJECT_DIR="/var/www/llevateloexpress.com"
BRANCH="fix/dashboard-404"

# Entrar al directorio del proyecto
cd $PROJECT_DIR

# Verificar si el directorio es un repositorio Git
if [ ! -d ".git" ]; then
  echo "Error: El directorio $PROJECT_DIR no es un repositorio Git."
  echo "¿Deseas configurarlo como un repositorio Git? (s/n)"
  read SETUP_GIT
  
  if [ "$SETUP_GIT" = "s" ]; then
    echo "Configurando repositorio Git..."
    # Backup de archivos importantes
    mkdir -p backups/git_setup_$(date +%Y%m%d)
    cp -r frontend/src backups/git_setup_$(date +%Y%m%d)/frontend_src_backup
    
    # Inicializar Git
    git init
    git remote add origin $REPO_URL
    echo "Repositorio Git inicializado y configurado para usar $REPO_URL"
  else
    echo "Operación cancelada por el usuario."
    exit 1
  fi
fi

# Guardar cambios locales si existen
if [[ -n $(git status -s) ]]; then
  echo "Se encontraron cambios locales. Creando backup..."
  BACKUP_BRANCH="backup_$(date +%Y%m%d_%H%M%S)"
  git checkout -b $BACKUP_BRANCH
  git add .
  git commit -m "Backup automático antes de sincronizar con GitHub"
  git checkout $BRANCH 2>/dev/null || git checkout main
  echo "Cambios locales guardados en rama $BACKUP_BRANCH"
fi

# Obtener cambios del repositorio remoto
echo "Obteniendo cambios desde el repositorio remoto..."
git fetch origin

# Cambiar a la rama específica
echo "Cambiando a la rama $BRANCH..."
git checkout $BRANCH || (git checkout main && git checkout -b $BRANCH origin/$BRANCH)

# Aplicar cambios
echo "Aplicando cambios..."
git reset --hard origin/$BRANCH

# Reconstruir frontend
echo "Reconstruyendo aplicación frontend..."
cd $PROJECT_DIR/frontend
npm install
npm run build

# Reiniciar servicios
echo "Reiniciando servicios..."
systemctl restart llevateloexpress-frontend
systemctl restart nginx

# Verificar si el dashboard está accesible
sleep 5
HTTP_STATUS=$(curl -s -o /dev/null -w "%{http_code}" https://llevateloexpress.com/dashboard/)
if [ "$HTTP_STATUS" -eq 200 ]; then
  echo "✅ Dashboard accesible (HTTP 200)"
else
  echo "⚠️ Dashboard devuelve estado HTTP: $HTTP_STATUS"
fi

echo ""
echo "===== SINCRONIZACIÓN COMPLETADA ====="
echo "El dashboard debería estar disponible en:"
echo "https://llevateloexpress.com/dashboard/" 