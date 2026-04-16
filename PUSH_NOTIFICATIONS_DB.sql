-- ========================================================
-- SCRIPT MIGRACIÓN: Notificaciones Push (FCM / Web Push)
-- ========================================================

-- Crear tabla para almacenar los tokens de dispositivos por usuario
-- Un usuario puede tener múltiples sesiones abiertas (Teléfono, PC, etc.)
CREATE TABLE IF NOT EXISTS public.device_tokens (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    token TEXT NOT NULL UNIQUE,
    platform TEXT, -- 'android', 'ios', 'web'
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    last_used TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Políticas de Seguridad (RLS) para hacerla segura
ALTER TABLE public.device_tokens ENABLE ROW LEVEL SECURITY;

-- Un usuario puede registrar sus propios tokens
CREATE POLICY "Los usuarios pueden insertar sus propios tokens" 
ON public.device_tokens FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- Un usuario solo puede ver y gestionar sus propios tokens
CREATE POLICY "Los usuarios pueden ver sus propios tokens" 
ON public.device_tokens FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Los usuarios pueden actualizar sus tokens" 
ON public.device_tokens FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Los usuarios pueden borrar sus tokens" 
ON public.device_tokens FOR DELETE 
USING (auth.uid() = user_id);

-- Opcional: Índice para búsquedas rápidas al enviar notificaciones masivas
CREATE INDEX IF NOT EXISTS device_tokens_user_id_idx ON public.device_tokens(user_id);
