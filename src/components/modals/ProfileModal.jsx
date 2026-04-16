import React, { useState, useRef } from 'react';
import { motion as Motion, AnimatePresence } from 'framer-motion';
import { X, Camera, Check, AlertCircle, User } from 'lucide-react';
import { supabase } from '../../supabaseClient';
import { useAuth } from '../../context/AuthContext';

const ProfileModal = ({ onClose, onSaveSuccess }) => {
  const { user, profile, fetchProfile } = useAuth();
  const [profileForm, setProfileForm] = useState({ 
    full_name: profile?.full_name || '', 
    username: profile?.username || '', 
    theapp_id: profile?.theapp_id || '' 
  });
  const [profileSaving, setProfileSaving] = useState(false);
  const [profileMsg, setProfileMsg] = useState('');
  const [avatarFile, setAvatarFile] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState(null);
  const [userRank, setUserRank] = useState(null);
  const avatarInputRef = useRef(null);

  useEffect(() => {
    const fetchUserRank = async () => {
      if (!user) return;
      // Fetch all coins to see position
      const { data } = await supabase.from('profiles').select('id, coins').order('coins', { ascending: false });
      if (data) {
        const index = data.findIndex(p => p.id === user.id);
        setUserRank(index + 1);
      }
    };
    fetchUserRank();
  }, [user]);

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setAvatarFile(file);
      setAvatarPreview(URL.createObjectURL(file));
    }
  };

  const handleSaveProfile = async () => {
    if (!user) return;
    setProfileSaving(true);
    setProfileMsg('');
    
    let avatarUrl = profile?.avatar_url || null;
    if (avatarFile) {
      const fileName = `avatars/${user.id}_${Date.now()}.jpg`;
      const { data, error: upErr } = await supabase.storage.from('media').upload(fileName, avatarFile, { upsert: true });
      if (upErr) {
        setProfileMsg('❌ ' + upErr.message);
        setProfileSaving(false);
        return;
      }
      if (data) {
        const { data: { publicUrl } } = supabase.storage.from('media').getPublicUrl(fileName);
        avatarUrl = publicUrl;
      }
    }

    const { error } = await supabase.from('profiles').update({ 
      full_name: profileForm.full_name, 
      username: profileForm.username, 
      theapp_id: profileForm.theapp_id, 
      avatar_url: avatarUrl 
    }).eq('id', user.id);

    if (error) setProfileMsg('❌ ' + error.message);
    else {
      setProfileMsg('✓ Guardado');
      await fetchProfile(user.id);
      if (onSaveSuccess) onSaveSuccess();
      setAvatarFile(null);
    }
    setProfileSaving(false);
  };

  const inputStyle = { padding: '10px 14px', borderRadius: '10px', border: '1px solid rgba(0,0,0,0.1)', fontSize: '12px', outline: 'none', width: '100%' };

  // Chart calculation
  const circleRadius = 45;
  const circumference = 2 * Math.PI * circleRadius;
  const level = profile?.level || 1;
  const coins = profile?.coins || 0;
  const nextLevelThreshold = level * 1000;
  const progressPercent = Math.min((coins / nextLevelThreshold) * 100, 100);
  const offset = circumference - (progressPercent / 100) * circumference;

  return (
    <Motion.div 
      initial={{ opacity: 0 }} 
      animate={{ opacity: 1 }} 
      exit={{ opacity: 0 }} 
      className="modal-overlay" style={{ zIndex: 200 }}
      onClick={onClose}
    >
      <Motion.div style={{ background: 'white', padding: '32px', borderRadius: '25px', width: '380px', maxHeight: '90vh', overflowY: 'auto' }} onClick={e => e.stopPropagation()}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
          <h3 style={{ fontSize: '16px', fontWeight: '900', margin: 0 }}>MI PERFIL</h3>
          <button onClick={onClose} style={{ border: 'none', background: 'none', cursor: 'pointer', opacity: 0.4 }}><X size={18} /></button>
        </div>

        {/* Ranking Chart Section */}
        <div className="rank-chart-container">
          <div style={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <svg width="100" height="100" className="chart-svg">
              <circle cx="50" cy="50" r={circleRadius} className="chart-circle-bg" />
              <circle 
                cx="50" cy="50" r={circleRadius} 
                className="chart-circle-progress" 
                strokeDasharray={circumference} 
                strokeDashoffset={offset} 
              />
            </svg>
            <div style={{ position: 'absolute', textAlign: 'center' }}>
              <div style={{ fontSize: '20px', fontWeight: '900', color: 'var(--primary)' }}>{level}</div>
              <div style={{ fontSize: '8px', fontWeight: 'bold', opacity: 0.4 }}>NIVEL</div>
            </div>
          </div>
          <div className="rank-badge">RANK GLOBAL: #{userRank || '?'}</div>
          <div style={{ marginTop: '15px', textAlign: 'center' }}>
            <div style={{ fontSize: '12px', fontWeight: '800' }}>PUNTUACIÓN DE CREADOR</div>
            <div style={{ fontSize: '10px', opacity: 0.5 }}>{coins} / {nextLevelThreshold} pts</div>
          </div>
        </div>

        <div style={{ textAlign: 'center', margin: '24px 0' }}>
          <div style={{ position: 'relative', display: 'inline-block' }}>
            <div style={{ width: '80px', height: '80px', borderRadius: '50%', overflow: 'hidden', border: '3px solid var(--primary)', margin: '0 auto' }}>
              {(avatarPreview || profile?.avatar_url)
                ? <img src={avatarPreview || profile?.avatar_url} style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt="avatar" />
                : <div style={{ width: '100%', height: '100%', background: 'rgba(0, 71, 255, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><User size={32} color="var(--primary)" /></div>
              }
            </div>
            <button 
              onClick={() => avatarInputRef.current?.click()} 
              style={{ position: 'absolute', bottom: 0, right: 0, background: 'var(--primary)', color: 'white', border: 'none', borderRadius: '50%', width: '26px', height: '26px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
            >
              <Camera size={12} />
            </button>
            <input ref={avatarInputRef} type="file" accept="image/*" onChange={handleAvatarChange} style={{ display: 'none' }} />
          </div>
          <p style={{ fontSize: '10px', opacity: 0.4, marginTop: '8px' }}>{user?.email}</p>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <div>
            <label style={{ fontSize: '10px', fontWeight: 'bold', opacity: 0.5, display: 'block', marginBottom: '4px' }}>NOMBRE</label>
            <input style={inputStyle} value={profileForm.full_name} onChange={e => setProfileForm(f => ({ ...f, full_name: e.target.value }))} placeholder="Tu nombre completo" />
          </div>
          <div>
            <label style={{ fontSize: '10px', fontWeight: 'bold', opacity: 0.5, display: 'block', marginBottom: '4px' }}>USUARIO</label>
            <input style={inputStyle} value={profileForm.username} onChange={e => setProfileForm(f => ({ ...f, username: e.target.value }))} placeholder="@usuario" />
          </div>
          <div>
            <label style={{ fontSize: '10px', fontWeight: 'bold', opacity: 0.5, display: 'block', marginBottom: '4px' }}>THEAPP ID</label>
            <input style={inputStyle} value={profileForm.theapp_id} onChange={e => setProfileForm(f => ({ ...f, theapp_id: e.target.value }))} placeholder="ej: 00A1" />
          </div>

          {profileMsg && (
            <div style={{ 
              padding: '10px 14px', 
              borderRadius: '10px', 
              background: profileMsg.startsWith('✓') ? 'rgba(34,197,94,0.1)' : 'rgba(239,68,68,0.1)', 
              color: profileMsg.startsWith('✓') ? '#15803d' : '#dc2626', 
              fontSize: '11px', 
              fontWeight: '600', 
              display: 'flex', 
              alignItems: 'center', 
              gap: '6px' 
            }}>
              {profileMsg.startsWith('✓') ? <Check size={13} /> : <AlertCircle size={13} />} {profileMsg}
            </div>
          )}

          <button 
            onClick={handleSaveProfile} 
            disabled={profileSaving} 
            className="btn-primary" 
            style={{ padding: '12px', borderRadius: '12px', fontWeight: 'bold', marginTop: '4px', background: 'var(--primary)', color: 'white', border: 'none', cursor: 'pointer' }}
          >
            {profileSaving ? 'GUARDANDO...' : 'GUARDAR CAMBIOS'}
          </button>
        </div>
      </Motion.div>
    </Motion.div>
  );
};

export default ProfileModal;
