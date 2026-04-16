import React from 'react';
import BentoCard from '../components/feed/BentoCard';
import { usePosts } from '../hooks/usePosts';
import { useAuth } from '../context/AuthContext';

const FeedPage = ({ type, activeCategory = 'All', onOpenPost, onLike }) => {
  const { user } = useAuth();
  const { feed, loading } = usePosts(user, type);

  const filteredFeed = feed.filter(i => {
    return activeCategory === 'All' || i.category === activeCategory;
  });

  return (
    <main style={{ paddingTop: '100px', maxWidth: '1000px', margin: '0 auto', paddingBottom: '60px', minHeight: '80vh' }}>
      <div style={{ padding: '0 20px 20px' }}>
        <h2 style={{ fontSize: '12px', fontWeight: '900', color: 'var(--primary)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
          {type === 'global' ? 'Tendencias Globales' : (type === 'friends' ? 'Feed de Amigos' : 'Descubrimiento Local')}
        </h2>
      </div>

      <div className="bento-grid">
        {loading ? (
          <div style={{ textAlign: 'center', gridColumn: '1 / -1', opacity: 0.4, paddingTop: '60px' }}>Cargando...</div>
        ) : filteredFeed.length === 0 ? (
          <div style={{ textAlign: 'center', gridColumn: '1 / -1', paddingTop: '60px', opacity: 0.5, padding: '0 20px' }}>
            <p>No hay publicaciones disponibles aquí todavía.</p>
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

export default FeedPage;
