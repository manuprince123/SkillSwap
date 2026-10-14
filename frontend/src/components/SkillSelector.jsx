import React, { useState } from 'react';
import { 
  Plus, 
  Trash2, 
  Save, 
  Code2, 
  Palette, 
  Globe, 
  Camera, 
  BarChart3, 
  BookOpen, 
  Sparkles,
  Check,
  Search
} from 'lucide-react';
import { updateUserProfile } from '../api';

const CATALOG = [
  { name: 'Python', category: 'Programming', icon: Code2, teachStyle: 'pill-teach-purple', learnStyle: 'pill-learn-blue' },
  { name: 'UI/UX Design', category: 'UI/UX & Design', icon: Palette, teachStyle: 'pill-teach-purple', learnStyle: 'pill-learn-mint' },
  { name: 'Photography', category: 'Creative Arts', icon: Camera, teachStyle: 'pill-photo-violet', learnStyle: 'pill-learn-blue' },
  { name: 'Spanish', category: 'Languages', icon: Globe, teachStyle: 'pill-lang-sky', learnStyle: 'pill-lang-sky' },
  { name: 'Data Analysis', category: 'Business & Data', icon: BarChart3, teachStyle: 'pill-teach-purple', learnStyle: 'pill-learn-blue' },
  { name: 'React', category: 'Programming', icon: Code2, teachStyle: 'pill-teach-purple', learnStyle: 'pill-learn-mint' },
  { name: 'Figma', category: 'UI/UX & Design', icon: Palette, teachStyle: 'pill-teach-purple', learnStyle: 'pill-learn-mint' },
  { name: 'Video Editing', category: 'Creative Arts', icon: Camera, teachStyle: 'pill-photo-violet', learnStyle: 'pill-learn-blue' },
  { name: 'Machine Learning', category: 'Programming', icon: Code2, teachStyle: 'pill-teach-purple', learnStyle: 'pill-learn-blue' },
  { name: 'Japanese', category: 'Languages', icon: Globe, teachStyle: 'pill-lang-sky', learnStyle: 'pill-lang-sky' },
  { name: 'French', category: 'Languages', icon: Globe, teachStyle: 'pill-lang-sky', learnStyle: 'pill-lang-sky' },
  { name: 'Public Speaking', category: 'Academics', icon: BookOpen, teachStyle: 'pill-teach-purple', learnStyle: 'pill-learn-mint' }
];

