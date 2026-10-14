import React, { useState, useEffect } from 'react';
import { 
  Calendar as CalendarIcon, 
  Clock, 
  Video, 
  CheckCircle, 
  Plus, 
  Sparkles, 
  ExternalLink,
  Star,
  BookOpen
} from 'lucide-react';
import { fetchSessions, createSession } from '../api';

export default function SessionScheduler({ currentUser, activeSwap, onOpenRatingModal }) {
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showBookingForm, setShowBookingForm] = useState(false);

  // Booking Form State
  const [skillName, setSkillName] = useState(activeSwap?.skill_offered?.name || 'Python');
  const [sessionDate, setSessionDate] = useState('2026-10-20T16:00');
  const [duration, setDuration] = useState(60);
  const [notes, setNotes] = useState('Lesson 1: Intro to FastAPI routers & async database queries');
  const [bookingLoading, setBookingLoading] = useState(false);

  useEffect(() => {
    loadSessions();
  }, [currentUser]);

  const loadSessions = async () => {
    if (!currentUser?.id) return;
    setLoading(true);
    try {
      const data = await fetchSessions(currentUser.id);
      setSessions(data);
    } catch (err) {
      console.error('Failed to load sessions:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateSession = async (e) => {
    e.preventDefault();
    if (!activeSwap) {
      alert('Please select an active accepted swap from the Chat tab to schedule a session.');
      return;
    }

    setBookingLoading(true);
    try {
      const isTeacher = activeSwap.sender_id === currentUser.id;
      const teacherId = isTeacher ? activeSwap.sender_id : activeSwap.receiver_id;
      const learnerId = isTeacher ? activeSwap.receiver_id : activeSwap.sender_id;

      const payload = {
        swap_id: activeSwap.id,
        teacher_id: teacherId,
        learner_id: learnerId,
        skill_name: skillName,
        scheduled_start: new Date(sessionDate).toISOString(),
        duration_minutes: parseInt(duration),
        notes: notes
      };

      const created = await createSession(payload);
      setSessions([...sessions, created]);
      setShowBookingForm(false);
    } catch (err) {
      alert('Failed to schedule session: ' + err.message);
    } finally {
      setBookingLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: '1240px', margin: '0 auto', padding: '36px 20px' }}>
      
      {/* Header */}
      <div style={{
        display: 'flex',
        flexWrap: 'wrap',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '20px',
        marginBottom: '32px'
      }}>
        <div>
          <h1 style={{ fontSize: '2.2rem', fontWeight: 800, color: '#0F172A', letterSpacing: '-0.03em' }}>
            Exchange Sessions & Calendar
          </h1>
          <p style={{ fontSize: '1rem', color: '#64748B', marginTop: '4px' }}>
            Book scheduled practice hours, launch video calls, and endorse peer skills.
          </p>
        </div>

        <button
          onClick={() => setShowBookingForm(!showBookingForm)}
          style={{
            padding: '13px 24px',
            borderRadius: '14px',
            border: 'none',
            background: 'linear-gradient(135deg, #6366F1 0%, #3B82F6 100%)',
            color: 'white',
            fontWeight: 700,
            fontSize: '0.94rem',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            boxShadow: '0 8px 20px rgba(99, 102, 241, 0.3)'
          }}
        >
          <Plus size={18} />
          {showBookingForm ? 'Hide Booking Form' : 'Book New Session'}
        </button>
      </div>

      {/* Booking Form (Conditional) */}
      {showBookingForm && (
        <div style={{
          background: '#FFFFFF',
          borderRadius: '24px',
          border: '1px solid #DDD6FE',
          padding: '30px',
          marginBottom: '36px',
          boxShadow: '0 15px 35px -10px rgba(99, 102, 241, 0.1)',
          animation: 'fadeIn 0.2s ease'
        }}>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0F172A', marginBottom: '6px' }}>
            Schedule an Exchange Lesson
          </h2>
          <p style={{ fontSize: '0.85rem', color: '#64748B', marginBottom: '20px' }}>
            {activeSwap 
              ? `Scheduling session under swap: ${activeSwap.skill_offered.name} ⇄ ${activeSwap.skill_requested.name}`
              : 'Select an exchange in the Chat tab or book with default demo partner.'}
          </p>

          <form onSubmit={handleCreateSession} style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
            gap: '18px'
          }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.84rem', fontWeight: 600, color: '#334155', marginBottom: '6px' }}>
                Subject / Skill
              </label>
              <input
                type="text"
                required
                value={skillName}
                onChange={(e) => setSkillName(e.target.value)}
                placeholder="e.g. Python Async Programming"
                style={{
                  width: '100%',
                  padding: '11px 14px',
                  borderRadius: '12px',
                  border: '1px solid #CBD5E1',
                  fontSize: '0.9rem',
                  outline: 'none'
                }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.84rem', fontWeight: 600, color: '#334155', marginBottom: '6px' }}>
                Date & Time
              </label>
              <input
                type="datetime-local"
                required
                value={sessionDate}
                onChange={(e) => setSessionDate(e.target.value)}
                style={{
                  width: '100%',
                  padding: '11px 14px',
                  borderRadius: '12px',
                  border: '1px solid #CBD5E1',
                  fontSize: '0.9rem',
                  outline: 'none'
                }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.84rem', fontWeight: 600, color: '#334155', marginBottom: '6px' }}>
                Duration
              </label>
              <select
                value={duration}
                onChange={(e) => setDuration(e.target.value)}
                style={{
                  width: '100%',
                  padding: '11px 14px',
                  borderRadius: '12px',
                  border: '1px solid #CBD5E1',
                  fontSize: '0.9rem',
                  outline: 'none'
                }}
              >
                <option value={30}>30 Minutes</option>
                <option value={60}>60 Minutes (1 Hour)</option>
                <option value={90}>90 Minutes (1.5 Hours)</option>
              </select>
            </div>

            <div style={{ gridColumn: '1 / -1' }}>
              <label style={{ display: 'block', fontSize: '0.84rem', fontWeight: 600, color: '#334155', marginBottom: '6px' }}>
                Lesson Objectives / Syllabus
              </label>
              <input
                type="text"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="What will you teach/practice during this hour?"
                style={{
                  width: '100%',
                  padding: '11px 14px',
                  borderRadius: '12px',
                  border: '1px solid #CBD5E1',
                  fontSize: '0.9rem',
                  outline: 'none'
                }}
              />
            </div>

            <div style={{ gridColumn: '1 / -1', display: 'flex', gap: '10px', marginTop: '10px' }}>
              <button
                type="submit"
                disabled={bookingLoading}
                style={{
                  padding: '12px 24px',
                  borderRadius: '12px',
                  border: 'none',
                  background: 'linear-gradient(135deg, #6366F1 0%, #3B82F6 100%)',
                  color: 'white',
                  fontWeight: 700,
                  fontSize: '0.92rem',
                  cursor: 'pointer'
                }}
              >
                {bookingLoading ? 'Scheduling...' : 'Confirm Session Booking'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Sessions Feed */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '60px 20px', color: '#94A3B8' }}>
          Loading your calendar sessions...
        </div>
      ) : sessions.length === 0 ? (
        <div style={{
          textAlign: 'center',
          padding: '60px 20px',
          background: '#FFFFFF',
          borderRadius: '24px',
          border: '1px solid #E2E8F0'
        }}>
          <CalendarIcon size={36} color="#94A3B8" style={{ margin: '0 auto 12px' }} />
          <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: '#0F172A' }}>No scheduled sessions yet</h3>
          <p style={{ color: '#64748B', fontSize: '0.9rem', marginTop: '6px' }}>
            Accept a swap proposal in the Chat tab or click <strong>Book New Session</strong> above!
          </p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {sessions.map((sess) => {
            const isTeacher = sess.teacher_id === currentUser?.id;
            const partnerName = isTeacher ? sess.learner_name : sess.teacher_name;
            const dateStr = new Date(sess.scheduled_start).toLocaleString('en-US', {
              weekday: 'short',
              month: 'short',
              day: 'numeric',
              hour: '2-digit',
              minute: '2-digit'
            });

            return (
              <div
                key={sess.id}
                style={{
                  background: '#FFFFFF',
                  borderRadius: '20px',
                  border: '1px solid #E2E8F0',
                  padding: '24px',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.03)',
                  display: 'flex',
                  flexWrap: 'wrap',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: '20px'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '18px' }}>
                  <div style={{
                    width: '54px',
                    height: '54px',
                    borderRadius: '16px',
                    background: isTeacher ? '#FAF5FF' : '#F0FDF4',
                    border: isTeacher ? '1px solid #DDD6FE' : '1px solid #BBF7D0',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: isTeacher ? '#7C3AED' : '#15803D'
                  }}>
                    <BookOpen size={24} />
                  </div>

                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#0F172A' }}>
                        {sess.skill_name}
                      </h3>
                      <span style={{
                        fontSize: '0.75rem',
                        fontWeight: 700,
                        padding: '3px 8px',
                        borderRadius: '6px',
                        background: isTeacher ? '#EDE9FE' : '#DCFCE7',
                        color: isTeacher ? '#7C3AED' : '#15803D'
                      }}>
                        {isTeacher ? 'You are Teaching' : 'You are Learning'}
                      </span>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '14px', fontSize: '0.84rem', color: '#64748B', marginTop: '6px' }}>
                      <span>Peer: <strong>{partnerName}</strong></span>
                      <span>·</span>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <Clock size={14} /> {sess.duration_minutes} mins
                      </span>
                      <span>·</span>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <CalendarIcon size={14} /> {dateStr}
                      </span>
                    </div>

                    {sess.notes && (
                      <div style={{ fontSize: '0.82rem', color: '#475569', marginTop: '6px' }}>
                        Objective: {sess.notes}
                      </div>
                    )}
                  </div>
                </div>

                {/* Right Action Buttons */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <a
                    href={sess.meeting_url}
                    target="_blank"
                    rel="noreferrer"
                    style={{
                      padding: '10px 18px',
                      borderRadius: '12px',
                      border: 'none',
                      background: '#10B981',
                      color: 'white',
                      fontWeight: 700,
                      fontSize: '0.86rem',
                      textDecoration: 'none',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      boxShadow: '0 4px 12px rgba(16, 185, 129, 0.25)'
                    }}
                  >
                    <Video size={16} /> Join Video Call
                  </a>

                  <button
                    onClick={() => onOpenRatingModal(sess)}
                    style={{
                      padding: '10px 16px',
                      borderRadius: '12px',
                      border: '1px solid #F59E0B',
                      background: '#FFFBEB',
                      color: '#B45309',
                      fontWeight: 700,
                      fontSize: '0.86rem',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px'
                    }}
                  >
                    <Star size={15} fill="#F59E0B" /> Endorse & Rate Mentor
                  </button>
                </div>

              </div>
            );
          })}
        </div>
      )}

    </div>
  );
}
