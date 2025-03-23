# Documentación del Sistema de Notificaciones para LlévateloExpress

## Descripción General

El Sistema de Notificaciones de LlévateloExpress es un componente fundamental que permite mantener informados a los usuarios sobre eventos relevantes relacionados con sus solicitudes de financiamiento, pagos, estados de puntos, y otras interacciones importantes con la plataforma. Este documento describe la arquitectura, componentes y guía de implementación para el Sistema de Notificaciones.

## Arquitectura del Sistema

El Sistema de Notificaciones se compone de tres elementos principales:

1. **Servicio de Notificaciones Backend**: Responsable de generar, almacenar y gestionar notificaciones.
2. **API de Notificaciones**: Proporciona endpoints para acceder a notificaciones y manejar preferencias.
3. **Componentes Frontend de Notificaciones**: Muestra las notificaciones al usuario y maneja interacciones.

### Diagrama de Componentes

```
┌───────────────────┐      ┌───────────────────┐      ┌───────────────────┐
│   Eventos de la   │      │    Servicio de    │      │  Componentes de   │
│    Aplicación     │─────▶│   Notificaciones  │─────▶│   Notificaciones  │
│                   │      │                   │      │                   │
└───────────────────┘      └───────────────────┘      └───────────────────┘
                                    │
                                    ▼
                           ┌───────────────────┐
                           │  Proveedores de   │
                           │  Notificaciones   │
                           │ (Email, Push, DB) │
                           └───────────────────┘
```

## Tipos de Notificaciones a Implementar

### 1. Notificaciones en la Aplicación (In-App)
- Alertas dentro de la plataforma web
- Centro de notificaciones con historial
- Marcadores de no leído/leído

### 2. Notificaciones por Email
- Plantillas transaccionales
- Envío programado (recordatorios)
- Confirmaciones y alertas

### 3. Notificaciones Push (Opcional - Fase 2)
- Para dispositivos móviles cuando se implemente la versión móvil
- Alertas instantáneas para eventos críticos

## Implementación del Backend

### 1. Modelos de Datos

Crear los siguientes modelos en Django:

```python
# notifications/models.py
from django.db import models
from django.contrib.auth import get_user_model
from django.contrib.contenttypes.fields import GenericForeignKey
from django.contrib.contenttypes.models import ContentType

User = get_user_model()

class NotificationType(models.Model):
    """Define los tipos de notificaciones disponibles en el sistema"""
    code = models.CharField(max_length=50, unique=True)
    name = models.CharField(max_length=100)
    description = models.TextField(blank=True)
    template_subject = models.CharField(max_length=255)
    template_body = models.TextField()
    email_enabled = models.BooleanField(default=True)
    push_enabled = models.BooleanField(default=False)
    in_app_enabled = models.BooleanField(default=True)
    
    def __str__(self):
        return self.name

class NotificationPreference(models.Model):
    """Preferencias de notificación por usuario y tipo"""
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='notification_preferences')
    notification_type = models.ForeignKey(NotificationType, on_delete=models.CASCADE)
    email_enabled = models.BooleanField(default=True)
    push_enabled = models.BooleanField(default=True)
    in_app_enabled = models.BooleanField(default=True)
    
    class Meta:
        unique_together = ['user', 'notification_type']
    
    def __str__(self):
        return f"{self.user.username} - {self.notification_type.code}"

class Notification(models.Model):
    """Notificación enviada a un usuario"""
    STATUS_CHOICES = (
        ('pending', 'Pendiente'),
        ('delivered', 'Entregada'),
        ('failed', 'Fallida'),
    )
    
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='notifications')
    notification_type = models.ForeignKey(NotificationType, on_delete=models.CASCADE)
    title = models.CharField(max_length=255)
    message = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)
    read_at = models.DateTimeField(null=True, blank=True)
    is_read = models.BooleanField(default=False)
    
    # Campos para relacionar con cualquier modelo
    content_type = models.ForeignKey(ContentType, on_delete=models.CASCADE, null=True, blank=True)
    object_id = models.PositiveIntegerField(null=True, blank=True)
    related_object = GenericForeignKey('content_type', 'object_id')
    
    # Campos para seguimiento de envío
    email_status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    push_status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    
    # Metadata adicional (como JSON)
    data = models.JSONField(default=dict, blank=True)
    
    class Meta:
        ordering = ['-created_at']
    
    def __str__(self):
        return f"{self.title} ({self.user.username})"
    
    def mark_as_read(self):
        """Marca la notificación como leída"""
        from django.utils import timezone
        
        if not self.is_read:
            self.is_read = True
            self.read_at = timezone.now()
            self.save(update_fields=['is_read', 'read_at'])
```

