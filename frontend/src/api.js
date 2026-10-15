export function getApiBase() {
  // 1. Production Vercel environment variable (points to Render backend)
  const envUrl = import.meta.env.VITE_API_BASE_URL;
  if (envUrl && envUrl.trim()) {
    const trimmed = envUrl.trim().replace(/\/+$/, '');
    return trimmed.endsWith('/api') ? trimmed : `${trimmed}/api`;
  }

  // 2. Browser localStorage override (allows dynamic backend switching)
  if (typeof window !== 'undefined') {
    const customApi = window.localStorage.getItem('skillswap_api_base');
    if (customApi && customApi.trim()) {
      const trimmed = customApi.trim().replace(/\/+$/, '');
      return trimmed.endsWith('/api') ? trimmed : `${trimmed}/api`;
    }
  }

  // 3. Fallback to local Vite dev proxy /api
  return '/api';
}

export function getWsBase() {
  const apiBase = getApiBase();
  if (apiBase.startsWith('http')) {
    const wsProto = apiBase.startsWith('https:') ? 'wss:' : 'ws:';
    const host = apiBase.replace(/^https?:\/\//, '').replace(/\/api\/?$/, '');
    return `${wsProto}//${host}`;
  }
  const protocol = typeof window !== 'undefined' && window.location.protocol === 'https:' ? 'wss:' : 'ws:';
  const host = typeof window !== 'undefined' ? window.location.host : 'localhost:8000';
  return `${protocol}//${host}`;
}

const getEndpoint = (path) => `${getApiBase()}${path.startsWith('/') ? path : `/${path}`}`;

export const API_BASE = getApiBase();

export async function fetchClusterStatus() {
  const res = await fetch(`${API_BASE}/cluster/status`);
  if (!res.ok) throw new Error('Failed to fetch cluster status');
  return res.json();
}

export async function connectCluster(mongodbUrl, databaseName = 'skillswap') {
  const res = await fetch(`${API_BASE}/cluster/connect`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ mongodb_url: mongodbUrl, database_name: databaseName })
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.detail || 'Failed to connect cluster');
  }
  return res.json();
}

export async function loginUser(email, password) {
  const res = await fetch(`${API_BASE}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password })
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.detail || 'Login failed');
  }
  return res.json();
}

export async function registerUser(userData) {
  const res = await fetch(`${API_BASE}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(userData)
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.detail || 'Registration failed');
  }
  return res.json();
}

export async function switchDemoUser(userId) {
  const res = await fetch(`${API_BASE}/auth/demo-switch/${userId}`);
  if (!res.ok) throw new Error('Failed to switch student');
  return res.json();
}

export async function fetchUsers(search = '', skill = '') {
  const params = new URLSearchParams();
  if (search) params.append('search', search);
  if (skill) params.append('skill', skill);
  const res = await fetch(`${API_BASE}/users?${params.toString()}`);
  if (!res.ok) throw new Error('Failed to fetch students');
  return res.json();
}

export async function fetchUserProfile(userId) {
  const res = await fetch(`${API_BASE}/users/${userId}`);
  if (!res.ok) throw new Error('Failed to fetch profile');
  return res.json();
}

export async function updateUserProfile(userId, updates) {
  const res = await fetch(`${API_BASE}/users/${userId}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(updates)
  });
  if (!res.ok) throw new Error('Failed to update profile');
  return res.json();
}

export async function fetchMatches(currentUserId) {
  const res = await fetch(`${API_BASE}/matches?current_user_id=${currentUserId}`);
  if (!res.ok) throw new Error('Failed to fetch matches');
  return res.json();
}

export async function fetchSwaps(userId) {
  const res = await fetch(`${API_BASE}/swaps?user_id=${userId}`);
  if (!res.ok) throw new Error('Failed to fetch swaps');
  return res.json();
}

export async function createSwap(senderId, payload) {
  const res = await fetch(`${API_BASE}/swaps?sender_id=${senderId}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });
  if (!res.ok) throw new Error('Failed to create swap proposal');
  return res.json();
}

export async function updateSwapStatus(swapId, newStatus) {
  const res = await fetch(`${API_BASE}/swaps/${swapId}/status?new_status=${newStatus}`, {
    method: 'PATCH'
  });
  if (!res.ok) throw new Error('Failed to update swap status');
  return res.json();
}

export async function fetchChat(swapId) {
  const res = await fetch(`${API_BASE}/chat/${swapId}`);
  if (!res.ok) throw new Error('Failed to fetch chat history');
  return res.json();
}

export async function sendChatMessage(senderId, payload) {
  const res = await fetch(`${API_BASE}/chat?sender_id=${senderId}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });
  if (!res.ok) throw new Error('Failed to send message');
  return res.json();
}

export async function fetchSessions(userId) {
  const res = await fetch(`${API_BASE}/sessions?user_id=${userId}`);
  if (!res.ok) throw new Error('Failed to fetch sessions');
  return res.json();
}

export async function createSession(payload) {
  const res = await fetch(`${API_BASE}/sessions`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });
  if (!res.ok) throw new Error('Failed to schedule session');
  return res.json();
}

export async function fetchReviews(userId) {
  const res = await fetch(`${API_BASE}/reviews/${userId}`);
  if (!res.ok) throw new Error('Failed to fetch reviews');
  return res.json();
}

export async function createReview(reviewerId, payload) {
  const res = await fetch(`${API_BASE}/reviews?reviewer_id=${reviewerId}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });
  if (!res.ok) throw new Error('Failed to submit review');
  return res.json();
}

export async function fetchMaterials(category = 'All', search = '') {
  const params = new URLSearchParams();
  if (category && category !== 'All') params.append('category', category);
  if (search) params.append('search', search);
  const res = await fetch(`${API_BASE}/materials?${params.toString()}`);
  if (!res.ok) throw new Error('Failed to fetch materials');
  return res.json();
}

export async function createMaterial(authorId, payload) {
  const res = await fetch(`${API_BASE}/materials?author_id=${authorId}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });
  if (!res.ok) throw new Error('Failed to upload material');
  return res.json();
}

export async function downloadMaterial(materialId) {
  const res = await fetch(`${API_BASE}/materials/${materialId}/download`, {
    method: 'POST'
  });
  if (!res.ok) throw new Error('Failed to record download');
  return res.json();
}

export async function likeMaterial(materialId) {
  const res = await fetch(`${API_BASE}/materials/${materialId}/like`, {
    method: 'POST'
  });
  if (!res.ok) throw new Error('Failed to like material');
  return res.json();
}

