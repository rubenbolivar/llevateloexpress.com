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

## Estado Actual del Proyecto (Abril 2023)

### Componentes Implementados
- ✅ **Sistema de Puntos**: Gestión completa de puntos por puntualidad con visualización para usuarios
- ✅ **Calculadora de Financiamiento**: Cálculos precisos para ambas modalidades con visualización interactiva
- ✅ **Sistema de Solicitudes**: Backend completo con gestión de estados y documentos
- ✅ **Panel Administrativo**: API de estadísticas y reportes implementada

### En Progreso
- 🔄 Frontend del panel administrativo (60%)
- 🔄 Flujo completo de solicitudes de financiamiento (70%)
- 🔄 Sistema de notificaciones (20%)

### Próximos Pasos
1. Completar interfaces del panel administrativo
2. Finalizar flujo de usuario para solicitudes
3. Implementar sistema de notificaciones por email

Para más detalles sobre el estado del proyecto, consulte el [Informe de Avance](./INFORME_AVANCE_LLEVATELOEXPRESS.md).

## Tecnologías Utilizadas

### Backend
- Django 4.2
- Django REST Framework
- PostgreSQL
- JWT Authentication

### Frontend
- Next.js
- TypeScript
- Material UI
- Redux Toolkit
- Tailwind CSS
- React Hook Form

## Requisitos previos

- Python 3.9+
- Node.js 16+
- PostgreSQL
- npm o yarn

## Instalación

### Backend (Django)

1. Clona el repositorio
2. Navega al directorio backend
3. Crea un entorno virtual:
   ```
   python -m venv venv
   ```
4. Activa el entorno virtual:
   - Windows: `venv\Scripts\activate`
   - macOS/Linux: `source venv/bin/activate`
5. Instala las dependencias:
   ```
   pip install -r requirements.txt
   ```
6. Configura el archivo .env (usa .env.example como referencia)
7. Aplica las migraciones:
   ```
   python manage.py migrate
   ```
8. Crea un superusuario:
   ```
   python manage.py createsuperuser
   ```
9. Inicia el servidor:
   ```
   python manage.py runserver
   ```

### Frontend (Next.js)

1. Navega al directorio frontend
2. Instala las dependencias:
   ```
   npm install
   ```
   o
   ```
   yarn
   ```
3. Inicia el servidor de desarrollo:
   ```
   npm run dev
   ```
   o
   ```
   yarn dev
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

## Equipo de Desarrollo

Este proyecto está siendo desarrollado por un equipo de ingenieros de software especializados en desarrollo web full-stack, enfocados en crear una solución robusta y escalable.

## Contribuciones

Para contribuir al proyecto, por favor sigue estos pasos:

1. Haz fork del repositorio
2. Crea una rama para tu funcionalidad (`git checkout -b feature/nueva-funcionalidad`)
3. Haz commit de tus cambios (`git commit -m 'Añadir nueva funcionalidad'`)
4. Haz push a la rama (`git push origin feature/nueva-funcionalidad`)
5. Abre un Pull Request

## Licencia

Este proyecto es privado y no está disponible para uso público sin autorización. 