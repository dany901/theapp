import React from 'react';
import { useAuth } from '../../context/AuthContext';
import logo from '../../assets/logo_sharp.png'; // Using app logo for coins

const CoinBalance = () => {
  const { profile } = useAuth();

  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      gap: '6px',
      background: 'var(--primary-glow)',
      padding: '4px 10px',
      borderRadius: '12px',
      cursor: 'pointer'
    }}>
      <img src={logo} style={{ height: '14px', width: 'auto' }} alt="coin" />
      <span style={{ fontSize: '12px', fontWeight: '800', color: 'var(--primary)' }}>
        {profile?.coins || 0}
      </span>
    </div>
  );
};

export default CoinBalance;
