#!/bin/bash

# Script para desplegar los cambios del dashboard en producción

echo "===== DESPLIEGUE DE CORRECCIÓN DASHBOARD ====="
echo "Fecha: $(date)"

# Constantes
SERVER_USER="root"
SERVER_IP="203.161.55.87"
PROJECT_DIR="/var/www/llevateloexpress.com"

# 1. Confirmar cambios en git si no están confirmados
echo "Paso 1: Preparando cambios para el despliegue..."

# Verificar si hay cambios sin confirmar
if [[ $(git status --porcelain | grep -E 'frontend/src/app/dashboard|sync_admin_dashboard.sh|DASHBOARD_FIX.md|nginx_dashboard_config.conf') ]]; then
  echo "  → Añadiendo archivos modificados a Git..."
  git add frontend/src/app/dashboard/ sync_admin_dashboard.sh DASHBOARD_FIX.md nginx_dashboard_config.conf
  
  echo "  → Confirmando cambios..."
  git commit -m "Fix: Añadir ruta /dashboard y sincronizar con /admin"
  
  echo "  → Subiendo cambios a la rama remota..."
  git push origin $(git branch --show-current)
  
  echo "  ✓ Cambios confirmados y subidos a Git"
else
  echo "  ✓ No hay cambios pendientes para confirmar"
fi

# 2. Desplegar en el servidor
echo "Paso 2: Desplegando cambios en el servidor..."

# Crear script temporal para ejecutar en el servidor
cat > /tmp/server_deploy.sh << 'EOF'
#!/bin/bash

# Script que se ejecutará en el servidor

echo "===== ACTUALIZANDO PROYECTO EN SERVIDOR ====="
echo "Fecha: $(date)"

PROJECT_DIR="/var/www/llevateloexpress.com"

# Entrar al directorio del proyecto
cd $PROJECT_DIR

# Hacer backup de archivos importantes
echo "Haciendo backup de configuración y archivos críticos..."
mkdir -p backups/$(date +%Y%m%d)
cp -r frontend/src/app/admin backups/$(date +%Y%m%d)/admin_backup
cp /etc/nginx/sites-available/llevateloexpress backups/$(date +%Y%m%d)/nginx_config_backup

# Actualizar desde git
echo "Actualizando código desde repositorio..."
git fetch
git checkout -f fix/dashboard-404
echo "  ✓ Actualización completada"

# Reconstruir frontend
echo "Reconstruyendo aplicación frontend..."
cd $PROJECT_DIR/frontend
npm install
npm run build
echo "  ✓ Reconstrucción completada"

# Reiniciar servicios
echo "Reiniciando servicios..."
systemctl restart llevateloexpress-frontend
systemctl restart nginx
echo "  ✓ Servicios reiniciados"

echo "===== DESPLIEGUE COMPLETADO ====="
echo "El dashboard debería estar disponible ahora en:"
echo "https://llevateloexpress.com/dashboard/"
EOF

# Enviar script al servidor
echo "  → Enviando script al servidor..."
scp /tmp/server_deploy.sh $SERVER_USER@$SERVER_IP:/tmp/server_deploy.sh

# Ejecutar script en el servidor
echo "  → Ejecutando script en el servidor..."
ssh $SERVER_USER@$SERVER_IP "chmod +x /tmp/server_deploy.sh && /tmp/server_deploy.sh"

echo ""
echo "===== DESPLIEGUE COMPLETADO ====="
echo "Visita https://llevateloexpress.com/dashboard/ para verificar que todo funciona correctamente." 