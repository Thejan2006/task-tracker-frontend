'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ThemeControls } from '@/components/ThemeControls';
import { motion } from 'framer-motion';
import toast, { Toaster } from 'react-hot-toast';

interface User { id: number; username?: string; email?: string; name?: string; is_active?: boolean; is_admin?: boolean; created_at?: string; }

export default function AdminPage() {
  const router = useRouter();
  const [users, setUsers] = useState<User[]>([]);
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState<'all' | 'active' | 'disabled'>('all');
  const [loading, setLoading] = useState(true);
  const [forbidden, setForbidden] = useState(false);
  const token = typeof window === 'undefined' ? null : localStorage.getItem('token');

  useEffect(() => {
    if (!token) { router.replace('/login'); return; }
    fetch('http://localhost:8000/admin/users', { headers: { Authorization: `Bearer ${token}` } })
      .then(async (response) => { if (response.status === 401) { localStorage.removeItem('token'); router.replace('/login'); return []; } if (response.status === 403) { setForbidden(true); return []; } if (!response.ok) throw new Error('Admin users endpoint is unavailable'); return response.json(); })
      .then((data) => setUsers(Array.isArray(data) ? data : []))
      .catch((error) => toast.error(error instanceof Error ? error.message : 'Could not load users'))
      .finally(() => setLoading(false));
  }, [router, token]);

  const filteredUsers = useMemo(() => users.filter((user) => { const matches = `${user.username || ''} ${user.email || ''} ${user.name || ''}`.toLowerCase().includes(query.toLowerCase()); return matches && (filter === 'all' || filter === 'active' && user.is_active !== false || filter === 'disabled' && user.is_active === false); }), [users, query, filter]);
  const activeCount = users.filter((user) => user.is_active !== false).length;
  if (loading) return <div className="auth-loading">Checking admin access...</div>;
  if (forbidden) return <main className="auth-loading"><div className="access-denied"><span className="eyebrow">403 Forbidden</span><h1>Admin access required.</h1><p>Your account is not authorized to view this workspace.</p><Link href="/dashboard" className="button button-primary">Return to dashboard</Link></div></main>;
  return <main className="dashboard-shell min-h-screen"><Toaster position="top-right" /><header className="site-header profile-header"><Link href="/dashboard" className="brand"><span className="brand-mark">T</span><span>Taskflow</span></Link><div className="profile-header-actions"><ThemeControls /><Link href="/dashboard" className="button button-small button-ghost">Dashboard</Link></div></header><section className="admin-page"><div className="admin-title"><div><span className="eyebrow">Restricted workspace</span><h1>Admin <span>control room.</span></h1><p>Manage accounts and monitor workspace health.</p></div><div className="admin-stats"><div><strong>{users.length}</strong><span>Total users</span></div><div><strong>{activeCount}</strong><span>Active users</span></div></div></div><div className="admin-toolbar"><input className="admin-search" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search users..." /><select value={filter} onChange={(event) => setFilter(event.target.value as typeof filter)}><option value="all">All users</option><option value="active">Active</option><option value="disabled">Disabled</option></select></div><div className="user-table"><div className="user-table-head"><span>User</span><span>Email</span><span>Status</span><span>Joined</span></div>{filteredUsers.map((user) => <motion.div className="user-row" key={user.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }}><div className="user-cell"><span className="user-avatar">{(user.name || user.username || 'U').charAt(0).toUpperCase()}</span><b>{user.name || user.username || 'Unnamed user'}</b></div><span>{user.email || user.username || '—'}</span><span className={`user-status ${user.is_active === false ? 'disabled' : ''}`}>{user.is_active === false ? 'Disabled' : 'Active'}</span><span>{user.created_at ? new Date(user.created_at).toLocaleDateString() : '—'}</span></motion.div>)}{filteredUsers.length === 0 && <div className="empty-state">No users match this search.</div>}</div></section></main>;
}
