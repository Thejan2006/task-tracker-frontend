'use client';

import { ChangeEvent, FormEvent, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ThemeControls } from '@/components/ThemeControls';
import Link from 'next/link';
import toast, { Toaster } from 'react-hot-toast';

interface Profile { id?: number; username?: string; email?: string; name?: string; full_name?: string; bio?: string; avatar_url?: string; }

export default function ProfilePage() {
  const router = useRouter();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [name, setName] = useState('');
  const [bio, setBio] = useState('');
  const [avatar, setAvatar] = useState<File | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) { router.replace('/login'); return; }
    fetch('http://localhost:8000/users/me', { headers: { Authorization: `Bearer ${token}` } })
      .then(async (response) => { if (response.status === 401) { localStorage.removeItem('token'); router.replace('/login'); return; } if (!response.ok) throw new Error('Profile endpoint is unavailable'); return response.json(); })
      .then((data) => { if (!data) return; setProfile(data); setName(data.name || data.full_name || ''); setBio(data.bio || ''); })
      .catch((error) => toast.error(error instanceof Error ? error.message : 'Could not load profile'))
      .finally(() => setLoading(false));
  }, [router]);

  const handleSave = async (event: FormEvent) => {
    event.preventDefault();
    const token = localStorage.getItem('token');
    if (!token) { router.replace('/login'); return; }
    setSaving(true);
    try {
      const form = new FormData();
      form.append('name', name);
      form.append('bio', bio);
      if (avatar) form.append('avatar', avatar);
      const response = await fetch('http://localhost:8000/users/me', { method: 'PUT', headers: { Authorization: `Bearer ${token}` }, body: form });
      if (response.status === 401) { localStorage.removeItem('token'); router.replace('/login'); return; }
      if (!response.ok) throw new Error('Could not save profile changes');
      setProfile(await response.json());
      toast.success('Profile updated');
    } catch (error) { toast.error(error instanceof Error ? error.message : 'Could not save profile'); } finally { setSaving(false); }
  };

  if (loading) return <div className="grid min-h-screen place-items-center bg-[#080812] text-[#9898ad]">Loading profile...</div>;
  return <main className="min-h-screen bg-[radial-gradient(circle_at_85%_0,rgba(139,92,246,0.13),transparent_28%),#080812] text-[#f8f7ff]"><Toaster position="top-right" /><header className="mx-auto flex h-[82px] max-w-[1180px] items-center justify-between border-b border-white/10 px-7"><Link href="/dashboard" className="inline-flex items-center gap-2.5 text-[1.1rem] font-bold"><span className="grid h-[29px] w-[29px] place-items-center rounded-[9px] bg-[linear-gradient(135deg,#8b5cf6,#c084fc)] text-white">T</span><span>Taskflow</span></Link><div className="ml-auto flex items-center gap-[15px]"><ThemeControls /><Link href="/dashboard" className="rounded-[10px] border border-white/10 bg-white/[0.04] px-3.5 py-[9px] text-[0.78rem]">Back to dashboard</Link></div></header><section className="mx-auto max-w-[1180px] px-7 pb-[100px] pt-[15px] max-[800px]:px-[18px]"><div className="pb-[35px] pt-[65px]"><span className="text-[0.68rem] font-bold uppercase tracking-[0.16em] text-[#b49aff]">Your workspace identity</span><h1 className="my-[22px] mb-5 text-[clamp(2.7rem,5vw,4.5rem)] tracking-[-0.075em]">Make it <span className="text-[#8b5cf6]">yours.</span></h1><p className="max-w-[510px] text-[1.08rem] leading-[1.7] text-[#9898ad]">Keep your profile details current so your team knows who is moving work forward.</p></div><form className="max-w-[620px] rounded-2xl border border-white/10 bg-white/[0.04] p-[30px] backdrop-blur-[14px]" onSubmit={handleSave}><div className="mb-3.5 grid h-20 w-20 place-items-center overflow-hidden rounded-[24px] bg-[rgba(139,92,246,0.16)] text-[2rem] font-bold text-[#8b5cf6]">{profile?.avatar_url ? <img className="h-full w-full object-cover" src={profile.avatar_url} alt="" /> : (name || profile?.username || 'U').charAt(0).toUpperCase()}</div><label className="relative mb-[25px] inline-flex items-center justify-center rounded-[10px] border border-white/10 bg-white/[0.04] px-3.5 py-[9px] text-[0.78rem]">Change photo<input className="absolute inset-0 cursor-pointer opacity-0" type="file" accept="image/*" onChange={(event: ChangeEvent<HTMLInputElement>) => setAvatar(event.target.files?.[0] || null)} /></label><div className="grid grid-cols-2 gap-x-3.5 max-[800px]:grid-cols-1"><label className="mb-4 block text-[0.75rem] text-[#9898ad]">Username<input className="mt-[7px] block w-full rounded-[9px] border border-white/10 bg-white/[0.045] px-3.5 py-[13px] text-[#f8f7ff]" value={profile?.username || ''} readOnly /></label><label className="mb-4 block text-[0.75rem] text-[#9898ad]">Name<input className="mt-[7px] block w-full rounded-[9px] border border-white/10 bg-white/[0.045] px-3.5 py-[13px] text-[#f8f7ff]" value={name} onChange={(event) => setName(event.target.value)} placeholder="Your name" /></label><label className="mb-4 block text-[0.75rem] text-[#9898ad]">Email<input className="mt-[7px] block w-full rounded-[9px] border border-white/10 bg-white/[0.045] px-3.5 py-[13px] text-[#f8f7ff]" value={profile?.email || ''} readOnly /></label><label className="col-span-full mb-4 block text-[0.75rem] text-[#9898ad] max-[800px]:col-span-1">About you<textarea className="mt-[7px] block w-full rounded-[9px] border border-white/10 bg-white/[0.045] px-3.5 py-[13px] text-[#f8f7ff]" value={bio} onChange={(event) => setBio(event.target.value)} placeholder="A short introduction" rows={4} /></label></div><button className="mt-2 inline-flex items-center justify-center gap-2.5 rounded-[10px] bg-[linear-gradient(135deg,#8b5cf6,#6d28d9)] px-5 py-3 font-semibold text-white" disabled={saving}>{saving ? 'Saving...' : 'Save changes'} <span>→</span></button></form></section></main>;
}