### 2. Servicio de Notificaciones

```python
# notifications/services.py
from django.utils import timezone
from django.template import Template, Context
from django.contrib.contenttypes.models import ContentType
from django.conf import settings
from .models import Notification, NotificationType, NotificationPreference

class NotificationService:
    """Servicio para enviar notificaciones a los usuarios"""
    
    @classmethod
    def send_notification(cls, user, notification_type_code, context=None, related_object=None):
        """
        Envía una notificación al usuario
        
        Args:
            user: Usuario destinatario
            notification_type_code: Código del tipo de notificación
            context: Diccionario con variables para renderizar el template
            related_object: Objeto relacionado con la notificación
        """
        try:
            # Obtener tipo de notificación
            notification_type = NotificationType.objects.get(code=notification_type_code)
            
            # Obtener o crear preferencias del usuario
            preferences, _ = NotificationPreference.objects.get_or_create(
                user=user,
                notification_type=notification_type,
                defaults={
                    'email_enabled': notification_type.email_enabled,
                    'push_enabled': notification_type.push_enabled,
                    'in_app_enabled': notification_type.in_app_enabled,
                }
            )
            
            # Preparar contexto
            if context is None:
                context = {}
            context.update({
                'user': user,
                'site_name': settings.SITE_NAME,
                'site_url': settings.SITE_URL,
            })
            
            # Renderizar templates
            ctx = Context(context)
            subject_template = Template(notification_type.template_subject)
            body_template = Template(notification_type.template_body)
            
            title = subject_template.render(ctx)
            message = body_template.render(ctx)
            
            # Crear notificación
            notification = Notification(
                user=user,
                notification_type=notification_type,
                title=title,
                message=message,
                data=context
            )
            
            # Asociar objeto relacionado si existe
            if related_object:
                content_type = ContentType.objects.get_for_model(related_object)
                notification.content_type = content_type
                notification.object_id = related_object.id
            
            notification.save()
            
            # Enviar notificaciones según preferencias
            if preferences.email_enabled:
                cls._send_email_notification(notification)
                
            if preferences.push_enabled:
                cls._send_push_notification(notification)
                
            return notification
            
        except NotificationType.DoesNotExist:
            raise ValueError(f"Notification type with code '{notification_type_code}' does not exist")
        except Exception as e:
            # Registrar error pero no propagarlo
            import logging
            logging.error(f"Error sending notification: {str(e)}")
            return None
    
    @staticmethod
    def _send_email_notification(notification):
        """Envía la notificación por email"""
        # En implementación real, utilizar Django Email o algún servicio como SendGrid
        try:
            from django.core.mail import send_mail
            
            send_mail(
                subject=notification.title,
                message=notification.message,
                html_message=notification.message,  # Podría ser HTML
                from_email=settings.DEFAULT_FROM_EMAIL,
                recipient_list=[notification.user.email],
                fail_silently=False,
            )
            
            notification.email_status = 'delivered'
            notification.save(update_fields=['email_status'])
            
        except Exception as e:
            notification.email_status = 'failed'
            notification.save(update_fields=['email_status'])
            raise e
    
    @staticmethod
    def _send_push_notification(notification):
        """Envía la notificación como push notification"""
        # Para implementación futura con Firebase o similar
        notification.push_status = 'pending'
        notification.save(update_fields=['push_status'])

    @classmethod
    def mark_as_read(cls, notification_id, user):
        """Marca una notificación como leída"""
        try:
            notification = Notification.objects.get(id=notification_id, user=user)
            notification.mark_as_read()
            return True
        except Notification.DoesNotExist:
            return False
            
    @classmethod
    def mark_all_as_read(cls, user):
        """Marca todas las notificaciones del usuario como leídas"""
        unread_notifications = Notification.objects.filter(
            user=user,
            is_read=False
        )
        
        current_time = timezone.now()
        unread_notifications.update(is_read=True, read_at=current_time)
        
        return unread_notifications.count()
```

