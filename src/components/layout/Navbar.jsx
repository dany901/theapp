import React, { useState } from 'react';
import { Menu, Search, User, LogOut, Globe, MapPin, Users as UsersIcon, Trophy, BarChart3, MessageCircle, X, Mail } from 'lucide-react';
import { NavLink, useNavigate } from 'react-router-dom';
import { motion as Motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';
import { supabase } from '../../supabaseClient';
import logo from '../../assets/logo_sharp.png';
import CoinBalance from '../social/CoinBalance';

const Navbar = ({ onOpenAuth, onOpenCreate, onOpenProfile, onOpenPolicies, activeCategory, setActiveCategory, CATEGORIES }) => {
  const { user, profile } = useAuth();
  const navigate = useNavigate();
  const [showSearch, setShowSearch] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showMobileMenu, setShowMobileMenu] = useState(false);

  const NavItem = ({ to, icon: Icon, label, onClick }) => (
    <NavLink 
      to={to} 
      onClick={onClick}
      style={({ isActive }) => ({
        display: 'flex',
        alignItems: 'center',
        gap: '6px',
        textDecoration: 'none',
        color: isActive ? 'var(--primary)' : 'inherit',
        opacity: isActive ? 1 : 0.5,
        fontSize: '11px',
        fontWeight: 'bold',
        textTransform: 'uppercase'
      })}
    >
      <Icon size={14} />
      <span className="hide-mobile-text">{label}</span>
    </NavLink>
  );

  return (
    <header className="glass" style={{ position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100, padding: '12px 0' }}>
      <div style={{ maxWidth: '1100px', margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0 24px' }}>
        <div style={{ display: 'flex', gap: '8px', cursor: 'pointer', alignItems: 'center' }} onClick={() => navigate('/')}>
          <img src={logo} alt="logo" style={{ height: '30px' }} />
          <span style={{ fontSize: '20px', fontWeight: '900', color: '#000000' }}>theapp</span>
        </div>
        
        <nav style={{ display: 'flex', gap: '15px', alignItems: 'center' }}>
          {showSearch ? (
            <div style={{ display: 'flex', alignItems: 'center', background: 'rgba(0,0,0,0.05)', borderRadius: '20px', padding: '4px 12px' }}>
              <input 
                autoFocus
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Buscar..."
                style={{ background: 'none', border: 'none', fontSize: '12px', outline: 'none', width: '80px' }}
              />
              <button onClick={() => setShowSearch(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '10px', opacity: 0.5 }}>×</button>
            </div>
          ) : (
            <button onClick={() => setShowSearch(true)} style={{ background: 'none', border: 'none', cursor: 'pointer', opacity: 0.4 }}><Search size={18} /></button>
          )}

          <div className="desktop-nav">
            <NavItem to="/" icon={Globe} label="Global" />
            <NavItem to="/local" icon={MapPin} label="Local" />
            {user && <NavItem to="/amigos" icon={UsersIcon} label="Amigos" />}
            <NavItem to="/ranking" icon={Trophy} label="Ranking" />
            {user && <NavItem to="/chat" icon={MessageCircle} label="Chat" />}
            {user && <NavItem to="/creator" icon={BarChart3} label="Panel" />}
          </div>

          <div className="hide-mobile" style={{ width: '1px', height: '20px', background: 'rgba(0,0,0,0.1)', margin: '0 5px' }}></div>
          
          {!user ? (
            <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
              <button onClick={onOpenAuth} className="btn-primary" style={{ padding: '6px 12px', fontSize: '9px', background: 'var(--primary)', color: 'white', border: 'none', borderRadius: '20px', fontWeight: 'bold', cursor: 'pointer' }}>INICIAR</button>
              <button 
                onClick={() => setShowMobileMenu(true)} 
                className="show-mobile"
                style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '5px' }}
              >
                <Menu size={22} />
              </button>
            </div>
          ) : (
            <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
              <CoinBalance />
              <button 
                onClick={onOpenCreate} 
                className="hide-mobile"
                style={{ background: 'var(--primary)', color: 'white', borderRadius: '50%', width: '28px', height: '28px', border: 'none', cursor: 'pointer', fontSize: '18px', lineHeight: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
              >
                +
              </button>
              <button 
                onClick={onOpenProfile} 
                style={{ border: '2px solid var(--primary)', borderRadius: '50%', padding: 0, cursor: 'pointer', background: 'none', width: '30px', height: '30px', overflow: 'hidden' }}
              >
                {profile?.avatar_url ? <img src={profile.avatar_url} style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt="avatar" /> : <User size={14} style={{ margin: '6px', color: 'var(--primary)' }} />}
              </button>
              <button 
                onClick={() => setShowMobileMenu(true)} 
                className="show-mobile"
                style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '5px' }}
              >
                <Menu size={22} />
              </button>
            </div>
          )}
        </nav>
      </div>

      {CATEGORIES && (
        <div className="category-scroll" style={{ maxWidth: '1100px', margin: '12px auto 0', display: 'flex', justifyContent: 'center', gap: '30px', padding: '0 24px' }}>
          {CATEGORIES.map(cat => (
            <button 
              key={cat}
              onClick={() => setActiveCategory(cat)}
              style={{
                background: 'none',
                border: 'none',
                fontSize: '10px',
                fontWeight: 'bold',
                letterSpacing: '0.05em',
                opacity: activeCategory === cat ? 1 : 0.3,
                color: activeCategory === cat ? 'var(--primary)' : 'inherit',
                cursor: 'pointer',
                paddingBottom: '4px',
                borderBottom: activeCategory === cat ? '2px solid var(--primary)' : '2px solid transparent',
                transition: 'all 0.2s',
                whiteSpace: 'nowrap'
              }}
            >
              {cat.toUpperCase()}
            </button>
          ))}
          <button 
            onClick={onOpenPolicies} 
            style={{ background: 'none', border: 'none', fontSize: '9px', opacity: 0.2, cursor: 'pointer', whiteSpace: 'nowrap' }}
          >
            POLITICAS
          </button>
          <button 
            onClick={() => window.location.href = 'mailto:contact@theapp.pro'} 
            style={{ background: 'none', border: 'none', fontSize: '9px', opacity: 0.2, cursor: 'pointer', whiteSpace: 'nowrap' }}
          >
            CONTACTO
          </button>
        </div>
      )}

      {/* Mobile Sidebar */}
      <AnimatePresence>
        {showMobileMenu && (
          <>
            <Motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowMobileMenu(false)}
              style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', zIndex: 999 }}
            />
            <Motion.div 
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="mobile-sidebar"
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                  <img src={logo} alt="logo" style={{ height: '24px' }} />
                  <span style={{ fontSize: '18px', fontWeight: '900', color: '#000000' }}>theapp</span>
                </div>
                <button onClick={() => setShowMobileMenu(false)} style={{ border: 'none', background: 'none', cursor: 'pointer' }}><X size={24} /></button>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', marginTop: '20px' }}>
                <NavItem to="/" icon={Globe} label="GLOBAL" onClick={() => setShowMobileMenu(false)} />
                <NavItem to="/local" icon={MapPin} label="LOCAL" onClick={() => setShowMobileMenu(false)} />
                {user && <NavItem to="/amigos" icon={UsersIcon} label="AMIGOS" onClick={() => setShowMobileMenu(false)} />}
                <NavItem to="/ranking" icon={Trophy} label="RANKING" onClick={() => setShowMobileMenu(false)} />
                {user && <NavItem to="/chat" icon={MessageCircle} label="CHAT" onClick={() => setShowMobileMenu(false)} />}
                {user && <NavItem to="/creator" icon={BarChart3} label="MI PANEL" onClick={() => setShowMobileMenu(false)} />}
                <button onClick={() => { setShowMobileMenu(false); window.location.href = 'mailto:contact@theapp.pro'; }} style={{ display: 'flex', alignItems: 'center', gap: '6px', textDecoration: 'none', color: 'inherit', opacity: 0.5, fontSize: '11px', fontWeight: 'bold', border: 'none', background: 'none', padding: 0, textTransform: 'uppercase', cursor: 'pointer', textAlign: 'left' }}><Mail size={14} /> CONTACTO</button>
              </div>

              <div style={{ marginTop: 'auto', borderTop: '1px solid #f0f0f0', paddingTop: '20px', display: 'flex', flexDirection: 'column', gap: '15px' }}>
                <button onClick={() => { onOpenCreate(); setShowMobileMenu(false); }} style={{ width: '100%', padding: '12px', background: 'var(--primary)', color: 'white', border: 'none', borderRadius: '12px', fontWeight: 'bold', cursor: 'pointer' }}>CREAR PUBLICACIÓN</button>
                <button onClick={() => { onOpenProfile(); setShowMobileMenu(false); }} style={{ width: '100%', padding: '12px', background: '#f5f5f5', color: 'black', border: 'none', borderRadius: '12px', fontWeight: 'bold', cursor: 'pointer' }}>MI PERFIL</button>
                <button onClick={() => supabase.auth.signOut()} style={{ width: '100%', padding: '12px', background: 'none', color: '#ff4b4b', border: 'none', fontWeight: 'bold', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}><LogOut size={18} /> CERRAR SESIÓN</button>
              </div>
            </Motion.div>
          </>
        )}
      </AnimatePresence>
    </header>
  );
};

export default Navbar;
