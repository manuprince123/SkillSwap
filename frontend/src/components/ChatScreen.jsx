import React, { useState, useEffect, useRef } from 'react';
import { 
  Send, 
  ArrowRightLeft, 
  Calendar, 
  Video, 
  CheckCircle2, 
  Clock, 
  User, 
  Check, 
  XCircle,
  Sparkles,
  MessageSquare
} from 'lucide-react';
import { fetchSwaps, fetchChat, sendChatMessage, updateSwapStatus, getWsBase } from '../api';

export default function ChatScreen({ currentUser, activeSwapId, onScheduleSession }) {
  const [swaps, setSwaps] = useState([]);
  const [selectedSwap, setSelectedSwap] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loadingSwaps, setLoadingSwaps] = useState(true);
  const [loadingChat, setLoadingChat] = useState(false);
  const [wsConnected, setWsConnected] = useState(false);

  const messagesEndRef = useRef(null);
  const wsRef = useRef(null);

  // Load swaps on mount or user switch
  useEffect(() => {
    loadUserSwaps();
  }, [currentUser]);

  // Handle activeSwapId prop if passed from another view
  useEffect(() => {
    if (activeSwapId && swaps.length > 0) {
      const match = swaps.find(s => s.id === activeSwapId);
      if (match) setSelectedSwap(match);
    }
  }, [activeSwapId, swaps]);

  // Load chat and setup WebSocket when selectedSwap changes
  useEffect(() => {
    if (!selectedSwap) return;
    loadChatMessages(selectedSwap.id);
    setupWebSocket(selectedSwap.id);

    return () => {
      if (wsRef.current) {
        wsRef.current.close();
      }
    };
  }, [selectedSwap]);

  // Scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const loadUserSwaps = async () => {
    if (!currentUser?.id) return;
    setLoadingSwaps(true);
    try {
      const data = await fetchSwaps(currentUser.id);
      setSwaps(data);
      if (data.length > 0 && !selectedSwap) {
        setSelectedSwap(data[0]);
      }
    } catch (err) {
      console.error('Failed to load swaps:', err);
    } finally {
      setLoadingSwaps(false);
    }
  };

  const loadChatMessages = async (swapId) => {
    setLoadingChat(true);
    try {
      const data = await fetchChat(swapId);
      setMessages(data);
    } catch (err) {
      console.error('Failed to load chat:', err);
    } finally {
      setLoadingChat(false);
    }
  };

  const setupWebSocket = (swapId) => {
    try {
      const wsBase = getWsBase();
      const wsUrl = `${wsBase}/ws/chat/${swapId}/${currentUser.id}`;
      const ws = new WebSocket(wsUrl);

      ws.onopen = () => {
        setWsConnected(true);
      };

      ws.onmessage = (event) => {
        const msg = JSON.parse(event.data);
        setMessages(prev => {
          if (prev.some(m => m.id === msg.id)) return prev;
          return [...prev, msg];
        });
      };

      ws.onclose = () => {
        setWsConnected(false);
      };

      wsRef.current = ws;
    } catch (e) {
      console.warn('WebSocket connection fallback to polling:', e);
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedSwap) return;

    const otherUserId = selectedSwap.sender_id === currentUser.id 
      ? selectedSwap.receiver_id 
      : selectedSwap.sender_id;

    const payload = {
      swap_id: selectedSwap.id,
      receiver_id: otherUserId,
      content: newMessage.trim(),
      message_type: 'text'
    };

    setNewMessage('');

    try {
      const sent = await sendChatMessage(currentUser.id, payload);
      // If WebSocket didn't already append it:
      setMessages(prev => {
        if (prev.some(m => m.id === sent.id)) return prev;
        return [...prev, sent];
      });
    } catch (err) {
      alert('Failed to send message: ' + err.message);
    }
  };

  const handleUpdateStatus = async (newStatus) => {
    if (!selectedSwap) return;
    try {
      const updated = await updateSwapStatus(selectedSwap.id, newStatus);
      setSelectedSwap(updated);
      setSwaps(swaps.map(s => s.id === updated.id ? updated : s));
    } catch (err) {
      alert('Failed to update status: ' + err.message);
    }
  };

  const handleSendMeetingLink = async () => {
    if (!selectedSwap) return;
    const otherUserId = selectedSwap.sender_id === currentUser.id 
      ? selectedSwap.receiver_id 
      : selectedSwap.sender_id;
    
    const meetUrl = `https://meet.google.com/swap-${Math.random().toString(36).substring(7)}`;
    const payload = {
      swap_id: selectedSwap.id,
      receiver_id: otherUserId,
      content: `Here is our Google Meet room for the skill session: ${meetUrl}`,
      message_type: 'meeting_link'
    };

    try {
      await sendChatMessage(currentUser.id, payload);
    } catch (err) {
      alert('Failed to send link');
    }
  };

  return (
    <div style={{ maxWidth: '1240px', margin: '0 auto', padding: '24px 20px' }}>
      
      <div style={{
        background: '#FFFFFF',
        borderRadius: '28px',
        border: '1px solid #E2E8F0',
        boxShadow: '0 20px 40px -15px rgba(0, 0, 0, 0.05)',
        minHeight: '720px',
        display: 'grid',
        gridTemplateColumns: '340px 1fr',
        overflow: 'hidden'
      }}>
        
        {/* ========================================= */}
        {/* LEFT SIDEBAR: ACTIVE SWAPS LIST           */}
        {/* ========================================= */}
        <div style={{
          borderRight: '1px solid #E2E8F0',
          display: 'flex',
          flexDirection: 'column',
          background: '#F8FAFC'
        }}>
          {/* Header */}
          <div style={{ padding: '24px 20px', borderBottom: '1px solid #E2E8F0', background: '#FFFFFF' }}>
            <h2 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#0F172A' }}>
              Skill Exchanges
            </h2>
            <div style={{ fontSize: '0.8rem', color: '#64748B', marginTop: '2px' }}>
              Active proposals & barter rooms
            </div>
          </div>

          {/* Swaps list */}
          <div style={{ flex: 1, overflowY: 'auto', padding: '12px' }}>
            {loadingSwaps ? (
              <div style={{ textAlign: 'center', padding: '40px 20px', color: '#94A3B8' }}>
                Loading your exchange proposals...
              </div>
            ) : swaps.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '40px 20px', color: '#94A3B8' }}>
                <MessageSquare size={32} style={{ margin: '0 auto 10px', opacity: 0.5 }} />
                <div style={{ fontWeight: 600 }}>No swap proposals yet</div>
                <div style={{ fontSize: '0.8rem', marginTop: '4px' }}>
                  Head over to Smart Matches to propose an exchange!
                </div>
              </div>
            ) : (
              swaps.map((s) => {
                const isSelected = selectedSwap?.id === s.id;
                const isSender = s.sender_id === currentUser?.id;
                const otherName = isSender ? s.receiver_name : s.sender_name;
                const otherAvatar = isSender ? s.receiver_avatar : s.sender_avatar;

                return (
                  <div
                    key={s.id}
                    onClick={() => setSelectedSwap(s)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '12px',
                      padding: '14px',
                      borderRadius: '16px',
                      marginBottom: '8px',
                      cursor: 'pointer',
                      background: isSelected ? '#FFFFFF' : 'transparent',
                      border: isSelected ? '1px solid #CBD5E1' : '1px solid transparent',
                      boxShadow: isSelected ? '0 4px 12px rgba(0,0,0,0.05)' : 'none',
                      transition: 'all 0.15s'
                    }}
                  >
                    <img
                      src={otherAvatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80'}
                      alt={otherName}
                      style={{ width: '46px', height: '46px', borderRadius: '14px', objectFit: 'cover' }}
                    />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '2px' }}>
                        <div style={{ fontWeight: 700, fontSize: '0.9rem', color: '#0F172A', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {otherName}
                        </div>
                        <span style={{
                          fontSize: '0.7rem',
                          fontWeight: 700,
                          padding: '2px 8px',
                          borderRadius: '6px',
                          textTransform: 'uppercase',
                          background: s.status === 'accepted' ? '#DCFCE7' : s.status === 'pending' ? '#FEF3C7' : '#F1F5F9',
                          color: s.status === 'accepted' ? '#15803D' : s.status === 'pending' ? '#B45309' : '#64748B'
                        }}>
                          {s.status}
                        </span>
                      </div>
                      
                      <div style={{ fontSize: '0.76rem', color: '#64748B', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {s.skill_offered?.name} ⇄ {s.skill_requested?.name}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* ========================================= */}
        {/* RIGHT AREA: LIVE CHAT & BARTER ACTION BAR */}
        {/* ========================================= */}
        {selectedSwap ? (
          <div style={{ display: 'flex', flexDirection: 'column', height: '100%', background: '#FFFFFF' }}>
            
            {/* Top Barter Status Header */}
            <div style={{
              padding: '18px 24px',
              borderBottom: '1px solid #E2E8F0',
              background: '#F8FAFC',
              display: 'flex',
              flexWrap: 'wrap',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '16px'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                <div style={{
                  width: '42px',
                  height: '42px',
                  borderRadius: '12px',
                  background: 'linear-gradient(135deg, #06B6D4 0%, #6366F1 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'white'
                }}>
                  <ArrowRightLeft size={20} />
                </div>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: '#0F172A' }}>
                      {selectedSwap.sender_name} ⇄ {selectedSwap.receiver_name}
                    </h3>
                    <span style={{
                      fontSize: '0.72rem',
                      fontWeight: 700,
                      padding: '3px 8px',
                      borderRadius: '6px',
                      background: selectedSwap.status === 'accepted' ? '#DCFCE7' : '#FEF3C7',
                      color: selectedSwap.status === 'accepted' ? '#15803D' : '#B45309',
                      textTransform: 'uppercase'
                    }}>
                      {selectedSwap.status}
                    </span>
                  </div>
                  <div style={{ fontSize: '0.82rem', color: '#64748B', marginTop: '2px' }}>
                    Term: <strong>{selectedSwap.skill_offered.hours}h {selectedSwap.skill_offered.name}</strong> for <strong>{selectedSwap.skill_requested.hours}h {selectedSwap.skill_requested.name}</strong>
                  </div>
                </div>
              </div>

              {/* Status Action Buttons */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                {selectedSwap.status === 'pending' && selectedSwap.receiver_id === currentUser.id && (
                  <>
                    <button
                      onClick={() => handleUpdateStatus('accepted')}
                      style={{
                        padding: '9px 16px',
                        borderRadius: '10px',
                        border: 'none',
                        background: '#10B981',
                        color: 'white',
                        fontWeight: 700,
                        fontSize: '0.84rem',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px'
                      }}
                    >
                      <Check size={16} /> Accept Swap
                    </button>
                    <button
                      onClick={() => handleUpdateStatus('declined')}
                      style={{
                        padding: '9px 16px',
                        borderRadius: '10px',
                        border: '1px solid #CBD5E1',
                        background: '#FFFFFF',
                        color: '#64748B',
                        fontWeight: 600,
                        fontSize: '0.84rem',
                        cursor: 'pointer'
                      }}
                    >
                      Decline
                    </button>
                  </>
                )}

                {selectedSwap.status === 'accepted' && (
                  <>
                    <button
                      onClick={() => onScheduleSession(selectedSwap)}
                      style={{
                        padding: '9px 16px',
                        borderRadius: '10px',
                        border: 'none',
                        background: 'linear-gradient(135deg, #6366F1 0%, #3B82F6 100%)',
                        color: 'white',
                        fontWeight: 700,
                        fontSize: '0.84rem',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px'
                      }}
                    >
                      <Calendar size={15} /> Book Session
                    </button>

                    <button
                      onClick={handleSendMeetingLink}
                      title="Generate Google Meet Link"
                      style={{
                        padding: '9px 14px',
                        borderRadius: '10px',
                        border: '1px solid #E2E8F0',
                        background: '#FFFFFF',
                        color: '#475569',
                        fontWeight: 600,
                        fontSize: '0.84rem',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px'
                      }}
                    >
                      <Video size={15} color="#059669" /> Video Room
                    </button>
                  </>
                )}
              </div>
            </div>

            {/* Chat Messages Stream */}
            <div style={{ flex: 1, padding: '24px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '14px' }}>
              {/* Proposal Note Banner */}
              <div style={{
                margin: '0 auto 16px',
                maxWidth: '520px',
                background: '#FAF5FF',
                border: '1px solid #DDD6FE',
                borderRadius: '16px',
                padding: '16px 20px',
                textAlign: 'center',
                fontSize: '0.86rem',
                color: '#6D28D9'
              }}>
                <div style={{ fontWeight: 700, marginBottom: '4px' }}>Initial Swap Proposal Note:</div>
                "{selectedSwap.note}"
              </div>

              {messages.map((m) => {
                const isMe = m.sender_id === currentUser.id;

                return (
                  <div
                    key={m.id}
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: isMe ? 'flex-end' : 'flex-start'
                    }}
                  >
                    <div style={{ fontSize: '0.72rem', color: '#94A3B8', marginBottom: '4px', marginInline: '8px' }}>
                      {m.sender_name}
                    </div>

                    <div style={{
                      maxWidth: '70%',
                      padding: '12px 18px',
                      borderRadius: isMe ? '18px 18px 4px 18px' : '18px 18px 18px 4px',
                      background: isMe ? 'linear-gradient(135deg, #6366F1 0%, #3B82F6 100%)' : '#F1F5F9',
                      color: isMe ? '#FFFFFF' : '#0F172A',
                      fontSize: '0.92rem',
                      lineHeight: 1.45,
                      boxShadow: isMe ? '0 4px 12px rgba(99, 102, 241, 0.2)' : 'none'
                    }}>
                      {m.content}
                    </div>
                  </div>
                );
              })}
              <div ref={messagesEndRef} />
            </div>

            {/* Message Input Box */}
            <form onSubmit={handleSendMessage} style={{
              padding: '18px 24px',
              borderTop: '1px solid #E2E8F0',
              display: 'flex',
              gap: '12px',
              background: '#FFFFFF'
            }}>
              <input
                type="text"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder="Type your message, suggest a time slot, or discuss goals..."
                style={{
                  flex: 1,
                  padding: '13px 18px',
                  borderRadius: '14px',
                  border: '1px solid #CBD5E1',
                  fontSize: '0.92rem',
                  outline: 'none',
                  backgroundColor: '#F8FAFC'
                }}
              />
              <button
                type="submit"
                style={{
                  padding: '0 24px',
                  borderRadius: '14px',
                  border: 'none',
                  background: 'linear-gradient(135deg, #6366F1 0%, #3B82F6 100%)',
                  color: 'white',
                  fontWeight: 700,
                  fontSize: '0.92rem',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px'
                }}
              >
                <Send size={16} /> Send
              </button>
            </form>

          </div>
        ) : (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#94A3B8' }}>
            Select an exchange on the left to start chatting.
          </div>
        )}

      </div>
    </div>
  );
}
