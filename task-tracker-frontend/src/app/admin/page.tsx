'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { OrganizoLayout } from '@/components/layout/OrganizoLayout';
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
  const token = typeof window === 'undefined' ? null : localStorage.getItem('token');

  useEffect(() => {
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
  }, [router, token]);

  const filteredUsers = useMemo(() => {
    return users.filter((user) => {
      const matches = `${user.username || ''} ${user.email || ''} ${user.name || ''}`
        .toLowerCase()
        .includes(query.toLowerCase());
      return (
        matches &&
        (filter === 'all' ||
          (filter === 'active' && user.is_active !== false) ||
          (filter === 'disabled' && user.is_active === false))
      );
    });
  }, [users, query, filter]);

  const activeCount = users.filter((user) => user.is_active !== false).length;

  if (loading) {
    return (
      <OrganizoLayout activeNav="admin">
        <div className="grid h-96 place-items-center">
          <div className="flex flex-col items-center gap-2">
            <div className="h-7 w-7 animate-spin rounded-full border-2 border-[var(--text-main)] border-t-transparent" />
            <span className="text-xs text-[var(--text-muted)]">Checking permissions...</span>
          </div>
        </div>
      </OrganizoLayout>
    );
  }

  if (forbidden) {
    return (
      <OrganizoLayout>
        <div className="organizo-card mx-auto max-w-md p-8 text-center my-12">
          <span className="eyebrow">403 Restricted</span>
          <h2 className="mt-2 text-xl font-bold text-[var(--text-main)]">Admin Access Required</h2>
          <p className="mt-2 text-xs text-[var(--text-muted)] leading-relaxed">
            Your current account does not have authorization to view the administration panel.
          </p>
          <div className="mt-6">
            <Link href="/dashboard" className="btn-primary-mono text-xs">
              Return to Workspace
            </Link>
          </div>
        </div>
      </OrganizoLayout>
    );
  }

  return (
    <OrganizoLayout activeNav="admin">
      <Toaster position="top-right" />

      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <span className="eyebrow">Administration</span>
            <h1 className="text-2xl font-bold tracking-tight text-[var(--text-main)]">
              Team & Users
            </h1>
            <p className="mt-1 text-xs text-[var(--text-muted)]">
              Manage workspace accounts and authorization.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="organizo-card px-4 py-2 text-center">
              <span className="text-[0.65rem] text-[var(--text-muted)] uppercase tracking-wider block">Total</span>
              <span className="text-base font-bold text-[var(--text-main)]">{users.length}</span>
            </div>
            <div className="organizo-card px-4 py-2 text-center">
              <span className="text-[0.65rem] text-[var(--text-muted)] uppercase tracking-wider block">Active</span>
              <span className="text-base font-bold text-[var(--text-main)]">{activeCount}</span>
            </div>
          </div>
        </div>

        {/* Filter Bar */}
        <div className="organizo-card p-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <input
              type="text"
              placeholder="Search by username, name, or email..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="search-pill text-xs py-2 rounded-xl flex-1"
            />
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value as typeof filter)}
              className="search-pill text-xs py-2 rounded-xl sm:max-w-[180px]"
            >
              <option value="all">All Members ({users.length})</option>
              <option value="active">Active Members ({activeCount})</option>
              <option value="disabled">Disabled ({users.length - activeCount})</option>
            </select>
          </div>
        </div>

        {/* Table */}
        <div className="organizo-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-[var(--card-border)] bg-[var(--canvas-bg)] text-[0.68rem] uppercase tracking-wider text-[var(--text-subtle)]">
                <tr>
                  <th className="px-5 py-3.5">User</th>
                  <th className="px-5 py-3.5">Email</th>
                  <th className="px-5 py-3.5">Role</th>
                  <th className="px-5 py-3.5">Status</th>
                  <th className="px-5 py-3.5">Joined</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--card-border)]">
                {filteredUsers.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-5 py-12 text-center text-xs text-[var(--text-muted)]">
                      No members found matching this search.
                    </td>
                  </tr>
                ) : (
                  filteredUsers.map((user) => (
                    <tr key={user.id} className="hover:bg-[var(--canvas-bg)] transition-colors">
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-3">
                          <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-[var(--active-highlight)] border border-[var(--card-border)] text-xs font-bold text-[var(--text-main)]">
                            {(user.name || user.username || 'U').charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <div className="font-semibold text-[var(--text-main)]">
                              {user.name || user.username || 'Unnamed'}
                            </div>
                            <div className="text-[0.68rem] text-[var(--text-subtle)]">@{user.username}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-3.5 text-[var(--text-muted)]">{user.email || '—'}</td>
                      <td className="px-5 py-3.5">
                        {user.is_admin ? (
                          <span className="pill-badge pill-high">Admin</span>
                        ) : (
                          <span className="pill-badge pill-low">Member</span>
                        )}
                      </td>
                      <td className="px-5 py-3.5">
                        <span
                          className={`pill-badge ${
                            user.is_active === false ? 'pill-low text-red-500' : 'pill-medium'
                          }`}
                        >
                          {user.is_active === false ? 'Disabled' : 'Active'}
                        </span>
                      </td>
                      <td className="px-5 py-3.5 text-[var(--text-subtle)]">
                        {user.created_at ? new Date(user.created_at).toLocaleDateString() : '—'}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </OrganizoLayout>
  );
}
