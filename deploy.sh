#!/bin/bash

# Script principal de despliegue para LlévateloExpress.com

echo "============================================"
echo "Iniciando despliegue de LlévateloExpress.com"
echo "============================================"

# Verificar dependencias
echo "Verificando dependencias..."
command -v python3 >/dev/null 2>&1 || { echo "Python 3 no está instalado. Abortando."; exit 1; }
command -v npm >/dev/null 2>&1 || { echo "Node.js/npm no está instalado. Abortando."; exit 1; }
command -v postgres >/dev/null 2>&1 || { echo "PostgreSQL no está instalado. Abortando."; exit 1; }

# Desplegar el backend
echo ""
echo "Desplegando el backend..."
cd backend

# Crear/activar entorno virtual si no existe
if [ ! -d "venv" ]; then
  echo "Creando entorno virtual..."
  python3 -m venv venv
fi

# Activar entorno virtual
source venv/bin/activate

# Instalar dependencias
echo "Instalando dependencias del backend..."
pip install -r requirements.txt

# Configurar archivo .env si no existe
if [ ! -f ".env" ]; then
  echo "Creando archivo .env a partir de .env.example..."
  cp .env.example .env
  echo "¡ATENCIÓN! Por favor, edite el archivo backend/.env con sus configuraciones"
fi

# Migrar base de datos
echo "Verificando base de datos..."
python manage.py migrate

# Crear superusuario si no existe
echo "¿Desea crear un superusuario? (s/n)"
read crear_usuario
if [ "$crear_usuario" = "s" ]; then
  python manage.py createsuperuser
fi

# Cargar datos iniciales
echo "¿Desea cargar datos iniciales? (s/n)"
read cargar_datos
if [ "$cargar_datos" = "s" ]; then
  echo "Cargando datos iniciales..."
  python manage.py loaddata fixtures/payment_methods.json
  python manage.py loaddata fixtures/products.json
  python manage.py loaddata fixtures/financing_plans.json
fi

# Volver al directorio raíz
cd ..

# Desplegar el frontend
echo ""
echo "Desplegando el frontend..."
cd frontend

# Instalar dependencias
echo "Instalando dependencias del frontend..."
npm install

# Construir aplicación
echo "Construyendo aplicación..."
npm run build

# Volver al directorio raíz
cd ..

echo ""
echo "=================================================="
echo "¡Despliegue completado!"
echo ""
echo "Para iniciar el backend:"
echo "  cd backend && ./start.sh"
echo ""
echo "Para iniciar el frontend:"
echo "  cd frontend && ./start.sh"
echo "==================================================" 