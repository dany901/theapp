import React, { useState, useEffect } from 'react';
import { Trophy, Medal, Star, User } from 'lucide-react';
import { supabase } from '../supabaseClient';
import VerifiedBadge from '../components/social/VerifiedBadge';
import FollowButton from '../components/social/FollowButton';
import logo from '../assets/logo_sharp.png';

const Ranking = () => {
  const [topUsers, setTopUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRanking = async () => {
      setLoading(true);
      // Rank by coins and level
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .order('coins', { ascending: false })
        .limit(20);
      
      if (!error) setTopUsers(data);
      setLoading(false);
    };
    fetchRanking();
  }, []);

  return (
    <main style={{ paddingTop: '100px', maxWidth: '600px', margin: '0 auto', paddingBottom: '80px', paddingLeft: '20px', paddingRight: '20px' }}>
      <div style={{ textAlign: 'center', marginBottom: '32px' }}>
        <h1 style={{ fontSize: '28px', fontWeight: '900', marginBottom: '8px' }}>RANKING SEMANAL</h1>
        <p style={{ opacity: 0.5, fontSize: '14px' }}>Los creadores más apoyados de la comunidad</p>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', opacity: 0.3, paddingTop: '40px' }}>Cargando ranking...</div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {topUsers.map((u, index) => (
            <div 
              key={u.id}
              style={{
                background: 'white',
                padding: '16px 20px',
                borderRadius: '20px',
                display: 'flex',
                alignItems: 'center',
                gap: '16px',
                boxShadow: index < 3 ? '0 10px 25px var(--primary-glow)' : 'none',
                border: index < 3 ? '1px solid var(--primary-glow)' : '1px solid rgba(0,0,0,0.03)'
              }}
            >
              <div style={{ width: '30px', fontWeight: '900', fontSize: '18px', color: index < 3 ? 'var(--primary)' : 'rgba(0,0,0,0.2)' }}>
                {index === 0 ? <Trophy size={24} color="var(--gold)" /> : index + 1}
              </div>
              
              <div style={{ position: 'relative' }}>
                <img 
                  src={u.avatar_url || `https://api.dicebear.com/7.x/thumbs/svg?seed=${u.id}`} 
                  style={{ width: '48px', height: '48px', borderRadius: '50%', objectFit: 'cover' }} 
                  alt="pfp" 
                />
                {index < 3 && (
                  <div style={{ position: 'absolute', top: -5, right: -5, background: 'white', borderRadius: '50%', padding: '2px' }}>
                    <Medal size={16} color={index === 0 ? 'var(--gold)' : (index === 1 ? '#C0C0C0' : '#CD7F32')} />
                  </div>
                )}
              </div>

              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: '800', fontSize: '15px', display: 'flex', alignItems: 'center' }}>
                  {u.theapp_id || 'Usuario'} <VerifiedBadge type={u.verification_type} />
                </div>
                <div style={{ fontSize: '12px', opacity: 0.4 }}>Nivel {u.level || 1}</div>
              </div>

              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: '16px', fontWeight: '900', color: 'var(--primary)', display: 'flex', alignItems: 'center', gap: '4px', justifyContent: 'flex-end' }}>
                  <img src={logo} style={{ height: '12px' }} alt="c" /> {u.coins || 0}
                </div>
                <FollowButton targetId={u.id} />
              </div>
            </div>
          ))}
        </div>
      )}
    </main>
  );
};

export default Ranking;
