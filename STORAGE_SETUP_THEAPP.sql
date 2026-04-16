-- 1. Habilitar STORAGE (Si no está habilitado)
-- Nota: Puedes crear el bucket manualmente en el panel de Supabase -> Storage llamado "media" con acceso público para que sea más fácil.

-- 2. Permisos para que los usuarios puedan subir fotos a la carpeta "media"
-- Reemplaza 'media' por el nombre de tu bucket si decides llamarlo distinto.

INSERT INTO storage.buckets (id, name, public) 
VALUES ('media', 'media', true)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "Cualquiera ve las fotos de theapp"
ON storage.objects FOR SELECT
USING (bucket_id = 'media');

CREATE POLICY "Usuarios registrados suben fotos"
ON storage.objects FOR INSERT
WITH CHECK (
    bucket_id = 'media' 
    AND auth.role() = 'authenticated'
);

CREATE POLICY "Usuarios borran sus fotos"
ON storage.objects FOR DELETE
USING (
    bucket_id = 'media' 
    AND auth.uid() = owner
);
