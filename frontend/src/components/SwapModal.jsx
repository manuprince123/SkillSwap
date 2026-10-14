import React, { useState } from 'react';
import { ArrowRightLeft, X, Send, Sparkles, Clock, CheckCircle } from 'lucide-react';
import confetti from 'canvas-confetti';
import { createSwap } from '../api';

export default function SwapModal({ isOpen, onClose, currentUser, candidate, matchData, onSwapCreated }) {
  if (!isOpen || !candidate) return null;

  const defaultOfferedSkill = matchData?.highlight_skill_teach || currentUser?.skills_to_teach?.[0]?.name || 'General Mentorship';
  const defaultRequestedSkill = matchData?.highlight_skill_learn || candidate?.skills_to_teach?.[0]?.name || 'Peer Learning';

  const [offeredSkill, setOfferedSkill] = useState(defaultOfferedSkill);
  const [offeredHours, setOfferedHours] = useState(2);
  const [requestedSkill, setRequestedSkill] = useState(defaultRequestedSkill);
  const [requestedHours, setRequestedHours] = useState(2);
  const [note, setNote] = useState(
    `Hey ${candidate.full_name?.split(' ')[0]}! I saw your profile and would love to exchange skills. I can teach you ${defaultOfferedSkill} in exchange for some sessions on ${defaultRequestedSkill}!`
  );
  const [sending, setSending] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSending(true);

    try {
      const payload = {
        receiver_id: candidate.id,
        skill_offered: { name: offeredSkill, hours: parseInt(offeredHours) },
        skill_requested: { name: requestedSkill, hours: parseInt(requestedHours) },
        note: note
      };

      const result = await createSwap(currentUser.id, payload);

      // Trigger Confetti Celebration!
      try {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 }
        });
      } catch (err) {}

      onSwapCreated(result);
      onClose();
    } catch (err) {
      alert('Failed to send swap proposal: ' + err.message);
    } finally {
      setSending(false);
    }
  };

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      backgroundColor: 'rgba(15, 23, 42, 0.65)',
      backdropFilter: 'blur(5px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 110,
      padding: '20px'
    }}>
      <div style={{
        background: '#FFFFFF',
        borderRadius: '28px',
        maxWidth: '580px',
        width: '100%',
        padding: '36px',
        boxShadow: '0 25px 60px -15px rgba(0, 0, 0, 0.25)',
        position: 'relative',
        animation: 'fadeIn 0.2s ease'
      }}>
        {/* Close Button */}
        <button
          onClick={onClose}
          style={{
            position: 'absolute',
            top: '24px',
            right: '24px',
            background: '#F1F5F9',
            border: 'none',
            borderRadius: '50%',
            width: '36px',
            height: '36px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            color: '#64748B'
          }}
        >
          <X size={18} />
        </button>

        {/* Modal Header with Candidate Info */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '24px' }}>
          <img
            src={candidate.avatar_url}
            alt={candidate.full_name}
            style={{ width: '60px', height: '60px', borderRadius: '20px', objectFit: 'cover' }}
          />
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <h2 style={{ fontSize: '1.35rem', fontWeight: 800, color: '#0F172A' }}>
                Propose Skill Exchange
              </h2>
            </div>
            <p style={{ fontSize: '0.88rem', color: '#64748B' }}>
              Exchanging with <strong>{candidate.full_name}</strong> ({candidate.university})
            </p>
          </div>
        </div>

        {/* The Barter Matrix Input Box */}
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          
          <div style={{
            background: '#F8FAFC',
            borderRadius: '20px',
            border: '1px solid #E2E8F0',
            padding: '20px',
            display: 'flex',
            flexDirection: 'column',
            gap: '16px'
          }}>
            {/* What you will teach */}
            <div>
              <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: '#7C3AED', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '8px' }}>
                1. What You Will Teach ({currentUser.full_name.split(' ')[0]})
              </label>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 110px', gap: '10px' }}>
                <select
                  value={offeredSkill}
                  onChange={(e) => setOfferedSkill(e.target.value)}
                  style={{
                    padding: '11px 14px',
                    borderRadius: '12px',
                    border: '1px solid #DDD6FE',
                    background: '#FAF5FF',
                    color: '#7C3AED',
                    fontWeight: 700,
                    fontSize: '0.9rem',
                    outline: 'none'
                  }}
                >
                  {currentUser.skills_to_teach.map((s, idx) => (
                    <option key={idx} value={s.name}>{s.name} ({s.proficiency || 'Intermediate'})</option>
                  ))}
                  <option value="General Mentorship">General Mentorship</option>
                </select>

                <select
                  value={offeredHours}
                  onChange={(e) => setOfferedHours(e.target.value)}
                  style={{
                    padding: '11px 14px',
                    borderRadius: '12px',
                    border: '1px solid #DDD6FE',
                    background: '#FAF5FF',
                    color: '#7C3AED',
                    fontWeight: 700,
                    fontSize: '0.9rem',
                    outline: 'none'
                  }}
                >
                  <option value={1}>1 Hour</option>
                  <option value={2}>2 Hours</option>
                  <option value={3}>3 Hours</option>
                  <option value={4}>4 Hours</option>
                </select>
              </div>
            </div>

            {/* Exchange Divider */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
              <div style={{ position: 'absolute', width: '100%', height: '1px', background: '#E2E8F0' }} />
              <div style={{
                position: 'relative',
                background: '#FFFFFF',
                border: '1px solid #E2E8F0',
                borderRadius: '50%',
                width: '32px',
                height: '32px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#6366F1'
              }}>
                <ArrowRightLeft size={16} />
              </div>
            </div>

            {/* What you want in return */}
            <div>
              <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: '#15803D', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '8px' }}>
                2. What You Want in Exchange ({candidate.full_name.split(' ')[0]})
              </label>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 110px', gap: '10px' }}>
                <select
                  value={requestedSkill}
                  onChange={(e) => setRequestedSkill(e.target.value)}
                  style={{
                    padding: '11px 14px',
                    borderRadius: '12px',
                    border: '1px solid #BBF7D0',
                    background: '#F0FDF4',
                    color: '#15803D',
                    fontWeight: 700,
                    fontSize: '0.9rem',
                    outline: 'none'
                  }}
                >
                  {candidate.skills_to_teach.map((s, idx) => (
                    <option key={idx} value={s.name}>{s.name} ({s.proficiency || 'Intermediate'})</option>
                  ))}
                  <option value="Peer Mentorship">Peer Mentorship</option>
                </select>

                <select
                  value={requestedHours}
                  onChange={(e) => setRequestedHours(e.target.value)}
                  style={{
                    padding: '11px 14px',
                    borderRadius: '12px',
                    border: '1px solid #BBF7D0',
                    background: '#F0FDF4',
                    color: '#15803D',
                    fontWeight: 700,
                    fontSize: '0.9rem',
                    outline: 'none'
                  }}
                >
                  <option value={1}>1 Hour</option>
                  <option value={2}>2 Hours</option>
                  <option value={3}>3 Hours</option>
                  <option value={4}>4 Hours</option>
                </select>
              </div>
            </div>

          </div>

          {/* Proposal Intro Note */}
          <div>
            <label style={{ display: 'block', fontSize: '0.86rem', fontWeight: 600, color: '#334155', marginBottom: '8px' }}>
              Personal Intro & Learning Goals
            </label>
            <textarea
              rows={3}
              required
              value={note}
              onChange={(e) => setNote(e.target.value)}
              style={{
                width: '100%',
                padding: '12px 14px',
                borderRadius: '14px',
                border: '1px solid #CBD5E1',
                fontSize: '0.9rem',
                outline: 'none',
                resize: 'none'
              }}
            />
          </div>

          {/* Submit CTA */}
          <div style={{ display: 'flex', gap: '12px' }}>
            <button
              type="submit"
              disabled={sending}
              style={{
                flex: 1,
                padding: '14px',
                borderRadius: '14px',
                border: 'none',
                background: 'linear-gradient(135deg, #6366F1 0%, #3B82F6 100%)',
                color: 'white',
                fontWeight: 700,
                fontSize: '0.96rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                boxShadow: '0 8px 20px rgba(99, 102, 241, 0.35)'
              }}
            >
              <Send size={16} />
              {sending ? 'Sending Proposal...' : 'Send Swap Proposal'}
            </button>

            <button
              type="button"
              onClick={onClose}
              style={{
                padding: '14px 20px',
                borderRadius: '14px',
                border: '1px solid #E2E8F0',
                background: '#FFFFFF',
                color: '#64748B',
                fontWeight: 600,
                cursor: 'pointer'
              }}
            >
              Cancel
            </button>
          </div>

        </form>
      </div>
    </div>
  );
}
