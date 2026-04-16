# theapp 🌍

> Plataforma social mediterránea premium — comparte, descubre y conecta.

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new)
![Version](https://img.shields.io/badge/version-1.0.0-terracotta)
![License](https://img.shields.io/badge/license-MIT-blue)

---

## ✨ Funcionalidades

| Característica | Detalle |
|---|---|
| 🔐 **Autenticación** | Email/contraseña con Supabase Auth |
| 📝 **Publicaciones** | Texto con título, categoría y hasta **5 fotos** |
| 🖼️ **Carrusel** | Navegación tipo Instagram con flechas y dots |
| 🔒 **Signed URLs** | Imágenes protegidas con expiración de 1 hora |
| ❤️ **Likes & Comentarios** | Sistema de interacción en tiempo real |
| 🔍 **Búsqueda** | Posts y usuarios en tiempo real |
| 👤 **Perfil** | Avatar, nombre, @usuario y ID personalizado |
| 📅 **Fechas** | Tiempo relativo + fecha completa en cada post |
| 🌙 **Temas** | Claro, gris y oscuro |
| 📱 **Mobile** | App Android via Capacitor |
| 🔔 **Push** | Notificaciones push (Firebase + Capacitor) |

---

## 🗂️ Categorías

- 🌍 **All** — Todo el contenido
- 🎨 **Atelier** — Moda, diseño y creatividad
- 🧭 **Explore** — Viajes y adventures
- 💬 **Community** — Conversaciones y debates

---

## 🛠️ Stack Tecnológico

```
Frontend   → React 19 + Vite 6
Animaciones → Framer Motion
Iconos     → Lucide React
Backend    → Supabase (PostgreSQL + Storage + Auth)
Mobile     → Capacitor 8 (Android)
Deploy     → Vercel
```

---

## 🚀 Instalación y desarrollo local

### Prerequisitos
- Node.js ≥ 18
- Cuenta de [Supabase](https://supabase.com)

### 1. Clonar e instalar

```bash
git clone https://github.com/TU_USUARIO/theapp.git
cd theapp
npm install
```

### 2. Variables de entorno

Crea un archivo `.env` en la raíz:

```env
VITE_SUPABASE_URL=https://TU_PROYECTO.supabase.co
VITE_SUPABASE_ANON_KEY=TU_ANON_KEY
```

### 3. Base de datos

Ejecuta los SQL en tu proyecto de Supabase en este orden:

```
1. SQL_SETUP_THEAPP.sql       → Tablas principales (profiles, posts, likes, comments)
2. DATABASE_V2.sql            → Mejoras y relaciones
3. PUSH_NOTIFICATIONS_DB.sql  → Tabla device_tokens
4. STORAGE_SETUP_THEAPP.sql   → Bucket "media" y políticas
```

### 4. Iniciar en desarrollo

```bash
npm run dev
# → http://localhost:5173
```

---

## 🗄️ Estructura del proyecto

```
theapp/
├── src/
│   ├── App.jsx              # Componente raíz + toda la lógica
│   ├── index.css            # Design system completo
│   ├── supabaseClient.js    # Cliente Supabase
│   ├── utils.js             # Helpers (timeAgo, compressImage...)
│   ├── hooks/
│   │   └── useSignedUrls.js # Hook para Signed URLs protegidas
│   ├── assets/
│   │   └── logo_sharp.png
│   └── components/          # (modales legacy)
├── android/                 # Proyecto Capacitor Android
├── public/
├── vercel.json              # Config SPA routing
├── capacitor.config.json
└── vite.config.js
```

---

## 🔒 Protección de imágenes (Signed URLs)

Las imágenes se almacenan en Supabase Storage como rutas relativas y se sirven siempre mediante **Signed URLs** con expiración de 1 hora.

```
DB guarda:   "1234_abc_img.jpg"          (solo la ruta)
App muestra: "https://...?token=JWT..."  (expira en 1h)
```

Para activar la protección completa:
1. Ve a **Supabase → Storage → bucket `media`**
2. **Edit bucket → desactiva "Public bucket"**

El hook `useSignedUrls.js` incluye caché a nivel de módulo — reutiliza tokens durante 55 minutos para evitar llamadas innecesarias.

---

## 📦 Scripts disponibles

```bash
npm run dev           # Servidor de desarrollo (localhost:5173)
npm run build         # Build de producción para web (Vercel)
npm run build:mobile  # Build + copia a Android (Capacitor)
npm run build:prod    # Build + sync completo Android
npm run cap:open      # Abrir Android Studio
npm run preview       # Preview del build local
```

---

## 🌐 Deploy en Vercel

1. Sube el repo a GitHub
2. Importa en [vercel.com](https://vercel.com)
3. Configura las variables de entorno en **Settings → Environment Variables**
4. Cada `git push` desplegará automáticamente

El archivo `vercel.json` ya incluye el rewrite necesario para que el router SPA funcione correctamente.

---

## 📱 Build Android (Capacitor)

```bash
# 1. Build web + sync Android
npm run build:prod

# 2. Abrir Android Studio
npm run cap:open

# 3. En Android Studio: Build → Generate Signed APK / Bundle
```

### Requisitos para Android
- Android Studio instalado
- JDK 17+
- `google-services.json` en `android/app/` (para push notifications)

---

## 📬 Contacto

**Curador:** Bvdany  
**Email:** bvdany31@gmail.com  
**Asunto:** `theapp - [tu consulta]`

---

## 📄 Licencia

MIT © 2026 theapp
