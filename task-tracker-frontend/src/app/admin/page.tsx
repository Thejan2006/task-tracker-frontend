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
  if (loading) return <div className="grid min-h-screen place-items-center bg-[#080812] text-[#9898ad]">Checking admin access...</div>;
  if (forbidden) return <main className="grid min-h-screen place-items-center bg-[#080812] text-[#f8f7ff]"><div className="text-center"><span className="text-[0.68rem] font-bold uppercase tracking-[0.16em] text-[#b49aff]">403 Forbidden</span><h1 className="my-[18px] mb-2.5">Admin access required.</h1><p className="mb-[25px] text-[#9898ad]">Your account is not authorized to view this workspace.</p><Link href="/dashboard" className="inline-flex items-center justify-center rounded-[10px] bg-[linear-gradient(135deg,#8b5cf6,#6d28d9)] px-5 py-3 font-semibold text-white">Return to dashboard</Link></div></main>;
  return <main className="min-h-screen bg-[radial-gradient(circle_at_85%_0,rgba(139,92,246,0.13),transparent_28%),#080812] text-[#f8f7ff]"><Toaster position="top-right" /><header className="mx-auto flex h-[82px] max-w-[1180px] items-center justify-between border-b border-white/10 px-7"><Link href="/dashboard" className="inline-flex items-center gap-2.5 text-[1.1rem] font-bold"><span className="grid h-[29px] w-[29px] place-items-center rounded-[9px] bg-[linear-gradient(135deg,#8b5cf6,#c084fc)] text-white">T</span><span>Taskflow</span></Link><div className="ml-auto flex items-center gap-[15px]"><ThemeControls /><Link href="/dashboard" className="rounded-[10px] border border-white/10 bg-white/[0.04] px-3.5 py-[9px] text-[0.78rem]">Dashboard</Link></div></header><section className="mx-auto max-w-[1180px] px-7 pb-[100px] pt-[15px] max-[800px]:px-[18px]"><div className="flex items-end justify-between pb-[35px] pt-[65px] max-[800px]:flex-col max-[800px]:items-start max-[800px]:gap-[25px]"><div><span className="text-[0.68rem] font-bold uppercase tracking-[0.16em] text-[#b49aff]">Restricted workspace</span><h1 className="my-[13px] text-[clamp(2.7rem,5vw,4.5rem)] leading-none tracking-[-0.07em]">Admin <span className="text-[#8b5cf6]">control room.</span></h1><p className="text-[#9898ad]">Manage accounts and monitor workspace health.</p></div><div className="flex gap-[30px]"><div><strong className="block text-[2rem]">{users.length}</strong><span className="block text-[0.7rem] text-[#9898ad]">Total users</span></div><div><strong className="block text-[2rem]">{activeCount}</strong><span className="block text-[0.7rem] text-[#9898ad]">Active users</span></div></div></div><div className="mb-[15px] flex gap-2.5"><input className="flex-1 rounded-[9px] border border-white/10 bg-white/[0.04] px-3.5 py-3 text-[#f8f7ff] outline-none" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search users..." /><select className="rounded-[9px] border border-white/10 bg-white/[0.04] px-3.5 text-[#f8f7ff]" value={filter} onChange={(event) => setFilter(event.target.value as typeof filter)}><option value="all">All users</option><option value="active">Active</option><option value="disabled">Disabled</option></select></div><div className="overflow-hidden rounded-[14px] border border-white/10 bg-white/[0.04] max-[800px]:overflow-x-auto"><div className="grid min-w-[650px] grid-cols-[1.4fr_1.3fr_0.8fr_0.8fr] items-center gap-[15px] border-b border-white/10 px-[18px] py-[15px] text-[0.66rem] uppercase tracking-[0.08em] text-[#9898ad]"><span>User</span><span>Email</span><span>Status</span><span>Joined</span></div>{filteredUsers.map((user) => <motion.div className="grid min-w-[650px] grid-cols-[1.4fr_1.3fr_0.8fr_0.8fr] items-center gap-[15px] border-b border-white/10 px-[18px] py-[15px] text-[0.76rem]" key={user.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }}><div className="flex items-center gap-2.5"><span className="grid h-7 w-7 place-items-center rounded-full bg-[rgba(139,92,246,0.16)] text-[0.7rem] text-[#8b5cf6]">{(user.name || user.username || 'U').charAt(0).toUpperCase()}</span><b>{user.name || user.username || 'Unnamed user'}</b></div><span>{user.email || user.username || '—'}</span><span className={user.is_active === false ? 'text-rose-400' : 'text-green-400'}>{user.is_active === false ? 'Disabled' : 'Active'}</span><span>{user.created_at ? new Date(user.created_at).toLocaleDateString() : '—'}</span></motion.div>)}{filteredUsers.length === 0 && <div className="p-[45px] text-center text-[#9898ad]">No users match this search.</div>}</div></section></main>;
}
