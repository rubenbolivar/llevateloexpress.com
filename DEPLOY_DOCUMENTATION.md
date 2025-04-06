# Documentación de Despliegue Automático

Este documento describe el proceso para mantener sincronizados automáticamente los tres entornos del proyecto LlévateloExpress: repositorio local, GitHub y el servidor VPS.

## Configuración Inicial

### 1. Configuración de Remotes en Git Local

Asegúrate de tener configurados correctamente los remotes en tu repositorio local:

```bash
# Verificar los remotes existentes
git remote -v

# Si no existe el remote para el VPS, añádelo
git remote add vps ssh://root@llevateloexpress.com/var/www/llevateloexpress.com

# Si necesitas actualizar la URL del remote
git remote set-url origin https://github.com/rubenbolivar/llevateloexpress.com.git
git remote set-url vps ssh://root@llevateloexpress.com/var/www/llevateloexpress.com
```

### 2. Configurar Acceso SSH al VPS

Para evitar ingresar la contraseña cada vez:

```bash
# Generar clave SSH si no existe
ssh-keygen -t rsa -b 4096

# Copiar la clave al servidor
ssh-copy-id root@llevateloexpress.com
```

## Sistema de Sincronización Automática (Activo)

El proyecto está configurado para sincronizar automáticamente todos los repositorios cada vez que realizas un commit local en la rama principal. Esta funcionalidad utiliza Git Hooks.

### Git Hooks Configurados

1. **post-commit**: Sincroniza automáticamente los tres repositorios después de cada commit local.
   - Ubicación: `.git/hooks/post-commit`
   - Función: Cuando haces un commit en la rama main, automáticamente:
     - Envía los cambios a GitHub
     - Actualiza el VPS con los mismos cambios
     - Verifica que los tres repositorios estén sincronizados

2. **pre-push**: Verifica archivos críticos antes de enviar cambios.
   - Ubicación: `.git/hooks/pre-push`
   - Función: Antes de enviar cambios a un repositorio remoto:
     - Verifica si se han modificado archivos críticos
     - Muestra advertencias sobre los archivos críticos modificados
     - Permite continuar, pero recuerda verificar la funcionalidad después del despliegue

### Proceso de Sincronización Automática

1. Haces cambios en tu repositorio local
2. Realizas un commit: `git commit -m "Tu mensaje"`
3. Automáticamente:
   - Los cambios se envían a GitHub
   - El VPS se actualiza con los mismos cambios
   - Se verifica que los tres entornos estén sincronizados
4. Recibes confirmación del estado de la sincronización

### Cómo Verificar el Estado de Sincronización

Puedes verificar manualmente que todos los repositorios están sincronizados con:

```bash
echo "Repositorio local: $(git rev-parse HEAD)"
echo "GitHub: $(git rev-parse origin/main)"
echo "VPS: $(ssh root@llevateloexpress.com "cd /var/www/llevateloexpress.com && git rev-parse HEAD")"
```

## Otras Herramientas de Sincronización (Opcionales)

### Script Manual de Sincronización

Si prefieres ejecutar la sincronización manualmente, puedes usar el script `sync_repos.sh`:

```bash
# Sincronizar con mensaje personalizado
./sync_repos.sh "Tu mensaje de commit personalizado"

# Sincronizar con mensaje por defecto
./sync_repos.sh
```

### Flujo de Trabajo para Sincronización Manual

1. Realizar cambios locales
2. Ejecutar el script de sincronización manual
3. Verificar que todo funcione correctamente en todos los entornos

## Consideraciones Importantes

1. **Archivos Críticos**: El sistema mostrará advertencias cuando modifiques archivos críticos listados en `CRITICAL_FILES.md`.

2. **Resolución de Conflictos**: En caso de conflictos, el sistema intentará resolverlos automáticamente, pero en casos complejos requerirá intervención manual.

3. **Antes de Desplegar**:
   - Asegúrate de que todos los tests pasan en tu entorno local
   - Verifica que las modificaciones no afecten los archivos críticos
   - Comprueba que tienes los permisos SSH necesarios

4. **Después de Desplegar**:
   - Verifica que la aplicación funciona correctamente
   - Comprueba específicamente las rutas `/admin/` y `/dashboard/`
   - Verifica que los cambios esperados se han aplicado correctamente

## Automatización con GitHub Actions (Opcional)

Para una automatización completa, también puedes configurar GitHub Actions para desplegar automáticamente al VPS cuando se hacen cambios en la rama principal. Para ello, crea un archivo `.github/workflows/deploy.yml`:

```yaml
name: Deploy to VPS

on:
  push:
    branches: [ main ]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
    - uses: actions/checkout@v2
      with:
        fetch-depth: 0
    
    - name: Deploy to VPS
      uses: appleboy/ssh-action@master
      with:
        host: llevateloexpress.com
        username: root
        key: ${{ secrets.VPS_SSH_KEY }}
        script: |
          cd /var/www/llevateloexpress.com
          git fetch origin
          git reset --hard origin/main
          ./deploy.sh
```

Para configurar esto, necesitarás agregar la clave SSH privada como un secreto en GitHub (Configuración del repositorio > Secretos > Nuevo secreto de repositorio). 