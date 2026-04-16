# 📝 Registro de Cambios (Changelog) - TheApp

Este documento rastrea todas las modificaciones, mejoras y nuevas funcionalidades añadidas a TheApp.

---

## [Versión 0.1] - 11 de Abril, 2026

### ✨ Funcionalidades y Mejoras Iniciales
- **Diseño y Estética**: Implementación del nuevo tema "Premium Matte Black" como color principal (`#111111`) y acentos de color clásico (Like Rojo `#ff3b30`).
- **Publicaciones (Feed)**: Modificación del modal de detalle de los posts. Se permite la edición del post **una única vez** integrando la etiqueta visual `(editado)`.
- **Sistema de Chat**: 
  - Sincronización en tiempo real vía Supabase.
  - El panel lateral ahora carga agresivamente los *amigos mutuos* interactivamente.
  - Corrección de la duplicación visual (optimistic vs realtime) de mensajes enviados.
  - Inserción de botones de "Seguir" y "Bloquear" en la cabecera del chat con un usuario seleccionado.
  - Soporte de navegación responsiva para volver a la lista de usuarios en dispositivos móviles.
- **Interacción / Regalos**: Desactivadas las alertas intrusivas y molestas al enviar un regalo para asegurar una experiencia de usuario limpia y silenciosa.
- **Optimizaciones de Almacenamiento**: Implementación del sistema de compresión de archivos multimedia en el lado del cliente (frontend) antes de subir a los buckets de Supabase para optimizar costos de ancho de banda y almacenamiento.
- **Marco Legal (GDPR)**: Redacción y actualización de la sección `Policies.jsx` incluyendo los derechos contemplados en el GDPR (Arts. 13, 15, 17 y 21) referentes a transparencia, derecho al olvido, y gestión de la privacidad y geolocalización de los usuarios.

---

## [Versión 0.2] - 11 de Abril, 2026

### 🛡️ Cumplimiento Legal y Propiedad
- **Archivo de Licencia**: Creación del archivo raíz `LICENSE` fijando la plataforma como software *Propietario y Confidencial* (Propiedad Intelectual sin permiso de copia o ingeniería inversa).
- **Términos de Servicio (ToS)**: Sumados a la sección de normativas (`Policies.jsx`), definiendo las reglas de la comunidad y reserva de derechos de bloqueo.
- **EULA (Contrato de Licencia para Usuario Final)**: Se añadió oficialmente a las políticas para cumplir con los estándares requeridos para lanzamiento (exenciones de hardware, licencias limitadas revocables), esencial para la Google Play Store.

### 🔗 Publicaciones Inteligentes
- **Previsualización de Enlaces (Link Previews)**: Los usuarios pueden pegar un enlace externo en el campo de texto de nueva publicación. El sistema está ahora programado para extraer y descargar inteligentemente los *metadatos Open Graph* directamente (utilizando la API gratuita de Microlink), estableciendo la portada del enlace como imagen `media_url` nativa en el post automáticamente.

---

## [Versión 0.3] - 13 de Abril, 2026

### 📱 Optimización Móvil y Capacitor
- **Sincronización Automatizada**: Se crearon atajos nativos en `package.json` (`build:prod`) para construir en Vite y sincronizar automáticamente la carpeta `android` sin código inactivo.
- **Sensación Nativa CSS**: Ajuste profundo de `index.css` bloqueando el *scroll elástico* (bounce behavior) clásico de aplicaciones web móviles y habilitación de zonas seguras (`safe-area-inset`).
- **Control Físico**: Interceptación inteligente del Botón Físico "Atrás" en Android interactuando de forma controlada con react (*modales de post y auth*), protegiéndose de salidas accidentales de la app.
- **Iconografía Completa**: Instanciación del `splash.png` e `icon.png` base dentro del motor de `@capacitor/assets` procesando múltiples resoluciones adaptativas.

### 🔔 Notificaciones Push (Infrastructure)
- **Plugin de Alertas**: Instalación y configuración Typescript de `@capacitor/push-notifications`.
- **Estructura Auth**: Integración con el contexto de Firebase Cloud Messaging y obtención pasiva de *Tokens de Registro* por cada `user_id` logueado dinámicamente.
- **Tabla Inteligente FCM**: Escritura directa en BD (Supabase) del archivo `PUSH_NOTIFICATIONS_DB.sql` creando `device_tokens` asegurado con Row Level Security (RLS) anti-spam.
