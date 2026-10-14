import React, { useState, useEffect } from 'react';
import { 
  BookOpen, 
  Download, 
  Heart, 
  Plus, 
  Search, 
  Filter, 
  FileText, 
  Code2, 
  Palette, 
  Globe, 
  Camera, 
  ExternalLink,
  CheckCircle2,
  X,
  Share2,
  Layers
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { fetchMaterials, createMaterial, downloadMaterial, likeMaterial } from '../api';

const CATEGORIES = [
  'All',
  'Code & Templates',
  'Design & UI Kits',
  'Languages',
  'Creative Arts',
  'Academics & Science'
];

export default function MaterialExchange({ currentUser, onSelectSwapWithAuthor }) {
  const [materials, setMaterials] = useState([]);
  const [activeCategory, setActiveCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [downloadedIds, setDownloadedIds] = useState([]);

  // Upload Form State
  const [newTitle, setNewTitle] = useState('');
  const [newCategory, setNewCategory] = useState('Code & Templates');
  const [newFormat, setNewFormat] = useState('PDF');
  const [newSize, setNewSize] = useState('2.5 MB');
  const [newUrl, setNewUrl] = useState('');
  const [newRequirement, setNewRequirement] = useState('Free for Campus Peers');
  const [newDescription, setNewDescription] = useState('');
  const [isUploading, setIsUploading] = useState(false);

  useEffect(() => {
    loadMaterials();
  }, [activeCategory]);

  const loadMaterials = async () => {
    setLoading(true);
    try {
      const data = await fetchMaterials(activeCategory, searchQuery);
      setMaterials(data);
    } catch (err) {
      console.error('Failed to load materials:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    loadMaterials();
  };

  const handleDownload = async (mat) => {
    try {
      await downloadMaterial(mat.id);
      setDownloadedIds([...downloadedIds, mat.id]);
      setMaterials(materials.map(m => m.id === mat.id ? { ...m, downloads_count: m.downloads_count + 1 } : m));

      // Trigger Celebration Confetti
      try {
        confetti({
          particleCount: 60,
          spread: 60,
          origin: { y: 0.7 }
        });
      } catch (e) {}

      // If link exists, open it in new tab
      if (mat.download_url && mat.download_url.startsWith('http')) {
        window.open(mat.download_url, '_blank');
      } else {
        alert(`Starting download for: ${mat.title} (${mat.file_format})`);
      }
    } catch (e) {
      alert('Download registered');
    }
  };

  const handleLike = async (matId) => {
    try {
      await likeMaterial(matId);
      setMaterials(materials.map(m => m.id === matId ? { ...m, likes_count: m.likes_count + 1 } : m));
    } catch (e) {}
  };

  const handleUploadSubmit = async (e) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    setIsUploading(true);
    try {
      const payload = {
        title: newTitle.trim(),
        category: newCategory,
        description: newDescription.trim() || 'Comprehensive study resource for students.',
        file_format: newFormat,
        file_size: newSize || '2.0 MB',
        download_url: newUrl.trim() || 'https://drive.google.com',
        swap_requirement: newRequirement
      };

      const created = await createMaterial(currentUser.id, payload);
      setMaterials([created, ...materials]);
      setShowUploadModal(false);

      // Reset form
      setNewTitle('');
      setNewDescription('');
      setNewUrl('');

      try {
        confetti({ particleCount: 70, spread: 70, origin: { y: 0.6 } });
      } catch (e) {}
    } catch (err) {
      alert('Failed to upload material: ' + err.message);
    } finally {
      setIsUploading(false);
    }
  };

  const getFormatBadgeStyle = (format) => {
    const f = format?.toUpperCase() || 'PDF';
    if (f.includes('PDF')) return { bg: '#FEE2E2', color: '#DC2626', border: '#FECACA' };
    if (f.includes('FIGMA')) return { bg: '#F3E8FF', color: '#9333EA', border: '#E9D5FF' };
    if (f.includes('ZIP') || f.includes('GITHUB')) return { bg: '#EDE9FE', color: '#6366F1', border: '#DDD6FE' };
    if (f.includes('ANKI')) return { bg: '#E0F2FE', color: '#0284C7', border: '#BAE6FD' };
    return { bg: '#DCFCE7', color: '#15803D', border: '#BBF7D0' };
  };

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
            <BookOpen size={16} />
            <span>Campus Resource Library</span>
          </div>

          <h1 style={{ fontSize: '2.3rem', fontWeight: 800, color: '#0F172A', letterSpacing: '-0.03em', lineHeight: 1.15 }}>
            Student <span className="gradient-text">Material Exchange</span>
          </h1>

          <p style={{ fontSize: '1rem', color: '#64748B', marginTop: '10px', lineHeight: 1.6 }}>
            Exchange verified course notes, exam cheat sheets, Figma UI kits, code boilerplates, and flashcard decks with peers.
          </p>
        </div>

        <button
          onClick={() => setShowUploadModal(true)}
          style={{
            padding: '14px 26px',
            borderRadius: '16px',
            border: 'none',
            background: 'linear-gradient(135deg, #6366F1 0%, #3B82F6 100%)',
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
          <Plus size={18} /> Share Learning Material
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div style={{
        display: 'flex',
        flexWrap: 'wrap',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '16px',
        marginBottom: '28px'
      }}>
        {/* Category Chips */}
        <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', paddingBottom: '4px' }}>
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              style={{
                padding: '8px 18px',
                borderRadius: '9999px',
                border: activeCategory === cat ? 'none' : '1px solid #E2E8F0',
                background: activeCategory === cat ? '#0F172A' : '#FFFFFF',
                color: activeCategory === cat ? '#FFFFFF' : '#475569',
                fontSize: '0.84rem',
                fontWeight: 600,
                cursor: 'pointer',
                whiteSpace: 'nowrap',
                transition: 'all 0.15s'
              }}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Search */}
        <form onSubmit={handleSearchSubmit} style={{ position: 'relative', width: '280px' }}>
          <Search size={16} color="#94A3B8" style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)' }} />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search notes, UI kits, code..."
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
        </form>
      </div>

      {/* Materials Grid */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '60px 20px', color: '#94A3B8' }}>
          Loading shared student materials...
        </div>
      ) : materials.length === 0 ? (
        <div style={{
          textAlign: 'center',
          padding: '60px 20px',
          background: '#FFFFFF',
          borderRadius: '24px',
          border: '1px solid #E2E8F0'
        }}>
          <BookOpen size={36} color="#94A3B8" style={{ margin: '0 auto 12px' }} />
          <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: '#0F172A' }}>No materials found</h3>
          <p style={{ color: '#64748B', fontSize: '0.9rem', marginTop: '6px' }}>
            Be the first to upload a cheat sheet, design asset, or code starter!
          </p>
        </div>
      ) : (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))',
          gap: '24px'
        }}>
          {materials.map((mat) => {
            const badgeStyle = getFormatBadgeStyle(mat.file_format);
            const isDownloaded = downloadedIds.includes(mat.id);

            return (
              <div
                key={mat.id}
                style={{
                  background: '#FFFFFF',
                  borderRadius: '24px',
                  border: '1px solid #E2E8F0',
                  padding: '24px',
                  boxShadow: '0 10px 30px -10px rgba(0, 0, 0, 0.05)',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  transition: 'all 0.2s'
                }}
              >
                <div>
                  {/* Top Bar: Category + Format + Size */}
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
                    <span style={{ fontSize: '0.78rem', fontWeight: 700, color: '#6366F1', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                      {mat.category}
                    </span>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{
                        fontSize: '0.74rem',
                        fontWeight: 700,
                        padding: '3px 8px',
                        borderRadius: '6px',
                        background: badgeStyle.bg,
                        color: badgeStyle.color,
                        border: `1px solid ${badgeStyle.border}`
                      }}>
                        {mat.file_format}
                      </span>
                      <span style={{ fontSize: '0.75rem', color: '#94A3B8' }}>
                        {mat.file_size}
                      </span>
                    </div>
                  </div>

                  {/* Title & Description */}
                  <h3 style={{ fontSize: '1.18rem', fontWeight: 800, color: '#0F172A', lineHeight: 1.35, marginBottom: '8px' }}>
                    {mat.title}
                  </h3>

                  <p style={{ fontSize: '0.88rem', color: '#64748B', lineHeight: 1.5, marginBottom: '16px' }}>
                    {mat.description}
                  </p>

                  {/* Barter Requirement Pill */}
                  <div style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '5px 12px',
                    borderRadius: '9999px',
                    fontSize: '0.78rem',
                    fontWeight: 700,
                    marginBottom: '18px',
                    background: mat.swap_requirement.toLowerCase().includes('free') ? '#F0FDF4' : '#FAF5FF',
                    color: mat.swap_requirement.toLowerCase().includes('free') ? '#15803D' : '#7C3AED',
                    border: mat.swap_requirement.toLowerCase().includes('free') ? '1px solid #BBF7D0' : '1px solid #DDD6FE'
                  }}>
                    <span>⚡ Terms: {mat.swap_requirement}</span>
                  </div>
                </div>

                {/* Bottom Row: Author + Download & Like Buttons */}
                <div>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    paddingTop: '16px',
                    borderTop: '1px solid #F1F5F9',
                    marginBottom: '14px'
                  }}>
                    {/* Author */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <img
                        src={mat.author_avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80'}
                        alt={mat.author_name}
                        style={{ width: '32px', height: '32px', borderRadius: '50%', objectFit: 'cover' }}
                      />
                      <div style={{ fontSize: '0.82rem', fontWeight: 600, color: '#334155' }}>
                        {mat.author_name}
                      </div>
                    </div>

                    {/* Stats */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <button
                        onClick={() => handleLike(mat.id)}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '4px',
                          background: 'none',
                          border: 'none',
                          color: '#EF4444',
                          fontSize: '0.82rem',
                          fontWeight: 600,
                          cursor: 'pointer'
                        }}
                      >
                        <Heart size={15} fill="#EF4444" />
                        <span>{mat.likes_count}</span>
                      </button>

                      <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#64748B', fontSize: '0.82rem' }}>
                        <Download size={15} />
                        <span>{mat.downloads_count}</span>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div style={{ display: 'flex', gap: '10px' }}>
                    <button
                      onClick={() => handleDownload(mat)}
                      style={{
                        flex: 1,
                        padding: '11px',
                        borderRadius: '12px',
                        border: 'none',
                        background: isDownloaded ? '#10B981' : 'linear-gradient(135deg, #6366F1 0%, #3B82F6 100%)',
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
                      {isDownloaded ? <CheckCircle2 size={16} /> : <Download size={16} />}
                      {isDownloaded ? 'Downloaded' : 'Get / Swap Resource'}
                    </button>

                    {mat.author_id !== currentUser?.id && onSelectSwapWithAuthor && (
                      <button
                        onClick={() => onSelectSwapWithAuthor(mat.author_id)}
                        title="Propose full skill swap with author"
                        style={{
                          padding: '11px 14px',
                          borderRadius: '12px',
                          border: '1px solid #E2E8F0',
                          background: '#FFFFFF',
                          color: '#475569',
                          fontWeight: 600,
                          fontSize: '0.84rem',
                          cursor: 'pointer'
                        }}
                      >
                        <Share2 size={16} />
                      </button>
                    )}
                  </div>
                </div>

              </div>
            );
          })}
        </div>
      )}

      {/* Upload Material Modal */}
      {showUploadModal && (
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
            maxWidth: '560px',
            width: '100%',
            padding: '36px',
            boxShadow: '0 25px 60px -15px rgba(0, 0, 0, 0.25)',
            position: 'relative',
            animation: 'fadeIn 0.2s ease'
          }}>
            <button
              onClick={() => setShowUploadModal(false)}
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

            <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '20px' }}>
              <div style={{
                width: '46px',
                height: '46px',
                borderRadius: '14px',
                background: '#EEF2FF',
                color: '#6366F1',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <BookOpen size={22} />
              </div>
              <div>
                <h2 style={{ fontSize: '1.35rem', fontWeight: 800, color: '#0F172A' }}>
                  Share Learning Material
                </h2>
                <p style={{ fontSize: '0.85rem', color: '#64748B' }}>
                  Help fellow students learn by uploading notes, UI assets, or code.
                </p>
              </div>
            </div>

            <form onSubmit={handleUploadSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.84rem', fontWeight: 600, color: '#334155', marginBottom: '6px' }}>
                  Resource Title
                </label>
                <input
                  type="text"
                  required
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="e.g. Python FastAPI Async Architecture Cheat Sheet"
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

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.84rem', fontWeight: 600, color: '#334155', marginBottom: '6px' }}>
                    Category
                  </label>
                  <select
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '11px 14px',
                      borderRadius: '12px',
                      border: '1px solid #CBD5E1',
                      fontSize: '0.88rem',
                      outline: 'none'
                    }}
                  >
                    <option value="Code & Templates">Code & Templates</option>
                    <option value="Design & UI Kits">Design & UI Kits</option>
                    <option value="Languages">Languages</option>
                    <option value="Creative Arts">Creative Arts</option>
                    <option value="Academics & Science">Academics & Science</option>
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.84rem', fontWeight: 600, color: '#334155', marginBottom: '6px' }}>
                    Format
                  </label>
                  <select
                    value={newFormat}
                    onChange={(e) => setNewFormat(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '11px 14px',
                      borderRadius: '12px',
                      border: '1px solid #CBD5E1',
                      fontSize: '0.88rem',
                      outline: 'none'
                    }}
                  >
                    <option value="PDF">PDF Document</option>
                    <option value="Figma">Figma File / Community</option>
                    <option value="ZIP / GitHub">ZIP / GitHub Repo</option>
                    <option value="Anki / APKG">Anki Flashcard Deck</option>
                    <option value="Notion">Notion Workspace</option>
                  </select>
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.84rem', fontWeight: 600, color: '#334155', marginBottom: '6px' }}>
                  Terms of Exchange
                </label>
                <input
                  type="text"
                  value={newRequirement}
                  onChange={(e) => setNewRequirement(e.target.value)}
                  placeholder="e.g. Free for Campus Peers, or Swap for UI/UX notes"
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
                  Resource Link or File Download URL
                </label>
                <input
                  type="url"
                  value={newUrl}
                  onChange={(e) => setNewUrl(e.target.value)}
                  placeholder="https://drive.google.com/... or https://github.com/..."
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
                  Description & What's Included
                </label>
                <textarea
                  rows={3}
                  value={newDescription}
                  onChange={(e) => setNewDescription(e.target.value)}
                  placeholder="Summarize key topics, chapters, or components covered..."
                  style={{
                    width: '100%',
                    padding: '11px 14px',
                    borderRadius: '12px',
                    border: '1px solid #CBD5E1',
                    fontSize: '0.9rem',
                    outline: 'none',
                    resize: 'none'
                  }}
                />
              </div>

              <div style={{ display: 'flex', gap: '12px', marginTop: '8px' }}>
                <button
                  type="submit"
                  disabled={isUploading}
                  style={{
                    flex: 1,
                    padding: '13px',
                    borderRadius: '12px',
                    border: 'none',
                    background: 'linear-gradient(135deg, #6366F1 0%, #3B82F6 100%)',
                    color: 'white',
                    fontWeight: 700,
                    fontSize: '0.94rem',
                    cursor: 'pointer'
                  }}
                >
                  {isUploading ? 'Publishing...' : 'Publish Material'}
                </button>
                <button
                  type="button"
                  onClick={() => setShowUploadModal(false)}
                  style={{
                    padding: '13px 20px',
                    borderRadius: '12px',
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
      )}

    </div>
  );
}
