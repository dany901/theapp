/**
 * useSignedUrls.js
 * ─────────────────────────────────────────────────────────────────────────
 * Convierte URLs públicas o rutas de Supabase Storage en Signed URLs
 * con expiración de 1 hora. Cache a nivel de módulo para evitar llamadas
 * repetidas entre re-renders y entre componentes.
 *
 * ¿Cómo protege las imágenes?
 *  · Las Signed URLs incluyen un token JWT único y expiran en 1h.
 *  · Una vez expiradas, la URL no carga (403).
 *  · No hay URL pública estable que alguien pueda compartir o indexar.
 *  · Funciona solo si el bucket "media" está en modo PRIVADO en Supabase.
 * ─────────────────────────────────────────────────────────────────────────
 */
import { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';

// ── Cache global (nivel módulo — persiste entre renders) ──────────────────
const urlCache = new Map(); // key: storagePath → { signedUrl, expiresAt }

const EXPIRES_IN     = 3600; // duración de la signed URL en segundos (1h)
const REFRESH_BUFFER = 300;  // renovar 5 min antes de expirar

// ── Extrae el path relativo de Supabase de cualquier formato de URL ───────
export const extractStoragePath = (raw) => {
  if (!raw) return null;

  // Raw path (nuevo formato): "1234_abc_img.jpg" o "avatars/user_id.jpg"
  if (!raw.startsWith('http')) return raw;

  // URL pública completa: .../storage/v1/object/public/media/PATH
  // URL signed:           .../storage/v1/object/sign/media/PATH?token=...
  const match = raw.match(/\/object\/(?:public|sign)\/media\/(.+?)(?:\?|$)/);
  return match ? decodeURIComponent(match[1]) : null;
};

// ── Genera (o devuelve del cache) una Signed URL para un path ─────────────
export const resolveSignedUrl = async (storagePath) => {
  if (!storagePath) return null;

  const now    = Date.now();
  const cached = urlCache.get(storagePath);

  // Devolver del cache si no ha expirado (con buffer de 5 min)
  if (cached && cached.expiresAt > now + REFRESH_BUFFER * 1000) {
    return cached.signedUrl;
  }

  const { data, error } = await supabase.storage
    .from('media')
    .createSignedUrl(storagePath, EXPIRES_IN);

  if (error || !data?.signedUrl) {
    // Si falla (bucket aún público o path inválido), devolver null
    // → el componente hará fallback a la URL original
    console.warn('[SignedURL] Error en path:', storagePath, error?.message);
    return null;
  }

  urlCache.set(storagePath, {
    signedUrl: data.signedUrl,
    expiresAt: now + EXPIRES_IN * 1000,
  });

  return data.signedUrl;
};

// ── Hook principal ─────────────────────────────────────────────────────────
/**
 * useSignedUrls(rawUrls)
 * Recibe un array de URLs/paths (públicas, signed o rutas brutas).
 * Devuelve { resolved: string[], loading: boolean }
 * · resolved: array de Signed URLs listas para usar en <img src>
 * · Fallback: si no puede firmar, devuelve la URL original.
 */
export const useSignedUrls = (rawUrls = []) => {
  const key = rawUrls.join('|'); // dependency key estable
  const [resolved, setResolved] = useState([]);
  const [loading,  setLoading]  = useState(rawUrls.length > 0);

  useEffect(() => {
    if (!rawUrls.length) {
      setResolved([]);
      setLoading(false);
      return;
    }

    let cancelled = false;
    setLoading(true);

    Promise.all(
      rawUrls.map(async (raw) => {
        // URLs externas (dicebear, https que no son de Supabase Media) → sin firmar
        if (raw && raw.startsWith('http') && !raw.includes('supabase.co')) {
          return raw;
        }
        const path   = extractStoragePath(raw);
        const signed = path ? await resolveSignedUrl(path) : null;
        return signed ?? raw; // fallback a la URL original si falla
      })
    ).then((urls) => {
      if (!cancelled) {
        setResolved(urls);
        setLoading(false);
      }
    });

    return () => { cancelled = true; };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);

  return { resolved, loading };
};

// ── Hook singular (para un solo src, e.g. avatares) ───────────────────────
export const useSignedUrl = (rawUrl) => {
  const { resolved, loading } = useSignedUrls(rawUrl ? [rawUrl] : []);
  return { url: resolved[0] ?? rawUrl, loading };
};
