import React from 'react';
import { Check } from 'lucide-react';

const VerifiedBadge = ({ type }) => {
  if (!type || type === 'none') return null;

  const color = type === 'gold' ? '#FFD700' : (type === 'blue' ? '#0047FF' : '#10b981');

  return (
    <div style={{
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      width: '14px',
      height: '14px',
      borderRadius: '50%',
      background: color,
      marginLeft: '4px',
      flexShrink: 0
    }}>
      <Check size={8} color="white" strokeWidth={4} />
    </div>
  );
};

export default VerifiedBadge;
