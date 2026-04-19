import React from 'react';
import { motion as Motion } from 'framer-motion';
import { User } from 'lucide-react';
import InteractionBar from './InteractionBar';
import { renderTextWithLinks } from '../../utils';
import VerifiedBadge from '../social/VerifiedBadge';

const isVideo = (url) => {
  if (!url) return false;
  const lower = url.toLowerCase().split('?')[0];
  return lower.endsWith('.mp4') || lower.endsWith('.webm') || lower.endsWith('.mov') || lower.endsWith('.ogg') || lower.endsWith('.mkv');
};

const BentoCard = ({ item, onLike, onOpenPost }) => {
  const isLiked = item.user_has_liked || false;
  
  return (
    <Motion.div 
      layout 
      className="bento-item"
      onClick={onOpenPost}
      whileHover={{ y: -2, boxShadow: '0 8px 30px var(--primary-glow)' }}
      style={{ background: 'white', padding: '20px', borderRadius: '25px', textAlign: 'center', cursor: 'pointer', transition: 'box-shadow 0.2s' }}
    >
      <div style={{ display: 'flex', justifyContent: 'center', gap: '8px', marginBottom: '12px', alignItems: 'center' }}>
        <span style={{ fontSize: '9px', fontWeight: 'bold', opacity: 0.45, color: 'var(--black)', display: 'flex', alignItems: 'center' }}>
          {item.profiles?.theapp_id || 'Usuario'}
          <VerifiedBadge type={item.profiles?.verification_type} />
        </span>
        <span style={{ 
          fontSize: '8px', 
          fontWeight: 'bold', 
          border: '1px solid var(--primary)', 
          color: 'var(--primary)', 
          padding: '2px 8px', 
          borderRadius: '4px' 
        }}>
          {item.category}
        </span>
      </div>
      
      <div>
        <img 
          src={item.profiles?.avatar_url || `https://api.dicebear.com/7.x/thumbs/svg?seed=${item.author_id}`}
          style={{ width: '38px', height: '38px', borderRadius: '50%', marginBottom: '10px', objectFit: 'cover', border: '2px solid var(--primary-glow)' }} 
          alt="pfp" 
        />
        {item.title && <h4 style={{ fontSize: '14px', fontWeight: '900', margin: '0 0 8px 0', lineHeight: '1.3' }}>{item.title}</h4>}
        <p style={{ 
          fontSize: '12px', 
          opacity: 0.8, 
          marginBottom: '12px', 
          lineHeight: '1.55', 
          display: '-webkit-box', 
          WebkitLineClamp: 3, 
          WebkitBoxOrient: 'vertical', 
          overflow: 'hidden', 
          whiteSpace: 'pre-wrap', 
          wordBreak: 'break-word' 
        }}>
          {renderTextWithLinks(item.content)}
        </p>
        
        {item.media_url && (
          <div style={{ width: '100%', maxHeight: '180px', borderRadius: '14px', overflow: 'hidden', marginBottom: '8px' }}>
            {isVideo(item.media_url) ? (
              <video
                src={item.media_url}
                style={{ width: '100%', height: '180px', objectFit: 'cover' }}
                muted
                playsInline
                preload="metadata"
                onMouseEnter={e => e.target.play()}
                onMouseLeave={e => { e.target.pause(); e.target.currentTime = 0; }}
              />
            ) : (
              <img src={item.media_url} style={{ width: '100%', height: '180px', objectFit: 'cover' }} alt="media" />
            )}
          </div>
        )}
      </div>
      
      <InteractionBar 
        item={item} 
        isLiked={isLiked}
        onLike={() => onLike(item.id, isLiked)}
        onOpenPost={onOpenPost}
      />
    </Motion.div>
  );
};

export default BentoCard;
