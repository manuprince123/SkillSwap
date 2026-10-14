import React, { useState, useEffect } from 'react';
import { 
  User, 
  GraduationCap, 
  Star, 
  Clock, 
  CheckCircle2, 
  ShieldCheck, 
  Edit3, 
  BookOpen, 
  Sparkles,
  Quote
} from 'lucide-react';
import { fetchReviews } from '../api';

export default function ProfileScreen({ currentUser, profileUser = null, onEditSkills, onProposeSwap }) {
  const user = profileUser || currentUser;
  const isMe = !profileUser || profileUser.id === currentUser?.id;

  const [reviews, setReviews] = useState([]);
  const [loadingReviews, setLoadingReviews] = useState(true);

  useEffect(() => {
    if (user?.id) {
      loadReviews(user.id);
    }
  }, [user]);

  const loadReviews = async (userId) => {
    setLoadingReviews(true);
    try {
      const data = await fetchReviews(userId);
      setReviews(data);
    } catch (err) {
      console.error('Failed to load reviews:', err);
    } finally {
      setLoadingReviews(false);
    }
  };

  return (
    <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '36px 20px' }}>
      
      {/* Profile Header Card */}
      <div style={{
        background: '#FFFFFF',
        borderRadius: '28px',
        border: '1px solid #E2E8F0',
        boxShadow: '0 20px 40px -15px rgba(0, 0, 0, 0.05)',
        padding: '36px',
        marginBottom: '32px',
        position: 'relative'
      }}>
        <div style={{
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '24px'
        }}>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
            <img
              src={user?.avatar_url}
              alt={user?.full_name}
              style={{
                width: '90px',
                height: '90px',
                borderRadius: '26px',
                objectFit: 'cover',
                border: '3px solid #EEF2FF',
                boxShadow: '0 8px 20px rgba(99, 102, 241, 0.15)'
              }}
            />
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <h1 style={{ fontSize: '1.8rem', fontWeight: 800, color: '#0F172A', letterSpacing: '-0.02em' }}>
                  {user?.full_name}
                </h1>
                <span style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '4px',
                  background: '#F0FDF4',
                  color: '#16A34A',
                  border: '1px solid #BBF7D0',
                  padding: '3px 10px',
                  borderRadius: '9999px',
                  fontSize: '0.74rem',
                  fontWeight: 700
                }}>
                  <ShieldCheck size={14} /> Verified Student
                </span>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.92rem', color: '#64748B', marginTop: '4px' }}>
                <GraduationCap size={16} color="#6366F1" />
                <span>{user?.university}</span>
              </div>

              <p style={{ fontSize: '0.95rem', color: '#475569', marginTop: '10px', maxWidth: '600px', lineHeight: 1.5 }}>
                {user?.bio || 'Passionate student eager to learn and share skills across campus.'}
              </p>
            </div>
          </div>

          {/* Action on Header */}
          <div>
            {isMe ? (
              <button
                onClick={onEditSkills}
                style={{
                  padding: '12px 22px',
                  borderRadius: '14px',
                  border: '1px solid #CBD5E1',
                  background: '#F8FAFC',
                  color: '#0F172A',
                  fontWeight: 700,
                  fontSize: '0.9rem',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}
              >
                <Edit3 size={16} /> Edit My Skill Matrix
              </button>
            ) : (
              <button
                onClick={() => onProposeSwap(user)}
                style={{
                  padding: '12px 24px',
                  borderRadius: '14px',
                  border: 'none',
                  background: 'linear-gradient(135deg, #6366F1 0%, #3B82F6 100%)',
                  color: 'white',
                  fontWeight: 700,
                  fontSize: '0.92rem',
                  cursor: 'pointer',
                  boxShadow: '0 8px 20px rgba(99, 102, 241, 0.3)'
                }}
              >
                Propose Swap with {user?.full_name?.split(' ')[0]}
              </button>
            )}
          </div>

        </div>

        {/* Stats Row */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
          gap: '16px',
          marginTop: '32px',
          paddingTop: '24px',
          borderTop: '1px solid #F1F5F9'
        }}>
          <div style={{ padding: '16px', borderRadius: '16px', background: '#F8FAFC', border: '1px solid #E2E8F0' }}>
            <div style={{ fontSize: '0.78rem', color: '#64748B', fontWeight: 600, textTransform: 'uppercase' }}>
              Student Rating
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '6px' }}>
              <Star size={20} fill="#F59E0B" color="#F59E0B" />
              <span style={{ fontSize: '1.5rem', fontWeight: 800, color: '#0F172A' }}>
                {user?.rating_summary?.average_rating?.toFixed(1) || '5.0'}
              </span>
              <span style={{ fontSize: '0.85rem', color: '#94A3B8' }}>
                ({user?.rating_summary?.total_reviews || 0} reviews)
              </span>
            </div>
          </div>

          <div style={{ padding: '16px', borderRadius: '16px', background: '#F8FAFC', border: '1px solid #E2E8F0' }}>
            <div style={{ fontSize: '0.78rem', color: '#64748B', fontWeight: 600, textTransform: 'uppercase' }}>
              Hours Exchanged
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '6px' }}>
              <Clock size={20} color="#6366F1" />
              <span style={{ fontSize: '1.5rem', fontWeight: 800, color: '#0F172A' }}>
                {user?.rating_summary?.hours_taught || 0}
              </span>
              <span style={{ fontSize: '0.85rem', color: '#94A3B8' }}>hours taught</span>
            </div>
          </div>

          <div style={{ padding: '16px', borderRadius: '16px', background: '#F8FAFC', border: '1px solid #E2E8F0' }}>
            <div style={{ fontSize: '0.78rem', color: '#64748B', fontWeight: 600, textTransform: 'uppercase' }}>
              Active Skills
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '6px' }}>
              <BookOpen size={20} color="#10B981" />
              <span style={{ fontSize: '1.5rem', fontWeight: 800, color: '#0F172A' }}>
                {(user?.skills_to_teach?.length || 0) + (user?.skills_to_learn?.length || 0)}
              </span>
              <span style={{ fontSize: '0.85rem', color: '#94A3B8' }}>in matrix</span>
            </div>
          </div>
        </div>
      </div>

      {/* Skills Showcase Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))',
        gap: '24px',
        marginBottom: '36px'
      }}>
        {/* Teaching Skills */}
        <div style={{
          background: '#FFFFFF',
          borderRadius: '24px',
          border: '1px solid #DDD6FE',
          padding: '28px'
        }}>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0F172A', marginBottom: '16px' }}>
            Skills Offered ({user?.full_name?.split(' ')[0]})
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {user?.skills_to_teach?.map((s, idx) => (
              <div
                key={idx}
                style={{
                  padding: '14px 18px',
                  borderRadius: '16px',
                  background: '#FAF5FF',
                  border: '1px solid #DDD6FE'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <span style={{ fontWeight: 700, color: '#0F172A', fontSize: '0.98rem' }}>
                    {s.name}
                  </span>
                  <span style={{
                    fontSize: '0.74rem',
                    fontWeight: 700,
                    background: '#EDE9FE',
                    color: '#7C3AED',
                    padding: '3px 8px',
                    borderRadius: '6px'
                  }}>
                    {s.proficiency || 'Intermediate'}
                  </span>
                </div>
                {s.experience_summary && (
                  <div style={{ fontSize: '0.82rem', color: '#64748B', marginTop: '4px' }}>
                    {s.experience_summary}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Learning Targets */}
        <div style={{
          background: '#FFFFFF',
          borderRadius: '24px',
          border: '1px solid #BBF7D0',
          padding: '28px'
        }}>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0F172A', marginBottom: '16px' }}>
            Skills Wanted in Exchange
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {user?.skills_to_learn?.map((s, idx) => (
              <div
                key={idx}
                style={{
                  padding: '14px 18px',
                  borderRadius: '16px',
                  background: '#F0FDF4',
                  border: '1px solid #BBF7D0'
                }}
              >
                <div style={{ fontWeight: 700, color: '#0F172A', fontSize: '0.98rem' }}>
                  {s.name}
                </div>
                {s.target_goal && (
                  <div style={{ fontSize: '0.82rem', color: '#64748B', marginTop: '4px' }}>
                    {s.target_goal}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Reviews & Endorsements Section */}
      <div style={{
        background: '#FFFFFF',
        borderRadius: '24px',
        border: '1px solid #E2E8F0',
        padding: '32px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
          <Sparkles size={22} color="#F59E0B" />
          <h2 style={{ fontSize: '1.35rem', fontWeight: 800, color: '#0F172A' }}>
            Peer Endorsements & Student Reviews ({reviews.length})
          </h2>
        </div>

        {loadingReviews ? (
          <div style={{ color: '#94A3B8' }}>Loading endorsements...</div>
        ) : reviews.length === 0 ? (
          <div style={{ color: '#64748B', fontSize: '0.9rem' }}>
            No reviews yet. Complete your first swap session to receive endorsements!
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {reviews.map((r) => (
              <div
                key={r.id}
                style={{
                  padding: '20px',
                  borderRadius: '18px',
                  background: '#F8FAFC',
                  border: '1px solid #E2E8F0'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <img
                      src={r.reviewer_avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80'}
                      alt={r.reviewer_name}
                      style={{ width: '40px', height: '40px', borderRadius: '50%', objectFit: 'cover' }}
                    />
                    <div>
                      <div style={{ fontWeight: 700, fontSize: '0.92rem', color: '#0F172A' }}>
                        {r.reviewer_name}
                      </div>
                      <div style={{ fontSize: '0.78rem', color: '#64748B' }}>
                        Learned <strong>{r.skill_taught}</strong>
                      </div>
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    {[...Array(r.rating)].map((_, i) => (
                      <Star key={i} size={15} fill="#F59E0B" color="#F59E0B" />
                    ))}
                  </div>
                </div>

                {/* Tags */}
                {r.tags?.length > 0 && (
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '10px' }}>
                    {r.tags.map((tag, i) => (
                      <span
                        key={i}
                        style={{
                          fontSize: '0.75rem',
                          fontWeight: 600,
                          background: '#EEF2FF',
                          color: '#4F46E5',
                          padding: '3px 10px',
                          borderRadius: '9999px',
                          border: '1px solid #C7D2FE'
                        }}
                      >
                        ✓ {tag}
                      </span>
                    ))}
                  </div>
                )}

                <div style={{ fontSize: '0.9rem', color: '#334155', lineHeight: 1.5, fontStyle: 'italic' }}>
                  "{r.comment}"
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
}