### 3. Endpoints de API para Notificaciones

```python
# notifications/views.py
from rest_framework import viewsets, status, permissions
from rest_framework.decorators import action
from rest_framework.response import Response
from .models import Notification, NotificationPreference, NotificationType
from .serializers import (
    NotificationSerializer, 
    NotificationPreferenceSerializer,
    NotificationTypeSerializer
)
from .services import NotificationService

class NotificationViewSet(viewsets.ReadOnlyModelViewSet):
    """API para notificaciones del usuario autenticado"""
    serializer_class = NotificationSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        """Solo devuelve notificaciones del usuario actual"""
        return Notification.objects.filter(user=self.request.user)
    
    @action(detail=True, methods=['post'])
    def mark_as_read(self, request, pk=None):
        """Marca una notificación como leída"""
        success = NotificationService.mark_as_read(pk, request.user)
        
        if success:
            return Response({'status': 'notification marked as read'})
        return Response(
            {'error': 'Notification not found'}, 
            status=status.HTTP_404_NOT_FOUND
        )
    
    @action(detail=False, methods=['post'])
    def mark_all_as_read(self, request):
        """Marca todas las notificaciones como leídas"""
        count = NotificationService.mark_all_as_read(request.user)
        return Response({'status': f'{count} notifications marked as read'})
    
    @action(detail=False, methods=['get'])
    def unread(self, request):
        """Devuelve solo notificaciones no leídas"""
        queryset = self.get_queryset().filter(is_read=False)
        page = self.paginate_queryset(queryset)
        
        if page is not None:
            serializer = self.get_serializer(page, many=True)
            return self.get_paginated_response(serializer.data)
            
        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)

class NotificationPreferenceViewSet(viewsets.ModelViewSet):
    """API para gestionar preferencias de notificaciones"""
    serializer_class = NotificationPreferenceSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        """Solo devuelve preferencias del usuario actual"""
        return NotificationPreference.objects.filter(user=self.request.user)
    
    def perform_create(self, serializer):
        """Asigna automáticamente el usuario actual"""
        serializer.save(user=self.request.user)

class NotificationTypeViewSet(viewsets.ReadOnlyModelViewSet):
    """API para listar tipos de notificaciones disponibles"""
    queryset = NotificationType.objects.all()
    serializer_class = NotificationTypeSerializer
    permission_classes = [permissions.IsAuthenticated]
```

## Implementación del Frontend

### 1. Componente de Notificaciones

