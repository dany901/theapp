import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Heart, MessageCircle, LogOut, Send, Trash2,
  Image as ImageIcon, X, AlertCircle, User, Camera, Check, ArrowLeft,
  ChevronUp, ChevronDown, Search, Menu, Shield, Mail
} from 'lucide-react';
import { App as CapacitorApp } from '@capacitor/app';
import { PushNotifications } from '@capacitor/push-notifications';
import { supabase } from './supabaseClient';
import { useSignedUrls, useSignedUrl } from './hooks/useSignedUrls';
import logo from './assets/logo_sharp.png';

const CATEGORIES = ['All', 'Atelier', 'Explore', 'Community'];

const CATEGORY_INFO = {
  All:       { emoji: '🌍', title: 'Todo',      desc: 'Toda la actividad de theapp en un solo lugar.' },
  Atelier:   { emoji: '🎨', title: 'Atelier',   desc: 'Espacio de moda, diseño y creatividad. Comparte tus creaciones, looks e inspiraciones visuales.' },
  Explore:   { emoji: '🧭', title: 'Explore',   desc: 'Descubre lugares, aventuras y experiencias únicas. Comparte tus viajes y momentos especiales.' },
  Community: { emoji: '💬', title: 'Community', desc: 'Conversaciones, noticias y debates de nuestra comunidad.' },
};

/* Parses "title\n---\nbody" format */
const parsePost = (content) => {
  if (!content) return { title: null, body: '' };
  const sep = '\n---\n';
  const idx = content.indexOf(sep);
  if (idx !== -1) return { title: content.slice(0, idx).trim(), body: content.slice(idx + sep.length).trim() };
  return { title: null, body: content };
};

const compressImage = async (file, maxWidth = 1080) => {
  try {
    return await new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onerror = () => reject(new Error('FileReader error'));
      reader.onload = (ev) => {
        const img = new Image();
        img.src = ev.target.result;
        img.onerror = () => reject(new Error('Image load error'));
        img.onload = () => {
          try {
            const canvas = document.createElement('canvas');
            let w = img.width, h = img.height;
            if (w > maxWidth) { h = (maxWidth / w) * h; w = maxWidth; }
            canvas.width = w; canvas.height = h;
            canvas.getContext('2d').drawImage(img, 0, 0, w, h);
            canvas.toBlob(blob => {
              if (blob) resolve(new File([blob], file.name, { type: 'image/jpeg', lastModified: Date.now() }));
              else reject(new Error('toBlob null'));
            }, 'image/jpeg', 0.82);
          } catch (e) { reject(e); }
        };
      };
    });
  } catch (err) {
    console.warn('[compress] fallback:', err.message);
    return file;
  }
};

const LinkifyText = ({ text }) => {
  if (!text) return null;
  const urlRegex = /(https?:\/\/[^\s]+)/g;
  const parts = text.split(urlRegex);
  return parts.map((part, i) => 
    part.match(urlRegex) 
      ? <a key={i} href={part} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--terracotta)', textDecoration: 'underline' }} onClick={e => e.stopPropagation()}>{part}</a> 
      : part
  );
};

const timeAgo = (d) => {
  const s = (Date.now() - new Date(d)) / 1000;
  if (s < 60) return 'ahora';
  if (s < 3600) return `${Math.floor(s / 60)}m`;
  if (s < 86400) return `${Math.floor(s / 3600)}h`;
  return `${Math.floor(s / 86400)}d`;
};

const MONTHS_ES = ['ene','feb','mar','abr','may','jun','jul','ago','sep','oct','nov','dic'];
const fullDate = (d) => {
  const dt = new Date(d);
  const dd = dt.getDate();
  const mm = MONTHS_ES[dt.getMonth()];
  const yyyy = dt.getFullYear();
  const hh = String(dt.getHours()).padStart(2,'0');
  const min = String(dt.getMinutes()).padStart(2,'0');
  const currentYear = new Date().getFullYear();
  return currentYear === yyyy ? `${dd} ${mm} · ${hh}:${min}` : `${dd} ${mm} ${yyyy} · ${hh}:${min}`;
};

// ─── MEDIA CAROUSEL ───────────────────────────────────────────────────
const parseMediaUrls = (mediaUrl) => {
  if (!mediaUrl) return [];
  try {
    const p = JSON.parse(mediaUrl);
    return Array.isArray(p) ? p.filter(Boolean) : [mediaUrl];
  } catch { return [mediaUrl]; }
};

