#!/bin/bash

# Script para iniciar el backend de LlévateloExpress

echo "Activando entorno virtual..."
source venv/bin/activate

echo "Iniciando el servidor de producción para LlévateloExpress.com backend..."
gunicorn llevateloexpress.wsgi:application --bind 0.0.0.0:8000 --workers 3 