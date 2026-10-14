import React, { useState } from 'react';
import { Star, X, Check, Sparkles } from 'lucide-react';
import confetti from 'canvas-confetti';
import { createReview } from '../api';

const BADGE_OPTIONS = [
  'Super Clear',
  'Patient Explainer',
  'Practical Exercises',
  'Design System Guru',
  'Fast Debugger',
  'Punctual & Friendly',
  'Inspiring Mentor'
];

export default function RatingModal({ isOpen, onClose, session, currentUser, onReviewSubmitted }) {
  if (!isOpen || !session) return null;

  const isTeacher = session.teacher_id === currentUser.id;
  const revieweeId = isTeacher ? session.learner_id : session.teacher_id;
  const revieweeName = isTeacher ? session.learner_name : session.teacher_name;

  const [rating, setRating] = useState(5);
  const [hoverRating, setHoverRating] = useState(0);
  const [selectedTags, setSelectedTags] = useState(['Super Clear', 'Patient Explainer']);
  const [comment, setComment] = useState('Great interactive session! We wrote clean code and solved tricky edge cases together.');
  const [submitting, setSubmitting] = useState(false);

  const toggleTag = (tag) => {
    if (selectedTags.includes(tag)) {
      setSelectedTags(selectedTags.filter(t => t !== tag));
    } else {
      setSelectedTags([...selectedTags, tag]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const payload = {
        session_id: session.id,
        reviewee_id: revieweeId,
        skill_taught: session.skill_name,
        rating: rating,
        tags: selectedTags,
        comment: comment
      };

      const res = await createReview(currentUser.id, payload);

      // Trigger Confetti!
      try {
        confetti({
          particleCount: 70,
          spread: 60,
          origin: { y: 0.6 }
        });
      } catch (e) {}

      onReviewSubmitted(res);
      onClose();
    } catch (err) {
      alert('Failed to submit review: ' + err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      backgroundColor: 'rgba(15, 23, 42, 0.65)',
      backdropFilter: 'blur(4px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 120,
      padding: '20px'
    }}>
      <div style={{
        background: '#FFFFFF',
        borderRadius: '28px',
        maxWidth: '540px',
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

        <div style={{ textAlign: 'center', marginBottom: '24px' }}>
          <div style={{
            width: '52px',
            height: '52px',
            borderRadius: '16px',
            background: '#FEF3C7',
            color: '#D97706',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: '12px'
          }}>
            <Star size={26} fill="#F59E0B" color="#F59E0B" />
          </div>
          <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#0F172A' }}>
            Rate Your Session with {revieweeName}
          </h2>
          <p style={{ fontSize: '0.88rem', color: '#64748B', marginTop: '4px' }}>
            Skill: <strong>{session.skill_name}</strong> · Endorse badges to build their student reputation.
          </p>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          
          {/* Interactive Star Rating */}
          <div style={{ display: 'flex', justifyContent: 'center', gap: '10px' }}>
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                type="button"
                key={star}
                onClick={() => setRating(star)}
                onMouseEnter={() => setHoverRating(star)}
                onMouseLeave={() => setHoverRating(0)}
                style={{
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  padding: '4px',
                  transition: 'transform 0.1s'
                }}
              >
                <Star
                  size={36}
                  fill={(hoverRating || rating) >= star ? '#F59E0B' : 'none'}
                  color={(hoverRating || rating) >= star ? '#F59E0B' : '#CBD5E1'}
                />
              </button>
            ))}
          </div>

          {/* Endorsement Badges */}
          <div>
            <label style={{ display: 'block', fontSize: '0.84rem', fontWeight: 700, color: '#334155', marginBottom: '8px' }}>
              Select Endorsement Badges
            </label>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
              {BADGE_OPTIONS.map((badge) => {
                const isSelected = selectedTags.includes(badge);
                return (
                  <button
                    type="button"
                    key={badge}
                    onClick={() => toggleTag(badge)}
                    style={{
                      padding: '7px 14px',
                      borderRadius: '9999px',
                      border: isSelected ? '1px solid #6366F1' : '1px solid #E2E8F0',
                      background: isSelected ? '#EEF2FF' : '#F8FAFC',
                      color: isSelected ? '#4F46E5' : '#475569',
                      fontSize: '0.82rem',
                      fontWeight: 600,
                      cursor: 'pointer',
                      transition: 'all 0.15s'
                    }}
                  >
                    {isSelected && '✓ '}
                    {badge}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Written Feedback */}
          <div>
            <label style={{ display: 'block', fontSize: '0.84rem', fontWeight: 700, color: '#334155', marginBottom: '8px' }}>
              Written Feedback & Testimonial
            </label>
            <textarea
              rows={3}
              required
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="What made this student a great mentor or partner?"
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

          {/* Submit */}
          <div style={{ display: 'flex', gap: '12px' }}>
            <button
              type="submit"
              disabled={submitting}
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
              <Sparkles size={16} />
              {submitting ? 'Submitting...' : 'Post Rating & Endorsement'}
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
