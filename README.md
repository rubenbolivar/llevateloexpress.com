# LlévateloExpress

Plataforma de financiamiento y adquisición de motocicletas, vehículos, camiones y maquinaria agrícola en Venezuela.

## Descripción del Proyecto

LlévateloExpress es una plataforma web completa para la financiación y adquisición de vehículos en Venezuela. La aplicación permite a los usuarios explorar un catálogo de vehículos, calcular opciones de financiamiento, realizar solicitudes de crédito y gestionar sus pagos.

## Características Principales

- Catálogo de vehículos con categorías: motocicletas, automóviles, camiones y maquinaria agrícola
- Dos modalidades de financiamiento:
  - Compra Programada con Adjudicación al 45%
  - Crédito de Adjudicación Inmediata
- Sistema de puntos por puntualidad
- Panel administrativo para gestión completa
- Calculadora de financiamiento interactiva
- Sistema de seguimiento de pagos
- Gestión de solicitudes de crédito

## Estado Actual del Proyecto (Febrero 2025)

### Componentes Completados
- ✅ **Panel Administrativo**: 
  - Validación de Pagos: Interfaz completa para revisar, aprobar o rechazar pagos
  - Configuración del Sistema: Panel configurable con pestañas para puntos, financiamiento, pagos y sistema general
  - Dashboard con estadísticas y reportes
  
- ✅ **Flujo de Solicitudes**:
  - Interfaz de usuario para visualizar solicitudes con diseño de tarjetas informativas
  - Seguimiento visual del estado mediante stepper
  - Vista detallada con pestañas para información del producto, plan, documentos e historial

- ✅ **Sistema de Puntos**: 
  - Gestión completa de puntos por puntualidad
  - Visualización para usuarios y administradores
  - Cálculo automático de días de espera

- ✅ **Calculadora de Financiamiento**: 
  - Cálculos precisos para ambas modalidades con visualización interactiva
  - Simulación de pagos mensuales y adjudicación
  - Guardado de simulaciones para usuarios registrados

### En Progreso
- 🔄 Sistema de notificaciones (90%) - Documentación completa, pendiente de implementación
- 🔄 Optimizaciones de rendimiento (80%) 
- 🔄 Pruebas automatizadas (60%)

## Tecnologías Utilizadas

### Backend
- Django 4.2
- Django REST Framework 3.15
- PostgreSQL
- JWT Authentication
- Gunicorn para despliegue en producción

### Frontend
- Next.js 14
- TypeScript
- Material UI 5
- Redux Toolkit
- Tailwind CSS
- React Hook Form

## Requisitos Previos

- Python 3.9+
- Node.js 18+
- PostgreSQL
- Git (opcional, pero recomendado para gestionar el código)

## Instalación y Despliegue

### Método Automatizado (Recomendado)

Utilizando nuestro script de despliegue:

```bash
# Clona el repositorio
git clone https://github.com/tu-usuario/llevateloexpress.git
cd llevateloexpress

# Da permisos de ejecución al script
chmod +x deploy.sh

# Ejecuta el script de despliegue
./deploy.sh
```

El script se encargará de:
1. Verificar las dependencias necesarias
2. Configurar el entorno virtual de Python
3. Instalar las dependencias del backend
4. Configurar la base de datos
5. Instalar las dependencias del frontend
6. Compilar la aplicación frontend
7. Ofrecer opciones para crear un superusuario y cargar datos iniciales

### Instalación Manual

#### Backend (Django)

1. Navega al directorio backend
2. Crea un entorno virtual:
   ```
   python3 -m venv venv
   ```
3. Activa el entorno virtual:
   - Windows: `venv\Scripts\activate`
   - macOS/Linux: `source venv/bin/activate`
4. Instala las dependencias:
   ```
   pip install -r requirements.txt
   ```
5. Configura el archivo .env (usa .env.example como referencia)
6. Aplica las migraciones:
   ```
   python manage.py migrate
   ```