```tsx
// src/components/notifications/NotificationsMenu.tsx
import React, { useState, useEffect } from 'react';
import {
  Badge,
  Box,
  IconButton,
  Menu,
  MenuItem,
  Divider,
  Typography,
  ListItemText,
  Button,
  CircularProgress,
} from '@mui/material';
import NotificationsIcon from '@mui/icons-material/Notifications';
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';

import { useGetUnreadNotificationsQuery, useMarkAsReadMutation, useMarkAllAsReadMutation } from '@/api/notificationsApi';

const NotificationsMenu = () => {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);
  
  // API queries y mutations
  const { data: notifications, isLoading, refetch } = useGetUnreadNotificationsQuery();
  const [markAsRead] = useMarkAsReadMutation();
  const [markAllAsRead] = useMarkAllAsReadMutation();
  
  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };
  
  const handleClose = () => {
    setAnchorEl(null);
  };
  
  const handleMarkAsRead = async (id: number) => {
    try {
      await markAsRead(id);
      refetch();
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };
  
  const handleMarkAllAsRead = async () => {
    try {
      await markAllAsRead();
      refetch();
      handleClose();
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
    }
  };
  
  return (
    <>
      <IconButton
        size="large"
        color="inherit"
        onClick={handleClick}
        aria-controls={open ? 'notifications-menu' : undefined}
        aria-haspopup="true"
        aria-expanded={open ? 'true' : undefined}
      >
        <Badge badgeContent={notifications?.length || 0} color="error">
          <NotificationsIcon />
        </Badge>
      </IconButton>
      
      <Menu
        id="notifications-menu"
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        PaperProps={{
          style: {
            maxHeight: 400,
            width: 350,
          },
        }}
      >
        <Box px={2} py={1} display="flex" justifyContent="space-between" alignItems="center">
          <Typography variant="subtitle1" fontWeight="bold">
            Notificaciones
          </Typography>
          {notifications && notifications.length > 0 && (
            <Button size="small" onClick={handleMarkAllAsRead}>
              Marcar todas como leídas
            </Button>
          )}
        </Box>
        
        <Divider />
        
        {isLoading ? (
          <Box p={2} display="flex" justifyContent="center">
            <CircularProgress size={24} />
          </Box>
        ) : notifications && notifications.length > 0 ? (
          notifications.map((notification) => (
            <MenuItem key={notification.id} onClick={() => handleMarkAsRead(notification.id)}>
              <Box width="100%">
                <Typography variant="subtitle2" fontWeight="bold" gutterBottom>
                  {notification.title}
                </Typography>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  {notification.message}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {formatDistanceToNow(new Date(notification.created_at), { addSuffix: true, locale: es })}
                </Typography>
              </Box>
            </MenuItem>
          ))
        ) : (
          <Box p={2} textAlign="center">
            <Typography variant="body2" color="text.secondary">
              No tienes notificaciones nuevas
            </Typography>
          </Box>
        )}
        
        {notifications && notifications.length > 0 && (
          <>
            <Divider />
            <Box p={1} textAlign="center">
              <Button size="small" href="/perfil/notificaciones">
                Ver todas las notificaciones
              </Button>
            </Box>
          </>
        )}
      </Menu>
    </>
  );
};

export default NotificationsMenu;
```

### 2. Página de Centro de Notificaciones

```tsx
// src/app/perfil/notificaciones/page.tsx
'use client';

import React, { useState } from 'react';
import {
  Box,
  Typography,
  Paper,
  Tabs,
  Tab,
  List,
  ListItem,
  ListItemText,
  Divider,
  Chip,
  Button,
  CircularProgress,
  Card,
  CardContent,
  FormControlLabel,
  Switch,
  Alert,
} from '@mui/material';

import { 
  useGetNotificationsQuery, 
  useGetNotificationPreferencesQuery,
  useUpdateNotificationPreferenceMutation 
} from '@/api/notificationsApi';
import { formatDate } from '@/lib/utils';

// Componente de pestaña
interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`notifications-tabpanel-${index}`}
      aria-labelledby={`notifications-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ pt: 3 }}>{children}</Box>}
    </div>
  );
}

