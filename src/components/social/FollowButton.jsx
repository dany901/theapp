import React, { useState, useEffect } from 'react';
import { supabase } from '../../supabaseClient';
import { useAuth } from '../../context/AuthContext';

const FollowButton = ({ targetId }) => {
  const { user } = useAuth();
  const [isFollowing, setIsFollowing] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user || user.id === targetId) return;

    const checkFollow = async () => {
      const { data } = await supabase
        .from('follows')
        .select('*')
        .eq('follower_id', user.id)
        .eq('following_id', targetId)
        .single();
      
      setIsFollowing(!!data);
      setLoading(false);
    };

    checkFollow();
  }, [user, targetId]);

  const toggleFollow = async (e) => {
    e.stopPropagation();
    if (!user) return alert('Regístrate para seguir usuarios');
    if (user.id === targetId) return;

    setLoading(true);
    if (isFollowing) {
      await supabase.from('follows').delete().match({ follower_id: user.id, following_id: targetId });
      setIsFollowing(false);
    } else {
      await supabase.from('follows').insert({ follower_id: user.id, following_id: targetId });
      setIsFollowing(true);
    }
    setLoading(false);
  };

  if (user?.id === targetId || !user) return null;

  return (
    <button 
      onClick={toggleFollow}
      disabled={loading}
      style={{
        padding: '6px 16px',
        borderRadius: '20px',
        border: isFollowing ? '1px solid var(--primary)' : 'none',
        background: isFollowing ? 'transparent' : 'var(--primary)',
        color: isFollowing ? 'var(--primary)' : 'white',
        fontSize: '11px',
        fontWeight: 'bold',
        cursor: 'pointer',
        transition: 'all 0.2s'
      }}
    >
      {loading ? '...' : (isFollowing ? 'Siguiendo' : 'Seguir')}
    </button>
  );
};

export default FollowButton;