const MediaCarousel = ({ mediaUrl, compact = false }) => {
  const rawUrls = React.useMemo(() => parseMediaUrls(mediaUrl), [mediaUrl]);
  const { resolved: urls, loading } = useSignedUrls(rawUrls);
  const [cur, setCur] = React.useState(0);
  const h = compact ? '180px' : '380px';

  // Spinner mientras se generan las Signed URLs
  if (loading && rawUrls.length > 0) return (
    <div className={`media-carousel${compact ? ' compact' : ''}`}
      style={{ height: h, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.04)' }}>
      <div style={{ width: '22px', height: '22px', border: '2px solid rgba(0,0,0,0.1)', borderTopColor: 'var(--terracotta)', borderRadius: '50%', animation: 'spin 0.7s linear infinite' }} />
    </div>
  );
  if (!urls.length) return null;

  return (
    <div className={`media-carousel${compact ? ' compact' : ''}`}>
      <img src={urls[cur]} alt={`foto ${cur + 1}`} style={{ height: h }}
        draggable="false"
        onContextMenu={e => e.preventDefault()}
      />
      {urls.length > 1 && (
        <>
          {cur > 0 && (
            <button className="carousel-arrow left" onClick={e => { e.stopPropagation(); setCur(c => c - 1); }}>‹</button>
          )}
          {cur < urls.length - 1 && (
            <button className="carousel-arrow right" onClick={e => { e.stopPropagation(); setCur(c => c + 1); }}>›</button>
          )}
          <div className="carousel-dots">
            {urls.map((_, i) => (
              <button key={i} className={`carousel-dot${i === cur ? ' active' : ''}`}
                style={{ width: i === cur ? '14px' : '5px' }}
                onClick={e => { e.stopPropagation(); setCur(i); }} />
            ))}
          </div>
          <div className="carousel-counter">{cur + 1}/{urls.length}</div>
        </>
      )}
    </div>
  );
};

// ─── POST DETAIL ──────────────────────────────────────────────────────
const PostDetail = ({ post, posts, currentIndex, user, profile, onClose, onLike, onCommentSubmit, onNavigate, onDelete }) => {
  const [comments, setComments]     = useState([]);
  const [commentText, setCommentText] = useState('');
  const [loading, setLoading]       = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [liked, setLiked]           = useState(post.user_has_liked || false);
  const [likesCount, setLikesCount] = useState(post.likes_count || 0);
  const bottomRef  = useRef(null);
  const touchStartY = useRef(0);
  const { title, body } = parsePost(post.content);
  const canPrev = currentIndex > 0;
  const canNext = currentIndex < posts.length - 1;

  useEffect(() => {
    setLiked(post.user_has_liked || false);
    setLikesCount(post.likes_count || 0);
    setLoading(true);
    let active = true;
    supabase.from('comments')
      .select('*, profiles(username, full_name, avatar_url)')
      .eq('post_id', post.id).order('created_at', { ascending: true })
      .then(({ data }) => {
        if (active && data) setComments(data);
        if (active) setLoading(false);
      });
    return () => { active = false; };
  }, [post.id, post.user_has_liked, post.likes_count]);

  const refreshComments = async () => {
    const { data } = await supabase.from('comments')
      .select('*, profiles(username, full_name, avatar_url)')
      .eq('post_id', post.id).order('created_at', { ascending: true });
    if (data) setComments(data);
  };

  const handleLike = async () => {
    if (!user) return;
    if (liked) {
      await supabase.from('likes').delete().match({ post_id: post.id, user_id: user.id });
      setLiked(false); setLikesCount(c => c - 1);
    } else {
      await supabase.from('likes').insert({ post_id: post.id, user_id: user.id });
      setLiked(true); setLikesCount(c => c + 1);
    }
    onLike();
  };

  const submitComment = async () => {
    if (!commentText.trim() || submitting || !user) return;
    setSubmitting(true);
    await supabase.from('comments').insert({ post_id: post.id, user_id: user.id, content: commentText.trim() });
    setCommentText('');
    await refreshComments();
    onCommentSubmit();
    setSubmitting(false);
    setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);
  };

  // Swipe navigation on mobile
  const onTouchStart = (e) => { touchStartY.current = e.touches[0].clientY; };
  const onTouchEnd   = (e) => {
    const diff = touchStartY.current - e.changedTouches[0].clientY;
    if (Math.abs(diff) > 60) {
      if (diff > 0 && canNext) onNavigate(currentIndex + 1);
      if (diff < 0 && canPrev) onNavigate(currentIndex - 1);
    }
  };

  const navBtn = (enabled, onClick, Icon) => (
    <button onClick={onClick} disabled={!enabled} style={{
      width: '40px', height: '40px', borderRadius: '50%', border: 'none',
      background: enabled ? 'white' : 'rgba(255,255,255,0.25)',
      color: enabled ? 'var(--terracotta)' : 'rgba(255,255,255,0.4)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      cursor: enabled ? 'pointer' : 'default',
      boxShadow: enabled ? '0 2px 10px rgba(0,0,0,0.18)' : 'none',
      transition: 'all 0.2s'
    }}>
      <Icon size={18} />
    </button>
  );

  return (
    <div className="modal-overlay" style={{ zIndex: 300 }} onClick={onClose}>
      {/* ↑↓ Navigation */}
      <div style={{ position: 'absolute', right: '16px', top: '50%', transform: 'translateY(-50%)', display: 'flex', flexDirection: 'column', gap: '8px', zIndex: 10 }} onClick={e => e.stopPropagation()}>
        {navBtn(canPrev, () => onNavigate(currentIndex - 1), ChevronUp)}
        {navBtn(canNext, () => onNavigate(currentIndex + 1), ChevronDown)}
      </div>

      <motion.div initial={{ y: 50, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 50, opacity: 0 }}
        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
        style={{ background: 'white', borderRadius: '28px', width: '100%', maxWidth: '580px', maxHeight: '92vh', overflow: 'hidden', display: 'flex', flexDirection: 'column', margin: '0 64px 0 16px' }}
        onClick={e => e.stopPropagation()}
        onTouchStart={onTouchStart} onTouchEnd={onTouchEnd}
      >
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '16px 20px', borderBottom: '1px solid rgba(0,0,0,0.06)', flexShrink: 0 }}>
          <button onClick={onClose} style={{ border: 'none', background: 'rgba(0,0,0,0.05)', borderRadius: '50%', width: '34px', height: '34px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <ArrowLeft size={16} />
          </button>
          <img src={post.profiles?.avatar_url || `https://api.dicebear.com/7.x/thumbs/svg?seed=${post.author_id}`}
            style={{ width: '40px', height: '40px', borderRadius: '50%', objectFit: 'cover', border: '2px solid rgba(159,64,45,0.2)', flexShrink: 0 }} alt="pfp" />
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontWeight: '800', fontSize: '14px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {post.profiles?.full_name || post.profiles?.username || 'Usuario'}
            </div>
            <div style={{ fontSize: '11px', opacity: 0.4 }}>
              @{post.profiles?.username}
              <span style={{ margin: '0 4px' }}>·</span>
              <span title={fullDate(post.created_at)}>{timeAgo(post.created_at)}</span>
              <span style={{ margin: '0 4px', opacity: 0.5 }}>·</span>
              <span style={{ fontVariantNumeric: 'tabular-nums' }}>{fullDate(post.created_at)}</span>
            </div>
          </div>
          <span style={{ fontSize: '8px', fontWeight: 'bold', border: '1px solid var(--terracotta)', color: 'var(--terracotta)', padding: '3px 10px', borderRadius: '20px', flexShrink: 0 }}>{post.category}</span>
          {posts.length > 1 && <span style={{ fontSize: '10px', opacity: 0.25, flexShrink: 0 }}>{currentIndex + 1}/{posts.length}</span>}
        </div>

        {/* Body */}
        <div style={{ overflowY: 'auto', flex: 1 }}>
          <div style={{ padding: '20px 22px' }}>
            {title && <h2 style={{ fontSize: '20px', fontWeight: '900', margin: '0 0 10px 0', lineHeight: '1.25' }}>{title}</h2>}
            <p style={{ fontSize: '15px', lineHeight: '1.65', margin: '0 0 16px 0', opacity: 0.85, wordBreak: 'break-word' }}>
              <LinkifyText text={body} />
            </p>
            {post.media_url && <MediaCarousel mediaUrl={post.media_url} />}
          </div>

          {/* Stats */}
          <div style={{ display: 'flex', gap: '24px', padding: '12px 22px', borderTop: '1px solid rgba(0,0,0,0.05)', borderBottom: '1px solid rgba(0,0,0,0.05)', alignItems: 'center' }}>
            <button onClick={handleLike}
              style={{ display: 'flex', alignItems: 'center', gap: '7px', border: 'none', background: 'none', cursor: user ? 'pointer' : 'default', color: liked ? 'var(--terracotta)' : 'rgba(0,0,0,0.5)', fontSize: '13px', fontWeight: '600', transition: 'color 0.2s' }}>
              <Heart size={18} fill={liked ? 'currentColor' : 'none'} /> {likesCount}
            </button>
            <span style={{ display: 'flex', alignItems: 'center', gap: '7px', fontSize: '13px', fontWeight: '600', color: 'rgba(0,0,0,0.35)' }}>
              <MessageCircle size={18} /> {comments.length}
            </span>
            {user?.id === post.author_id && (
              <button onClick={async () => {
                if (!window.confirm('¿Seguro que quieres eliminar esta publicación?')) return;
                const { error } = await supabase.from('posts').delete().eq('id', post.id);
                if (error) { alert('Error: ' + error.message); return; }
                if (onDelete) onDelete();
                onClose();
              }}
                style={{ display: 'flex', alignItems: 'center', gap: '6px', border: 'none', background: 'none', cursor: 'pointer', color: '#dc2626', fontSize: '12px', fontWeight: '600', marginLeft: 'auto', padding: '4px 8px', borderRadius: '8px', transition: 'background 0.2s' }}
                onMouseEnter={e => e.currentTarget.style.background = 'rgba(220,38,38,0.08)'}
                onMouseLeave={e => e.currentTarget.style.background = 'none'}
              >
                <Trash2 size={15} /> Eliminar
              </button>
            )}
          </div>

          {/* Comments */}
          <div style={{ padding: '16px 22px', display: 'flex', flexDirection: 'column', gap: '14px', background: 'rgba(0,0,0,0.015)' }}>
            <div style={{ fontSize: '10px', fontWeight: '800', opacity: 0.35, letterSpacing: '1.5px', marginBottom: '4px' }}>COMENTARIOS DE LA COMUNIDAD</div>
            {loading ? (
              <div style={{ textAlign: 'center', opacity: 0.3, fontSize: '12px', padding: '24px 0' }}>Cargando...</div>
            ) : comments.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '32px 0' }}>
                <MessageCircle size={28} style={{ opacity: 0.12, margin: '0 auto 8px' }} />
                <p style={{ fontSize: '13px', opacity: 0.4, margin: 0 }}>Sin comentarios todavía. ¡Sé el primero!</p>
              </div>
            ) : comments.map(c => (
              <div key={c.id} style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
                <img src={c.profiles?.avatar_url || `https://api.dicebear.com/7.x/thumbs/svg?seed=${c.user_id}`}
                  style={{ width: '34px', height: '34px', borderRadius: '50%', objectFit: 'cover', flexShrink: 0, border: '1px solid rgba(0,0,0,0.07)' }} alt="pfp" />
                <div style={{ background: 'rgba(0,0,0,0.035)', padding: '10px 14px', borderRadius: '16px', flex: 1 }}>
                  <div style={{ fontSize: '11px', fontWeight: '800', marginBottom: '3px', color: 'var(--terracotta)' }}>@{c.profiles?.username || 'user'}</div>
                  <div style={{ fontSize: '13px', lineHeight: '1.5' }}>{c.content}</div>
                </div>
              </div>
            ))}
            <div ref={bottomRef} />
          </div>
        </div>

        {/* Comment input */}
        <div style={{ padding: '14px 22px', borderTop: '1px solid rgba(0,0,0,0.06)', flexShrink: 0, background: 'white' }}>
          {user ? (
            <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
              <div style={{ width: '34px', height: '34px', borderRadius: '50%', overflow: 'hidden', flexShrink: 0, border: '2px solid rgba(159,64,45,0.2)' }}>
                {profile?.avatar_url
                  ? <img src={profile.avatar_url} style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt="me" />
                  : <div style={{ width: '100%', height: '100%', background: 'rgba(159,64,45,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><User size={14} color="var(--terracotta)" /></div>
                }
              </div>
              <input value={commentText} onChange={e => setCommentText(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && submitComment()}
                placeholder="Añade un comentario..."
                style={{ flex: 1, background: 'rgba(0,0,0,0.04)', border: 'none', borderRadius: '22px', padding: '10px 16px', fontSize: '13px', outline: 'none' }}
                autoFocus
              />
              {commentText.trim() && (
                <button onClick={() => setCommentText('')} style={{ background: 'rgba(0,0,0,0.05)', border: 'none', borderRadius: '50%', width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', flexShrink: 0 }}>
                  <X size={12} />
                </button>
              )}
              <button onClick={submitComment} disabled={!commentText.trim() || submitting}
                style={{ background: commentText.trim() ? 'var(--terracotta)' : '#e5e5e5', color: commentText.trim() ? 'white' : '#aaa', border: 'none', borderRadius: '50%', width: '38px', height: '38px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: commentText.trim() ? 'pointer' : 'default', transition: 'all 0.2s', flexShrink: 0 }}>
                <Send size={14} />
              </button>
            </div>
          ) : (
            <p style={{ textAlign: 'center', fontSize: '12px', opacity: 0.4, margin: 0 }}>Inicia sesión para comentar</p>
          )}
        </div>
      </motion.div>
    </div>
  );
};

// ─── INTERACTION BAR ──────────────────────────────────────────────────
const InteractionBar = ({ item, user, onLike, onOpenPost, isLiked }) => {
  return (
    <div onClick={e => e.stopPropagation()}
      style={{ marginTop: '16px', paddingTop: '12px', borderTop: '1px solid rgba(0,0,0,0.05)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
      <div style={{ display: 'flex', gap: '4px' }}>
        <button onClick={(e) => { e.stopPropagation(); onLike(); }}
          style={{ padding: '7px', color: isLiked ? 'var(--terracotta)' : 'rgba(0,0,0,0.4)', border: 'none', background: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '5px', fontSize: '12px', borderRadius: '20px', transition: 'all 0.2s' }}>
          <Heart size={15} fill={isLiked ? 'currentColor' : 'none'} /> {item.likes_count || 0}
        </button>
        <button onClick={(e) => { e.stopPropagation(); onOpenPost(); }}
          style={{ padding: '7px', opacity: 0.4, border: 'none', background: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '5px', fontSize: '12px', borderRadius: '20px' }}>
          <MessageCircle size={15} /> {item.comments_count || 0}
        </button>
      </div>
      <button onClick={(e) => { e.stopPropagation(); navigator.share ? navigator.share({ text: item.content, url: window.location.href }) : navigator.clipboard.writeText(window.location.href); }}
        style={{ padding: '7px', opacity: 0.22, border: 'none', background: 'none', cursor: 'pointer', borderRadius: '20px' }}>
        <Send size={15} />
      </button>
    </div>
  );
};

// ─── BENTO CARD ──────────────────────────────────────────────────────
const BentoCard = ({ item, user, onLike, onOpenPost }) => {
  const isLiked = item.user_has_liked || false;
  const { title, body } = parsePost(item.content);
  // Resuelve el avatar (puede ser un path de Supabase o una URL externa)
  const fallbackAvatar = `https://api.dicebear.com/7.x/thumbs/svg?seed=${item.author_id}`;
  const { url: avatarSrc } = useSignedUrl(item.profiles?.avatar_url || null);
  return (
    <motion.div className="bento-item" onClick={onOpenPost}
      whileHover={{ y: -2 }}
      style={{ background: 'white', padding: '20px', borderRadius: '25px', textAlign: 'center', cursor: 'pointer', transition: 'box-shadow 0.3s ease', boxShadow: '0 4px 20px rgba(0,0,0,0.03)' }}
    >
      <div style={{ display: 'flex', justifyContent: 'center', gap: '8px', marginBottom: '12px', alignItems: 'center' }}>
        <span style={{ fontSize: '9px', fontWeight: 'bold', opacity: 0.45 }}>@{item.profiles?.username || 'user'}</span>
        <span style={{ fontSize: '8px', fontWeight: 'bold', border: '1px solid var(--terracotta)', color: 'var(--terracotta)', padding: '2px 8px', borderRadius: '4px' }}>{item.category}</span>
      </div>
      <img src={avatarSrc || fallbackAvatar}
        style={{ width: '38px', height: '38px', borderRadius: '50%', marginBottom: '10px', objectFit: 'cover', border: '2px solid rgba(159,64,45,0.15)' }} alt="pfp"
        onError={e => { e.currentTarget.src = fallbackAvatar; }}
      />
      {title && <p style={{ fontSize: '13px', fontWeight: '800', margin: '0 0 6px', lineHeight: '1.3' }}>{title}</p>}
      <p style={{ fontSize: '12px', opacity: 0.78, marginBottom: item.media_url ? '8px' : '12px', lineHeight: '1.55', display: '-webkit-box', WebkitLineClamp: title ? 2 : 3, WebkitBoxOrient: 'vertical', overflow: 'hidden', wordBreak: 'break-word' }}>
        <LinkifyText text={body} />
      </p>
      {item.media_url && <MediaCarousel mediaUrl={item.media_url} compact />}
      <div style={{ fontSize: '9px', opacity: 0.3, marginBottom: '8px', textAlign: 'right', fontVariantNumeric: 'tabular-nums' }}>{fullDate(item.created_at)}</div>
      <InteractionBar item={item} user={user} isLiked={isLiked} onLike={() => onLike(item.id, isLiked)} onOpenPost={onOpenPost} />
    </motion.div>
  );
};

// ─── SEARCH MODAL ─────────────────────────────────────────────────────
const SearchModal = ({ onClose, onOpenPost }) => {
  const [query, setQuery]   = useState('');
  const [results, setResults] = useState({ posts: [], profiles: [] });
  const [searching, setSearching] = useState(false);
  const inputRef = useRef(null);

  useEffect(() => { setTimeout(() => inputRef.current?.focus(), 50); }, []);

  useEffect(() => {
    if (!query.trim() || query.length < 2) { setResults({ posts: [], profiles: [] }); return; }
    const t = setTimeout(async () => {
      setSearching(true);
      const [pr, profr] = await Promise.all([
        supabase.from('posts').select('*, profiles(username, avatar_url, full_name)').ilike('content', `%${query}%`).limit(8),
        supabase.from('profiles').select('*').or(`username.ilike.%${query}%,full_name.ilike.%${query}%`).limit(6),
      ]);
      setResults({ posts: pr.data || [], profiles: profr.data || [] });
      setSearching(false);
    }, 380);
    return () => clearTimeout(t);
  }, [query]);

  const rowHover = { onMouseEnter: e => e.currentTarget.style.background = 'rgba(0,0,0,0.025)', onMouseLeave: e => e.currentTarget.style.background = 'transparent' };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="modal-overlay modal-overlay-top" style={{ zIndex: 400 }}
      onClick={onClose}
    >
      <motion.div initial={{ y: -18, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: -18, opacity: 0 }}
        style={{ background: 'white', borderRadius: '24px', width: '100%', maxWidth: '520px', overflow: 'hidden', margin: '0 16px' }}
        onClick={e => e.stopPropagation()}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '16px 20px', borderBottom: '1px solid rgba(0,0,0,0.06)' }}>
          <Search size={17} style={{ opacity: 0.38, flexShrink: 0 }} />
          <input ref={inputRef} value={query} onChange={e => setQuery(e.target.value)}
            placeholder="Buscar posts o personas..."
            style={{ flex: 1, border: 'none', outline: 'none', fontSize: '15px', background: 'transparent' }}
          />
          {query && <button onClick={() => setQuery('')} style={{ border: 'none', background: 'none', cursor: 'pointer', opacity: 0.35 }}><X size={15} /></button>}
          <button onClick={onClose} style={{ border: 'none', background: 'rgba(0,0,0,0.06)', borderRadius: '50%', width: '30px', height: '30px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><X size={13} /></button>
        </div>

        <div style={{ maxHeight: '62vh', overflowY: 'auto' }}>
          {searching && <div style={{ padding: '22px', textAlign: 'center', opacity: 0.35, fontSize: '13px' }}>Buscando...</div>}

          {!searching && query.length >= 2 && !results.posts.length && !results.profiles.length && (
            <div style={{ padding: '36px', textAlign: 'center', opacity: 0.38 }}>
              <Search size={26} style={{ margin: '0 auto 8px' }} />
              <p style={{ fontSize: '13px', margin: 0 }}>Sin resultados para "{query}"</p>
            </div>
          )}

          {results.profiles.length > 0 && (
            <>
              <div style={{ padding: '10px 20px 4px', fontSize: '9px', fontWeight: '800', opacity: 0.35, letterSpacing: '1px' }}>PERSONAS</div>
              {results.profiles.map(p => (
                <div key={p.id} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 20px', cursor: 'pointer' }} {...rowHover}>
                  <img src={p.avatar_url || `https://api.dicebear.com/7.x/thumbs/svg?seed=${p.id}`}
                    style={{ width: '40px', height: '40px', borderRadius: '50%', objectFit: 'cover', border: '2px solid rgba(159,64,45,0.12)' }} alt="pfp" />
                  <div>
                    <div style={{ fontWeight: '700', fontSize: '13px' }}>{p.full_name || p.username}</div>
                    <div style={{ fontSize: '11px', opacity: 0.4 }}>@{p.username}</div>
                  </div>
                </div>
              ))}
            </>
          )}

          {results.posts.length > 0 && (
            <>
              <div style={{ padding: '10px 20px 4px', fontSize: '9px', fontWeight: '800', opacity: 0.35, letterSpacing: '1px', borderTop: results.profiles.length ? '1px solid rgba(0,0,0,0.05)' : 'none' }}>PUBLICACIONES</div>
              {results.posts.map(post => {
                const { title: t, body: b } = parsePost(post.content);
                return (
                  <div key={post.id} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 20px', cursor: 'pointer', borderBottom: '1px solid rgba(0,0,0,0.04)' }}
                    onClick={() => { onOpenPost(post); onClose(); }} {...rowHover}>
                    <img src={post.profiles?.avatar_url || `https://api.dicebear.com/7.x/thumbs/svg?seed=${post.author_id}`}
                      style={{ width: '36px', height: '36px', borderRadius: '50%', objectFit: 'cover', flexShrink: 0 }} alt="pfp" />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: '10px', opacity: 0.4, marginBottom: '1px' }}>@{post.profiles?.username}</div>
                      {t && <div style={{ fontWeight: '700', fontSize: '13px', marginBottom: '1px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{t}</div>}
                      <div style={{ fontSize: '12px', opacity: 0.65, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{b}</div>
                    </div>
                    {post.media_url && <img src={post.media_url} style={{ width: '46px', height: '46px', borderRadius: '8px', objectFit: 'cover', flexShrink: 0 }} alt="th" />}
                  </div>
                );
              })}
            </>
          )}

          {!query && (
            <div style={{ padding: '36px', textAlign: 'center', opacity: 0.32 }}>
              <Search size={28} style={{ margin: '0 auto 10px' }} />
              <p style={{ fontSize: '13px', margin: 0 }}>Busca posts o personas en theapp</p>
            </div>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
};

// ─── APP ──────────────────────────────────────────────────────────────
function App() {
  const [activeCategory, setActiveCategory] = useState('All');
  const [user,  setUser]   = useState(null);
  const [profile, setProfile] = useState(null);
  const [showAuth, setShowAuth]     = useState(false);
  const [isSignUp, setIsSignUp]     = useState(false);
  const [showCreate, setShowCreate] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [showPolicies, setShowPolicies] = useState(false);
  const [showContact, setShowContact]   = useState(false);
  const [showSearch, setShowSearch]     = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [selectedPost, setSelectedPost] = useState(null);
  const [feed, setFeed]     = useState([]);
  const [loading, setLoading] = useState(true);
  const [createLoading, setCreateLoading] = useState(false);
  const [authError, setAuthError]   = useState('');
  const [authLoading, setAuthLoading] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState([]); // [{file, preview}] — hasta 5 fotos
  const [profileForm, setProfileForm] = useState({ full_name: '', username: '', theapp_id: '' });
  const [profileSaving, setProfileSaving] = useState(false);
  const [profileMsg, setProfileMsg] = useState('');
  const [avatarFile, setAvatarFile] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState(null);
  const [bgTheme, setBgTheme] = useState('light'); // light, gray, dark
  const avatarInputRef = useRef(null);

  const bgStyles = { light: 'rgba(159,64,45,0.03)', gray: '#e5e7eb', dark: '#1c1c1c' };
  const getHeaderColor = () => bgTheme === 'dark' ? 'rgba(28,28,28,0.85)' : 'rgba(255, 250, 247, 0.85)';

  const filteredFeed   = feed.filter(i => activeCategory === 'All' || i.category === activeCategory);
  const selectedIndex  = selectedPost ? filteredFeed.findIndex(p => p.id === selectedPost.id) : -1;
  const handleNavigate = (idx) => { if (idx >= 0 && idx < filteredFeed.length) setSelectedPost(filteredFeed[idx]); };

  const fetchProfile = useCallback(async (uid) => {
    if (!uid) return;
    const { data } = await supabase.from('profiles').select('*').eq('id', uid).single();
    if (data) { setProfile(data); setProfileForm({ full_name: data.full_name || '', username: data.username || '', theapp_id: data.theapp_id || '' }); }
  }, []);

  const fetchPosts = useCallback(async (currentUser, silent = false) => {
    if (!silent) setLoading(true);
    const { data, error } = await supabase.from('posts')
      .select('*, profiles!inner(theapp_id, avatar_url, full_name, username), likes(user_id), comments(id)')
      .order('created_at', { ascending: false });
    if (!error) {
      const mapped = data.map(p => ({ ...p, likes_count: p.likes?.length || 0, comments_count: p.comments?.length || 0, user_has_liked: p.likes?.some(l => l.user_id === currentUser?.id) }));
      setFeed(mapped);
      setSelectedPost(prev => { if (!prev) return null; return mapped.find(p => p.id === prev.id) || prev; });
    }
    if (!silent) setLoading(false);
  }, []);

  const initPush = useCallback(async (currentUser) => {
    if (!currentUser) return;
    try {
      let permStatus = await PushNotifications.checkPermissions();
      if (permStatus.receive === 'prompt') {
        permStatus = await PushNotifications.requestPermissions();
      }
      if (permStatus.receive !== 'granted') return;

      await PushNotifications.register();

      PushNotifications.removeAllListeners();
      
      PushNotifications.addListener('registration', async (token) => {
        // Enviar Token a la DB segura de Supabase que hicimos
        await supabase.from('device_tokens').upsert({
          user_id: currentUser.id,
          token: token.value,
          platform: 'android'
        }, { onConflict: 'token' });
      });

      PushNotifications.addListener('pushNotificationReceived', (n) => {
        console.log('Push recibida:', n);
      });
    } catch (error) {
      console.log('Entorno no nativo/Falta Firebase Google-services, saltando Push.');
    }
  }, []);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      const u = session?.user ?? null;
      setUser(u); fetchPosts(u); if (u) { fetchProfile(u.id); initPush(u); }
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_e, session) => {
      const u = session?.user ?? null;
      setUser(u); fetchPosts(u); if (u) { fetchProfile(u.id); initPush(u); }
    });

    // Capacitor Hardware Back Button handler
    const backButtonListener = CapacitorApp.addListener('backButton', ({ canGoBack }) => {
      if (showCreate) setShowCreate(false);
      else if (showProfile) setShowProfile(false);
      else if (showPolicies) setShowPolicies(false);
      else if (showContact) setShowContact(false);
      else if (showSearch) setShowSearch(false);
      else if (selectedPost) setSelectedPost(null);
      else if (showAuth) setShowAuth(false);
      else if (canGoBack) window.history.back();
      else CapacitorApp.exitApp();
    });

    return () => {
      subscription.unsubscribe();
      backButtonListener.remove();
    };
  }, [fetchPosts, fetchProfile, showCreate, showProfile, showPolicies, showContact, showSearch, selectedPost, showAuth]);

  // Bloquear scroll al abrir modales — aplicado en <html> para NO anular scrollbar-gutter:stable del body
  // Si se aplica en body, el JS inline-style gana sobre el CSS y el scrollbar desaparece → temblor
  useEffect(() => {
    const isModalOpen = showCreate || showProfile || showPolicies || showContact || showSearch || selectedPost || showAuth;
    document.documentElement.style.overflow = isModalOpen ? 'hidden' : '';
    return () => { document.documentElement.style.overflow = ''; };
  }, [showCreate, showProfile, showPolicies, showContact, showSearch, selectedPost, showAuth]);


  const handleFileChange = async (e) => {
    const files = Array.from(e.target.files);
    if (!files.length) return;
    const slots = 5 - selectedFiles.length;
    if (slots <= 0) return;
    setCreateLoading(true);
    const toAdd = files.slice(0, slots);
    const compressed = await Promise.all(toAdd.map(f => compressImage(f)));
    const newItems = compressed.map(f => ({ file: f, preview: URL.createObjectURL(f) }));
    setSelectedFiles(prev => [...prev, ...newItems]);
    setCreateLoading(false);
    e.target.value = ''; // reset para poder añadir el mismo archivo
  };

  const handleAvatarChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const c = await compressImage(file, 400);
    setAvatarFile(c); setAvatarPreview(URL.createObjectURL(c));
  };

  const handleSaveProfile = async () => {
    if (!user) return;
    setProfileSaving(true); setProfileMsg('');
    let avatarUrl = profile?.avatar_url || null;
    if (avatarFile) {
      const fn = `avatars/${user.id}_${Date.now()}.jpg`;
      const { data, error: uErr } = await supabase.storage.from('media').upload(fn, avatarFile, { upsert: true });
      if (uErr) { setProfileMsg('\u274c ' + uErr.message); setProfileSaving(false); return; }
      // Guardamos el PATH relativo (no la URL pública) para que funcione con Signed URLs
      if (data) avatarUrl = fn;
    }
    const { error } = await supabase.from('profiles').update({ full_name: profileForm.full_name, username: profileForm.username, theapp_id: profileForm.theapp_id, avatar_url: avatarUrl }).eq('id', user.id);
    if (error) setProfileMsg('\u274c ' + error.message);
    else { setProfileMsg('\u2713 Guardado'); await fetchProfile(user.id); fetchPosts(user, true); setAvatarFile(null); }
    setProfileSaving(false);
  };

  const handleCreatePost = async (e) => {
    e.preventDefault();
    if (!user) return setShowAuth(true);
    setCreateLoading(true);
    const fd = new FormData(e.target);
    const titleVal = fd.get('title')?.trim() || '';
    const bodyVal  = fd.get('content')?.trim() || '';
    const fullContent = titleVal ? `${titleVal}\n---\n${bodyVal}` : bodyVal;
    let mediaUrl = '';
    if (selectedFiles.length > 0) {
      const uploadedPaths = [];
      for (const { file } of selectedFiles) {
        // Nombre único para el archivo
        const fn = `${Date.now()}_${Math.random().toString(36).slice(2)}_img.jpg`;
        const { data, error: upErr } = await supabase.storage.from('media').upload(fn, file);
        if (upErr) { alert('ERROR ALMACÉN: ' + upErr.message); setCreateLoading(false); return; }
        // Guardamos SOLO el PATH (no la URL pública) → compatible con Signed URLs
        if (data) uploadedPaths.push(fn);
      }
      mediaUrl = uploadedPaths.length === 1 ? uploadedPaths[0] : JSON.stringify(uploadedPaths);
    }
    const { error } = await supabase.from('posts').insert({
      author_id: user.id, content: fullContent, media_url: mediaUrl,
      media_type: selectedFiles.length ? 'portrait' : 'none', category: fd.get('category') || 'Community'
    });
    if (!error) { setShowCreate(false); setSelectedFiles([]); fetchPosts(user); }
    else alert('ERROR DB: ' + error.message);
    setCreateLoading(false);
  };

  const handleAuth = async (e) => {
    e.preventDefault();
    setAuthError(''); setAuthLoading(true);
    const fd = new FormData(e.target);
    const email = fd.get('email'), password = fd.get('password');
    if (isSignUp) {
      const { error } = await supabase.auth.signUp({ email, password, options: { data: { full_name: fd.get('name') } } });
      if (error) setAuthError(error.message); else setAuthError('✓ Revisa tu email para confirmar');
    } else {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) setAuthError(error.message); else { setShowAuth(false); setAuthError(''); }
    }
    setAuthLoading(false);
  };

  const inp = { padding: '10px 14px', borderRadius: '10px', border: '1px solid rgba(0,0,0,0.1)', fontSize: '12px', outline: 'none', width: '100%' };

  return (
    <div style={{ minHeight: '100vh', background: bgStyles[bgTheme] }}>

      {/* ── HEADER ── */}
      <header style={{ position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100, padding: '10px 0', background: bgTheme === 'dark' ? '#1c1c1c' : '#fffaf7', borderBottom: '1px solid rgba(159, 64, 45, 0.08)' }}>
        <div style={{ maxWidth: '1100px', margin: '0 auto', display: 'flex', alignItems: 'center', padding: '0 14px', gap: '10px' }}>

          {/* Logo */}
          <div style={{ display: 'flex', gap: '6px', alignItems: 'center', cursor: 'pointer', flexShrink: 0 }} onClick={() => setActiveCategory('All')}>
            <img src={logo} alt="logo" style={{ height: '28px' }} />
            <span style={{ fontSize: '19px', fontWeight: '900', color: 'var(--terracotta)' }}>theapp</span>
          </div>

          {/* Categoy Dropdown for Mobile / Web */}
          <div style={{ flex: 1, display: 'flex', justifyContent: 'center' }}>
            <div style={{ position: 'relative', background: 'rgba(0,0,0,0.04)', borderRadius: '12px', display: 'flex', alignItems: 'center' }}>
              <select value={activeCategory} onChange={e => setActiveCategory(e.target.value)}
                style={{ appearance: 'none', background: 'transparent', border: 'none', padding: '6px 24px 6px 14px', fontSize: '12px', fontWeight: 'bold', color: 'var(--terracotta)', outline: 'none', cursor: 'pointer', textAlign: 'center', width: '100%' }}>
                {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
              <ChevronDown size={12} style={{ position: 'absolute', right: '10px', color: 'var(--terracotta)', pointerEvents: 'none', opacity: 0.6 }} />
            </div>
          </div>

          {/* Right actions — always visible */}
          <div style={{ display: 'flex', gap: '7px', alignItems: 'center', flexShrink: 0 }}>
            {/* Theme Toggle */}
            <div style={{ display: 'flex', background: 'rgba(0,0,0,0.05)', borderRadius: '20px', padding: '2px', overflow: 'hidden' }}>
              {['light', 'gray', 'dark'].map(t => (
                <button key={t} onClick={() => setBgTheme(t)} 
                  style={{ border: 'none', width: '18px', height: '18px', borderRadius: '50%', margin: '2px', cursor: 'pointer', background: t === 'light' ? '#fff' : t === 'gray' ? '#888' : '#222', border: bgTheme === t ? '2px solid var(--terracotta)' : '1px solid rgba(0,0,0,0.1)' }} />
              ))}
            </div>

            {/* Search */}
            <button onClick={() => setShowSearch(true)}
              style={{ border: 'none', background: 'rgba(0,0,0,0.05)', borderRadius: '50%', width: '30px', height: '30px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Search size={13} />
            </button>

            {/* ☰ Hamburger — Políticas / Contacto */}
            <div style={{ position: 'relative' }}>
              <button onClick={() => setShowMobileMenu(v => !v)}
                style={{ border: 'none', background: 'rgba(0,0,0,0.05)', borderRadius: '50%', width: '30px', height: '30px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Menu size={13} />
              </button>
              <AnimatePresence>
                {showMobileMenu && (
                  <>
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                      style={{ position: 'fixed', inset: 0, zIndex: 5 }} onClick={() => setShowMobileMenu(false)} />
                    <motion.div initial={{ opacity: 0, y: -8, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: -8, scale: 0.95 }}
                      style={{ position: 'absolute', right: 0, top: '38px', background: 'white', borderRadius: '16px', padding: '8px', boxShadow: '0 8px 30px rgba(0,0,0,0.14)', zIndex: 10, minWidth: '158px' }}>
                      {[
                        { label: 'Políticas', icon: <Shield size={14} style={{ opacity: 0.5 }} />, action: () => { setShowPolicies(true); setShowMobileMenu(false); } },
                        { label: 'Contacto',  icon: <Mail size={14}   style={{ opacity: 0.5 }} />, action: () => { setShowContact(true);  setShowMobileMenu(false); } },
                      ].map(item => (
                        <button key={item.label} onClick={item.action}
                          style={{ width: '100%', display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 14px', border: 'none', background: 'none', cursor: 'pointer', fontSize: '12px', fontWeight: '600', borderRadius: '10px', textAlign: 'left' }}
                          onMouseEnter={e => e.currentTarget.style.background = 'rgba(0,0,0,0.04)'}
                          onMouseLeave={e => e.currentTarget.style.background = 'none'}>
                          {item.icon} {item.label}
                        </button>
                      ))}
                    </motion.div>
                  </>
                )}
              </AnimatePresence>
            </div>

            {/* Auth / user actions */}
            {!user ? (
              <button onClick={() => setShowAuth(true)} className="btn-terracotta" style={{ padding: '7px 13px', fontSize: '9px', whiteSpace: 'nowrap' }}>INICIAR</button>
            ) : (
              <>
                <button onClick={() => setShowCreate(true)}
                  style={{ background: 'var(--terracotta)', color: 'white', borderRadius: '50%', width: '30px', height: '30px', border: 'none', cursor: 'pointer', fontSize: '20px', lineHeight: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>+
                </button>
                <button onClick={() => setShowProfile(true)}
                  style={{ border: '2px solid var(--terracotta)', borderRadius: '50%', padding: 0, cursor: 'pointer', background: 'none', width: '30px', height: '30px', overflow: 'hidden', flexShrink: 0 }}>
                  {profile?.avatar_url ? <img src={profile.avatar_url} style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt="av" /> : <User size={13} style={{ margin: '6px', color: 'var(--terracotta)' }} />}
                </button>
                <button onClick={() => supabase.auth.signOut()} style={{ opacity: 0.2, border: 'none', background: 'none', cursor: 'pointer', flexShrink: 0 }}><LogOut size={15} /></button>
              </>
            )}
          </div>
        </div>
      </header>

      {/* ── FEED ── */}
      <main style={{ maxWidth: '1000px', margin: '0 auto', padding: '96px 16px 60px' }}>
        <div className="bento-grid">
          {loading ? (
            <div style={{ textAlign: 'center', width: '100%', opacity: 0.38, paddingTop: '60px' }}>Cargando...</div>
          ) : filteredFeed.length === 0 ? (
            <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '70px 20px' }}>
              <div style={{ fontSize: '44px', marginBottom: '14px' }}>{CATEGORY_INFO[activeCategory]?.emoji}</div>
              <p style={{ fontSize: '18px', fontWeight: '800', marginBottom: '8px' }}>{CATEGORY_INFO[activeCategory]?.title}</p>
              <p style={{ fontSize: '13px', opacity: 0.5, maxWidth: '290px', margin: '0 auto 26px', lineHeight: '1.65' }}>
                {CATEGORY_INFO[activeCategory]?.desc}
              </p>
              {user && (
                <button onClick={() => setShowCreate(true)} className="btn-terracotta" style={{ padding: '10px 26px', fontSize: '11px' }}>
                  + Publicar en {activeCategory}
                </button>
              )}
            </div>
          ) : (
            filteredFeed.map(item => (
              <BentoCard key={item.id} item={item} user={user}
                onOpenPost={() => setSelectedPost(item)}
                onLike={async (id, liked) => {
                  if (!user) return setShowAuth(true);
                  if (liked) await supabase.from('likes').delete().match({ post_id: id, user_id: user.id });
                  else await supabase.from('likes').insert({ post_id: id, user_id: user.id });
                  fetchPosts(user, true);
                }}
              />
            ))
          )}
        </div>
      </main>

      {/* ── POST DETAIL ── */}
      <AnimatePresence>
        {selectedPost && (
          <PostDetail post={selectedPost} posts={filteredFeed} currentIndex={selectedIndex}
            user={user} profile={profile}
            onClose={() => setSelectedPost(null)}
            onLike={() => fetchPosts(user, true)}
            onCommentSubmit={() => fetchPosts(user, true)}
            onNavigate={handleNavigate}
            onDelete={() => { setSelectedPost(null); fetchPosts(user); }}
          />
        )}
      </AnimatePresence>

      {/* ── SEARCH ── */}
      <AnimatePresence>
        {showSearch && <SearchModal onClose={() => setShowSearch(false)} onOpenPost={post => setSelectedPost(post)} />}
      </AnimatePresence>

      {/* ── MODAL CREAR POST ── */}
      <AnimatePresence>
        {showCreate && (
          <div className="modal-overlay" style={{ zIndex: 200, padding: '16px' }}
            onClick={() => { setShowCreate(false); setSelectedFiles([]); }}>
            <motion.div initial={{ y: 30, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 30, opacity: 0 }}
              transition={{ type: 'spring', damping: 26, stiffness: 320 }}
              style={{ background: 'white', padding: '28px', borderRadius: '25px', width: '100%', maxWidth: '400px' }} onClick={e => e.stopPropagation()}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px' }}>
                <h3 style={{ fontSize: '16px', fontWeight: '900', margin: 0 }}>NUEVA PUBLICACIÓN</h3>
                <button onClick={() => { setShowCreate(false); setSelectedFiles([]); }} style={{ border: 'none', background: 'none', cursor: 'pointer', opacity: 0.4 }}><X size={18} /></button>
              </div>
              <form onSubmit={handleCreatePost} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <input name="title" placeholder="Título (opcional)" maxLength={80}
                  style={{ ...inp, fontWeight: '700', fontSize: '13px' }} />
                <textarea name="content" placeholder="¿Qué estás compartiendo?" required
                  style={{ width: '100%', height: '88px', padding: '12px', borderRadius: '12px', border: '1px solid rgba(0,0,0,0.09)', fontSize: '13px', outline: 'none', resize: 'none', lineHeight: '1.5', boxSizing: 'border-box' }} />
                <select name="category" style={{ padding: '10px 14px', borderRadius: '10px', border: '1px solid rgba(0,0,0,0.09)', fontSize: '12px', outline: 'none' }}>
                  {CATEGORIES.filter(c => c !== 'All').map(c => <option key={c} value={c}>{c}</option>)}
                </select>

                {/* Multi-photo grid */}
                {selectedFiles.length > 0 ? (
                  <div className="photo-grid">
                    {selectedFiles.map((item, i) => (
                      <div key={i} className="photo-thumb">
                        <img src={item.preview} alt="" />
                        <button type="button" className="photo-thumb-remove"
                          onClick={() => setSelectedFiles(prev => prev.filter((_, j) => j !== i))}>x</button>
                      </div>
                    ))}
                    {selectedFiles.length < 5 && (
                      <label className="photo-add-btn">
                        <ImageIcon size={18} />
                        <span>Añadir</span>
                        <input type="file" accept="image/*" multiple onChange={handleFileChange} style={{ display: 'none' }} />
                      </label>
                    )}
                  </div>
                ) : (
                  <label style={{ padding: '14px', border: '1px dashed rgba(0,0,0,0.12)', borderRadius: '12px', cursor: 'pointer', textAlign: 'center', fontSize: '11px', opacity: 0.5, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                    <ImageIcon size={16} /> Añadir fotos (máx. 5)
                    <input type="file" accept="image/*" multiple onChange={handleFileChange} style={{ display: 'none' }} />
                  </label>
                )}

                <button type="submit" disabled={createLoading} className="btn-terracotta" style={{ padding: '13px', borderRadius: '12px', fontWeight: 'bold' }}>
                  {createLoading ? 'SUBIENDO...' : 'PUBLICAR'}
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ── MODAL PERFIL ── */}
      <AnimatePresence>
        {showProfile && (
          <div className="modal-overlay" style={{ zIndex: 200, padding: '16px' }}
            onClick={() => setShowProfile(false)}>
            <motion.div initial={{ y: 30, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 30, opacity: 0 }}
              transition={{ type: 'spring', damping: 26, stiffness: 320 }}
              style={{ background: 'white', padding: '30px', borderRadius: '25px', width: '100%', maxWidth: '340px' }} onClick={e => e.stopPropagation()}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '22px' }}>
                <h3 style={{ fontSize: '15px', fontWeight: '900', margin: 0 }}>MI PERFIL</h3>
                <button onClick={() => setShowProfile(false)} style={{ border: 'none', background: 'none', cursor: 'pointer', opacity: 0.4 }}><X size={18} /></button>
              </div>
              <div style={{ textAlign: 'center', marginBottom: '22px' }}>
                <div style={{ position: 'relative', display: 'inline-block' }}>
                  <div style={{ width: '78px', height: '78px', borderRadius: '50%', overflow: 'hidden', border: '3px solid var(--terracotta)', margin: '0 auto' }}>
                    {(avatarPreview || profile?.avatar_url)
                      ? <img src={avatarPreview || profile.avatar_url} style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt="av" />
                      : <div style={{ width: '100%', height: '100%', background: 'rgba(159,64,45,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><User size={30} color="var(--terracotta)" /></div>
                    }
                  </div>
                  <button onClick={() => avatarInputRef.current?.click()}
                    style={{ position: 'absolute', bottom: 0, right: 0, background: 'var(--terracotta)', color: 'white', border: 'none', borderRadius: '50%', width: '26px', height: '26px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
                    <Camera size={12} />
                  </button>
                  <input ref={avatarInputRef} type="file" accept="image/*" onChange={handleAvatarChange} style={{ display: 'none' }} />
                </div>
                <p style={{ fontSize: '10px', opacity: 0.38, marginTop: '6px' }}>{user?.email}</p>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {[['NOMBRE', 'full_name', 'Tu nombre completo'], ['USUARIO', 'username', '@usuario'], ['THEAPP ID', 'theapp_id', 'ej: 00A1']].map(([label, key, placeholder]) => (
                  <div key={key}>
                    <label style={{ fontSize: '9px', fontWeight: 'bold', opacity: 0.45, display: 'block', marginBottom: '4px', letterSpacing: '0.5px' }}>{label}</label>
                    <input style={inp} value={profileForm[key]} onChange={e => setProfileForm(f => ({ ...f, [key]: e.target.value }))} placeholder={placeholder} />
                  </div>
                ))}
                {profileMsg && (
                  <div style={{ padding: '10px 14px', borderRadius: '10px', background: profileMsg.startsWith('✓') ? 'rgba(34,197,94,0.1)' : 'rgba(239,68,68,0.1)', color: profileMsg.startsWith('✓') ? '#15803d' : '#dc2626', fontSize: '11px', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    {profileMsg.startsWith('✓') ? <Check size={13} /> : <AlertCircle size={13} />} {profileMsg}
                  </div>
                )}
                <button onClick={handleSaveProfile} disabled={profileSaving} className="btn-terracotta" style={{ padding: '12px', borderRadius: '12px', fontWeight: 'bold', marginTop: '4px' }}>
                  {profileSaving ? 'GUARDANDO...' : 'GUARDAR CAMBIOS'}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ── MODAL POLÍTICAS ── */}
      <AnimatePresence>
        {showPolicies && (
          <div className="modal-overlay" style={{ zIndex: 200, padding: '16px' }}
            onClick={() => setShowPolicies(false)}>
            <motion.div initial={{ y: 30, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 30, opacity: 0 }}
              transition={{ type: 'spring', damping: 26, stiffness: 320 }}
              style={{ background: 'white', padding: '30px', borderRadius: '25px', width: '100%', maxWidth: '360px' }} onClick={e => e.stopPropagation()}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '22px' }}>
                <h3 style={{ fontSize: '15px', fontWeight: '900', margin: 0 }}>POLÍTICAS DE THEAPP</h3>
                <button onClick={() => setShowPolicies(false)} style={{ border: 'none', background: 'none', cursor: 'pointer', opacity: 0.4 }}><X size={18} /></button>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '12px', lineHeight: '1.65', opacity: 0.8 }}>
                <p><strong>1. Respeto:</strong> Mantén un ambiente amigable y evita cualquier forma de acoso o mensajes ofensivos.</p>
                <p><strong>2. Contenido:</strong> theapp se reserva el derecho de eliminar contenidos inapropiados, ilegales o que infrinjan derechos de terceros.</p>
                <p><strong>3. Privacidad:</strong> Las imágenes y tu información son públicas dentro de theapp. Puedes modificarlas desde tu perfil.</p>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ── MODAL CONTACTO ── */}
      <AnimatePresence>
        {showContact && (
          <div className="modal-overlay" style={{ zIndex: 200, padding: '16px' }}
            onClick={() => setShowContact(false)}>
            <motion.div initial={{ y: 30, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 30, opacity: 0 }}
              transition={{ type: 'spring', damping: 26, stiffness: 320 }}
              style={{ background: 'white', padding: '30px', borderRadius: '25px', width: '100%', maxWidth: '300px', textAlign: 'center' }} onClick={e => e.stopPropagation()}>
              <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '6px' }}>
                <button onClick={() => setShowContact(false)} style={{ border: 'none', background: 'none', cursor: 'pointer', opacity: 0.4 }}><X size={18} /></button>
              </div>
              <img src={logo} style={{ height: '48px', marginBottom: '12px' }} alt="logo" />
              <h3 style={{ fontSize: '16px', fontWeight: '900', margin: '0 0 8px' }}>CONTACTO</h3>
              <p style={{ fontSize: '12px', opacity: 0.65, marginBottom: '20px', lineHeight: '1.6' }}>
                ¿Tienes alguna sugerencia, duda o problema técnico? Escríbenos:
              </p>
              <div style={{ padding: '16px', background: 'rgba(159,64,45,0.06)', borderRadius: '16px', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{ width: '40px', height: '40px', background: 'var(--terracotta)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <User size={18} color="white" />
                </div>
                <div style={{ textAlign: 'left' }}>
                  <div style={{ fontSize: '9px', opacity: 0.45, fontWeight: '700', letterSpacing: '0.5px' }}>CURADOR DE THEAPP</div>
                  <div style={{ fontSize: '15px', fontWeight: '900', color: 'var(--terracotta)' }}>Bvdany</div>
                </div>
              </div>
              <a href="mailto:bvdany31@gmail.com?subject=theapp - Contacto"
                style={{ textDecoration: 'none', display: 'block', padding: '13px', background: 'var(--terracotta)', color: 'white', borderRadius: '14px', fontWeight: 'bold', fontSize: '13px' }}>
                ENVIAR MENSAJE ✉️
              </a>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ── MODAL AUTH ── */}
      <AnimatePresence>
        {showAuth && (
          <div className="modal-overlay" style={{ zIndex: 200, padding: '16px' }}
            onClick={() => setShowAuth(false)}>
            <motion.div initial={{ y: 30, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 30, opacity: 0 }}
              transition={{ type: 'spring', damping: 26, stiffness: 320 }}
              style={{ background: 'white', padding: '28px', borderRadius: '25px', width: '100%', maxWidth: '310px', textAlign: 'center' }} onClick={e => e.stopPropagation()}>
              <img src={logo} style={{ height: '38px', marginBottom: '14px' }} alt="logo" />
              <form onSubmit={handleAuth} style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {isSignUp && <input name="name" placeholder="Nombre" required style={inp} />}
                <input name="email" type="email" placeholder="Email" required style={inp} />
                <input name="password" type="password" placeholder="Contraseña" required style={inp} />
                {authError && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '10px 14px', borderRadius: '10px', background: authError.startsWith('✓') ? 'rgba(34,197,94,0.1)' : 'rgba(239,68,68,0.1)', color: authError.startsWith('✓') ? '#15803d' : '#dc2626', fontSize: '11px', fontWeight: '600', textAlign: 'left' }}>
                    {!authError.startsWith('✓') && <AlertCircle size={14} />} {authError}
                  </div>
                )}
                <button type="submit" disabled={authLoading} className="btn-terracotta" style={{ padding: '12px', borderRadius: '12px', fontWeight: 'bold' }}>
                  {authLoading ? '...' : (isSignUp ? 'Crear cuenta' : 'Entrar')}
                </button>
              </form>
              <button onClick={() => { setIsSignUp(!isSignUp); setAuthError(''); }}
                style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '10px', marginTop: '14px', opacity: 0.4 }}>
                {isSignUp ? '¿Ya tienes cuenta? Entra' : 'Crea una gratis'}
              </button>
              </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default App;
