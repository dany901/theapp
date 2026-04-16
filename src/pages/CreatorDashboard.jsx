import React, { useState, useEffect } from 'react';
import { BarChart3, Users, Heart, MessageCircle, Gift, Info, ArrowUpRight, ArrowDownRight, Clock } from 'lucide-react';
import { supabase } from '../supabaseClient';
import { useAuth } from '../context/AuthContext';
import VerifiedBadge from '../components/social/VerifiedBadge';

const StatCard = ({ title, value, icon: Icon, color }) => (
  <div style={{ background: 'white', padding: '20px', borderRadius: '20px', display: 'flex', alignItems: 'center', gap: '15px', border: '1px solid rgba(0,0,0,0.03)' }}>
    <div style={{ padding: '10px', borderRadius: '12px', background: color + '15', color: color }}>
      <Icon size={20} />
    </div>
    <div>
      <div style={{ fontSize: '11px', fontWeight: 'bold', opacity: 0.4, marginBottom: '2px' }}>{title}</div>
      <div style={{ fontSize: '20px', fontWeight: '900' }}>{value}</div>
    </div>
  </div>
);

const CreatorDashboard = () => {
  const { user, profile } = useAuth();
  const [stats, setStats] = useState({ likes: 0, comments: 0, views: 0, coins: 0, followers: 0 });
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;

    const fetchStats = async () => {
      setLoading(true);
      
      // 1. Get likes and comments count from all posts
      const { data: posts } = await supabase.from('posts').select('id, likes_count:likes(count), comments_count:comments(count)').eq('author_id', user.id);
      
      let totalLikes = 0;
      let totalComments = 0;
      if (posts) {
        posts.forEach(p => {
          totalLikes += p.likes_count?.[0]?.count || 0;
          totalComments += p.comments_count?.[0]?.count || 0;
        });
      }

      // 2. Get followers count
      const { count: followersCount } = await supabase.from('follows').select('*', { count: 'exact', head: true }).eq('following_id', user.id);

      // 3. Get transactions history
      const { data: transData } = await supabase
        .from('coin_transactions')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(10);
        
      setTransactions(transData || []);

      setStats({
        likes: totalLikes,
        comments: totalComments,
        views: profile?.total_views || 0, // Placeholder if field doesn't exist yet
        coins: profile?.coins || 0,
        followers: followersCount || 0
      });
      setLoading(false);
    };

    fetchStats();
  }, [user, profile]);

  if (!user) return <div style={{paddingTop: '100px', textAlign: 'center'}}>Inicia sesión para ver tu panel</div>;

  return (
    <main style={{ paddingTop: '100px', maxWidth: '1000px', margin: '0 auto', paddingBottom: '80px', paddingLeft: '20px', paddingRight: '20px' }}>
      <div style={{ marginBottom: '32px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ fontSize: '28px', fontWeight: '900', marginBottom: '4px' }}>PANEL DE CREADOR</h1>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', opacity: 0.5 }}>
            <span style={{ fontSize: '14px' }}>Bienvenido, {profile?.full_name || user.email}</span>
            <VerifiedBadge type={profile?.verification_type} />
          </div>
        </div>
        <div style={{ background: 'var(--primary)', color: 'white', padding: '10px 20px', borderRadius: '15px', fontSize: '12px', fontWeight: 'bold' }}>
          NIVEL {profile?.level || 1}
        </div>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', opacity: 0.3, paddingTop: '40px' }}>Calculando métricas...</div>
      ) : (
        <>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px', marginBottom: '40px' }}>
            <StatCard title="SEGUIDORES" value={stats.followers} icon={Users} color="var(--primary)" />
            <StatCard title="ME GUSTA" value={stats.likes} icon={Heart} color="#EF4444" />
            <StatCard title="COMENTARIOS" value={stats.comments} icon={MessageCircle} color="#3B82F6" />
            <div style={{ position: 'relative' }}>
              <StatCard title="MONEDAS" value={stats.coins} icon={Gift} color="#F59E0B" />
              <div style={{ position: 'absolute', bottom: '15px', right: '20px', fontSize: '9px', fontWeight: 'bold', opacity: 0.4 }}>
                Futuro: 1000 Coins = 10€
              </div>
            </div>
          </div>

          <div style={{ background: 'white', borderRadius: '24px', padding: '30px', border: '1px solid rgba(0,0,0,0.03)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
              <BarChart3 size={20} color="var(--primary)" />
              <h3 style={{ fontSize: '18px', fontWeight: '900' }}>RENDIMIENTO RECIENTE</h3>
            </div>
            
            <div style={{  height: '200px', display: 'flex', alignItems: 'flex-end', gap: '15px', justifyContent: 'space-between', padding: '20px 0' }}>
              {/* Mock bar chart graph */}
              {[30, 45, 25, 60, 40, 75, 50].map((h, i) => (
                <div key={i} style={{ flex: 1, background: 'var(--primary-glow)', borderRadius: '8px 8px 0 0', position: 'relative', height: `${h}%`, minWidth: '20px' }}>
                   <div style={{ position: 'absolute', top: '-25px', width: '100%', textAlign: 'center', fontSize: '10px', fontWeight: 'bold', opacity: 0.3 }}>{Math.floor(h * 123)}</div>
                </div>
              ))}
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', opacity: 0.3, fontSize: '10px', fontWeight: 'bold', marginTop: '10px' }}>
              <span>LUN</span><span>MAR</span><span>MIE</span><span>JUE</span><span>VIE</span><span>SAB</span><span>DOM</span>
            </div>
          </div>
          
          {/* Historial de Transacciones / Regalos */}
          <div style={{ marginTop: '30px', background: 'white', borderRadius: '24px', padding: '30px', border: '1px solid rgba(0,0,0,0.03)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
              <Clock size={20} color="var(--primary)" />
              <h3 style={{ fontSize: '18px', fontWeight: '900' }}>HISTORIAL DE REGALOS</h3>
            </div>
            
            {transactions.length === 0 ? (
              <div style={{ textAlign: 'center', opacity: 0.3, padding: '20px 0', fontSize: '13px' }}>Aún no hay transacciones</div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {transactions.map(t => {
                  const isReceived = t.amount > 0;
                  return (
                    <div key={t.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 16px', background: 'rgba(0,0,0,0.02)', borderRadius: '14px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <div style={{ background: isReceived ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)', color: isReceived ? '#10B981' : '#EF4444', padding: '8px', borderRadius: '50%' }}>
                          {isReceived ? <ArrowDownRight size={16} /> : <ArrowUpRight size={16} />}
                        </div>
                        <div>
                          <div style={{ fontWeight: 'bold', fontSize: '13px' }}>
                            {t.type === 'gift_received' ? 'Regalo recibido' : t.type === 'gift_sent' ? 'Regalo enviado' : 'Transacción'}
                          </div>
                          <div style={{ fontSize: '11px', opacity: 0.5 }}>{new Date(t.created_at).toLocaleDateString()} {new Date(t.created_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</div>
                        </div>
                      </div>
                      <div style={{ fontWeight: '900', color: isReceived ? '#10B981' : '#EF4444' }}>
                        {isReceived ? '+' : ''}{t.amount} Coins
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
            <div style={{ marginTop: '16px', fontSize: '11px', opacity: 0.5, textAlign: 'center' }}>
              * 1000 TheApp Coins equivaldrán a 10 euros en futuras actualizaciones de monetización.
            </div>
          </div>

          <div style={{ marginTop: '30px', background: 'var(--bg-alt)', borderRadius: '20px', padding: '20px', display: 'flex', gap: '12px', alignItems: 'center' }}>
            <Info size={20} color="var(--primary)" />
            <p style={{ fontSize: '12px', opacity: 0.6, margin: 0 }}>
              <b>Sugerencia:</b> Las publicaciones con video tienen un <b>2.5x más de alcance</b> local en tu zona este fin de semana.
            </p>
          </div>
        </>
      )}
    </main>
  );
};

export default CreatorDashboard;
