import React, { useState } from 'react';
import { 
  ArrowRightLeft, 
  Mail, 
  Lock, 
  Eye, 
  EyeOff, 
  ArrowRight, 
  Users, 
  Star, 
  Sparkles,
  GraduationCap
} from 'lucide-react';
import heroIllustration from '../assets/hero_illustration.png';
import { loginUser, registerUser } from '../api';

export default function OnboardingAuth({ onLoginSuccess }) {
  const [isSignUp, setIsSignUp] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  
  // Form State
  const [email, setEmail] = useState('sarah.chen@campus.edu');
  const [password, setPassword] = useState('secret123');
  const [fullName, setFullName] = useState('Sarah Chen');
  const [university, setUniversity] = useState('UC Berkeley');
  const [teachSkill, setTeachSkill] = useState('Python');
  const [learnSkill, setLearnSkill] = useState('UI/UX');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMessage('');

    try {
      if (isSignUp) {
        // Register API
        const payload = {
          email,
          password,
          full_name: fullName,
          university,
          skills_to_teach: [{ name: teachSkill, category: 'General', proficiency: 'Intermediate' }],
          skills_to_learn: [{ name: learnSkill, category: 'General', target_goal: 'Skill exchange' }]
        };
        const data = await registerUser(payload);
        onLoginSuccess(data.user);
      } else {
        // Login API
        const data = await loginUser(email, password);
        onLoginSuccess(data.user);
      }
    } catch (err) {
      setErrorMessage(err.message || 'Something went wrong. Please check your inputs.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDemoLogin = async (userEmail, userPass, userName) => {
    setEmail(userEmail);
    setPassword(userPass);
    setIsLoading(true);
    try {
      const data = await loginUser(userEmail, userPass);
      onLoginSuccess(data.user);
    } catch (err) {
      setErrorMessage('Could not log in as demo student.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'radial-gradient(circle at 10% 20%, #F1F5F9 0%, #FFFFFF 90%)',
      padding: '30px 20px',
      position: 'relative',
      overflow: 'hidden'
    }}>
      {/* Background Soft Glows */}
      <div style={{
        position: 'absolute',
        top: '-10%',
        left: '5%',
        width: '500px',
        height: '500px',
        borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(99, 102, 241, 0.08) 0%, rgba(255, 255, 255, 0) 70%)',
        pointerEvents: 'none'
      }} />
      <div style={{
        position: 'absolute',
        bottom: '-10%',
        right: '10%',
        width: '450px',
        height: '450px',
        borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(6, 182, 212, 0.08) 0%, rgba(255, 255, 255, 0) 70%)',
        pointerEvents: 'none'
      }} />

      {/* Main Container */}
      <div style={{
        maxWidth: '1240px',
        width: '100%',
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))',
        gap: '48px',
        alignItems: 'center',
        zIndex: 10
      }}>
        
        {/* ========================================================= */}
        {/* LEFT COLUMN: HERO BANNER & SKILL PILLS (As per mockup)   */}
        {/* ========================================================= */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
          
          {/* Logo & Headline */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '24px' }}>
              <div style={{
                width: '52px',
                height: '52px',
                borderRadius: '16px',
                background: 'linear-gradient(135deg, #06B6D4 0%, #6366F1 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'white',
                boxShadow: '0 8px 20px rgba(6, 182, 212, 0.35)'
              }}>
                <ArrowRightLeft size={28} strokeWidth={2.8} />
              </div>
              <div style={{ fontSize: '2.5rem', fontWeight: 800, letterSpacing: '-0.03em', lineHeight: 1 }}>
                <span style={{ color: '#0F172A' }}>Skill</span>
                <span style={{
                  background: 'linear-gradient(135deg, #06B6D4 0%, #6366F1 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent'
                }}>Swap</span>
              </div>
            </div>

            <h2 style={{
              fontSize: '1.45rem',
              fontWeight: 700,
              color: '#0F172A',
              marginBottom: '10px'
            }}>
              Share your skills <span style={{ color: '#94A3B8' }}>·</span> Learn new ones <span style={{ color: '#94A3B8' }}>·</span> Grow together
            </h2>

            <p style={{
              fontSize: '1.05rem',
              color: '#64748B',
              lineHeight: 1.6,
              maxWidth: '480px'
            }}>
              Connect with students, exchange skills, and build a better you — together.
            </p>
          </div>

          {/* Collaborative Student Illustration Area */}
          <div style={{
            position: 'relative',
            background: '#FFFFFF',
            borderRadius: '28px',
            padding: '16px',
            border: '1.5px solid #E2E8F0',
            overflow: 'hidden',
            boxShadow: '0 20px 40px -15px rgba(99, 102, 241, 0.12)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'transform 0.25s ease, box-shadow 0.25s ease'
          }}>
            <img 
              src={heroIllustration} 
              alt="SkillSwap Students Collaborating" 
              style={{
                width: '100%',
                height: 'auto',
                borderRadius: '18px',
                display: 'block',
                objectFit: 'contain'
              }}
            />
          </div>

          {/* Bottom 3 Feature Highlights (Real People / Flexible / Build Future) */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: '16px',
            paddingTop: '8px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{
                width: '40px',
                height: '40px',
                borderRadius: '12px',
                background: '#F3E8FF',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#7C3AED'
              }}>
                <Users size={20} />
              </div>
              <div>
                <div style={{ fontSize: '0.9rem', fontWeight: 700, color: '#0F172A' }}>Real People</div>
                <div style={{ fontSize: '0.78rem', color: '#64748B' }}>Real Skills</div>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{
                width: '40px',
                height: '40px',
                borderRadius: '12px',
                background: '#EEF2FF',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#4F46E5'
              }}>
                <ArrowRightLeft size={20} />
              </div>
              <div>
                <div style={{ fontSize: '0.9rem', fontWeight: 700, color: '#0F172A' }}>Flexible</div>
                <div style={{ fontSize: '0.78rem', color: '#64748B' }}>Skill Exchange</div>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{
                width: '40px',
                height: '40px',
                borderRadius: '12px',
                background: '#FEF3C7',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#D97706'
              }}>
                <Star size={20} />
              </div>
              <div>
                <div style={{ fontSize: '0.9rem', fontWeight: 700, color: '#0F172A' }}>Build Your</div>
                <div style={{ fontSize: '0.78rem', color: '#64748B' }}>Future</div>
              </div>
            </div>
          </div>
        </div>

        {/* ========================================================= */}
        {/* RIGHT COLUMN: FLOATING AUTH CARD (As per mockup)          */}
        {/* ========================================================= */}
        <div style={{
          background: '#FFFFFF',
          borderRadius: '28px',
          padding: '44px 38px',
          boxShadow: '0 25px 60px -15px rgba(15, 23, 42, 0.08), 0 0 1px 1px rgba(15, 23, 42, 0.05)',
          border: '1px solid #E2E8F0',
          position: 'relative'
        }}>
          
          <div style={{ textAlign: 'left', marginBottom: '28px' }}>
            <h1 style={{
              fontSize: '2rem',
              fontWeight: 800,
              letterSpacing: '-0.03em',
              marginBottom: '6px'
            }}>
              {isSignUp ? 'Create your ' : 'Welcome to '}
              <span style={{ color: '#0F172A' }}>Skill</span>
              <span style={{
                background: 'linear-gradient(135deg, #06B6D4 0%, #6366F1 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent'
              }}>Swap</span>
            </h1>
            <p style={{ fontSize: '0.95rem', color: '#64748B' }}>
              {isSignUp 
                ? 'Join fellow students and start swapping skills for free.' 
                : 'Log in to continue your skill exchange journey.'}
            </p>
          </div>

          {errorMessage && (
            <div style={{
              background: '#FEF2F2',
              border: '1px solid #FECACA',
              color: '#DC2626',
              padding: '10px 14px',
              borderRadius: '12px',
              fontSize: '0.84rem',
              marginBottom: '20px'
            }}>
              {errorMessage}
            </div>
          )}

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
            
            {/* If Sign Up, ask for Full Name & University */}
            {isSignUp && (
              <>
                <div>
                  <label style={{ display: 'block', fontSize: '0.88rem', fontWeight: 600, color: '#334155', marginBottom: '8px' }}>
                    Full Name
                  </label>
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="e.g. Sarah Chen"
                    style={{
                      width: '100%',
                      padding: '13px 16px',
                      borderRadius: '14px',
                      border: '1px solid #CBD5E1',
                      fontSize: '0.95rem',
                      outline: 'none',
                      transition: 'border 0.2s',
                      backgroundColor: '#FFFFFF'
                    }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.88rem', fontWeight: 600, color: '#334155', marginBottom: '8px' }}>
                    University / College
                  </label>
                  <div style={{ position: 'relative' }}>
                    <GraduationCap size={18} color="#94A3B8" style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)' }} />
                    <input
                      type="text"
                      required
                      value={university}
                      onChange={(e) => setUniversity(e.target.value)}
                      placeholder="e.g. UC Berkeley"
                      style={{
                        width: '100%',
                        padding: '13px 16px 13px 44px',
                        borderRadius: '14px',
                        border: '1px solid #CBD5E1',
                        fontSize: '0.95rem',
                        outline: 'none',
                        backgroundColor: '#FFFFFF'
                      }}
                    />
                  </div>
                </div>

                {/* Quick Skills */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: '#7C3AED', marginBottom: '6px' }}>
                      Skill I Can Teach
                    </label>
                    <input
                      type="text"
                      required
                      value={teachSkill}
                      onChange={(e) => setTeachSkill(e.target.value)}
                      placeholder="e.g. Python"
                      style={{
                        width: '100%',
                        padding: '11px 14px',
                        borderRadius: '12px',
                        border: '1px solid #DDD6FE',
                        background: '#FAF5FF',
                        fontSize: '0.9rem'
                      }}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: '#047857', marginBottom: '6px' }}>
                      Skill I Want to Learn
                    </label>
                    <input
                      type="text"
                      required
                      value={learnSkill}
                      onChange={(e) => setLearnSkill(e.target.value)}
                      placeholder="e.g. UI/UX Design"
                      style={{
                        width: '100%',
                        padding: '11px 14px',
                        borderRadius: '12px',
                        border: '1px solid #A7F3D0',
                        background: '#ECFDF5',
                        fontSize: '0.9rem'
                      }}
                    />
                  </div>
                </div>
              </>
            )}

            {/* Email or Student ID */}
            <div>
              <label style={{ display: 'block', fontSize: '0.88rem', fontWeight: 600, color: '#334155', marginBottom: '8px' }}>
                Email or Student ID
              </label>
              <div style={{ position: 'relative' }}>
                <Mail size={18} color="#94A3B8" style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)' }} />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email or student ID"
                  style={{
                    width: '100%',
                    padding: '14px 16px 14px 46px',
                    borderRadius: '14px',
                    border: '1px solid #CBD5E1',
                    fontSize: '0.95rem',
                    outline: 'none',
                    backgroundColor: '#FFFFFF',
                    transition: 'all 0.2s'
                  }}
                  onFocus={(e) => e.target.style.borderColor = '#6366F1'}
                  onBlur={(e) => e.target.style.borderColor = '#CBD5E1'}
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label style={{ display: 'block', fontSize: '0.88rem', fontWeight: 600, color: '#334155', marginBottom: '8px' }}>
                Password
              </label>
              <div style={{ position: 'relative' }}>
                <Lock size={18} color="#94A3B8" style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)' }} />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  style={{
                    width: '100%',
                    padding: '14px 46px 14px 46px',
                    borderRadius: '14px',
                    border: '1px solid #CBD5E1',
                    fontSize: '0.95rem',
                    outline: 'none',
                    backgroundColor: '#FFFFFF',
                    transition: 'all 0.2s'
                  }}
                  onFocus={(e) => e.target.style.borderColor = '#6366F1'}
                  onBlur={(e) => e.target.style.borderColor = '#CBD5E1'}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{
                    position: 'absolute',
                    right: '16px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    color: '#94A3B8',
                    display: 'flex',
                    alignItems: 'center'
                  }}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {/* Forgot password */}
            {!isSignUp && (
              <div style={{ textAlign: 'right', marginTop: '-6px' }}>
                <a href="#forgot" onClick={(e) => { e.preventDefault(); alert('For this demo, password is: secret123'); }} style={{
                  fontSize: '0.84rem',
                  color: '#6366F1',
                  textDecoration: 'none',
                  fontWeight: 600
                }}>
                  Forgot password?
                </a>
              </div>
            )}

            {/* Main Gradient Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              style={{
                marginTop: '6px',
                width: '100%',
                padding: '15px',
                borderRadius: '14px',
                border: 'none',
                background: 'linear-gradient(135deg, #6366F1 0%, #3B82F6 100%)',
                color: '#FFFFFF',
                fontSize: '1rem',
                fontWeight: 700,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                boxShadow: '0 8px 20px rgba(99, 102, 241, 0.35)',
                transition: 'all 0.2s'
              }}
            >
              {isLoading ? 'Connecting...' : isSignUp ? 'Sign Up →' : 'Log In →'}
            </button>

            {/* Divider 'or' */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              margin: '8px 0'
            }}>
              <div style={{ flex: 1, height: '1px', backgroundColor: '#E2E8F0' }} />
              <span style={{ fontSize: '0.84rem', color: '#94A3B8' }}>or</span>
              <div style={{ flex: 1, height: '1px', backgroundColor: '#E2E8F0' }} />
            </div>

            {/* Continue with Google */}
            <button
              type="button"
              onClick={() => handleDemoLogin('sarah.chen@campus.edu', 'secret123', 'Sarah Chen')}
              style={{
                width: '100%',
                padding: '13px',
                borderRadius: '14px',
                border: '1px solid #E2E8F0',
                background: '#FFFFFF',
                color: '#1E293B',
                fontSize: '0.95rem',
                fontWeight: 600,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '10px',
                transition: 'background 0.2s'
              }}
            >
              <svg width="20" height="20" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
              </svg>
              Continue with Google
            </button>

            {/* Switch Sign up / Log in */}
            <div style={{ textAlign: 'center', marginTop: '10px', fontSize: '0.9rem', color: '#64748B' }}>
              {isSignUp ? (
                <>
                  Already have an account?{' '}
                  <button
                    type="button"
                    onClick={() => setIsSignUp(false)}
                    style={{ background: 'none', border: 'none', color: '#6366F1', fontWeight: 700, cursor: 'pointer', padding: 0 }}
                  >
                    Log In
                  </button>
                </>
              ) : (
                <>
                  Don't have an account?{' '}
                  <button
                    type="button"
                    onClick={() => setIsSignUp(true)}
                    style={{ background: 'none', border: 'none', color: '#6366F1', fontWeight: 700, cursor: 'pointer', padding: 0 }}
                  >
                    Sign up
                  </button>
                </>
              )}
            </div>

            {/* Quick Demo Student Switcher Pills */}
            <div style={{
              marginTop: '16px',
              paddingTop: '16px',
              borderTop: '1px dashed #E2E8F0',
              textAlign: 'center'
            }}>
              <div style={{ fontSize: '0.78rem', fontWeight: 600, color: '#94A3B8', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                Instant Demo Logins
              </div>
              <div style={{ display: 'flex', gap: '8px', justifyContent: 'center', flexWrap: 'wrap' }}>
                <button
                  type="button"
                  onClick={() => handleDemoLogin('sarah.chen@campus.edu', 'secret123', 'Sarah Chen')}
                  style={{
                    padding: '5px 12px',
                    borderRadius: '9999px',
                    border: '1px solid #DDD6FE',
                    background: '#FAF5FF',
                    color: '#7C3AED',
                    fontSize: '0.78rem',
                    fontWeight: 600,
                    cursor: 'pointer'
                  }}
                >
                  👩‍💻 Sarah (Python)
                </button>
                <button
                  type="button"
                  onClick={() => handleDemoLogin('alex.rivera@design.edu', 'secret123', 'Alex Rivera')}
                  style={{
                    padding: '5px 12px',
                    borderRadius: '9999px',
                    border: '1px solid #BBF7D0',
                    background: '#F0FDF4',
                    color: '#15803D',
                    fontSize: '0.78rem',
                    fontWeight: 600,
                    cursor: 'pointer'
                  }}
                >
                  🎨 Alex (UI/UX)
                </button>
                <button
                  type="button"
                  onClick={() => handleDemoLogin('liam.patel@lang.edu', 'secret123', 'Liam Patel')}
                  style={{
                    padding: '5px 12px',
                    borderRadius: '9999px',
                    border: '1px solid #BAE6FD',
                    background: '#F0F9FF',
                    color: '#0284C7',
                    fontSize: '0.78rem',
                    fontWeight: 600,
                    cursor: 'pointer'
                  }}
                >
                  🌐 Liam (Spanish)
                </button>
              </div>
            </div>

          </form>
        </div>

      </div>
    </div>
  );
}