7. Crea un superusuario:
   ```
   python manage.py createsuperuser
   ```
8. (Opcional) Carga datos iniciales:
   ```
   python manage.py loaddata fixtures/payment_methods.json
   python manage.py loaddata fixtures/products.json
   python manage.py loaddata fixtures/financing_plans.json
   ```

#### Frontend (Next.js)

1. Navega al directorio frontend
2. Instala las dependencias:
   ```
   npm install
   ```
3. Construye la aplicación:
   ```
   npm run build
   ```

### Iniciar los Servidores

#### Producción

Backend:
```bash
cd backend
./start.sh
```

Frontend:
```bash
cd frontend
./start.sh
```

#### Desarrollo

Backend:
```bash
cd backend
source venv/bin/activate
python manage.py runserver
```

Frontend:
```bash
cd frontend
npm run dev
```

## Estructura del Proyecto

### Backend

- **accounts**: Gestión de usuarios y perfiles
- **products**: Catálogo de vehículos y maquinarias
- **financing**: Planes de financiamiento y calculadora
- **applications**: Solicitudes de crédito
- **payments**: Sistema de registro y validación de pagos
- **points_system**: Sistema de puntos por puntualidad
- **dashboard**: API para panel administrativo
- **common**: Utilidades compartidas

### Frontend

- **src/app**: Páginas de la aplicación (Next.js App Router)
- **src/components**: Componentes reutilizables
- **src/api**: Configuración y endpoints de API
- **src/hooks**: Hooks personalizados
- **src/lib**: Utilidades y configuraciones
- **src/features**: Características principales organizadas por dominio
- **src/styles**: Estilos globales

## Despliegue en Producción

Para un despliegue en producción en un servidor web como Nginx, se recomienda:

1. Utilizar el script `deploy.sh` para la instalación inicial
2. Configurar Nginx como proxy inverso para el frontend y backend
3. Configurar certificados SSL para HTTPS
4. Configurar servicios systemd para mantener en ejecución los servidores
5. Programar copias de seguridad de la base de datos

### Ejemplo de Configuración de Nginx

```nginx
server {
    listen 80;
    server_name llevateloexpress.com www.llevateloexpress.com;
    
    # Redirección a HTTPS
    return 301 https://$host$request_uri;
}

server {
    listen 443 ssl;
    server_name llevateloexpress.com www.llevateloexpress.com;
    
    ssl_certificate /etc/letsencrypt/live/llevateloexpress.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/llevateloexpress.com/privkey.pem;
    
    # Configuración para el frontend
    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
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
        alias /ruta/a/llevateloexpress/backend/media;
    }
    
    location /static {
        alias /ruta/a/llevateloexpress/backend/static;
    }
}
```

## Documentación Adicional

- [Convenciones y Estándares](./CONVENCIONES_Y_ESTANDARES.md)
- [Informe de Avance](./INFORME_AVANCE_LLEVATELOEXPRESS.md)
- [Documentación del Sistema de Notificaciones](./DOCUMENTACION_NOTIFICACIONES.md)

## Resolución de Problemas Comunes

### Problemas con CORS
Si hay problemas de CORS, asegúrate de que el backend tenga habilitado django-cors-headers y configurado para permitir solicitudes desde el frontend.

### Problemas de Conexión API
- Confirma que las URLs de la API en el frontend sean correctas
- Verifica que el backend esté funcionando y accesible
- Revisa la configuración de autenticación JWT

### Errores en Consola del Navegador
- Inspecciona la consola del navegador para detectar errores
- Verifica la red para problemas de comunicación con la API

## Licencia

Este proyecto es privado y no está disponible para uso público sin autorización. 

<!-- Security scan triggered at 2025-09-01 20:17:05 -->

<!-- Security scan triggered at 2025-09-09 05:48:24 -->

<!-- Security scan triggered at 2025-09-28 15:57:58 -->