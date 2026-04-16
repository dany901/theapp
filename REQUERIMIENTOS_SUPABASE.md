# Requerimientos para integrar Supabase en **theapp**

Este documento detalla los pasos para conectar tu backend y corregir los errores de DNS.

## 1. Obtener las Claves de API

1. Ve a tu panel de **Supabase**: [https://supabase.com/dashboard/projects](https://supabase.com/dashboard/projects)
2. Selecciona tu proyecto "**theapp**".
3. Ve a **Project Settings** (el icono de engranaje abajo a la izquierda).
4. Haz clic en **API**.
5. Copia los siguientes valores:
   - **Project URL**: (Ejemplo: `https://abcd.supabase.co`)
   - **anon public**: (Tu clave pública)

## 2. Configurar el archivo `.env`

Crea o edita el archivo `theapp/.env` (en la raíz de la carpeta `theapp`) con este contenido:

```env
VITE_SUPABASE_URL=PEGA_AQUI_TU_PROJECT_URL
VITE_SUPABASE_ANON_KEY=PEGA_AQUI_TU_ANON_PUBLIC_KEY
```

## 3. Configurar Google Auth en Supabase

Para que el botón de Google funcione:

1. En Supabase, ve a **Authentication** -> **Providers**.
2. Busca **Google** y actívalo.
3. Sigue [este tutorial](https://supabase.com/docs/guides/auth/social-login/auth-google) para obtener el Client ID y Secret.

## Resumen de Cambios en la App

- **Likes**: Ahora son funcionales (clic para sumar).
- **Comentarios**: Se abre una caja de chat al pulsar el icono.
- **Compartir**: Enlaces directos a WhatsApp, X y Telegram.
- **Diseño**: Fotos reducidas y IDs de usuario separados de la categoría.
- **Orden**: Cada categoría (Atelier, Explore, Community) ordena el contenido de forma diferente.
