import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import OnboardingAuth from './components/OnboardingAuth';
import SkillSelector from './components/SkillSelector';
import MatchScreen from './components/MatchScreen';
import ChatScreen from './components/ChatScreen';
import SessionScheduler from './components/SessionScheduler';
import ProfileScreen from './components/ProfileScreen';
import MaterialExchange from './components/MaterialExchange';
import SwapModal from './components/SwapModal';
import RatingModal from './components/RatingModal';
import { switchDemoUser, fetchSwaps, fetchUserProfile } from './api';

export default function App() {
  const [currentUser, setCurrentUser] = useState(() => {
    const saved = localStorage.getItem('skillswap_user');
    return saved ? JSON.parse(saved) : null;
  });

  const [currentTab, setCurrentTab] = useState('matches'); // matches | skills | chat | sessions | materials | profile

  // Active Modals & Selected Objects
  const [swapModalState, setSwapModalState] = useState({ isOpen: false, candidate: null, matchData: null });
  const [ratingModalState, setRatingModalState] = useState({ isOpen: false, session: null });
  const [viewingProfileUser, setViewingProfileUser] = useState(null);
  const [activeSwapForChat, setActiveSwapForChat] = useState(null);
  const [pendingSwapsCount, setPendingSwapsCount] = useState(0);

  // Update pending swaps count whenever user changes
  useEffect(() => {
    if (currentUser?.id) {
      loadPendingSwaps();
    }
  }, [currentUser]);

  const loadPendingSwaps = async () => {
    try {
      const swaps = await fetchSwaps(currentUser.id);
      const pending = swaps.filter(s => s.status === 'pending' && s.receiver_id === currentUser.id);
      setPendingSwapsCount(pending.length);
    } catch (e) {}
  };

  const handleLoginSuccess = (user) => {
    setCurrentUser(user);
    localStorage.setItem('skillswap_user', JSON.stringify(user));
    setCurrentTab('matches');
  };

  const handleLogout = () => {
    setCurrentUser(null);
    localStorage.removeItem('skillswap_user');
  };

  const handleSwitchUser = async (userId) => {
    try {
      const data = await switchDemoUser(userId);
      setCurrentUser(data.user);
      localStorage.setItem('skillswap_user', JSON.stringify(data.user));
      setViewingProfileUser(null);
    } catch (err) {
      alert('Could not switch student peer: ' + err.message);
    }
  };

  const handleSelectSwapCandidate = (candidate, matchData) => {
    setSwapModalState({ isOpen: true, candidate, matchData });
  };

  const handleSwapWithAuthor = async (authorId) => {
    try {
      const author = await fetchUserProfile(authorId);
      setSwapModalState({ isOpen: true, candidate: author, matchData: null });
    } catch (e) {
      alert('Could not load peer profile');
    }
  };

  const handleViewProfile = (student) => {
    setViewingProfileUser(student);
    setCurrentTab('profile');
  };

  const handleSwapCreated = (newSwap) => {
    setActiveSwapForChat(newSwap.id);
    setCurrentTab('chat');
  };

  const handleScheduleFromChat = (swap) => {
    setActiveSwapForChat(swap.id);
    setCurrentTab('sessions');
  };

  const handleOpenRating = (session) => {
    setRatingModalState({ isOpen: true, session });
  };

  // If not logged in, display the theme Onboarding / Auth screen!
  if (!currentUser) {
    return <OnboardingAuth onLoginSuccess={handleLoginSuccess} />;
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', backgroundColor: '#F8FAFC' }}>
      
      {/* Sticky Navigation Bar */}
      <Navbar
        currentTab={currentTab}
        setCurrentTab={(tab) => {
          if (tab === 'profile') setViewingProfileUser(null); // view my own profile
          setCurrentTab(tab);
        }}
        currentUser={currentUser}
        onLogout={handleLogout}
        onSwitchUser={handleSwitchUser}
        pendingSwapsCount={pendingSwapsCount}
      />

      {/* Main Screen Content */}
      <main style={{ flex: 1 }}>
        {currentTab === 'matches' && (
          <MatchScreen
            currentUser={currentUser}
            onSelectSwapCandidate={handleSelectSwapCandidate}
            onViewProfile={handleViewProfile}
            onOpenChat={(swapId) => {
              setActiveSwapForChat(swapId);
              setCurrentTab('chat');
            }}
          />
        )}

        {currentTab === 'skills' && (
          <SkillSelector
            currentUser={currentUser}
            onUserUpdated={(updated) => {
              setCurrentUser(updated);
              localStorage.setItem('skillswap_user', JSON.stringify(updated));
            }}
          />
        )}

        {currentTab === 'chat' && (
          <ChatScreen
            currentUser={currentUser}
            activeSwapId={activeSwapForChat}
            onScheduleSession={handleScheduleFromChat}
          />
        )}

        {currentTab === 'sessions' && (
          <SessionScheduler
            currentUser={currentUser}
            activeSwap={null}
            onOpenRatingModal={handleOpenRating}
          />
        )}

        {currentTab === 'materials' && (
          <MaterialExchange
            currentUser={currentUser}
            onSelectSwapWithAuthor={handleSwapWithAuthor}
          />
        )}

        {currentTab === 'profile' && (
          <ProfileScreen
            currentUser={currentUser}
            profileUser={viewingProfileUser}
            onEditSkills={() => setCurrentTab('skills')}
            onProposeSwap={(user) => handleSelectSwapCandidate(user, null)}
          />
        )}
      </main>

      {/* Propose Swap Modal */}
      <SwapModal
        isOpen={swapModalState.isOpen}
        onClose={() => setSwapModalState({ isOpen: false, candidate: null, matchData: null })}
        currentUser={currentUser}
        candidate={swapModalState.candidate}
        matchData={swapModalState.matchData}
        onSwapCreated={handleSwapCreated}
      />

      {/* Rating & Endorsement Modal */}
      <RatingModal
        isOpen={ratingModalState.isOpen}
        onClose={() => setRatingModalState({ isOpen: false, session: null })}
        session={ratingModalState.session}
        currentUser={currentUser}
        onReviewSubmitted={() => {
          // Refresh profile reviews if open
          loadPendingSwaps();
        }}
      />

    </div>
  );
}