export default function NotificationsPage() {
  const [tabValue, setTabValue] = useState(0);
  
  // Consultas de API
  const { data: notifications, isLoading: isLoadingNotifications } = useGetNotificationsQuery();
  const { data: preferences, isLoading: isLoadingPreferences } = useGetNotificationPreferencesQuery();
  const [updatePreference, { isLoading: isUpdating }] = useUpdateNotificationPreferenceMutation();

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };
  
  const handlePreferenceChange = async (preferenceId: number, field: string, checked: boolean) => {
    try {
      await updatePreference({
        id: preferenceId,
        [field]: checked
      });
    } catch (error) {
      console.error('Error updating preference:', error);
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Centro de Notificaciones
      </Typography>

      <Paper sx={{ width: '100%' }}>
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs 
            value={tabValue} 
            onChange={handleTabChange}
            aria-label="notification tabs"
          >
            <Tab label="Todas las Notificaciones" />
            <Tab label="Preferencias" />
          </Tabs>
        </Box>

        {/* Panel de Notificaciones */}
        <TabPanel value={tabValue} index={0}>
          {isLoadingNotifications ? (
            <Box display="flex" justifyContent="center" my={4}>
              <CircularProgress />
            </Box>
          ) : notifications && notifications.length > 0 ? (
            <List>
              {notifications.map((notification, index) => (
                <React.Fragment key={notification.id}>
                  <ListItem alignItems="flex-start" sx={{
                    bgcolor: notification.is_read ? 'transparent' : 'action.hover',
                  }}>
                    <ListItemText
                      primary={
                        <Box display="flex" justifyContent="space-between" alignItems="center">
                          <Typography variant="subtitle1" fontWeight={notification.is_read ? 'normal' : 'bold'}>
                            {notification.title}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {formatDate(notification.created_at, true)}
                          </Typography>
                        </Box>
                      }
                      secondary={
                        <Box mt={1}>
                          <Typography variant="body2" color="text.primary" gutterBottom>
                            {notification.message}
                          </Typography>
                          {!notification.is_read && (
                            <Chip 
                              label="No leída" 
                              size="small" 
                              color="primary" 
                              variant="outlined" 
                            />
                          )}
                        </Box>
                      }
                    />
                  </ListItem>
                  {index < notifications.length - 1 && <Divider component="li" />}
                </React.Fragment>
              ))}
            </List>
          ) : (
            <Box p={4} textAlign="center">
              <Typography color="text.secondary">
                No tienes notificaciones
              </Typography>
            </Box>
          )}
        </TabPanel>

        {/* Panel de Preferencias */}
        <TabPanel value={tabValue} index={1}>
          {isLoadingPreferences ? (
            <Box display="flex" justifyContent="center" my={4}>
              <CircularProgress />
            </Box>
          ) : preferences && preferences.length > 0 ? (
            <Box>
              <Typography variant="subtitle1" gutterBottom>
                Configura qué notificaciones deseas recibir y por qué medios
              </Typography>
              
              {preferences.map((preference) => (
                <Card key={preference.id} variant="outlined" sx={{ mb: 2 }}>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      {preference.notification_type.name}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" paragraph>
                      {preference.notification_type.description}
                    </Typography>
                    
                    <Box mt={2}>
                      <FormControlLabel
                        control={
                          <Switch
                            checked={preference.email_enabled}
                            onChange={(e) => handlePreferenceChange(
                              preference.id, 
                              'email_enabled', 
                              e.target.checked
                            )}
                            disabled={isUpdating}
                          />
                        }
                        label="Notificaciones por email"
                      />
                      
                      <FormControlLabel
                        control={
                          <Switch
                            checked={preference.in_app_enabled}
                            onChange={(e) => handlePreferenceChange(
                              preference.id, 
                              'in_app_enabled', 
                              e.target.checked
                            )}
                            disabled={isUpdating}
                          />
                        }
                        label="Notificaciones en la plataforma"
                      />
                      
                      {preference.notification_type.push_enabled && (
                        <FormControlLabel
                          control={
                            <Switch
                              checked={preference.push_enabled}
                              onChange={(e) => handlePreferenceChange(
                                preference.id, 
                                'push_enabled', 
                                e.target.checked
                              )}
                              disabled={isUpdating}
                            />
                          }
                          label="Notificaciones push"
                        />
                      )}
                    </Box>
                  </CardContent>
                </Card>
              ))}
            </Box>
          ) : (
            <Alert severity="info">
              No hay preferencias de notificación configurables en este momento.
            </Alert>
          )}
        </TabPanel>
      </Paper>
    </Box>
  );
}
```

### 3. API Slice para Notificaciones

```tsx
// src/api/notificationsApi.ts
import { apiSlice } from './apiSlice';

export interface Notification {
  id: number;
  title: string;
  message: string;
  created_at: string;
  read_at: string | null;
  is_read: boolean;
  notification_type: {
    id: number;
    code: string;
    name: string;
  };
  data: Record<string, any>;
}

export interface NotificationType {
  id: number;
  code: string;
  name: string;
  description: string;
  email_enabled: boolean;
  push_enabled: boolean;
  in_app_enabled: boolean;
}

export interface NotificationPreference {
  id: number;
  notification_type: NotificationType;
  email_enabled: boolean;
  push_enabled: boolean;
  in_app_enabled: boolean;
}

