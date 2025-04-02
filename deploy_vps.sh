#!/bin/bash

# Script para actualizar el código y reiniciar servicios
# Colocar este script en el servidor y configurarlo para ejecutarse con cada push a GitHub

echo "===== INICIANDO ACTUALIZACIÓN DE LLEVATELOEXPRESS ====="
echo "Fecha: $(date)"

# Ir al directorio del proyecto
cd /var/www/llevateloexpress.com

# Detener servicios
echo "Deteniendo servicios..."
systemctl stop llevateloexpress-backend llevateloexpress-frontend

# Hacer backup de .env por seguridad
echo "Haciendo backup de archivos de configuración..."
cp backend/.env backend/.env.backup

# Extraer los cambios del repositorio
echo "Actualizando código desde GitHub..."
git fetch --all
git reset --hard origin/main

# Restaurar .env si se sobrescribió
echo "Restaurando archivos de configuración..."
cp backend/.env.backup backend/.env

# Configurar correctamente las variables de entorno
echo "Configurando .env con las variables correctas..."
sed -i 's/DEBUG=True/DEBUG=False/g' backend/.env
sed -i 's/ALLOWED_HOSTS=.*/ALLOWED_HOSTS=llevateloexpress.com,www.llevateloexpress.com,203.161.55.87,localhost,127.0.0.1/g' backend/.env
sed -i 's/CORS_ALLOWED_ORIGINS=.*/CORS_ALLOWED_ORIGINS=https:\/\/llevateloexpress.com,https:\/\/www.llevateloexpress.com/g' backend/.env

# Asegúrate de que el archivo .env tenga las variables correctas para la base de datos
echo "Verificando configuración de base de datos..."
if ! grep -q "DB_NAME=" backend/.env; then
    echo "DB_NAME=llevateloexpress" >> backend/.env
    echo "DB_USER=postgres" >> backend/.env
    echo "DB_PASSWORD=1SimonBolivar\$\$77" >> backend/.env
    echo "DB_HOST=localhost" >> backend/.env
    echo "DB_PORT=5432" >> backend/.env
fi

# Actualizar dependencias del backend
echo "Actualizando dependencias del backend..."
cd backend
source venv/bin/activate
pip install -r requirements.txt
python manage.py migrate
python manage.py collectstatic --noinput
cd ..

# Actualizar dependencias del frontend
echo "Actualizando dependencias del frontend..."
cd frontend
npm install
npm run build
cd ..

# Corregir la configuración de Nginx para el panel de admin
echo "Actualizando configuración de Nginx..."
cat > /etc/nginx/sites-available/llevateloexpress << 'EOL'
server {
    server_name llevateloexpress.com www.llevateloexpress.com;
    
    # Configuración para el admin de Django - DEBE IR PRIMERO
    location /admin/ {
        proxy_pass http://127.0.0.1:8000/admin/;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        # Configuración adicional para CSRF
        proxy_set_header X-CSRFToken $http_x_csrftoken;
        # Configuración para evitar problemas con cookies
        proxy_cookie_path / /;
    }
    
    # Para los estáticos del admin
    location /static/admin/ {
        alias /var/www/llevateloexpress.com/backend/static/admin/;
    }
    
    # Configuración para la API backend
    location /api {
        proxy_pass http://127.0.0.1:8000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
    
    # Configuración para archivos estáticos y media
    location /media {
        alias /var/www/llevateloexpress.com/backend/media;
    }
    
    location /static {
        alias /var/www/llevateloexpress.com/backend/static;
    }
    
    # Configuración para el frontend - DEBE IR AL FINAL
    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    listen 443 ssl; # managed by Certbot
    ssl_certificate /etc/letsencrypt/live/llevateloexpress.com/fullchain.pem; # managed by Certbot
    ssl_certificate_key /etc/letsencrypt/live/llevateloexpress.com/privkey.pem; # managed by Certbot
    include /etc/letsencrypt/options-ssl-nginx.conf; # managed by Certbot
    ssl_dhparam /etc/letsencrypt/ssl-dhparams.pem; # managed by Certbot
}

server {
    if ($host = www.llevateloexpress.com) {
        return 301 https://$host$request_uri;
    } # managed by Certbot


    if ($host = llevateloexpress.com) {
        return 301 https://$host$request_uri;
    } # managed by Certbot


    listen 80;
    server_name llevateloexpress.com www.llevateloexpress.com;
    return 404; # managed by Certbot
}
EOL

# Verificar la configuración de Nginx
nginx -t

# Iniciar servicios
echo "Iniciando servicios..."
systemctl start llevateloexpress-backend llevateloexpress-frontend
systemctl restart nginx

echo "===== ACTUALIZACIÓN COMPLETADA =====" 