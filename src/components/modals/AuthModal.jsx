import React, { useState } from 'react';
import { motion as Motion } from 'framer-motion';
import { AlertCircle } from 'lucide-react';
import { supabase } from '../../supabaseClient';
import logo from '../../assets/logo_sharp.png';

const AuthModal = ({ onClose }) => {
  const [isSignUp, setIsSignUp] = useState(false);
  const [authError, setAuthError] = useState('');
  const [authLoading, setAuthLoading] = useState(false);

  const handleAuth = async (e) => {
    e.preventDefault();
    setAuthError('');
    setAuthLoading(true);
    const formData = new FormData(e.target);
    const email = formData.get('email');
    const password = formData.get('password');

    if (isSignUp) {
      const { error } = await supabase.auth.signUp({ 
        email, 
        password, 
        options: { data: { full_name: formData.get('name') } } 
      });
      if (error) setAuthError(error.message);
      else setAuthError('✓ Revisa tu email para confirmar');
    } else {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) setAuthError(error.message);
      else {
        onClose();
        setAuthError('');
      }
    }
    setAuthLoading(false);
  };

  const inputStyle = { padding: '10px 14px', borderRadius: '10px', border: '1px solid rgba(0,0,0,0.1)', fontSize: '12px', outline: 'none', width: '100%' };

  return (
    <Motion.div 
      initial={{ opacity: 0 }} 
      animate={{ opacity: 1 }} 
      exit={{ opacity: 0 }} 
      className="modal-overlay" style={{ zIndex: 200 }}
      onClick={onClose}
    >
      <div style={{ background: 'white', padding: '30px', borderRadius: '25px', width: '320px', textAlign: 'center' }} onClick={e => e.stopPropagation()}>
        <img src={logo} style={{ height: '40px', marginBottom: '15px' }} alt="l" />
        <form onSubmit={handleAuth} style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {isSignUp && <input name="name" placeholder="Nombre" required style={inputStyle} />}
          <input name="email" placeholder="Email" required style={inputStyle} />
          <input name="password" type="password" placeholder="Contraseña" required style={inputStyle} />
          
          {authError && (
            <div style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '6px', 
              padding: '10px 14px', 
              borderRadius: '10px', 
              background: authError.startsWith('✓') ? 'rgba(34,197,94,0.1)' : 'rgba(239,68,68,0.1)', 
              color: authError.startsWith('✓') ? '#15803d' : '#dc2626', 
              fontSize: '11px', 
              fontWeight: '600', 
              textAlign: 'left' 
            }}>
              {!authError.startsWith('✓') && <AlertCircle size={14} />} {authError}
            </div>
          )}
          
          <button 
            type="submit" 
            disabled={authLoading} 
            className="btn-primary" 
            style={{ padding: '12px', borderRadius: '12px', fontWeight: 'bold', background: 'var(--primary)', color: 'white', border: 'none', cursor: 'pointer' }}
          >
            {authLoading ? '...' : (isSignUp ? 'Crear cuenta' : 'Entrar')}
          </button>
        </form>
        <button 
          onClick={() => { setIsSignUp(!isSignUp); setAuthError(''); }} 
          style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '10px', marginTop: '15px', opacity: 0.4 }}
        >
          {isSignUp ? '¿Ya tienes cuenta? Entra' : 'Crea una gratis'}
        </button>
      </div>
    </Motion.div>
  );
};

export default AuthModal;
