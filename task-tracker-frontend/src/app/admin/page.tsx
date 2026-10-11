'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ThemeControls } from '@/components/ThemeControls';
import { BrandLogo } from '@/components/BrandLogo';
import { motion } from 'framer-motion';
import toast, { Toaster } from 'react-hot-toast';

interface User {
  id: number;
  username?: string;
  email?: string;
  name?: string;
  is_active?: boolean;
  is_admin?: boolean;
  created_at?: string;
}

export default function AdminPage() {
  const router = useRouter();
  const [users, setUsers] = useState<User[]>([]);
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState<'all' | 'active' | 'disabled'>('all');
  const [loading, setLoading] = useState(true);
  const [forbidden, setForbidden] = useState(false);

  useEffect(() => {
    const token = typeof window === 'undefined' ? null : localStorage.getItem('token');
    if (!token) {
      router.replace('/login');
      return;
    }
    fetch('http://localhost:8000/admin/users', { headers: { Authorization: `Bearer ${token}` } })
      .then(async (response) => {
        if (response.status === 401) {
          localStorage.removeItem('token');
          router.replace('/login');
          return [];
        }
        if (response.status === 403) {
          setForbidden(true);
          return [];
        }
        if (!response.ok) throw new Error('Admin users endpoint is unavailable');
        return response.json();
      })
      .then((data) => setUsers(Array.isArray(data) ? data : []))
      .catch((error) => toast.error(error instanceof Error ? error.message : 'Could not load users'))
      .finally(() => setLoading(false));
  }, [router]);

  const filteredUsers = useMemo(
    () =>
      users.filter((user) => {
        const matches = `${user.username || ''} ${user.email || ''} ${user.name || ''}`
          .toLowerCase()
          .includes(query.toLowerCase());
        const matchesFilter =
          filter === 'all' ||
          (filter === 'active' && user.is_active !== false) ||
          (filter === 'disabled' && user.is_active === false);
        return matches && matchesFilter;
      }),
    [users, query, filter]
  );

  const activeCount = users.filter((user) => user.is_active !== false).length;

  if (loading) {
    return (
      <div className="neon-page grid min-h-screen place-items-center">
        <div className="glass-panel animate-pulse rounded-2xl px-9 py-8 text-center">
          <div className="mx-auto mb-4 h-9 w-9 rounded-full border-2 border-neon-cyan/20 border-t-neon-cyan animate-spin" />
          <p className="text-sm font-medium text-[#9aa4c7]">Checking admin authorization...</p>
        </div>
      </div>
    );
  }

  if (forbidden) {
    return (
      <main className="neon-page grid min-h-screen place-items-center px-4 text-[#f8f7ff]">
        <div className="glass-panel max-w-md rounded-2xl p-8 text-center">
          <span className="eyebrow text-rose-400">403 Forbidden</span>
          <h1 className="my-3 text-2xl font-bold">Admin access required</h1>
          <p className="mb-6 text-sm text-[#9aa4c7] leading-relaxed">
            Your account is authenticated, but does not have administrator privileges for this workspace.
          </p>
          <Link href="/dashboard" className="neon-button px-5 py-2.5 text-sm font-semibold">
            Return to dashboard
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="neon-page grid-overlay min-h-screen text-[#f8f7ff]">
      <Toaster position="top-right" />
      <header className="mx-auto flex h-[76px] max-w-[1180px] items-center justify-between border-b border-white/10 px-7">
        <BrandLogo href="/dashboard" />
        <div className="ml-auto flex items-center gap-3">
          <ThemeControls />
          <Link href="/dashboard" className="glass-button px-3.5 py-1.5 text-xs font-semibold">
            Dashboard
          </Link>
        </div>
      </header>

      <section className="mx-auto max-w-[1180px] px-7 pb-24 pt-10 max-[800px]:px-4">
        <div className="flex items-end justify-between pb-8 pt-4 max-[800px]:flex-col max-[800px]:items-start max-[800px]:gap-5">
          <div>
            <span className="eyebrow">Restricted workspace</span>
            <h1 className="my-2.5 text-[clamp(2.4rem,5vw,4rem)] font-bold tracking-tight text-[#f8f7ff]">
              Admin <span className="bg-[linear-gradient(90deg,#9b6cff,#27d7ff)] bg-clip-text text-transparent">control room.</span>
            </h1>
            <p className="text-sm text-[#9aa4c7]">Manage user accounts and monitor workspace membership.</p>
          </div>
          <div className="flex gap-6">
            <div className="glass-panel rounded-xl px-5 py-3">
              <strong className="block text-2xl font-extrabold text-[#f8f7ff]">{users.length}</strong>
              <span className="block text-[0.68rem] uppercase tracking-wider text-[#9aa4c7]">Total users</span>
            </div>
            <div className="glass-panel rounded-xl px-5 py-3 border-l-2 border-l-emerald-500">
              <strong className="block text-2xl font-extrabold text-[#f8f7ff]">{activeCount}</strong>
              <span className="block text-[0.68rem] uppercase tracking-wider text-[#9aa4c7]">Active users</span>
            </div>
          </div>
        </div>

        <div className="mb-4 flex gap-3 max-[600px]:flex-col">
          <input
            className="neon-input flex-1 p-3 text-sm"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search users by name, username, or email..."
          />
          <select
            className="neon-input w-auto min-w-[150px] p-3 text-sm"
            value={filter}
            onChange={(event) => setFilter(event.target.value as typeof filter)}
          >
            <option value="all">All statuses</option>
            <option value="active">Active only</option>
            <option value="disabled">Disabled only</option>
          </select>
        </div>

        <div className="overflow-hidden rounded-2xl border border-white/10 bg-white/[0.03] backdrop-blur-md max-[800px]:overflow-x-auto">
          <div className="grid min-w-[650px] grid-cols-[1.4fr_1.3fr_0.8fr_0.8fr] items-center gap-4 border-b border-white/10 px-5 py-3.5 text-[0.68rem] font-bold uppercase tracking-wider text-[#9aa4c7]">
            <span>User</span>
            <span>Email</span>
            <span>Status</span>
            <span>Joined</span>
          </div>

          {filteredUsers.map((user) => (
            <motion.div
              className="grid min-w-[650px] grid-cols-[1.4fr_1.3fr_0.8fr_0.8fr] items-center gap-4 border-b border-white/[0.06] px-5 py-3.5 text-xs transition-colors hover:bg-white/[0.02]"
              key={user.id}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              <div className="flex items-center gap-3">
                <span className="grid h-8 w-8 place-items-center rounded-full bg-violet-500/20 text-xs font-bold text-[#c4b5fd]">
                  {(user.name || user.username || 'U').charAt(0).toUpperCase()}
                </span>
                <div>
                  <b className="block font-semibold text-[#f8f7ff]">{user.name || user.username || 'Unnamed user'}</b>
                  {user.is_admin && (
                    <span className="text-[0.62rem] font-medium text-neon-cyan">Admin</span>
                  )}
                </div>
              </div>

              <span className="text-[#9aa4c7] truncate">{user.email || user.username || '—'}</span>

              <div>
                <span
                  className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[0.65rem] font-semibold ${
                    user.is_active === false
                      ? 'border border-rose-500/30 bg-rose-500/15 text-rose-300'
                      : 'border border-emerald-500/30 bg-emerald-500/15 text-emerald-300'
                  }`}
                >
                  <span
                    className={`h-1.5 w-1.5 rounded-full ${
                      user.is_active === false ? 'bg-rose-400' : 'bg-emerald-400'
                    }`}
                  />
                  {user.is_active === false ? 'Disabled' : 'Active'}
                </span>
              </div>

              <span className="text-[#9aa4c7]">
                {user.created_at ? new Date(user.created_at).toLocaleDateString() : '—'}
              </span>
            </motion.div>
          ))}

          {filteredUsers.length === 0 && (
            <div className="py-12 text-center text-sm text-[#9aa4c7]">
              No users match your search or filter.
            </div>
          )}
        </div>
      </section>
    </main>
  );
}