export const notificationsApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    // Obtener todas las notificaciones
    getNotifications: builder.query<Notification[], void>({
      query: () => `/notifications/`,
      providesTags: ['Notifications'],
    }),
    
    // Obtener solo notificaciones no leídas
    getUnreadNotifications: builder.query<Notification[], void>({
      query: () => `/notifications/unread/`,
      providesTags: ['Notifications'],
    }),
    
    // Marcar una notificación como leída
    markAsRead: builder.mutation<void, number>({
      query: (id) => ({
        url: `/notifications/${id}/mark_as_read/`,
        method: 'POST',
      }),
      invalidatesTags: ['Notifications'],
    }),
    
    // Marcar todas las notificaciones como leídas
    markAllAsRead: builder.mutation<void, void>({
      query: () => ({
        url: `/notifications/mark_all_as_read/`,
        method: 'POST',
      }),
      invalidatesTags: ['Notifications'],
    }),
    
    // Obtener preferencias de notificaciones
    getNotificationPreferences: builder.query<NotificationPreference[], void>({
      query: () => `/notification-preferences/`,
      providesTags: ['NotificationPreferences'],
    }),
    
    // Actualizar una preferencia
    updateNotificationPreference: builder.mutation<
      NotificationPreference, 
      Partial<NotificationPreference> & { id: number }
    >({
      query: ({ id, ...data }) => ({
        url: `/notification-preferences/${id}/`,
        method: 'PATCH',
        body: data,
      }),
      invalidatesTags: ['NotificationPreferences'],
    }),
    
    // Obtener tipos de notificaciones
    getNotificationTypes: builder.query<NotificationType[], void>({
      query: () => `/notification-types/`,
    }),
  }),
});

