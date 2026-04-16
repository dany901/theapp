import React, { useState, useEffect } from 'react';
import { motion as Motion } from 'framer-motion';
import { X, Send } from 'lucide-react';
import { supabase } from '../../supabaseClient';
import { useAuth } from '../../context/AuthContext';
import logo from '../../assets/logo_sharp.png';

const MOCK_GIFTS = [
  { id: 'g1', name: 'Like dorado', price: 10, icon: '✨' },
  { id: 'g2', name: 'Estrella', price: 50, icon: '⭐' },
  { id: 'g3', name: 'Fuego', price: 100, icon: '🔥' },
  { id: 'g4', name: 'Diamante', price: 500, icon: '💎' },
  { id: 'g5', name: 'Corona', price: 1000, icon: '👑' },
];

const GiftModal = ({ receiverId, postId, onClose, onGiftSent }) => {
  const { user, profile, fetchProfile } = useAuth();
  const [loading, setLoading] = useState(false);
  const [selectedGift, setSelectedGift] = useState(null);
  const [error, setError] = useState('');

  const handleSendGift = async () => {
    if (!selectedGift || !user || !profile) return;
    if (profile.coins < selectedGift.price) {
      setError('¡No tienes suficientes monedas!');
      return;
    }

    setLoading(true);
    setError('');

    try {
      // 1. Descontar monedas al emisor
      const { error: senderErr } = await supabase
        .from('profiles')
        .update({ coins: profile.coins - selectedGift.price })
        .eq('id', user.id);
      
      if (senderErr) throw senderErr;

      // 2. Añadir monedas al receptor
      const { data: recProfile } = await supabase.from('profiles').select('coins').eq('id', receiverId).single();
      const { error: receiverErr } = await supabase
        .from('profiles')
        .update({ coins: (recProfile?.coins || 0) + selectedGift.price })
        .eq('id', receiverId);
      
      if (receiverErr) throw receiverErr;

      // 3. Registrar transacción
      await supabase.from('coin_transactions').insert({
        user_id: user.id,
        amount: -selectedGift.price,
        type: 'gift_sent'
      });
      
      await supabase.from('coin_transactions').insert({
        user_id: receiverId,
        amount: selectedGift.price,
        type: 'gift_received'
      });

      // 4. Registrar regalo enviado
      await supabase.from('sent_gifts').insert({
        sender_id: user.id,
        receiver_id: receiverId,
        gift_id: null, // Using mock names for now since we don't have catalog table fully seeded
        post_id: postId
      });

      await fetchProfile(user.id);
      if (onGiftSent) onGiftSent();
      onClose();
      // Silently close without alert
    } catch (err) {
      setError('Error al enviar regalo: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Motion.div 
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="modal-overlay" style={{ zIndex: 400 }}
      onClick={onClose}
    >
      <Motion.div 
        initial={{ y: 20 }} animate={{ y: 0 }}
        style={{ background: 'white', padding: '24px', borderRadius: '24px', width: '340px', textAlign: 'center' }}
        onClick={e => e.stopPropagation()}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <h3 style={{ fontSize: '16px', fontWeight: '900', margin: 0 }}>ENVIAR REGALO</h3>
          <button onClick={onClose} style={{ border: 'none', background: 'none', cursor: 'pointer', opacity: 0.4 }}><X size={18} /></button>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px', marginBottom: '20px' }}>
          {MOCK_GIFTS.map(gift => (
            <button 
              key={gift.id}
              onClick={() => setSelectedGift(gift)}
              style={{
                padding: '12px 8px',
                borderRadius: '16px',
                border: selectedGift?.id === gift.id ? '2px solid var(--primary)' : '1px solid #f0f0f0',
                background: selectedGift?.id === gift.id ? 'var(--primary-glow)' : 'white',
                cursor: 'pointer',
                transition: 'all 0.2s'
              }}
            >
              <div style={{ fontSize: '24px', marginBottom: '4px' }}>{gift.icon}</div>
              <div style={{ fontSize: '10px', fontWeight: 'bold' }}>{gift.name}</div>
              <div style={{ fontSize: '10px', color: 'var(--primary)', fontWeight: '800', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '2px' }}>
                <img src={logo} style={{ height: '8px' }} alt="c" /> {gift.price}
              </div>
            </button>
          ))}
        </div>

        {error && <p style={{ color: '#dc2626', fontSize: '11px', marginBottom: '12px', fontWeight: 'bold' }}>{error}</p>}

        <button 
          onClick={handleSendGift}
          disabled={!selectedGift || loading}
          className="btn-primary"
          style={{ width: '100%', padding: '12px', borderRadius: '14px', background: 'var(--primary)', color: 'white', border: 'none', fontWeight: 'bold', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
        >
          {loading ? 'Procesando...' : (
            <>
              <Send size={16} /> ENVIAR {selectedGift ? selectedGift.price : ''}
            </>
          )}
        </button>
      </Motion.div>
    </Motion.div>
  );
};

export default GiftModal;
