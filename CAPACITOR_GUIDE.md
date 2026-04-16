# 📱 Guía de Integración Híbrida: Capacitor 6+ y Android SDK 36

Esta guía detalla las mejores prácticas y los pasos exactos para preparar, optimizar y firmar tu aplicación TheApp para producción en Android, garantizando paridad de comportamiento entre la web (Vite) y la versión nativa.

---

## 1. Sincronización Automática de Vite y Capacitor

Para garantizar que tu código generado en la carpeta `dist` pase automáticamente a Android (`android/app/src/main/assets/public`), ajusta los scripts en tu `package.json`:

```json
"scripts": {
  "dev": "vite",
  "build": "vite build && cap copy android",
  "build:prod": "vite build && cap sync android",
  "cap:open": "cap open android"
}
```

* Al correr `npm run build:prod`, se minificará el código, se removerá el código muerto y se sincronizará automáticamente con Android.

---

## 2. Configurar el Icono y Splash Screen

Usa la librería oficial de Capacitor para generar los recursos visuales en todas las resoluciones requeridas sin esfuerzo manual.

**Paso 1:** Coloca un `icon.png` (ideal 1024x1024) y un `splash.png` (ideal 2732x2732 sin transparencia) en una carpeta llamada `assets/` en la raíz de tu proyecto.

**Paso 2:** Ejecuta el generador de Capacitor:

```bash
npx @capacitor/assets generate --android
```

> *Esto incrustará automáticamente los iconos y splash screens directamente en tu directorio nativo de Android usando los tamaños exactos y respetando el diseño robusto de la marca.*

---

## 3. Generar el APK de Prueba Firmado (Gradle 8.13)

Si quieres enviar y probar la app, utiliza el wrapper de Gradle que ya viene configurado en la carpeta de Android.

Desde la terminal y **dentro del directorio de android (`cd android`)**, ejecuta:

**Para Windows:**

```powershell
.\gradlew assembleDebug
```

**Para Mac/Linux:**

```bash
./gradlew assembleDebug
```

*El APK generado y firmado para pruebas estará listo en:*
`android/app/build/outputs/apk/debug/app-debug.apk`

> *Asegúrate en el archivo `android/variables.gradle` que el SDK está correctamente establecido a 36 y las APIs de AndroidX estén al día.*

---

## 4. Optimización de WebView: Evitar que el teclado rompa el Layout de Vite

En Android, abrir el teclado puede desatar eventos que redimensionen abruptamente la ventana, estropeando tu menú inferior o modales de React.

Abre el archivo nativo `MainActivity.java` (ubicado en `android/app/src/main/java/tudominio/MainActivity.java`) y añade la bandera de configuración de teclado. Y en tu `AndroidManifest.xml` (en `android/app/src/main/AndroidManifest.xml`), dentro del tag `<activity>`, asegúrate de tener:

```xml
android:windowSoftInputMode="adjustResize"
```

*(Si no quieres que la pantalla se encoja nunca y prefieres que el teclado se sobreponga, cámbialo a `adjustPan` o `adjustNothing`).*

**Manejo de "Safe Areas" y el rebote elástico del Layout (CSS Frontend):**

Añade a tu `index.css`:

```css
/* Evita que el body sea desplazable al estilo web (Bounce effect) */
body {
  overscroll-behavior-y: none;
  min-height: 100vh;
  min-height: -webkit-fill-available;
}

/* Protege el contenido del Notch y los bordes */
.app-container {
  padding-top: env(safe-area-inset-top);
  padding-bottom: env(safe-area-inset-bottom);
}
```

---

## 5. El Botón Físico de "Atrás" en Android

Si estás viendo un Modal (ej. PostDetailModal) y el usuario presiona "Atrás" en Android, por defecto se cerrará la App entera. Configura Capacitor App Plugin en tu `App.jsx`:

```javascript
import { App as CapacitorApp } from '@capacitor/app';
import { useEffect } from 'react';

// Dentro de tu App principal de React:
useEffect(() => {
  const backButtonListener = CapacitorApp.addListener('backButton', ({ canGoBack }) => {
    // Aquí pon tu lógica. Si tienes un modal abierto, ciérralo.
    // Si no, y `canGoBack` es true, haz window.history.back();
    // Si no puedes ir atrás, usa CapacitorApp.exitApp();
  });

  return () => {
    backButtonListener.remove();
  };
}, []);
```

---

## 6. Notificaciones Push (Firebase + Capacitor + Service Worker)

Como expertos, sabemos que la Web Push API y Android Push son flujos paralelos que deben integrarse elegantemente para SDK 36.

**Instalación:**

```bash
npm install @capacitor/push-notifications
npx cap sync android
```

**Permisos y Captura de Token en React (TypeScript / JavaScript):**

```javascript
import { Capacitor } from '@capacitor/core';
import { PushNotifications } from '@capacitor/push-notifications';

export const registerPushNotifications = async () => {
  if (Capacitor.isNativePlatform()) {
    // Flujo Android (Desde SDK 33 / Android 13+ el permiso es obligatorio explícitamente en ejecución)
    let permStatus = await PushNotifications.checkPermissions();

    if (permStatus.receive === 'prompt') {
      permStatus = await PushNotifications.requestPermissions();
    }

    if (permStatus.receive !== 'granted') {
      console.warn("Permisos de notificaciones denegados en Android.");
      return;
    }

    // Registrar en FCM
    await PushNotifications.register();

    // Eventos
    PushNotifications.addListener('registration', (token) => {
      console.log('Push registration success, token: ' + token.value);
      // TODO: Envía token.value a Supabase para el Perfil
    });

    PushNotifications.addListener('pushNotificationReceived', (notification) => {
      console.log('App en Frontend - Push recibida: ', notification);
    });

  } else {
    // Flujo Web PWA (Service Worker)
    if ('serviceWorker' in navigator && 'PushManager' in window) {
      const permission = await Notification.requestPermission();
      if (permission === 'granted') {
          console.log("Para la Web usaremos Firebase Web SDK para el token y enviaremos a BD.");
      }
    }
  }
}
```

Para la versión Web en Offline y Web Push, configura tu `Vite/PWA plugin` para que inyecte un `firebase-messaging-sw.js` (Service Worker de Firebase) que levante caché estática y envíe eventos Push a la pantalla cuando la web esté cerrada.