export const {
  useGetNotificationsQuery,
  useGetUnreadNotificationsQuery,
  useMarkAsReadMutation,
  useMarkAllAsReadMutation,
  useGetNotificationPreferencesQuery,
  useUpdateNotificationPreferenceMutation,
  useGetNotificationTypesQuery,
} = notificationsApiSlice;
```

## Eventos del Sistema que Generan Notificaciones

### 1. Configuración Inicial

Crear un archivo de configuración inicial con los tipos de notificaciones:

```python
# notifications/fixtures/notification_types.json
[
  {
    "model": "notifications.notificationtype",
    "pk": 1,
    "fields": {
      "code": "application_status_change",
      "name": "Cambio de Estado de Solicitud",
      "description": "Notificaciones cuando tu solicitud cambia de estado",
      "template_subject": "Tu solicitud {{ application.reference_number }} ha cambiado a {{ application.get_status_display }}",
      "template_body": "<p>Estimado/a {{ user.first_name }},</p><p>Tu solicitud de financiamiento con referencia <strong>{{ application.reference_number }}</strong> para {{ application.product.name }} ha cambiado de estado a <strong>{{ application.get_status_display }}</strong>.</p><p>Puedes ingresar a tu perfil para ver más detalles.</p>",
      "email_enabled": true,
      "push_enabled": true,
      "in_app_enabled": true
    }
  },
  {
    "model": "notifications.notificationtype",
    "pk": 2,
    "fields": {
      "code": "payment_reminder",
      "name": "Recordatorio de Pago",
      "description": "Recordatorios de pagos próximos a vencer",
      "template_subject": "Recordatorio: Pago programado para el {{ payment.due_date|date:'d/m/Y' }}",
      "template_body": "<p>Estimado/a {{ user.first_name }},</p><p>Te recordamos que tienes un pago programado de <strong>{{ payment.amount|floatformat:2 }}</strong> para el <strong>{{ payment.due_date|date:'d/m/Y' }}</strong> correspondiente a tu solicitud {{ payment.application.reference_number }}.</p><p>Realiza tu pago a tiempo para mantener un buen historial y acumular puntos.</p>",
      "email_enabled": true,
      "push_enabled": true,
      "in_app_enabled": true
    }
  },
  {
    "model": "notifications.notificationtype",
    "pk": 3,
    "fields": {
      "code": "payment_verified",
      "name": "Pago Verificado",
      "description": "Confirmación cuando un pago ha sido verificado",
      "template_subject": "Tu pago ha sido verificado",
      "template_body": "<p>Estimado/a {{ user.first_name }},</p><p>Tu pago de <strong>{{ payment.amount|floatformat:2 }}</strong> con referencia <strong>{{ payment.reference_number }}</strong> ha sido verificado exitosamente.</p><p>Has ganado {{ points_earned }} puntos adicionales.</p>",
      "email_enabled": true,
      "push_enabled": true,
      "in_app_enabled": true
    }
  },
  {
    "model": "notifications.notificationtype",
    "pk": 4,
    "fields": {
      "code": "payment_rejected",
      "name": "Pago Rechazado",
      "description": "Alerta cuando un pago ha sido rechazado",
      "template_subject": "Tu pago ha sido rechazado",
      "template_body": "<p>Estimado/a {{ user.first_name }},</p><p>Tu pago de <strong>{{ payment.amount|floatformat:2 }}</strong> con referencia <strong>{{ payment.reference_number }}</strong> ha sido rechazado.</p><p>Motivo: {{ payment.rejection_reason }}</p><p>Por favor, contacta con nuestro equipo de soporte para resolver este inconveniente.</p>",
      "email_enabled": true,
      "push_enabled": true,
      "in_app_enabled": true
    }
  },
  {
    "model": "notifications.notificationtype",
    "pk": 5,
    "fields": {
      "code": "document_verified",
      "name": "Documento Verificado",
      "description": "Confirmación de verificación de documentos",
      "template_subject": "Tu documento ha sido verificado",
      "template_body": "<p>Estimado/a {{ user.first_name }},</p><p>Tu documento <strong>{{ document.name }}</strong> para la solicitud <strong>{{ document.application.reference_number }}</strong> ha sido verificado exitosamente.</p>",
      "email_enabled": true,
      "push_enabled": false,
      "in_app_enabled": true
    }
  },
  {
    "model": "notifications.notificationtype",
    "pk": 6,
    "fields": {
      "code": "document_rejected",
      "name": "Documento Rechazado",
      "description": "Alerta cuando un documento ha sido rechazado",
      "template_subject": "Tu documento requiere corrección",
      "template_body": "<p>Estimado/a {{ user.first_name }},</p><p>Tu documento <strong>{{ document.name }}</strong> para la solicitud <strong>{{ document.application.reference_number }}</strong> ha sido rechazado.</p><p>Motivo: {{ document.rejection_reason }}</p><p>Por favor, sube una nueva versión del documento para continuar con tu solicitud.</p>",
      "email_enabled": true,
      "push_enabled": true,
      "in_app_enabled": true
    }
  },
  {
    "model": "notifications.notificationtype",
    "pk": 7,
    "fields": {
      "code": "points_updated",
      "name": "Puntos Actualizados",
      "description": "Notificación cuando tus puntos cambian",
      "template_subject": "Tus puntos han sido actualizados",
      "template_body": "<p>Estimado/a {{ user.first_name }},</p><p>Tus puntos han cambiado en {{ points_change }} puntos.</p><p>Motivo: {{ reason }}</p><p>Tu puntuación actual es de {{ current_points }} puntos.</p>",
      "email_enabled": false,
      "push_enabled": false,
      "in_app_enabled": true
    }
  },
  {
    "model": "notifications.notificationtype",
    "pk": 8,
    "fields": {
      "code": "adjudication_ready",
      "name": "Listo para Adjudicación",
      "description": "Notificación cuando tu solicitud está lista para adjudicación",
      "template_subject": "¡Tu solicitud está lista para adjudicación!",
      "template_body": "<p>Estimado/a {{ user.first_name }},</p><p>Nos complace informarte que tu solicitud <strong>{{ application.reference_number }}</strong> para {{ application.product.name }} ha alcanzado el umbral requerido del {{ application.financing_plan.adjudication_percentage }}% y está lista para adjudicación.</p><p>Por favor, contacta con nosotros para coordinar la entrega de tu {{ application.product.name }}.</p>",
      "email_enabled": true,
      "push_enabled": true,
      "in_app_enabled": true
    }
  }
]
```

### 2. Implementación en diferentes módulos

#### Ejemplo: Actualización de estado de solicitud

```python
# applications/services.py
from notifications.services import NotificationService

def update_application_status(application, new_status, note=None, updated_by=None):
    """
    Actualiza el estado de una solicitud y envía notificaciones
    """
    old_status = application.status
    application.status = new_status
    
    # Si hay una nota, agregar al historial
    if note:
        application.add_status_history(
            status=new_status,
            note=note,
            created_by=updated_by
        )
    
    application.save()
    
    # Enviar notificación al usuario
    NotificationService.send_notification(
        user=application.user,
        notification_type_code='application_status_change',
        context={
            'application': application,
            'old_status': old_status,
            'new_status': new_status,
        },
        related_object=application
    )
    
    return application
