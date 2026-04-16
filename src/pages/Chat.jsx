import React, { useState, useEffect, useRef } from 'react';
import { Send, User, Image as ImageIcon, ArrowLeft, UserPlus, ShieldOff } from 'lucide-react';
import { supabase } from '../supabaseClient';
import { useAuth } from '../context/AuthContext';
import { timeAgo } from '../utils';

const Chat = () => {
  const { user } = useAuth();
  const [conversations, setConversations] = useState([]);
  const [activeChat, setActiveChat] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [searching, setSearching] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);
  };

  // User Search Logic
  useEffect(() => {
    const searchUsers = async () => {
      if (!searchQuery.trim() || searchQuery.length < 2) {
        setSearchResults([]);
        return;
      }
      setSearching(true);
      const { data } = await supabase
        .from('profiles')
        .select('*')
        .ilike('theapp_id', `%${searchQuery}%`)
        .limit(5);
      
      setSearchResults(data || []);
      setSearching(false);
    };

    const timer = setTimeout(searchUsers, 500);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Fetch initial conversations
  useEffect(() => {
    if (!user) return;

    const fetchConversations = async () => {
      setLoading(true);
      // Fetch people we have messages with or we follow
      const { data: follows } = await supabase
        .from('follows')
        .select('following_id, follower_id')
        .or(`follower_id.eq.${user.id},following_id.eq.${user.id}`);
      
      const uniqueUsers = [];
      const seenIds = new Set();
      
      if (follows) {
        // Collect all followers and following
        const followingSet = new Set(follows.filter(f => f.follower_id === user.id).map(f => f.following_id));
        const followerSet = new Set(follows.filter(f => f.following_id === user.id).map(f => f.follower_id));
        
        // Find mutuals (friends)
        followingSet.forEach(id => {
          if (followerSet.has(id) && !seenIds.has(id) && id !== user.id) {
            seenIds.add(id);
            uniqueUsers.push({ id });
          }
        });
      }

      // Also get users from messages
      const { data: msgs } = await supabase
        .from('messages')
        .select('sender_id, receiver_id')
        .or(`sender_id.eq.${user.id},receiver_id.eq.${user.id}`);
      
      if (msgs) {
        msgs.forEach(m => {
          const otherId = m.sender_id === user.id ? m.receiver_id : m.sender_id;
          if (!seenIds.has(otherId) && otherId !== user.id) {
            seenIds.add(otherId);
            uniqueUsers.push({ id: otherId });
          }
        });
      }

      // Fill user details
      if (uniqueUsers.length > 0) {
        const { data: profiles } = await supabase.from('profiles').select('*').in('id', uniqueUsers.map(u => u.id));
        setConversations(profiles || []);
      }
      setLoading(false);
    };

    fetchConversations();
  }, [user]);

  // Fetch and subscribe to messages
  useEffect(() => {
    if (!activeChat || !user) return;

    const fetchMessages = async () => {
      const { data } = await supabase
        .from('messages')
        .select('*')
        .or(`and(sender_id.eq.${user.id},receiver_id.eq.${activeChat.id}),and(sender_id.eq.${activeChat.id},receiver_id.eq.${user.id})`)
        .order('created_at', { ascending: true });
      setMessages(data || []);
      scrollToBottom();
    };

    fetchMessages();

    // Realtime subscription
    const channel = supabase
      .channel(`chat_${activeChat.id}`)
      .on('postgres_changes', { 
        event: 'INSERT', 
        schema: 'public', 
        table: 'messages'
      }, (payload) => {
        const m = payload.new;
        if ((m.sender_id === activeChat.id && m.receiver_id === user.id) || 
            (m.sender_id === user.id && m.receiver_id === activeChat.id)) {
          setMessages(prev => {
            // Check if we already have this message (optimistic update matching by exact content and very close timestamp, or temp id if we had one)
            // Since we can't easily match tempId to real DB ID here without complex logic,
            // we'll just check if the exact content was sent by us recently.
            // Better yet, just refetch to be safe and clean, or strictly filter.
            if (prev.some(msg => msg.id === m.id)) return prev;
            // Prevent duplication of optimistic messages
            if (m.sender_id === user.id) {
                const isDuplicate = prev.some(orig => orig.sender_id === user.id && orig.content === m.content && (new Date(m.created_at).getTime() - new Date(orig.created_at).getTime() < 5000));
                if (isDuplicate) {
                    // It's a duplicate, we should ideally replace the temp one with the real one, but returning prev is fine for visual stability
                    return prev.map(orig => (orig.sender_id === user.id && orig.content === m.content && String(orig.id).startsWith('temp-')) ? m : orig);
                }
            }
            return [...prev, m];
          });
          scrollToBottom();
        }
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [activeChat, user]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !activeChat || !user) return;

    const msg = {
      sender_id: user.id,
      receiver_id: activeChat.id,
      content: newMessage.trim(),
      is_temporary: false
    };

    // Optimistic update
    const tempId = 'temp-' + Date.now();
    setMessages(prev => [...prev, { ...msg, id: tempId, created_at: new Date().toISOString() }]);
    setNewMessage('');
    scrollToBottom();

    const { error } = await supabase.from('messages').insert(msg);
    if (error) {
      alert('Error: ' + error.message);
      setMessages(prev => prev.filter(m => m.id !== tempId));
    }
  };

  if (!user) return <div style={{paddingTop: '100px', textAlign: 'center'}}>Inicia sesión para chatear</div>;

  return (
    <main style={{ paddingTop: '80px', height: '100vh', display: 'flex', flexDirection: 'column' }}>
      <div style={{ flex: 1, display: 'flex', maxWidth: '1100px', margin: '0 auto', width: '100%', background: 'white', overflow: 'hidden' }}>
        
        {/* Sidebar: Conversations */}
        <div 
          style={{ 
            width: activeChat ? '300px' : '100%', 
            borderRight: '1px solid #f0f0f0', 
            overflowY: 'auto',
            flexShrink: 0
          }} 
          className={activeChat ? 'hide-mobile' : ''}
        >
          <div style={{ padding: '20px', borderBottom: '1px solid #f0f0f0' }}>
            <h2 style={{ fontSize: '18px', fontWeight: '900', marginBottom: '15px' }}>MENSAJES</h2>
            <div style={{ position: 'relative' }}>
              <input 
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Buscar usuario..."
                style={{ width: '100%', padding: '10px 14px', borderRadius: '12px', border: '1px solid #f0f0f0', background: '#f9f9f9', fontSize: '13px', outline: 'none' }}
              />
              {searching && <div style={{ position: 'absolute', right: '12px', top: '10px', fontSize: '10px', opacity: 0.3 }}>...</div>}
              
              {/* Search Results Overlay */}
              {searchResults.length > 0 && (
                <div style={{ position: 'absolute', top: '105%', left: 0, right: 0, background: 'white', boxShadow: '0 10px 25px rgba(0,0,0,0.1)', borderRadius: '12px', zIndex: 10, padding: '8px' }}>
                  {searchResults.map(res => (
                    <div 
                      key={res.id}
                      onClick={() => {
                        setActiveChat(res);
                        setSearchQuery('');
                        setSearchResults([]);
                      }}
                      style={{ padding: '10px', display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer', borderRadius: '8px', hover: { background: '#f5f5f5' } }}
                      onMouseEnter={e => e.currentTarget.style.background = '#f5f5f5'}
                      onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                    >
                      <img src={res.avatar_url || `https://api.dicebear.com/7.x/thumbs/svg?seed=${res.id}`} style={{ width: '30px', height: '30px', borderRadius: '50%' }} alt="p" />
                      <div style={{ fontSize: '13px', fontWeight: 'bold' }}>{res.theapp_id}</div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
          {loading ? (
            <div style={{ padding: '40px', textAlign: 'center', opacity: 0.3 }}>Cargando conversaciones...</div>
          ) : conversations.length === 0 ? (
            <div style={{ padding: '20px' }}>
              <p style={{ fontSize: '12px', opacity: 0.5, textAlign: 'center', marginBottom: '15px' }}>No tienes chats activos aún. ¡Busca a alguien!</p>
              <div style={{ padding: '10px', background: 'var(--primary-glow)', borderRadius: '12px', textAlign: 'center' }}>
                <User size={24} style={{ opacity: 0.2, margin: '0 auto 8px' }} />
                <p style={{ fontSize: '11px', fontWeight: 'bold', margin: 0 }}>Busca usuarios arriba para empezar</p>
              </div>
            </div>
          ) : (
            conversations.map(c => (
              <div 
                key={c.id} 
                onClick={() => setActiveChat(c)}
                style={{ 
                  padding: '12px 20px', 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: '12px', 
                  cursor: 'pointer', 
                  background: activeChat?.id === c.id ? 'var(--primary-glow)' : 'transparent',
                  borderLeft: activeChat?.id === c.id ? '4px solid var(--primary)' : '4px solid transparent'
                }}
              >
                <img src={c.avatar_url || `https://api.dicebear.com/7.x/thumbs/svg?seed=${c.id}`} style={{ width: '45px', height: '45px', borderRadius: '50%', objectFit: 'cover' }} alt="p" />
                <div>
                  <div style={{ fontWeight: 'bold', fontSize: '14px' }}>{c.theapp_id}</div>
                  <div style={{ fontSize: '11px', opacity: 0.5 }}>Toca para chatear</div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Main Content: Chat Window */}
        {activeChat ? (
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', background: 'white' }}>
            {/* Chat header */}
            <div style={{ padding: '12px 20px', borderBottom: '1px solid #f0f0f0', display: 'flex', alignItems: 'center', gap: '12px' }}>
              <button onClick={() => setActiveChat(null)} style={{ border: 'none', background: 'none', cursor: 'pointer', padding: '5px' }} className="show-mobile">
                <ArrowLeft size={18} />
              </button>
              <img src={activeChat.avatar_url || `https://api.dicebear.com/7.x/thumbs/svg?seed=${activeChat.id}`} style={{ width: '35px', height: '35px', borderRadius: '50%' }} alt="p" />
              <div style={{ fontWeight: 'bold', flex: 1 }}>{activeChat.theapp_id}</div>
              
              <div style={{ display: 'flex', gap: '10px' }}>
                <button 
                  onClick={async () => {
                    const { error } = await supabase.from('follows').insert({ follower_id: user.id, following_id: activeChat.id });
                    if (!error) alert('Ahora sigues a este usuario');
                  }}
                  style={{ border: 'none', background: 'var(--primary-glow)', color: 'var(--primary)', padding: '6px 12px', borderRadius: '14px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '5px', fontSize: '11px', fontWeight: 'bold' }}
                >
                  <UserPlus size={14} /> Seguir
                </button>
                <button 
                  onClick={async () => {
                    await supabase.from('blocks').insert({ blocker_id: user.id, blocked_id: activeChat.id });
                    alert('Usuario bloqueado.');
                    setActiveChat(null);
                  }}
                  style={{ border: 'none', background: '#fee2e2', color: '#dc2626', padding: '6px 12px', borderRadius: '14px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '5px', fontSize: '11px', fontWeight: 'bold' }}
                >
                  <ShieldOff size={14} /> Bloquear
                </button>
              </div>
            </div>

            {/* Messages body */}
            <div style={{ flex: 1, overflowY: 'auto', padding: '20px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {messages.map((m, i) => {
                const isMe = m.sender_id === user.id;
                return (
                  <div key={m.id || i} style={{ alignSelf: isMe ? 'flex-end' : 'flex-start', maxWidth: '70%' }}>
                    <div style={{ 
                      padding: '10px 14px', 
                      borderRadius: isMe ? '18px 18px 2px 18px' : '18px 18px 18px 2px',
                      background: isMe ? 'var(--primary)' : '#f0f2f5',
                      color: isMe ? 'white' : 'black',
                      fontSize: '14px'
                    }}>
                      {m.content}
                    </div>
                    <div style={{ fontSize: '9px', opacity: 0.3, marginTop: '4px', textAlign: isMe ? 'right' : 'left' }}>
                      {timeAgo(m.created_at)}
                    </div>
                  </div>
                );
              })}
              <div ref={messagesEndRef} />
            </div>

            {/* Input area */}
            <form onSubmit={handleSend} style={{ padding: '15px 20px', borderTop: '1px solid #f0f0f0', display: 'flex', gap: '10px' }}>
              <button type="button" style={{ border: 'none', background: 'none', cursor: 'pointer', opacity: 0.3 }}><ImageIcon size={20} /></button>
              <input 
                value={newMessage}
                onChange={e => setNewMessage(e.target.value)}
                placeholder="Escribe un mensaje..."
                style={{ flex: 1, border: 'none', background: '#f0f2f5', padding: '10px 16px', borderRadius: '20px', outline: 'none', fontSize: '14px' }}
              />
              <button type="submit" style={{ border: 'none', background: 'none', cursor: 'pointer', color: 'var(--primary)', opacity: newMessage.trim() ? 1 : 0.3 }}>
                <Send size={20} />
              </button>
            </form>
          </div>
        ) : (
          <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: 0.3 }} className="hide-mobile">
            <div style={{ textAlign: 'center' }}>
               <h2 style={{ fontSize: '18px', fontWeight: '900' }}>TUS MENSAJES</h2>
               <p style={{ fontSize: '12px' }}>Selecciona una conversación para empezar</p>
            </div>
          </div>
        )}
      </div>
    </main>
  );
};

export default Chat;
