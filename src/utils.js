import React from 'react';

/**
 * Generates sequential IDs like 00a1, 00a2... 0a10... a100... b001...
 * The pattern: 
 * - starts with numbers/letters as markers 
 * - evolves into a larger alphabetical/numerical sequence
 */
export const generateTheAppID = (index) => {
  const letters = 'abcdefghijklmnopqrstuvwxyz';
  const letterIndex = Math.floor(index / 999);
  const remainingValue = (index % 999) + 1;
  const letterPrefix = letters[letterIndex % 26];

  const numPart = remainingValue.toString().padStart(3, '0');
  
  if (index < 9) return `00a${index + 1}`;
  if (index < 99) return `0a${index + 1}`;
  if (index < 1000) return `a${numPart}`;
  
  return `${letterPrefix}${numPart}`;
};

// Example usage to map mock users
export const mapUsers = (count) => Array.from({ length: count }, (_, i) => generateTheAppID(i));

export const timeAgo = (dateStr) => {
  const diff = (Date.now() - new Date(dateStr)) / 1000;
  if (diff < 60) return 'ahora';
  if (diff < 3600) return `${Math.floor(diff / 60)}m`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h`;
  return `${Math.floor(diff / 86400)}d`;
};

export const renderTextWithLinks = (text) => {
  if (!text) return null;
  const urlRegex = /(https?:\/\/[^\s]+)/g;
  const parts = text.split(urlRegex);
  return parts.map((part, i) => {
    if (part.match(urlRegex)) {
      // Usamos React.createElement para evitar JSX en archivo .js y prevenir errores de Vite
      return React.createElement('a', {
        key: i,
        href: part,
        target: "_blank",
        rel: "noopener noreferrer",
        style: { color: 'var(--primary)', textDecoration: 'underline' },
        onClick: e => e.stopPropagation()
      }, part);
    }
    return part;
  });
};

export const compressImage = async (file, maxWidth = 1080) => {
  try {
    return await new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onerror = () => reject(new Error('FileReader error'));
      reader.onload = (event) => {
        const img = new Image();
        img.src = event.target.result;
        img.onerror = () => reject(new Error('Image load error'));
        img.onload = () => {
          try {
            const canvas = document.createElement('canvas');
            let width = img.width; let height = img.height;
            if (width > maxWidth) { height = (maxWidth / width) * height; width = maxWidth; }
            canvas.width = width; canvas.height = height;
            canvas.getContext('2d').drawImage(img, 0, 0, width, height);
            canvas.toBlob((blob) => {
              if (blob) resolve(new File([blob], file.name, { type: 'image/jpeg', lastModified: Date.now() }));
              else reject(new Error('canvas.toBlob returned null'));
            }, 'image/jpeg', 0.8);
          } catch (e) { reject(e); }
        };
      };
    });
  } catch (err) {
    console.warn('[COMPRESS] Fallo compresión, usando archivo original:', err.message);
    return file;
  }
};
