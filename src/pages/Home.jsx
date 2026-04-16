import React from 'react';
import BentoCard from '../components/feed/BentoCard';
import { usePosts } from '../hooks/usePosts';
import { useAuth } from '../context/AuthContext';

const Home = ({ activeCategory, searchQuery, onOpenPost, onLike }) => {
  const { user } = useAuth();
  const { feed, loading } = usePosts(user);

  const filteredFeed = feed.filter(i => {
    const isCat = activeCategory === 'All' || i.category === activeCategory;
    const q = searchQuery.toLowerCase();
    const isSearch = !q || (i.content?.toLowerCase().includes(q)) || (i.title?.toLowerCase().includes(q)) || (i.profiles?.theapp_id?.toLowerCase().includes(q));
    return isCat && isSearch;
  });

  return (
    <main style={{ paddingTop: '100px', maxWidth: '1000px', margin: '0 auto', paddingBottom: '60px' }}>
      <div className="bento-grid">
        {loading ? (
          <div style={{ textAlign: 'center', gridColumn: '1 / -1', opacity: 0.4, paddingTop: '60px' }}>Cargando...</div>
        ) : filteredFeed.length === 0 ? (
          <div style={{ textAlign: 'center', gridColumn: '1 / -1', paddingTop: '60px', opacity: 0.5, padding: '0 20px' }}>
            <p>No hay publicaciones disponibles en esta categoría.</p>
          </div>
        ) : (
          filteredFeed.map(item => (
            <BentoCard 
              key={item.id} 
              item={item} 
              onOpenPost={() => onOpenPost(item)} 
              onLike={onLike}
            />
          ))
        )}
      </div>
    </main>
  );
};

export default Home;
