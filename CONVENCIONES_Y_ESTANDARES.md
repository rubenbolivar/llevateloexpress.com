# Convenciones y Estándares para LlévateloExpress

Este documento define las convenciones y estándares a seguir en el desarrollo del proyecto LlévateloExpress para mantener la consistencia y evitar problemas en producción.

## 1. Modelos y Nomenclatura

| Término Estándar | Términos a Evitar | Descripción |
|------------------|-------------------|-------------|
| `CreditApplication` | `FinancingApplication` | Modelo principal para solicitudes de financiamiento |
| `Payment` | `PaymentTransaction` | Modelo para transacciones de pago |
| `PaymentMethod` | - | Modelo para métodos de pago |
| `PaymentSchedule` | - | Modelo para cronograma de pagos |
| `ApplicationDocument` | - | Modelo para documentos de solicitud |
| `ApplicationStatusHistory` | - | Modelo para historial de estados de solicitud |
| `UserPointsSummary` | - | Modelo para resumen de puntos de usuario |
| `PointTransaction` | - | Modelo para transacciones de puntos |

## 2. Estructura de URLs de API

### Convención de URLs

```
/api/v1/<recurso>/ - Colección de recursos
/api/v1/<recurso>/<id>/ - Recurso específico por ID
/api/v1/<recurso>/<id>/<acción>/ - Acción específica sobre un recurso
/api/v1/<recurso-padre>/<id-padre>/<recurso-hijo>/ - Recursos anidados
```

### Rutas Principales

| Ruta Estándar | Descripción |
|---------------|-------------|
| `/api/v1/accounts/...` | Endpoints relacionados con usuarios y autenticación |
| `/api/v1/applications/...` | Endpoints para solicitudes de financiamiento |
| `/api/v1/payments/...` | Endpoints para pagos y transacciones |
| `/api/v1/products/...` | Endpoints para productos y categorías |
| `/api/v1/financing/...` | Endpoints para planes de financiamiento |
| `/api/v1/points/...` | Endpoints para sistema de puntos |
| `/api/v1/dashboard/...` | Endpoints para estadísticas del panel de control |

### Endpoints Específicos Importantes

| Endpoint | Método | Descripción |
|----------|--------|-------------|
| `/api/v1/token/` | POST | Obtener token JWT |
| `/api/v1/token/refresh/` | POST | Refrescar token JWT |
| `/api/v1/applications/<id>/submit/` | POST | Enviar solicitud de financiamiento |
| `/api/v1/applications/<id>/change_status/` | POST | Cambiar estado de solicitud (admin) |
| `/api/v1/payments/<id>/verify/` | POST | Verificar un pago (admin) |
| `/api/v1/payments/<id>/reject/` | POST | Rechazar un pago (admin) |

## 3. Convenciones de Frontend (Next.js)

### Estructura de Rutas

| Tipo de Ruta | Ubicación |
|--------------|-----------|
| Públicas | `/src/app/<ruta>/...` |
| Protegidas de Usuario | `/src/app/perfil/...` |
| Protegidas de Admin | `/src/app/admin/...` |

### Rutas Principales

| Ruta | Descripción |
|------|-------------|
| `/` | Página principal |
| `/catalogo` | Catálogo de productos |
| `/calculadora` | Calculadora de financiamiento |
| `/login` | Inicio de sesión |
| `/registro` | Registro de usuario |
| `/perfil` | Perfil de usuario |
| `/perfil/solicitudes` | Solicitudes del usuario |
| `/perfil/pagos` | Pagos del usuario |
| `/perfil/puntos` | Puntos del usuario |
| `/admin` | Dashboard administrativo |
| `/admin/solicitudes` | Gestión de solicitudes (admin) |
| `/admin/pagos` | Validación de pagos (admin) |
| `/admin/configuracion` | Configuración del sistema (admin) |

### Nomenclatura de Componentes

- **Página principal**: `page.tsx`
- **Componentes de layout**: `layout.tsx`
- **Componentes reutilizables**: Usar PascalCase (ej. `PaymentForm.tsx`)
- **Hooks personalizados**: Prefijo "use" (ej. `usePaymentStatus.ts`)
- **Contextos**: Sufijo "Context" (ej. `AuthContext.tsx`)
- **Proveedores**: Sufijo "Provider" (ej. `ThemeProvider.tsx`)

## 4. Convenciones de Servicios y API

### Servicios Frontend

- **Cliente API**: Usar una única instancia configurada para toda la aplicación
- **Peticiones API**: Centralizar en módulos por dominio (ej. `paymentsApi.ts`)
- **Manejo de errores**: Implementar interceptores para manejo consistente
- **Caché**: Usar RTK Query con tags para invalidación eficiente

