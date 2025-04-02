#!/bin/bash

# Script de despliegue para LlévateloExpress en el VPS
# Ejecutar como: bash deploy_vps.sh

echo "============================================"
echo "Iniciando despliegue de LlévateloExpress.com en VPS"
echo "============================================"

# Actualizar sistema
echo "Actualizando el sistema..."
apt update && apt upgrade -y

# Instalar dependencias
echo "Instalando dependencias..."
apt install -y python3-pip python3-venv postgresql postgresql-contrib nginx git certbot python3-certbot-nginx

# Configurar PostgreSQL
echo "Configurando PostgreSQL..."
sudo -u postgres psql -c "CREATE DATABASE llevateloexpress;"
sudo -u postgres psql -c "CREATE USER llevatelouser WITH PASSWORD 'contraseña_segura';"
sudo -u postgres psql -c "ALTER ROLE llevatelouser SET client_encoding TO 'utf8';"
sudo -u postgres psql -c "ALTER ROLE llevatelouser SET default_transaction_isolation TO 'read committed';"
sudo -u postgres psql -c "ALTER ROLE llevatelouser SET timezone TO 'UTC';"
sudo -u postgres psql -c "GRANT ALL PRIVILEGES ON DATABASE llevateloexpress TO llevatelouser;"

# Clonar repositorio
echo "Clonando repositorio..."
mkdir -p /var/www
cd /var/www
git clone https://github.com/rubenbolivar/llevateloexpress.com.git
cd llevateloexpress.com

# Configurar el backend
echo "Configurando backend..."
cd backend
cp .env.example .env
sed -i 's/DEBUG=True/DEBUG=False/g' .env
sed -i 's/ALLOWED_HOSTS=localhost,127.0.0.1/ALLOWED_HOSTS=llevateloexpress.com,www.llevateloexpress.com,203.161.55.87/g' .env
sed -i 's/CORS_ALLOWED_ORIGINS=http:\/\/localhost:3000/CORS_ALLOWED_ORIGINS=https:\/\/llevateloexpress.com,https:\/\/www.llevateloexpress.com/g' .env
sed -i 's/DATABASE_NAME=llevateloexpress_dev/DATABASE_NAME=llevateloexpress/g' .env
sed -i 's/DATABASE_USER=postgres/DATABASE_USER=llevatelouser/g' .env
sed -i 's/DATABASE_PASSWORD=postgres/DATABASE_PASSWORD=contraseña_segura/g' .env

# Crear entorno virtual y activarlo
python3 -m venv venv
source venv/bin/activate

# Instalar dependencias
pip install -r requirements.txt

# Aplicar migraciones
python manage.py migrate

# Crear superusuario
echo "Creando superusuario admin con contraseña temporal 'admin12345'"
echo "from django.contrib.auth import get_user_model; User = get_user_model(); User.objects.create_superuser('admin', 'admin@llevateloexpress.com', 'admin12345')" | python manage.py shell

# Recolectar archivos estáticos
python manage.py collectstatic --noinput

# Configurar el frontend
cd ../frontend

# Instalar Node.js 18
echo "Instalando Node.js 18..."
curl -fsSL https://deb.nodesource.com/setup_18.x | bash -
apt install -y nodejs

# Instalar dependencias y construir
npm install
npm run build

# Configurar Nginx
echo "Configurando Nginx..."
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

# Corregir ALLOWED_HOSTS en settings.py
echo "Actualizando ALLOWED_HOSTS..."
sed -i "s/ALLOWED_HOSTS = \[.*\]/ALLOWED_HOSTS = \['llevateloexpress.com', 'www.llevateloexpress.com', '203.161.55.87', 'localhost', '127.0.0.1'\]/g" /var/www/llevateloexpress.com/backend/llevateloexpress/settings.py

# Configurar SSL con Let's Encrypt
echo "Configurando certificados SSL..."
certbot --nginx -d llevateloexpress.com -d www.llevateloexpress.com --non-interactive --agree-tos --email admin@llevateloexpress.com

# Configurar servicios systemd
echo "Configurando servicios systemd..."

# Backend service
cat > /etc/systemd/system/llevateloexpress-backend.service << 'EOL'
[Unit]
Description=LlévateloExpress Backend
After=network.target

[Service]
User=root
WorkingDirectory=/var/www/llevateloexpress.com/backend
ExecStart=/var/www/llevateloexpress.com/backend/venv/bin/gunicorn llevateloexpress.wsgi:application --bind 127.0.0.1:8000 --workers 3
Restart=on-failure

[Install]
WantedBy=multi-user.target
EOL

# Frontend service
cat > /etc/systemd/system/llevateloexpress-frontend.service << 'EOL'
[Unit]
Description=LlévateloExpress Frontend
After=network.target

[Service]
User=root
WorkingDirectory=/var/www/llevateloexpress.com/frontend
ExecStart=/usr/bin/npm start
Restart=on-failure

[Install]
WantedBy=multi-user.target
EOL

# Recargar systemd
systemctl daemon-reload

# Habilitar servicios para que inicien al arranque
systemctl enable llevateloexpress-backend llevateloexpress-frontend

# Reiniciar servicios y Nginx
systemctl restart llevateloexpress-backend llevateloexpress-frontend
systemctl restart nginx

# Configurar respaldos automáticos
echo "Configurando respaldos automáticos..."
cat > /etc/cron.d/llevateloexpress-backup << 'EOL'
0 2 * * * root pg_dump llevateloexpress > /var/backups/llevateloexpress_$(date +\%Y\%m\%d).sql
0 3 * * 0 root find /var/backups/ -name "llevateloexpress_*.sql" -type f -mtime +14 -delete
EOL

mkdir -p /var/backups

echo "============================================"
echo "¡Despliegue completado!"
echo "============================================"
echo "Accede al panel de administración: https://llevateloexpress.com/admin"
echo "Usuario: admin"
echo "Contraseña: admin12345"
echo ""
echo "¡IMPORTANTE! Cambiar la contraseña del usuario admin inmediatamente después del primer inicio de sesión."
echo "============================================" 