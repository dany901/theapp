import React, { useState, useEffect, useRef } from 'react';
import { motion as Motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, ChevronUp, ChevronDown, Heart, MessageCircle, Send, User, Trash2, MoreVertical, Flag, ShieldOff } from 'lucide-react';
import { supabase } from '../../supabaseClient';
import { timeAgo, renderTextWithLinks } from '../../utils';
import { useAuth } from '../../context/AuthContext';
import FollowButton from '../social/FollowButton';
import VerifiedBadge from '../social/VerifiedBadge';

const isVideo = (url) => {
  if (!url) return false;
  const lower = url.toLowerCase().split('?')[0];
  return lower.endsWith('.mp4') || lower.endsWith('.webm') || lower.endsWith('.mov') || lower.endsWith('.ogg') || lower.endsWith('.mkv');
};


const PostDetailModal = ({ post, onClose, onLike, onCommentSubmit, onNext, onPrev, onDelete }) => {
  const { user, profile } = useAuth();
  const [comments, setComments] = useState([]);
  const [commentText, setCommentText] = useState('');
  const [loadingComments, setLoadingComments] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [liked, setLiked] = useState(post.user_has_liked || false);
  const [likesCount, setLikesCount] = useState(post.likes_count || 0);

  const [showMenu, setShowMenu] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(post.title || '');
  const [editContent, setEditContent] = useState(post.content || '');
  const bottomRef = useRef(null);

  useEffect(() => {
    let active = true;
    supabase.from('comments')
      .select('*, profiles(username, full_name, avatar_url, theapp_id)')
      .eq('post_id', post.id)
      .order('created_at', { ascending: true })
      .then(({ data }) => {
        if (active && data) setComments(data);
        if (active) setLoadingComments(false);
      });
    return () => { active = false; };
  }, [post.id]);

  const loadComments = async () => {
    const { data } = await supabase.from('comments')
      .select('*, profiles(username, full_name, avatar_url, theapp_id)')
      .eq('post_id', post.id)
      .order('created_at', { ascending: true });
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

  const handleComment = async () => {
    if (!commentText.trim() || submitting || !user) return;
    setSubmitting(true);
    await supabase.from('comments').insert({ post_id: post.id, user_id: user.id, content: commentText.trim() });
    setCommentText('');
    await loadComments();
    onCommentSubmit();
    setSubmitting(false);
    setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);
  };

  const handleSaveEdit = async () => {
    if (!editContent.trim()) return;
    setSubmitting(true);
    const { error } = await supabase
      .from('posts')
      .update({ 
        title: editTitle.trim(), 
        content: editContent.trim(),
        is_edited: true // This will be the one-time flag
      })
      .eq('id', post.id);

    if (error) {
      alert('Error al editar: ' + error.message);
    } else {
      setIsEditing(false);
      // We rely on the parent to refresh or we could update local state if needed
      // For now, reload window or rely on the fact that is_edited is now true
      window.location.reload(); 
    }
    setSubmitting(false);
  };

  return (
    <Motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="modal-overlay" style={{ zIndex: 300 }}
      onClick={onClose}
    >
      <Motion.div initial={{ y: 50, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 50, opacity: 0 }} transition={{ type: 'spring', damping: 25, stiffness: 300 }}
        style={{ background: 'white', borderRadius: '28px', width: '100%', maxWidth: '580px', maxHeight: '90vh', overflow: 'hidden', display: 'flex', flexDirection: 'column', margin: '0 16px' }}
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px', padding: '18px 22px', borderBottom: '1px solid rgba(0,0,0,0.06)', flexShrink: 0 }}>
          <button onClick={onClose} style={{ border: 'none', background: 'rgba(0,0,0,0.05)', borderRadius: '50%', width: '34px', height: '34px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <ArrowLeft size={16} />
          </button>
          <img src={post.profiles?.avatar_url || `https://api.dicebear.com/7.x/thumbs/svg?seed=${post.author_id}`}
            style={{ width: '42px', height: '42px', borderRadius: '50%', objectFit: 'cover', border: '2px solid var(--primary-glow)', flexShrink: 0 }} alt="pfp" />
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontWeight: '800', fontSize: '14px', display: 'flex', alignItems: 'center' }}>
              <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {post.profiles?.theapp_id || 'Usuario'}
              </span>
              <VerifiedBadge type={post.profiles?.verification_type} />
            </div>
            <div style={{ fontSize: '11px', opacity: 0.4, display: 'flex', gap: '5px' }}>
              {timeAgo(post.created_at)}
              {post.is_edited && <span style={{ fontWeight: 'bold', color: 'var(--primary)' }}>(editado)</span>}
            </div>
          </div>
          <FollowButton targetId={post.author_id} />
          <span style={{ fontSize: '8px', fontWeight: 'bold', border: '1px solid var(--primary)', color: 'var(--primary)', padding: '3px 10px', borderRadius: '20px', flexShrink: 0 }}>{post.category}</span>
          
          <div style={{ position: 'relative' }}>
            <button onClick={() => setShowMenu(!showMenu)} style={{ border: 'none', background: 'none', cursor: 'pointer', padding: '5px', opacity: 0.3 }}>
              <MoreVertical size={18} />
            </button>
            {showMenu && (
              <div style={{ position: 'absolute', top: '100%', right: 0, background: 'white', boxShadow: '0 10px 40px rgba(0,0,0,0.1)', borderRadius: '12px', padding: '8px', zIndex: 10, width: '150px' }}>
                <button 
                  onClick={async () => {
                    if(!user) return;
                    await supabase.from('reports').insert({ reporter_id: user.id, target_id: post.id, reason: 'Reportado por usuario' });
                    alert('Gracias. Hemos recibido tu denuncia.');
                    setShowMenu(false);
                  }}
                  style={{ width: '100%', display: 'flex', alignItems: 'center', gap: '8px', padding: '10px', border: 'none', background: 'none', cursor: 'pointer', fontSize: '12px', fontWeight: 'bold', color: '#dc2626' }}
                >
                  <Flag size={14} /> Denunciar
                </button>
                {user?.id === post.author_id && !post.is_edited && (
                  <button 
                    onClick={() => { setIsEditing(true); setShowMenu(false); }}
                    style={{ width: '100%', display: 'flex', alignItems: 'center', gap: '8px', padding: '10px', border: 'none', background: 'none', cursor: 'pointer', fontSize: '12px', fontWeight: 'bold', color: 'var(--primary)' }}
                  >
                    <FileText size={14} /> Editar (Solo una vez)
                  </button>
                )}
                <button 
                  onClick={async () => {
                    if(!user) return;
                    await supabase.from('blocks').insert({ blocker_id: user.id, blocked_id: post.author_id });
                    alert('Usuario bloqueado.');
                    setShowMenu(false);
                    onClose();
                  }}
                  style={{ width: '100%', display: 'flex', alignItems: 'center', gap: '8px', padding: '10px', border: 'none', background: 'none', cursor: 'pointer', fontSize: '12px', fontWeight: 'bold' }}
                >
                  <ShieldOff size={14} /> Bloquear usuario
                </button>
              </div>
            )}
          </div>
          
          <div style={{ display: 'flex', gap: '8px', marginLeft: '5px' }}>
            <button onClick={onPrev} disabled={!onPrev} style={{ border: 'none', background: 'none', cursor: onPrev ? 'pointer' : 'default', padding: '4px', opacity: onPrev ? 1 : 0.2 }}>
              <ChevronUp size={20} />
            </button>
            <button onClick={onNext} disabled={!onNext} style={{ border: 'none', background: 'none', cursor: onNext ? 'pointer' : 'default', padding: '4px', opacity: onNext ? 1 : 0.2 }}>
              <ChevronDown size={20} />
            </button>
          </div>
        </div>

        {/* Scrollable body */}
        <div style={{ overflowY: 'auto', flex: 1 }}>
          <div style={{ padding: '20px 22px' }}>
            {isEditing ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <input 
                  value={editTitle}
                  onChange={e => setEditTitle(e.target.value)}
                  placeholder="Título (opcional)"
                  style={{ width: '100%', padding: '12px', borderRadius: '12px', border: '1px solid #f0f0f0', background: '#f9f9f9', fontSize: '14px', fontWeight: 'bold', outline: 'none' }}
                />
                <textarea 
                  value={editContent}
                  onChange={e => setEditContent(e.target.value)}
                  placeholder="¿Qué estás pensando?"
                  style={{ width: '100%', minHeight: '120px', padding: '12px', borderRadius: '12px', border: '1px solid #f0f0f0', background: '#f9f9f9', fontSize: '14px', outline: 'none', resize: 'none' }}
                />
                <div style={{ display: 'flex', gap: '10px' }}>
                  <button onClick={handleSaveEdit} disabled={submitting} 
                    style={{ flex: 1, padding: '10px', background: 'var(--primary)', color: 'white', border: 'none', borderRadius: '10px', fontWeight: 'bold', cursor: 'pointer' }}>
                    {submitting ? 'Guardando...' : 'Guardar Cambios'}
                  </button>
                  <button onClick={() => setIsEditing(false)} style={{ padding: '10px 20px', background: '#f0f0f0', border: 'none', borderRadius: '10px', fontWeight: 'bold', cursor: 'pointer' }}>Cancelar</button>
                </div>
              </div>
            ) : (
              <>
                {post.title && <h3 style={{ fontSize: '17px', fontWeight: '900', margin: '0 0 12px 0', lineHeight: '1.4' }}>{post.title}</h3>}
                <p style={{ fontSize: '15px', lineHeight: '1.65', margin: '0 0 16px 0', whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>{renderTextWithLinks(post.content)}</p>
                {post.media_url && (
                  <div style={{ borderRadius: '18px', overflow: 'hidden', marginBottom: '16px' }}>
                    {isVideo(post.media_url) ? (
                      <video
                        src={post.media_url}
                        style={{ width: '100%', maxHeight: '420px', display: 'block', background: '#000' }}
                        controls
                        playsInline
                        preload="metadata"
                      />
                    ) : (
                      <img src={post.media_url} style={{ width: '100%', objectFit: 'cover', maxHeight: '420px', display: 'block' }} alt="media" />
                    )}
                  </div>
                )}
              </>
            )}
          </div>

          {/* Stats bar */}
          <div style={{ display: 'flex', gap: '24px', padding: '12px 22px', borderTop: '1px solid rgba(0,0,0,0.05)', borderBottom: '1px solid rgba(0,0,0,0.05)', alignItems: 'center' }}>
            <button onClick={handleLike} style={{ display: 'flex', alignItems: 'center', gap: '7px', border: 'none', background: 'none', cursor: user ? 'pointer' : 'default', color: liked ? '#ff3b30' : 'rgba(0,0,0,0.5)', fontSize: '13px', fontWeight: '600', transition: 'color 0.2s' }}>
              <Heart size={18} fill={liked ? '#ff3b30' : 'none'} color={liked ? '#ff3b30' : 'currentColor'} /> {likesCount}
            </button>
            <span style={{ display: 'flex', alignItems: 'center', gap: '7px', fontSize: '13px', fontWeight: '600', color: 'rgba(0,0,0,0.4)' }}>
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
            <button style={{ display: 'flex', alignItems: 'center', gap: '7px', border: 'none', background: 'none', cursor: 'pointer', color: 'rgba(0,0,0,0.3)', fontSize: '13px', marginLeft: user?.id === post.author_id ? '0' : 'auto' }}
              onClick={() => { navigator.clipboard.writeText(window.location.href); }}>
              <Send size={16} />
            </button>
          </div>

          {/* Comments list */}
          <div style={{ padding: '16px 22px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {loadingComments ? (
              <div style={{ textAlign: 'center', opacity: 0.3, fontSize: '12px', padding: '20px 0' }}>Cargando...</div>
            ) : comments.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '30px 0' }}>
                <MessageCircle size={28} style={{ opacity: 0.15, margin: '0 auto 8px' }} />
                <p style={{ fontSize: '13px', opacity: 0.4, margin: 0 }}>Sin comentarios todavía</p>
              </div>
            ) : (
              comments.map(c => (
                <div key={c.id} style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
                  <img src={c.profiles?.avatar_url || `https://api.dicebear.com/7.x/thumbs/svg?seed=${c.user_id}`}
                    style={{ width: '34px', height: '34px', borderRadius: '50%', objectFit: 'cover', flexShrink: 0, border: '1px solid rgba(0,0,0,0.08)' }} alt="pfp" />
                  <div style={{ background: 'rgba(0,0,0,0.03)', padding: '10px 14px', borderRadius: '16px', flex: 1 }}>
                    <div style={{ fontSize: '11px', fontWeight: '800', marginBottom: '4px', color: 'var(--primary)' }}>
                      {c.profiles?.theapp_id || 'Usuario'}
                    </div>
                    <div style={{ fontSize: '13px', lineHeight: '1.5', whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>{renderTextWithLinks(c.content)}</div>
                  </div>
                </div>
              ))
            )}
            <div ref={bottomRef} />
          </div>
        </div>

        {/* Comment input */}
        <div style={{ padding: '14px 22px', borderTop: '1px solid rgba(0,0,0,0.06)', flexShrink: 0, background: 'white' }}>
          {user ? (
            <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
              <div style={{ width: '34px', height: '34px', borderRadius: '50%', overflow: 'hidden', flexShrink: 0, border: '2px solid var(--primary-glow)' }}>
                {profile?.avatar_url
                  ? <img src={profile.avatar_url} style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt="me" />
                  : <div style={{ width: '100%', height: '100%', background: 'var(--primary-glow)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><User size={14} color="var(--primary)" /></div>
                }
              </div>
              <input
                value={commentText}
                onChange={e => setCommentText(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleComment()}
                placeholder="Añade un comentario..."
                style={{ flex: 1, background: 'rgba(0,0,0,0.04)', border: 'none', borderRadius: '22px', padding: '10px 16px', fontSize: '13px', outline: 'none' }}
                autoFocus
              />
              <button onClick={handleComment} disabled={!commentText.trim() || submitting}
                style={{ background: commentText.trim() ? 'var(--primary)' : '#e5e5e5', color: commentText.trim() ? 'white' : '#aaa', border: 'none', borderRadius: '50%', width: '38px', height: '38px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: commentText.trim() ? 'pointer' : 'default', transition: 'all 0.2s', flexShrink: 0 }}>
                <Send size={14} />
              </button>
            </div>
          ) : (
            <div style={{ textAlign: 'center', padding: '4px 0' }}>
              <p style={{ fontSize: '12px', opacity: 0.5, margin: '0 0 8px' }}>Inicia sesión para comentar</p>
            </div>
          )}
        </div>
      </Motion.div>
  );
};

export default PostDetailModal;