```

#### Ejemplo: Verificación de pago

```python
# payments/services.py
from notifications.services import NotificationService
from points_system.services import calculate_points_for_payment

def verify_payment(payment, verified_by, verification_notes=None):
    """Verifica un pago y envía notificaciones"""
    # Verificar el pago
    payment.verify_payment(verified_by, verification_notes)
    
    # Calcular puntos
    points_transaction = calculate_points_for_payment(payment)
    
    # Enviar notificación
    NotificationService.send_notification(
        user=payment.user,
        notification_type_code='payment_verified',
        context={
            'payment': payment,
            'points_earned': points_transaction.points,
        },
        related_object=payment
    )
    
    return payment
```

## Indicaciones para Mantenimiento y Ampliación

### Agregar un Nuevo Tipo de Notificación

1. Definir el código, nombre y templates para el nuevo tipo
2. Agregar a la base de datos (mediante admin Django o migrations)
3. Implementar la llamada al servicio en el lugar adecuado del código

### Integración con Servicios de Email

Para envío masivo, considerar la integración con:
- SendGrid
- Amazon SES
- Mailgun

Ejemplo de SendGrid:

```python
def _send_email_notification(notification):
    """Envía la notificación por email usando SendGrid"""
    try:
        import sendgrid
        from sendgrid.helpers.mail import Mail, Email, To, Content
        
        sg = sendgrid.SendGridAPIClient(api_key=settings.SENDGRID_API_KEY)
        
        from_email = Email(settings.DEFAULT_FROM_EMAIL)
        to_email = To(notification.user.email)
        subject = notification.title
        content = Content("text/html", notification.message)
        
        mail = Mail(from_email, to_email, subject, content)
        response = sg.client.mail.send.post(request_body=mail.get())
        
        if response.status_code >= 200 and response.status_code < 300:
            notification.email_status = 'delivered'
        else:
            notification.email_status = 'failed'
            
        notification.save(update_fields=['email_status'])
        
    except Exception as e:
        notification.email_status = 'failed'
        notification.save(update_fields=['email_status'])
        raise e
```

### Desarrollo Futuro: Notificaciones Push

Para la Fase 2 del proyecto, integrar con Firebase Cloud Messaging:

1. Configurar Firebase en el proyecto
2. Implementar servicio de token de dispositivo
3. Añadir código para envío de notificaciones push

```python
def _send_push_notification(notification):
    """Envía la notificación como push notification usando Firebase"""
    try:
        import firebase_admin
        from firebase_admin import messaging
        
        # Obtener token del dispositivo del usuario
        device_token = UserDevice.objects.filter(
            user=notification.user, 
            is_active=True
        ).values_list('token', flat=True).first()
        
        if not device_token:
            notification.push_status = 'failed'
            notification.save(update_fields=['push_status'])
            return
        
        # Crear mensaje
        message = messaging.Message(
            notification=messaging.Notification(
                title=notification.title,
                body=notification.message,
            ),
            token=device_token,
            data={
                'notification_id': str(notification.id),
                'type': notification.notification_type.code,
            }
        )
        
        # Enviar mensaje
        response = messaging.send(message)
        
        notification.push_status = 'delivered'
        notification.save(update_fields=['push_status'])
        
    except Exception as e:
        notification.push_status = 'failed'
        notification.save(update_fields=['push_status'])
        raise e
```

## Conclusiones

El Sistema de Notificaciones es un componente crítico para mantener informados a los usuarios sobre eventos importantes en la plataforma LlévateloExpress. Su implementación adecuada mejorará significativamente la experiencia del usuario y aumentará la transparencia en los procesos de financiamiento.

Este documento proporciona la base para implementar un sistema de notificaciones robusto y extensible que se puede ampliar en el futuro con más tipos de notificaciones y canales de entrega adicionales.

Una vez implementado, asegúrese de:

1. Monitorear el rendimiento del sistema, especialmente el envío de emails masivos
2. Recopilar feedback de los usuarios sobre la utilidad y frecuencia de las notificaciones
3. Revisar y optimizar las plantillas para mejorar las tasas de lectura y engagement

La documentación completa de la API y los componentes del frontend deben mantenerse actualizados a medida que evoluciona el sistema. 