export default function SkillSelector({ currentUser, onUserUpdated }) {
  const [teachSkills, setTeachSkills] = useState(currentUser?.skills_to_teach || []);
  const [learnSkills, setLearnSkills] = useState(currentUser?.skills_to_learn || []);
  const [activeCategory, setActiveCategory] = useState('All');
  const [searchFilter, setSearchFilter] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // New Custom Skill Form State
  const [newSkillName, setNewSkillName] = useState('');
  const [newSkillType, setNewSkillType] = useState('teach'); // teach | learn
  const [newSkillProficiency, setNewSkillProficiency] = useState('Intermediate');
  const [newSkillDetail, setNewSkillDetail] = useState('');

  const categories = ['All', 'Programming', 'UI/UX & Design', 'Languages', 'Creative Arts', 'Business & Data'];

  const filteredCatalog = CATALOG.filter(item => {
    const matchesCat = activeCategory === 'All' || item.category === activeCategory;
    const matchesSearch = item.name.toLowerCase().includes(searchFilter.toLowerCase());
    return matchesCat && matchesSearch;
  });

  const handleAddFromCatalog = (skill, type) => {
    if (type === 'teach') {
      if (teachSkills.some(s => s.name.toLowerCase() === skill.name.toLowerCase())) return;
      setTeachSkills([...teachSkills, {
        name: skill.name,
        category: skill.category,
        proficiency: 'Intermediate',
        experience_summary: `Experienced in ${skill.name}`
      }]);
    } else {
      if (learnSkills.some(s => s.name.toLowerCase() === skill.name.toLowerCase())) return;
      setLearnSkills([...learnSkills, {
        name: skill.name,
        category: skill.category,
        target_goal: `Looking to improve ${skill.name}`
      }]);
    }
  };

  const handleRemoveSkill = (name, type) => {
    if (type === 'teach') {
      setTeachSkills(teachSkills.filter(s => s.name !== name));
    } else {
      setLearnSkills(learnSkills.filter(s => s.name !== name));
    }
  };

  const handleAddCustom = (e) => {
    e.preventDefault();
    if (!newSkillName.trim()) return;

    if (newSkillType === 'teach') {
      setTeachSkills([...teachSkills, {
        name: newSkillName.trim(),
        category: 'Custom',
        proficiency: newSkillProficiency,
        experience_summary: newSkillDetail || 'Practical experience'
      }]);
    } else {
      setLearnSkills([...learnSkills, {
        name: newSkillName.trim(),
        category: 'Custom',
        target_goal: newSkillDetail || 'Eager to learn from peers'
      }]);
    }

    setNewSkillName('');
    setNewSkillDetail('');
  };

  const handleSaveMatrix = async () => {
    setIsSaving(true);
    setSaveSuccess(false);
    try {
      const updated = await updateUserProfile(currentUser.id, {
        skills_to_teach: teachSkills,
        skills_to_learn: learnSkills
      });
      onUserUpdated(updated);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err) {
      alert('Failed to save skill changes: ' + err.message);
    } finally {
      setIsSaving(false);
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
            My Skill Exchange Matrix
          </h1>
          <p style={{ fontSize: '1rem', color: '#64748B', marginTop: '4px' }}>
            Specify what you can teach to peers and what you're eager to learn in return.
          </p>
        </div>

        <button
          onClick={handleSaveMatrix}
          disabled={isSaving}
          style={{
            padding: '13px 26px',
            borderRadius: '14px',
            border: 'none',
            background: saveSuccess ? '#10B981' : 'linear-gradient(135deg, #6366F1 0%, #3B82F6 100%)',
            color: 'white',
            fontWeight: 700,
            fontSize: '0.96rem',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            boxShadow: '0 8px 20px rgba(99, 102, 241, 0.3)',
            transition: 'all 0.2s'
          }}
        >
          {saveSuccess ? <Check size={18} /> : <Save size={18} />}
          {isSaving ? 'Saving to Database...' : saveSuccess ? 'Saved to MongoDB!' : 'Save Skill Matrix'}
        </button>
      </div>

      {/* Main Dual Zone Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))',
        gap: '28px',
        marginBottom: '40px'
      }}>
        
        {/* ========================================= */}
        {/* LEFT ZONE: SKILLS I CAN TEACH (Lavender) */}
        {/* ========================================= */}
        <div style={{
          background: '#FFFFFF',
          borderRadius: '24px',
          border: '1px solid #DDD6FE',
          padding: '28px',
          boxShadow: '0 10px 30px -10px rgba(124, 58, 237, 0.08)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div style={{
                width: '36px',
                height: '36px',
                borderRadius: '10px',
                background: '#EDE9FE',
                color: '#7C3AED',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <Code2 size={20} />
              </div>
              <div>
                <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0F172A' }}>
                  Skills I Can Teach
                </h2>
                <span style={{ fontSize: '0.8rem', color: '#7C3AED', fontWeight: 600 }}>
                  {teachSkills.length} active teaching {teachSkills.length === 1 ? 'skill' : 'skills'}
                </span>
              </div>
            </div>
          </div>

          {teachSkills.length === 0 ? (
            <div style={{
              padding: '30px',
              textAlign: 'center',
              border: '2px dashed #DDD6FE',
              borderRadius: '18px',
              color: '#8B5CF6',
              background: '#FAF5FF'
            }}>
              <Sparkles size={28} style={{ margin: '0 auto 10px' }} />
              <div style={{ fontWeight: 600 }}>No teaching skills selected yet.</div>
              <div style={{ fontSize: '0.82rem', marginTop: '4px', opacity: 0.8 }}>
                Select from the catalog below or add your custom skill!
              </div>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {teachSkills.map((s, idx) => (
                <div
                  key={idx}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '14px 18px',
                    borderRadius: '16px',
                    background: '#FAF5FF',
                    border: '1px solid #DDD6FE'
                  }}
                >
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
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
                      <div style={{ fontSize: '0.8rem', color: '#64748B', marginTop: '4px' }}>
                        {s.experience_summary}
                      </div>
                    )}
                  </div>

                  <button
                    onClick={() => handleRemoveSkill(s.name, 'teach')}
                    title="Remove skill"
                    style={{
                      background: 'none',
                      border: 'none',
                      color: '#94A3B8',
                      cursor: 'pointer',
                      padding: '6px',
                      borderRadius: '8px'
                    }}
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* ========================================= */}
        {/* RIGHT ZONE: SKILLS I WANT TO LEARN (Mint) */}
        {/* ========================================= */}
        <div style={{
          background: '#FFFFFF',
          borderRadius: '24px',
          border: '1px solid #BBF7D0',
          padding: '28px',
          boxShadow: '0 10px 30px -10px rgba(21, 128, 61, 0.08)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div style={{
                width: '36px',
                height: '36px',
                borderRadius: '10px',
                background: '#DCFCE7',
                color: '#15803D',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <Palette size={20} />
              </div>
              <div>
                <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0F172A' }}>
                  Skills I Want to Learn
                </h2>
                <span style={{ fontSize: '0.8rem', color: '#15803D', fontWeight: 600 }}>
                  {learnSkills.length} target learning {learnSkills.length === 1 ? 'goal' : 'goals'}
                </span>
              </div>
            </div>
          </div>

          {learnSkills.length === 0 ? (
            <div style={{
              padding: '30px',
              textAlign: 'center',
              border: '2px dashed #BBF7D0',
              borderRadius: '18px',
              color: '#16A34A',
              background: '#F0FDF4'
            }}>
              <Sparkles size={28} style={{ margin: '0 auto 10px' }} />
              <div style={{ fontWeight: 600 }}>No learning targets added yet.</div>
              <div style={{ fontSize: '0.82rem', marginTop: '4px', opacity: 0.8 }}>
                Add what you want to master in exchange for your knowledge!
              </div>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {learnSkills.map((s, idx) => (
                <div
                  key={idx}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '14px 18px',
                    borderRadius: '16px',
                    background: '#F0FDF4',
                    border: '1px solid #BBF7D0'
                  }}
                >
                  <div>
                    <div style={{ fontWeight: 700, color: '#0F172A', fontSize: '0.98rem' }}>
                      {s.name}
                    </div>
                    {s.target_goal && (
                      <div style={{ fontSize: '0.8rem', color: '#64748B', marginTop: '4px' }}>
                        {s.target_goal}
                      </div>
                    )}
                  </div>

                  <button
                    onClick={() => handleRemoveSkill(s.name, 'learn')}
                    title="Remove skill"
                    style={{
                      background: 'none',
                      border: 'none',
                      color: '#94A3B8',
                      cursor: 'pointer',
                      padding: '6px',
                      borderRadius: '8px'
                    }}
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>

      {/* ================================================= */}
      {/* QUICK CATALOG: One-click Add to Teach or Learn    */}
      {/* ================================================= */}
      <div style={{
        background: '#FFFFFF',
        borderRadius: '24px',
        border: '1px solid #E2E8F0',
        padding: '30px',
        marginBottom: '32px'
      }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '16px', marginBottom: '20px' }}>
          <div>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0F172A' }}>
              Popular Student Skills Catalog
            </h3>
            <p style={{ fontSize: '0.85rem', color: '#64748B' }}>
              Click <strong>+ Teach</strong> or <strong>+ Learn</strong> on any badge to populate your matrix instantly.
            </p>
          </div>

          {/* Search Box */}
          <div style={{ position: 'relative', minWidth: '240px' }}>
            <Search size={16} color="#94A3B8" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
            <input
              type="text"
              value={searchFilter}
              onChange={(e) => setSearchFilter(e.target.value)}
              placeholder="Search skill..."
              style={{
                width: '100%',
                padding: '9px 12px 9px 36px',
                borderRadius: '12px',
                border: '1px solid #CBD5E1',
                fontSize: '0.88rem',
                outline: 'none'
              }}
            />
          </div>
        </div>

        {/* Categories Bar */}
        <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', paddingBottom: '14px', marginBottom: '16px' }}>
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              style={{
                padding: '7px 16px',
                borderRadius: '9999px',
                border: activeCategory === cat ? 'none' : '1px solid #E2E8F0',
                background: activeCategory === cat ? '#0F172A' : '#F8FAFC',
                color: activeCategory === cat ? '#FFFFFF' : '#475569',
                fontSize: '0.82rem',
                fontWeight: 600,
                cursor: 'pointer',
                whiteSpace: 'nowrap'
              }}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Catalog Chips Grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
          gap: '14px'
        }}>
          {filteredCatalog.map((item) => {
            const Icon = item.icon;
            const alreadyTeaching = teachSkills.some(s => s.name.toLowerCase() === item.name.toLowerCase());
            const alreadyLearning = learnSkills.some(s => s.name.toLowerCase() === item.name.toLowerCase());

            return (
              <div
                key={item.name}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '12px 16px',
                  borderRadius: '16px',
                  background: '#F8FAFC',
                  border: '1px solid #E2E8F0',
                  transition: 'all 0.2s'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <Icon size={18} color="#6366F1" />
                  <div>
                    <div style={{ fontWeight: 700, fontSize: '0.9rem', color: '#0F172A' }}>{item.name}</div>
                    <div style={{ fontSize: '0.74rem', color: '#64748B' }}>{item.category}</div>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '6px' }}>
                  <button
                    onClick={() => handleAddFromCatalog(item, 'teach')}
                    disabled={alreadyTeaching}
                    style={{
                      padding: '5px 9px',
                      borderRadius: '8px',
                      border: '1px solid #DDD6FE',
                      background: alreadyTeaching ? '#EDE9FE' : '#FFFFFF',
                      color: '#7C3AED',
                      fontSize: '0.74rem',
                      fontWeight: 700,
                      cursor: alreadyTeaching ? 'default' : 'pointer'
                    }}
                  >
                    {alreadyTeaching ? 'Teaching' : '+ Teach'}
                  </button>

                  <button
                    onClick={() => handleAddFromCatalog(item, 'learn')}
                    disabled={alreadyLearning}
                    style={{
                      padding: '5px 9px',
                      borderRadius: '8px',
                      border: '1px solid #BBF7D0',
                      background: alreadyLearning ? '#DCFCE7' : '#FFFFFF',
                      color: '#15803D',
                      fontSize: '0.74rem',
                      fontWeight: 700,
                      cursor: alreadyLearning ? 'default' : 'pointer'
                    }}
                  >
                    {alreadyLearning ? 'Learning' : '+ Learn'}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ================================================= */}
      {/* CUSTOM SKILL CREATOR                             */}
      {/* ================================================= */}
      <div style={{
        background: '#FAF5FF',
        borderRadius: '24px',
        border: '1px dashed #DDD6FE',
        padding: '28px'
      }}>
        <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#0F172A', marginBottom: '6px' }}>
          Can't find your specific subject? Add Custom Skill
        </h3>
        <p style={{ fontSize: '0.85rem', color: '#64748B', marginBottom: '18px' }}>
          From organic chemistry to video game development or guitar fingerpicking — add anything you know.
        </p>

        <form onSubmit={handleAddCustom} style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr)) 140px',
          gap: '12px',
          alignItems: 'end'
        }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#334155', marginBottom: '6px' }}>
              Skill Name
            </label>
            <input
              type="text"
              required
              value={newSkillName}
              onChange={(e) => setNewSkillName(e.target.value)}
              placeholder="e.g. Flutter, Organic Chemistry"
              style={{
                width: '100%',
                padding: '11px 14px',
                borderRadius: '12px',
                border: '1px solid #CBD5E1',
                fontSize: '0.9rem',
                backgroundColor: '#FFFFFF',
                outline: 'none'
              }}
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#334155', marginBottom: '6px' }}>
              Matrix Zone
            </label>
            <select
              value={newSkillType}
              onChange={(e) => setNewSkillType(e.target.value)}
              style={{
                width: '100%',
                padding: '11px 14px',
                borderRadius: '12px',
                border: '1px solid #CBD5E1',
                fontSize: '0.9rem',
                backgroundColor: '#FFFFFF',
                outline: 'none'
              }}
            >
              <option value="teach">I Can Teach This</option>
              <option value="learn">I Want to Learn This</option>
            </select>
          </div>

          {newSkillType === 'teach' && (
            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#334155', marginBottom: '6px' }}>
                Your Proficiency
              </label>
              <select
                value={newSkillProficiency}
                onChange={(e) => setNewSkillProficiency(e.target.value)}
                style={{
                  width: '100%',
                  padding: '11px 14px',
                  borderRadius: '12px',
                  border: '1px solid #CBD5E1',
                  fontSize: '0.9rem',
                  backgroundColor: '#FFFFFF',
                  outline: 'none'
                }}
              >
                <option value="Beginner">Beginner</option>
                <option value="Intermediate">Intermediate</option>
                <option value="Advanced">Advanced / Expert</option>
              </select>
            </div>
          )}

          <div>
            <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#334155', marginBottom: '6px' }}>
              Note / Detail
            </label>
            <input
              type="text"
              value={newSkillDetail}
              onChange={(e) => setNewSkillDetail(e.target.value)}
              placeholder={newSkillType === 'teach' ? 'Experience summary' : 'What you hope to build'}
              style={{
                width: '100%',
                padding: '11px 14px',
                borderRadius: '12px',
                border: '1px solid #CBD5E1',
                fontSize: '0.9rem',
                backgroundColor: '#FFFFFF',
                outline: 'none'
              }}
            />
          </div>

          <button
            type="submit"
            style={{
              padding: '12px',
              borderRadius: '12px',
              border: 'none',
              background: '#0F172A',
              color: '#FFFFFF',
              fontWeight: 700,
              fontSize: '0.9rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px'
            }}
          >
            <Plus size={16} /> Add Skill
          </button>
        </form>
      </div>

    </div>
  );
}