### Endpoints API

- **Verbos HTTP**: Usar correctamente (GET para lectura, POST para creación, PUT/PATCH para actualización, DELETE para eliminación)
- **Acciones Especiales**: Usar `/api/v1/<recurso>/<id>/<acción>/` (ej. `/payments/123/verify/`)
- **Paginación**: Parámetros estándar `page` y `page_size`
- **Filtros**: Usar query params con nombres descriptivos
- **Respuestas de error**: Estructura estándar JSON con campo `error` o `errors`

## 5. Estándares de Importación y Dependencias

### Importaciones en Backend

- Evitar importaciones circulares (usar importaciones en funciones cuando sea necesario)
- Agrupar importaciones por tipo:
  1. Librerías estándar de Python
  2. Paquetes de Django y DRF
  3. Aplicaciones de terceros
  4. Módulos propios del proyecto
- Para modelos de otras apps, importar directamente en las funciones que los usan

Ejemplo:
```python
# Importaciones estándar
import json
from datetime import datetime, timedelta

# Importaciones de Django/DRF
from django.db import models
from django.utils import timezone
from rest_framework import viewsets, status

# Importaciones de terceros
from rest_framework_simplejwt.authentication import JWTAuthentication

# Importaciones propias
from .models import CreditApplication
from .serializers import CreditApplicationSerializer
```

### Importaciones en Frontend

- Ordenar importaciones por tipo:
  1. React y Next.js
  2. Librerías UI (Material UI, etc.)
  3. Hooks y utilidades personalizadas
  4. Componentes propios
- Usar path aliases para rutas limpias (`@/components/...`)
- Evitar importaciones de `../../../` profundas

Ejemplo:
```typescript
// React y Next.js
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';

// Material UI
import { 
  Box, 
  Typography, 
  Button 
} from '@mui/material';

// Hooks y utilidades
import { useAuth } from '@/hooks/useAuth';
import { formatCurrency } from '@/lib/utils';

// Componentes propios
import PaymentForm from '@/components/payments/PaymentForm';
```

## 6. Directrices para Despliegue Seguro

1. **Versionado de API**: 
   - Mantener prefijo `/api/v1/` para facilitar migraciones futuras
   - Para cambios incompatibles, incrementar versión (`/api/v2/`)

2. **URLs Absolutas**: 
   - Backend: Usar `request.build_absolute_uri()` para URLs completas
   - Frontend: Usar variables de entorno para la base URL del API
   - Configurar en `.env` y `.env.production`

3. **Cambios de Esquema**:
   - Realizar migraciones atómicas y verificadas
   - Evitar eliminar campos usados en producción
   - Implementar versionado de modelos cuando sea necesario
   - Usar migraciones de datos cuando sea necesario

4. **Archivos Estáticos**:
   - Frontend: Usar rutas relativas o variables de entorno
   - Backend: Configurar MEDIA_URL y STATIC_URL apropiadamente

5. **Variables de Entorno**:
   - Nunca hardcodear valores que cambien entre entornos
   - Usar `.env.example` como plantilla de referencia
   - Asegurarse de que `.env` esté en `.gitignore`

## 7. Convenciones de Base de Datos

### Nombres de Tablas y Campos

- **Tablas**: Usar el prefijo de la aplicación Django (ej. `accounts_user`)
- **Campos**: Usar snake_case para nombres de campo
- **Claves primarias**: Usar `id` como nombre estándar
- **Claves foráneas**: Usar `<modelo>_id` como sufijo

### Índices y Restricciones

- **Índices**: Crear para campos usados frecuentemente en filtros y ordenamientos
- **Restricciones de unicidad**: Definir explícitamente cuando sea necesario
- **Cascadas de eliminación**: Considerar cuidadosamente las implicaciones

## 8. Convenciones de Código

### Python/Django

- Seguir PEP 8 para estilo de código
- Docstrings para todas las clases y métodos
- Usar Type Hints cuando sea posible
- Anotaciones de modelos con verbose_name para mejor admin

### TypeScript/React

- Usar ESLint con configuración estándar
- Definir interfaces para props de componentes
- Evitar any, usar tipos específicos
- Comentar código complejo

## 9. Registro de Cambios

| Fecha | Autor | Descripción |
|-------|-------|-------------|
| YYYY-MM-DD | Tu Nombre | Versión inicial |

## 10. Recursos Adicionales

- [Documentación de Django](https://docs.djangoproject.com/)
- [Documentación de Django REST Framework](https://www.django-rest-framework.org/)
- [Documentación de Next.js](https://nextjs.org/docs)
- [Documentación de Material UI](https://mui.com/material-ui/getting-started/) 