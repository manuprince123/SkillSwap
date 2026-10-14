import React, { useState } from 'react';
import { Database, CheckCircle2, AlertCircle, X, ExternalLink, RefreshCw, Key, Server } from 'lucide-react';
import { connectCluster } from '../api';

export default function ClusterModal({ isOpen, onClose, clusterStatus, onClusterUpdated }) {
  const [mongodbUrl, setMongodbUrl] = useState('');
  const [dbName, setDbName] = useState('skillswap');
  const [testing, setTesting] = useState(false);
  const [statusMessage, setStatusMessage] = useState(null);

  if (!isOpen) return null;

  const handleConnect = async (e) => {
    e.preventDefault();
    setTesting(true);
    setStatusMessage(null);

    try {
      const result = await connectCluster(mongodbUrl, dbName);
      onClusterUpdated(result);
      if (result.is_atlas_connected) {
        setStatusMessage({ type: 'success', text: 'Connected to live MongoDB Atlas cluster!' });
      } else {
        setStatusMessage({ type: 'error', text: result.connection_error_message || 'Could not reach cluster.' });
      }
    } catch (err) {
      setStatusMessage({ type: 'error', text: err.message || 'Connection failed' });
    } finally {
      setTesting(false);
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
      zIndex: 100,
      padding: '20px'
    }}>
      <div style={{
        background: '#FFFFFF',
        borderRadius: '24px',
        maxWidth: '560px',
        width: '100%',
        padding: '32px',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
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

        {/* Modal Header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '20px' }}>
          <div style={{
            width: '48px',
            height: '48px',
            borderRadius: '14px',
            background: clusterStatus?.is_atlas_connected ? '#DCFCE7' : '#EFF6FF',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: clusterStatus?.is_atlas_connected ? '#15803D' : '#3B82F6'
          }}>
            <Database size={24} />
          </div>
          <div>
            <h2 style={{ fontSize: '1.3rem', fontWeight: 800, color: '#0F172A' }}>
              MongoDB Atlas Online Cluster
            </h2>
            <p style={{ fontSize: '0.85rem', color: '#64748B' }}>
              Connect your cloud database to sync student skills & swaps live.
            </p>
          </div>
        </div>

        {/* Current Status Box */}
        <div style={{
          background: clusterStatus?.is_atlas_connected ? '#F0FDF4' : '#FFFBEB',
          border: clusterStatus?.is_atlas_connected ? '1px solid #BBF7D0' : '1px solid #FDE68A',
          borderRadius: '16px',
          padding: '16px',
          marginBottom: '24px',
          display: 'flex',
          alignItems: 'flex-start',
          gap: '12px'
        }}>
          {clusterStatus?.is_atlas_connected ? (
            <CheckCircle2 size={20} color="#16A34A" style={{ marginTop: '2px', flexShrink: 0 }} />
          ) : (
            <AlertCircle size={20} color="#D97706" style={{ marginTop: '2px', flexShrink: 0 }} />
          )}
          <div style={{ fontSize: '0.86rem', flex: 1 }}>
            <div style={{ fontWeight: 700, color: clusterStatus?.is_atlas_connected ? '#166534' : '#92400E' }}>
              {clusterStatus?.is_atlas_connected ? '🟢 Connected to MongoDB Atlas Cluster' : '🟡 Running in Local Sandbox Data Mode'}
            </div>
            <div style={{ color: clusterStatus?.is_atlas_connected ? '#15803D' : '#B45309', marginTop: '4px' }}>
              {clusterStatus?.is_atlas_connected 
                ? `Active Database: ${clusterStatus.database_name} · ${clusterStatus.total_users} students in cluster.`
                : 'All student profiles, swaps, and chat work out of the box in sandbox mode. Paste your Atlas URI below to link your live online cluster.'}
            </div>
          </div>
        </div>

        {/* Input Form */}
        <form onSubmit={handleConnect} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.86rem', fontWeight: 600, color: '#334155', marginBottom: '6px' }}>
              MongoDB Connection URI
            </label>
            <div style={{ position: 'relative' }}>
              <Key size={16} color="#94A3B8" style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)' }} />
              <input
                type="password"
                required
                value={mongodbUrl}
                onChange={(e) => setMongodbUrl(e.target.value)}
                placeholder="mongodb+srv://<username>:<password>@cluster0.xxx.mongodb.net/..."
                style={{
                  width: '100%',
                  padding: '12px 14px 12px 40px',
                  borderRadius: '12px',
                  border: '1px solid #CBD5E1',
                  fontSize: '0.9rem',
                  outline: 'none',
                  backgroundColor: '#FFFFFF'
                }}
              />
            </div>
            <div style={{ fontSize: '0.75rem', color: '#94A3B8', marginTop: '5px' }}>
              Find this in MongoDB Atlas: <strong>Connect → Drivers → Python 3.6+</strong>
            </div>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.86rem', fontWeight: 600, color: '#334155', marginBottom: '6px' }}>
              Database Name
            </label>
            <div style={{ position: 'relative' }}>
              <Server size={16} color="#94A3B8" style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)' }} />
              <input
                type="text"
                value={dbName}
                onChange={(e) => setDbName(e.target.value)}
                placeholder="skillswap"
                style={{
                  width: '100%',
                  padding: '12px 14px 12px 40px',
                  borderRadius: '12px',
                  border: '1px solid #CBD5E1',
                  fontSize: '0.9rem',
                  outline: 'none',
                  backgroundColor: '#FFFFFF'
                }}
              />
            </div>
          </div>

          {statusMessage && (
            <div style={{
              padding: '10px 14px',
              borderRadius: '12px',
              fontSize: '0.84rem',
              background: statusMessage.type === 'success' ? '#ECFDF5' : '#FEF2F2',
              color: statusMessage.type === 'success' ? '#047857' : '#DC2626',
              border: statusMessage.type === 'success' ? '1px solid #A7F3D0' : '1px solid #FECACA'
            }}>
              {statusMessage.text}
            </div>
          )}

          <div style={{ display: 'flex', gap: '12px', marginTop: '8px' }}>
            <button
              type="submit"
              disabled={testing}
              style={{
                flex: 1,
                padding: '12px',
                borderRadius: '12px',
                border: 'none',
                background: 'linear-gradient(135deg, #6366F1 0%, #3B82F6 100%)',
                color: 'white',
                fontWeight: 700,
                fontSize: '0.92rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px'
              }}
            >
              {testing ? <RefreshCw size={16} className="animate-spin" /> : <Database size={16} />}
              {testing ? 'Testing Cluster...' : 'Connect Online Cluster'}
            </button>

            <button
              type="button"
              onClick={onClose}
              style={{
                padding: '12px 20px',
                borderRadius: '12px',
                border: '1px solid #E2E8F0',
                background: '#FFFFFF',
                color: '#64748B',
                fontWeight: 600,
                fontSize: '0.92rem',
                cursor: 'pointer'
              }}
            >
              Close
            </button>
          </div>
        </form>

        {/* Quick Atlas Tips */}
        <div style={{
          marginTop: '24px',
          paddingTop: '16px',
          borderTop: '1px solid #F1F5F9',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <span style={{ fontSize: '0.78rem', color: '#64748B' }}>
            Remember to add IP <code style={{ background: '#F1F5F9', padding: '2px 5px', borderRadius: '4px' }}>0.0.0.0/0</code> in Atlas Network Access
          </span>
          <a
            href="https://cloud.mongodb.com"
            target="_blank"
            rel="noreferrer"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              fontSize: '0.78rem',
              color: '#3B82F6',
              textDecoration: 'none',
              fontWeight: 600
            }}
          >
            Open Atlas <ExternalLink size={12} />
          </a>
        </div>
      </div>
    </div>
  );
}
