import React, { useState, useEffect } from 'react';
import { 
  Sparkles, 
  ArrowRightLeft, 
  Star, 
  Clock, 
  Send, 
  User, 
  Filter, 
  Search, 
  CheckCircle2, 
  GraduationCap,
  MessageSquare
} from 'lucide-react';
import { fetchMatches } from '../api';

export default function MatchScreen({ currentUser, onSelectSwapCandidate, onViewProfile, onOpenChat }) {
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterPerfectOnly, setFilterPerfectOnly] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    loadMatches();
  }, [currentUser]);

  const loadMatches = async () => {
    if (!currentUser?.id) return;
    setLoading(true);
    try {
      const data = await fetchMatches(currentUser.id);
      setMatches(data);
    } catch (err) {
      console.error('Failed to load matches:', err);
    } finally {
      setLoading(false);
    }
  };

  const filteredMatches = matches.filter(m => {
    if (filterPerfectOnly && !m.is_perfect_match) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      const inName = m.candidate.full_name.toLowerCase().includes(q);
      const inUniv = m.candidate.university.toLowerCase().includes(q);
      const inTeach = m.candidate.skills_to_teach.some(s => s.name.toLowerCase().includes(q));
      const inLearn = m.candidate.skills_to_learn.some(s => s.name.toLowerCase().includes(q));
      if (!inName && !inUniv && !inTeach && !inLearn) return false;
    }
    return true;
  });

  return (
    <div style={{ maxWidth: '1240px', margin: '0 auto', padding: '36px 20px' }}>
      
      {/* Header Banner */}
      <div style={{
        background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.08) 0%, rgba(6, 182, 212, 0.08) 100%)',
        border: '1px solid #E2E8F0',
        borderRadius: '28px',
        padding: '36px',
        marginBottom: '32px',
        display: 'flex',
        flexWrap: 'wrap',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '24px'
      }}>
        <div style={{ maxWidth: '640px' }}>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            padding: '6px 14px',
            borderRadius: '9999px',
            background: '#FFFFFF',
            border: '1px solid #E2E8F0',
            fontSize: '0.82rem',
            fontWeight: 700,
            color: '#4F46E5',
            marginBottom: '14px',
            boxShadow: '0 2px 6px rgba(0,0,0,0.03)'
          }}>
            <Sparkles size={16} />
            <span>AI Bi-Directional Match Engine</span>
          </div>

          <h1 style={{ fontSize: '2.3rem', fontWeight: 800, color: '#0F172A', letterSpacing: '-0.03em', lineHeight: 1.15 }}>
            Find Your Perfect <span className="gradient-text">Skill Exchange Partner</span>
          </h1>

          <p style={{ fontSize: '1rem', color: '#64748B', marginTop: '10px', lineHeight: 1.6 }}>
            Our algorithm pairs you with students who want what you can teach and can teach what you want to learn. No fees, just mutual growth.
          </p>
        </div>

        {/* Quick Match Counter Card */}
        <div style={{
          background: '#FFFFFF',
          borderRadius: '20px',
          padding: '24px 30px',
          border: '1px solid #E2E8F0',
          boxShadow: '0 10px 25px -5px rgba(0,0,0,0.05)',
          textAlign: 'center',
          minWidth: '200px'
        }}>
          <div style={{ fontSize: '2.4rem', fontWeight: 800, color: '#4F46E5', lineHeight: 1 }}>
            {matches.filter(m => m.is_perfect_match).length}
          </div>
          <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#0F172A', marginTop: '4px' }}>
            Perfect 2-Way Matches
          </div>
          <div style={{ fontSize: '0.74rem', color: '#64748B', marginTop: '2px' }}>
            Ready for instant barter
          </div>
        </div>
      </div>

      {/* Filter and Search Controls */}
      <div style={{
        display: 'flex',
        flexWrap: 'wrap',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '16px',
        marginBottom: '28px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
          {/* Perfect Match Toggle Pill */}
          <button
            onClick={() => setFilterPerfectOnly(!filterPerfectOnly)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '10px 18px',
              borderRadius: '9999px',
              border: filterPerfectOnly ? '1px solid #6366F1' : '1px solid #E2E8F0',
              background: filterPerfectOnly ? '#EEF2FF' : '#FFFFFF',
              color: filterPerfectOnly ? '#4F46E5' : '#475569',
              fontSize: '0.88rem',
              fontWeight: 700,
              cursor: 'pointer',
              transition: 'all 0.2s'
            }}
          >
            <Sparkles size={16} />
            <span>⚡ Perfect 2-Way Matches Only</span>
            {filterPerfectOnly && <CheckCircle2 size={16} color="#6366F1" />}
          </button>

          <span style={{ fontSize: '0.85rem', color: '#64748B' }}>
            Showing {filteredMatches.length} available peer matches
          </span>
        </div>

        {/* Search */}
        <div style={{ position: 'relative', width: '280px' }}>
          <Search size={16} color="#94A3B8" style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)' }} />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by skill, name, university..."
            style={{
              width: '100%',
              padding: '10px 14px 10px 38px',
              borderRadius: '12px',
              border: '1px solid #CBD5E1',
              fontSize: '0.88rem',
              outline: 'none',
              background: '#FFFFFF'
            }}
          />
        </div>
      </div>

      {/* Matches Grid */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '60px 20px', color: '#64748B' }}>
          <div className="animate-spin" style={{ display: 'inline-block', marginBottom: '14px' }}>
            <Sparkles size={32} color="#6366F1" />
          </div>
          <div>Calculating peer skill compatibility scores...</div>
        </div>
      ) : filteredMatches.length === 0 ? (
        <div style={{
          textAlign: 'center',
          padding: '60px 20px',
          background: '#FFFFFF',
          borderRadius: '24px',
          border: '1px solid #E2E8F0'
        }}>
          <ArrowRightLeft size={36} color="#94A3B8" style={{ margin: '0 auto 12px' }} />
          <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: '#0F172A' }}>No matching peers found</h3>
          <p style={{ color: '#64748B', fontSize: '0.9rem', marginTop: '6px' }}>
            Try updating your Skill Matrix or toggle off the filter.
          </p>
        </div>
      ) : (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))',
          gap: '24px'
        }}>
          {filteredMatches.map((item) => {
            const student = item.candidate;
            const isPerfect = item.is_perfect_match;

            return (
              <div
                key={student.id}
                style={{
                  background: '#FFFFFF',
                  borderRadius: '24px',
                  border: isPerfect ? '2px solid #818CF8' : '1px solid #E2E8F0',
                  boxShadow: isPerfect 
                    ? '0 20px 40px -15px rgba(99, 102, 241, 0.15), 0 0 1px 1px rgba(99, 102, 241, 0.2)' 
                    : '0 10px 30px -10px rgba(0, 0, 0, 0.05)',
                  padding: '24px',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  position: 'relative',
                  transition: 'all 0.2s'
                }}
              >
                {/* Perfect Match Ribbon */}
                {isPerfect && (
                  <div style={{
                    position: 'absolute',
                    top: '-12px',
                    right: '24px',
                    background: 'linear-gradient(135deg, #6366F1 0%, #3B82F6 100%)',
                    color: '#FFFFFF',
                    padding: '4px 14px',
                    borderRadius: '9999px',
                    fontSize: '0.75rem',
                    fontWeight: 800,
                    letterSpacing: '0.04em',
                    boxShadow: '0 4px 12px rgba(99, 102, 241, 0.35)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px'
                  }}>
                    <Sparkles size={13} />
                    <span>PERFECT 2-WAY MATCH</span>
                  </div>
                )}

                <div>
                  {/* Top Row: Avatar + Name + Compatibility Score */}
                  <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '14px', marginBottom: '16px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                      <img
                        src={student.avatar_url}
                        alt={student.full_name}
                        style={{
                          width: '56px',
                          height: '56px',
                          borderRadius: '18px',
                          objectFit: 'cover',
                          border: '2px solid #F1F5F9'
                        }}
                      />
                      <div>
                        <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#0F172A' }}>
                          {student.full_name}
                        </h3>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.8rem', color: '#64748B', marginTop: '2px' }}>
                          <GraduationCap size={14} color="#6366F1" />
                          <span>{student.university}</span>
                        </div>
                      </div>
                    </div>

                    {/* Compatibility Score Circle */}
                    <div style={{
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                      width: '56px',
                      height: '56px',
                      borderRadius: '16px',
                      background: isPerfect ? '#EEF2FF' : '#F8FAFC',
                      border: isPerfect ? '1px solid #C7D2FE' : '1px solid #E2E8F0',
                      color: isPerfect ? '#4F46E5' : '#475569'
                    }}>
                      <div style={{ fontSize: '1.05rem', fontWeight: 800, lineHeight: 1 }}>
                        {item.match_score}%
                      </div>
                      <div style={{ fontSize: '0.62rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.02em', marginTop: '2px' }}>
                        Match
                      </div>
                    </div>
                  </div>

                  {/* Rating and Hours Summary */}
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '14px',
                    padding: '8px 14px',
                    background: '#F8FAFC',
                    borderRadius: '12px',
                    marginBottom: '16px',
                    fontSize: '0.82rem'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#D97706', fontWeight: 700 }}>
                      <Star size={15} fill="#F59E0B" color="#F59E0B" />
                      <span>{student.rating_summary?.average_rating?.toFixed(1) || '5.0'}</span>
                      <span style={{ color: '#94A3B8', fontWeight: 500 }}>
                        ({student.rating_summary?.total_reviews || 0} reviews)
                      </span>
                    </div>
                    <div style={{ width: '1px', height: '14px', background: '#E2E8F0' }} />
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#64748B' }}>
                      <Clock size={14} />
                      <span>{student.rating_summary?.hours_taught || 0} hrs taught</span>
                    </div>
                  </div>

                  {/* Match Explanation Banner */}
                  <div style={{
                    background: isPerfect ? '#F5F3FF' : '#F0F9FF',
                    border: isPerfect ? '1px solid #DDD6FE' : '1px solid #BAE6FD',
                    borderRadius: '12px',
                    padding: '10px 14px',
                    marginBottom: '18px',
                    fontSize: '0.83rem',
                    color: isPerfect ? '#6D28D9' : '#0369A1',
                    lineHeight: 1.4,
                    fontWeight: 500
                  }}>
                    {item.explanation}
                  </div>

                  {/* Skills Section */}
                  <div style={{ marginBottom: '16px' }}>
                    <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#7C3AED', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '8px' }}>
                      Can Teach You
                    </div>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                      {student.skills_to_teach.map((s, idx) => (
                        <span key={idx} className="skill-pill pill-teach-purple">
                          {s.name} <span style={{ opacity: 0.65, fontWeight: 500 }}>· {s.proficiency || 'Teach'}</span>
                        </span>
                      ))}
                    </div>
                  </div>

                  <div style={{ marginBottom: '20px' }}>
                    <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#15803D', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '8px' }}>
                      Wants to Learn
                    </div>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                      {student.skills_to_learn.map((s, idx) => (
                        <span key={idx} className="skill-pill pill-learn-mint">
                          {s.name} <span style={{ opacity: 0.65, fontWeight: 500 }}>· Learn</span>
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Bottom Card Actions */}
                <div style={{
                  display: 'flex',
                  gap: '10px',
                  paddingTop: '16px',
                  borderTop: '1px solid #F1F5F9'
                }}>
                  <button
                    onClick={() => onSelectSwapCandidate(student, item)}
                    style={{
                      flex: 1,
                      padding: '11px',
                      borderRadius: '12px',
                      border: 'none',
                      background: 'linear-gradient(135deg, #6366F1 0%, #3B82F6 100%)',
                      color: 'white',
                      fontWeight: 700,
                      fontSize: '0.88rem',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '6px',
                      boxShadow: '0 4px 12px rgba(99, 102, 241, 0.25)'
                    }}
                  >
                    <Send size={15} /> Propose Swap
                  </button>

                  <button
                    onClick={() => onViewProfile(student)}
                    style={{
                      padding: '11px 16px',
                      borderRadius: '12px',
                      border: '1px solid #E2E8F0',
                      background: '#FFFFFF',
                      color: '#475569',
                      fontWeight: 600,
                      fontSize: '0.86rem',
                      cursor: 'pointer'
                    }}
                  >
                    Profile
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
