import { useState, useCallback, useEffect } from 'react';
import { supabase } from '../supabaseClient';

export const usePosts = (currentUser, feedType = 'global') => {
  const [feed, setFeed] = useState([]);
  const [loading, setLoading] = useState(true);
  const [recentPostIds, setRecentPostIds] = useState([]);

  const fetchPosts = useCallback(async (silent = false) => {
    if (!silent) setLoading(true);
    
    let query = supabase
      .from('posts')
      .select(`
        *, 
        profiles!inner ( 
          theapp_id, 
          avatar_url, 
          full_name, 
          username, 
          verification_type, 
          is_verified 
        ), 
        likes ( user_id ), 
        comments ( id ), 
        views_count, 
        shares_count
      `);

    if (feedType === 'friends' && currentUser) {
      const { data: followed } = await supabase
        .from('follows')
        .select('following_id')
        .eq('follower_id', currentUser.id);
      
      const followedIds = followed?.map(f => f.following_id) || [];
      query = query.in('author_id', [currentUser.id, ...followedIds]);
    } else if (feedType === 'local') {
      query = query.not('latitude', 'is', null);
    }

    const { data: posts, error } = await query.order('created_at', { ascending: false });
    
    if (!error && posts) {
      // Aplicamos el mapeo básico (mantenemos el sort por tiempo de la DB por defecto)
      const mapped = posts.map(p => ({ 
        ...p, 
        likes_count: p.likes?.length || 0, 
        comments_count: p.comments?.length || 0, 
        user_has_liked: p.likes?.some(l => l.user_id === currentUser?.id),
        traffic_score: (p.likes?.length || 0) + ((p.comments?.length || 0) * 2)
      }));
      setFeed(mapped);
    }
    if (!silent) setLoading(false);
  }, [currentUser?.id, feedType]); // Solo depende del ID de usuario y el tipo de feed

  useEffect(() => {
    fetchPosts();
  }, [fetchPosts]);

  // Aplicamos el ordenamiento (incluyendo session priority) en la vista
  const sortedFeed = [...feed].sort((a, b) => {
    // 1. Session priority
    const aRecent = recentPostIds.includes(a.id);
    const bRecent = recentPostIds.includes(b.id);
    if (aRecent && !bRecent) return -1;
    if (!aRecent && bRecent) return 1;
    
    // 2. Traffic Score / Verified / Time...
    const aVerified = a.profiles?.is_verified ? 1 : 0;
    const bVerified = b.profiles?.is_verified ? 1 : 0;
    if (aVerified !== bVerified) return bVerified - aVerified;
    if (b.traffic_score !== a.traffic_score) return b.traffic_score - a.traffic_score;
    return new Date(b.created_at) - new Date(a.created_at);
  });

  const addRecentPostId = (id) => setRecentPostIds(prev => [...prev, id]);

  return { feed: sortedFeed, loading, fetchPosts, addRecentPostId };
};
