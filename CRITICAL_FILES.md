# Archivos Críticos del Proyecto LlévateloExpress

Este documento lista los archivos y directorios críticos que han sido modificados para resolver problemas específicos y que deben preservarse durante cualquier despliegue.

## Archivos Críticos en el VPS

Estos archivos contienen cambios importantes que deben preservarse en el servidor VPS:

1. **`backend/llevateloexpress/settings.py`**: 
   - Contiene configuraciones específicas para el entorno de producción
   - Incluye `ALLOWED_HOSTS` con dominio específico
   - Contiene configuraciones de CSRF y seguridad
   - **¡NO SOBRESCRIBIR!**

2. **`frontend/src/app/dashboard/`**:
   - Directorio completo que contiene el panel de administración en Next.js
   - Creado para resolver el problema de error 404 en `/dashboard/`
   - **¡NO SOBRESCRIBIR!**

3. **`deploy.sh`**:
   - Script de despliegue personalizado para el servidor
   - **¡NO SOBRESCRIBIR!**

4. **`/etc/nginx/sites-available/llevateloexpress`**:
   - Configuración de Nginx con rutas específicas para `/admin/` y `/dashboard/`
   - Crucial para el funcionamiento correcto de ambos paneles administrativos
   - Una copia de referencia se encuentra en `nginx_fix.conf`
   - **¡NO SOBRESCRIBIR!**

## Estrategia de Sincronización

A partir de ahora, todos los repositorios (GitHub, local y VPS) se mantendrán sincronizados con los mismos archivos. Si se necesitan cambios en alguno de los archivos críticos, estos cambios se harán en todos los repositorios para mantener la coherencia.

## Recordatorio Importante

- Verificar que las rutas críticas (`/admin/` y `/dashboard/`) funcionen después de cada despliegue
- Realizar pruebas adecuadas después de modificar cualquiera de los archivos críticos
- Mantener todos los repositorios sincronizados para evitar confusiones 