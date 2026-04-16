import React from 'react';
import { Heart, MessageCircle, Send } from 'lucide-react';

const InteractionBar = ({ item, isLiked, onLike, onOpenPost }) => {
  const shareContent = async (e) => {
    e.stopPropagation();
    if (navigator.share) {
      await navigator.share({ title: 'theapp', text: item.content, url: window.location.href });
    } else {
      navigator.clipboard.writeText(window.location.href);
    }
  };

  return (
    <div onClick={e => e.stopPropagation()}
      style={{ marginTop: '16px', paddingTop: '12px', borderTop: '1px solid rgba(0,0,0,0.05)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
      <div style={{ display: 'flex', gap: '4px' }}>
        <button onClick={(e) => { e.stopPropagation(); onLike(); }}
          style={{ padding: '7px', color: isLiked ? '#ff3b30' : 'rgba(0,0,0,0.4)', border: 'none', background: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '5px', fontSize: '12px', borderRadius: '20px', transition: 'all 0.2s' }}>
          <Heart size={15} fill={isLiked ? '#ff3b30' : 'none'} color={isLiked ? '#ff3b30' : 'currentColor'} /> {item.likes_count || 0}
        </button>
        <button onClick={(e) => { e.stopPropagation(); onOpenPost(); }}
          style={{ padding: '7px', opacity: 0.4, border: 'none', background: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '5px', fontSize: '12px', borderRadius: '20px' }}>
          <MessageCircle size={15} /> {item.comments_count || 0}
        </button>
      </div>
      <button onClick={shareContent} style={{ padding: '7px', opacity: 0.25, border: 'none', background: 'none', cursor: 'pointer', borderRadius: '20px' }}><Send size={15} /></button>
    </div>
  );
};

export default InteractionBar;
