import React, { useState } from 'react';
import { 
  Sparkles, 
  MessageSquare, 
  Calendar, 
  Layers, 
  User, 
  BookOpen,
  LogOut, 
  Users, 
  ChevronDown,
  ArrowRightLeft,
  Compass,
  Star
} from 'lucide-react';

export default function Navbar({ 
  currentTab, 
  setCurrentTab, 
  currentUser, 
  onLogout, 
  onSwitchUser, 
  pendingSwapsCount = 0
}) {
  const [showUserDropdown, setShowUserDropdown] = useState(false);

  const demoStudents = [
    { id: 'user-sarah-01', name: 'Sarah Chen', title: 'Teaches Python · Wants UI/UX', avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80' },
    { id: 'user-alex-02', name: 'Alex Rivera', title: 'Teaches UI/UX · Wants Python', avatar: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=100&auto=format&fit=crop&q=80' },
    { id: 'user-maya-03', name: 'Maya Lin', title: 'Teaches React · Wants Spanish', avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=100&auto=format&fit=crop&q=80' },
    { id: 'user-liam-04', name: 'Liam Patel', title: 'Teaches Spanish · Wants Python', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80' }
  ];

  return (
    <header style={{
      backgroundColor: '#FFFFFF',
      borderBottom: '1px solid #E2E8F0',
      position: 'sticky',
      top: 0,
      zIndex: 40,
      boxShadow: '0 1px 3px rgba(0,0,0,0.03)'
    }}>
      <div style={{
        maxWidth: '1280px',
        margin: '0 auto',
        padding: '0 24px',
        height: '72px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '20px'
      }}>
        {/* Brand Logo matching theme image */}
        <div 
          onClick={() => setCurrentTab('matches')}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            cursor: 'pointer',
            userSelect: 'none'
          }}
        >
          {/* Dual curved arrows icon */}
          <div style={{
            width: '42px',
            height: '42px',
            borderRadius: '12px',
            background: 'linear-gradient(135deg, #06B6D4 0%, #6366F1 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'white',
            boxShadow: '0 4px 12px rgba(6, 182, 212, 0.25)'
          }}>
            <ArrowRightLeft size={22} strokeWidth={2.5} />
          </div>
          <div>
            <div style={{ fontSize: '1.45rem', fontWeight: 800, letterSpacing: '-0.03em', lineHeight: 1 }}>
              <span style={{ color: '#0F172A' }}>Skill</span>
              <span style={{ 
                background: 'linear-gradient(135deg, #06B6D4 0%, #6366F1 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent'
              }}>Swap</span>
            </div>
            <div style={{ fontSize: '0.72rem', color: '#64748B', fontWeight: 500, letterSpacing: '0.02em' }}>
              STUDENT EXCHANGE
            </div>
          </div>
        </div>

        {/* Center Nav Navigation */}
        <nav style={{
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          background: '#F8FAFC',
          padding: '5px',
          borderRadius: '16px',
          border: '1px solid #E2E8F0'
        }}>
          <button
            onClick={() => setCurrentTab('matches')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '8px 16px',
              borderRadius: '12px',
              border: 'none',
              fontSize: '0.88rem',
              fontWeight: 600,
              cursor: 'pointer',
              transition: 'all 0.2s',
              background: currentTab === 'matches' ? '#FFFFFF' : 'transparent',
              color: currentTab === 'matches' ? '#4F46E5' : '#64748B',
              boxShadow: currentTab === 'matches' ? '0 2px 6px rgba(0,0,0,0.06)' : 'none'
            }}
          >
            <Sparkles size={16} />
            Smart Matches
          </button>

          <button
            onClick={() => setCurrentTab('skills')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '8px 16px',
              borderRadius: '12px',
              border: 'none',
              fontSize: '0.88rem',
              fontWeight: 600,
              cursor: 'pointer',
              transition: 'all 0.2s',
              background: currentTab === 'skills' ? '#FFFFFF' : 'transparent',
              color: currentTab === 'skills' ? '#4F46E5' : '#64748B',
              boxShadow: currentTab === 'skills' ? '0 2px 6px rgba(0,0,0,0.06)' : 'none'
            }}
          >
            <Layers size={16} />
            Skill Matrix
          </button>

          <button
            onClick={() => setCurrentTab('chat')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '8px 16px',
              borderRadius: '12px',
              border: 'none',
              fontSize: '0.88rem',
              fontWeight: 600,
              cursor: 'pointer',
              transition: 'all 0.2s',
              position: 'relative',
              background: currentTab === 'chat' ? '#FFFFFF' : 'transparent',
              color: currentTab === 'chat' ? '#4F46E5' : '#64748B',
              boxShadow: currentTab === 'chat' ? '0 2px 6px rgba(0,0,0,0.06)' : 'none'
            }}
          >
            <MessageSquare size={16} />
            Swaps & Chat
            {pendingSwapsCount > 0 && (
              <span style={{
                background: '#EF4444',
                color: 'white',
                fontSize: '0.7rem',
                fontWeight: 700,
                width: '18px',
                height: '18px',
                borderRadius: '50%',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginLeft: '2px'
              }}>
                {pendingSwapsCount}
              </span>
            )}
          </button>

          <button
            onClick={() => setCurrentTab('sessions')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '8px 16px',
              borderRadius: '12px',
              border: 'none',
              fontSize: '0.88rem',
              fontWeight: 600,
              cursor: 'pointer',
              transition: 'all 0.2s',
              background: currentTab === 'sessions' ? '#FFFFFF' : 'transparent',
              color: currentTab === 'sessions' ? '#4F46E5' : '#64748B',
              boxShadow: currentTab === 'sessions' ? '0 2px 6px rgba(0,0,0,0.06)' : 'none'
            }}
          >
            <Calendar size={16} />
            Sessions
          </button>

          <button
            onClick={() => setCurrentTab('materials')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '8px 16px',
              borderRadius: '12px',
              border: 'none',
              fontSize: '0.88rem',
              fontWeight: 600,
              cursor: 'pointer',
              transition: 'all 0.2s',
              background: currentTab === 'materials' ? '#FFFFFF' : 'transparent',
              color: currentTab === 'materials' ? '#4F46E5' : '#64748B',
              boxShadow: currentTab === 'materials' ? '0 2px 6px rgba(0,0,0,0.06)' : 'none'
            }}
          >
            <BookOpen size={16} />
            Material Exchange
          </button>

          <button
            onClick={() => setCurrentTab('profile')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '8px 16px',
              borderRadius: '12px',
              border: 'none',
              fontSize: '0.88rem',
              fontWeight: 600,
              cursor: 'pointer',
              transition: 'all 0.2s',
              background: currentTab === 'profile' ? '#FFFFFF' : 'transparent',
              color: currentTab === 'profile' ? '#4F46E5' : '#64748B',
              boxShadow: currentTab === 'profile' ? '0 2px 6px rgba(0,0,0,0.06)' : 'none'
            }}
          >
            <User size={16} />
            My Profile
          </button>
        </nav>

        {/* Right Section: User Controls */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>

          {/* Peer Quick Switcher */}
          <div style={{ position: 'relative' }}>
            <button
              onClick={() => setShowUserDropdown(!showUserDropdown)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                padding: '5px 12px 5px 6px',
                borderRadius: '9999px',
                border: '1px solid #E2E8F0',
                background: '#FFFFFF',
                cursor: 'pointer'
              }}
            >
              <img 
                src={currentUser?.avatar_url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80'} 
                alt={currentUser?.full_name} 
                style={{ width: '32px', height: '32px', borderRadius: '50%', objectFit: 'cover' }}
              />
              <div style={{ textAlign: 'left', lineHeight: 1.2 }}>
                <div style={{ fontSize: '0.84rem', fontWeight: 700, color: '#0F172A' }}>
                  {currentUser?.full_name?.split(' ')[0] || 'Student'}
                </div>
                <div style={{ fontSize: '0.7rem', color: '#64748B' }}>
                  {currentUser?.skills_to_teach?.[0]?.name ? `Teaches ${currentUser.skills_to_teach[0].name}` : 'Student'}
                </div>
              </div>
              <ChevronDown size={14} color="#64748B" />
            </button>

            {/* Switch Peer Dropdown */}
            {showUserDropdown && (
              <div 
                style={{
                  position: 'absolute',
                  right: 0,
                  top: '115%',
                  width: '280px',
                  background: '#FFFFFF',
                  borderRadius: '18px',
                  boxShadow: '0 20px 40px -15px rgba(0,0,0,0.15), 0 0 1px 1px rgba(0,0,0,0.05)',
                  padding: '12px',
                  zIndex: 50,
                  animation: 'fadeIn 0.2s ease'
                }}
              >
                <div style={{ 
                  padding: '6px 10px 10px', 
                  borderBottom: '1px solid #F1F5F9',
                  marginBottom: '6px'
                }}>
                  <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    Switch Demo Peer
                  </div>
                  <div style={{ fontSize: '0.75rem', color: '#94A3B8' }}>
                    Test 2-way swaps from both sides
                  </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  {demoStudents.map((peer) => (
                    <button
                      key={peer.id}
                      onClick={() => {
                        onSwitchUser(peer.id);
                        setShowUserDropdown(false);
                      }}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '10px',
                        padding: '8px 10px',
                        borderRadius: '12px',
                        border: 'none',
                        background: currentUser?.id === peer.id ? '#F0F9FF' : 'transparent',
                        cursor: 'pointer',
                        textAlign: 'left',
                        width: '100%',
                        transition: 'background 0.15s'
                      }}
                    >
                      <img 
                        src={peer.avatar} 
                        alt={peer.name} 
                        style={{ width: '30px', height: '30px', borderRadius: '50%', objectFit: 'cover' }} 
                      />
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: '0.82rem', fontWeight: 600, color: '#0F172A' }}>
                          {peer.name} {currentUser?.id === peer.id && '✓'}
                        </div>
                        <div style={{ fontSize: '0.72rem', color: '#64748B', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {peer.title}
                        </div>
                      </div>
                    </button>
                  ))}
                </div>

                <div style={{ 
                  marginTop: '10px', 
                  paddingTop: '8px', 
                  borderTop: '1px solid #F1F5F9' 
                }}>
                  <button
                    onClick={() => {
                      setShowUserDropdown(false);
                      onLogout();
                    }}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      padding: '8px 10px',
                      borderRadius: '10px',
                      border: 'none',
                      background: 'transparent',
                      color: '#EF4444',
                      fontSize: '0.82rem',
                      fontWeight: 600,
                      cursor: 'pointer',
                      width: '100%'
                    }}
                  >
                    <LogOut size={15} />
                    Log Out to Theme Screen
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
