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

  if (loading) return <div className="auth-loading">Loading profile...</div>;
  return <main className="dashboard-shell min-h-screen"><Toaster position="top-right" /><header className="site-header profile-header"><Link href="/dashboard" className="brand"><span className="brand-mark">T</span><span>Taskflow</span></Link><div className="profile-header-actions"><ThemeControls /><Link href="/dashboard" className="button button-small button-ghost">Back to dashboard</Link></div></header><section className="profile-page"><div className="page-hero profile-hero"><span className="eyebrow">Your workspace identity</span><h1>Make it <span>yours.</span></h1><p>Keep your profile details current so your team knows who is moving work forward.</p></div><form className="profile-card" onSubmit={handleSave}><div className="profile-avatar">{profile?.avatar_url ? <img src={profile.avatar_url} alt="" /> : (name || profile?.username || 'U').charAt(0).toUpperCase()}</div><label className="button button-small button-ghost upload-button">Change photo<input type="file" accept="image/*" onChange={(event: ChangeEvent<HTMLInputElement>) => setAvatar(event.target.files?.[0] || null)} /></label><div className="profile-fields"><label className="field">Username<input value={profile?.username || ''} readOnly /></label><label className="field">Name<input value={name} onChange={(event) => setName(event.target.value)} placeholder="Your name" /></label><label className="field">Email<input value={profile?.email || ''} readOnly /></label><label className="field">About you<textarea value={bio} onChange={(event) => setBio(event.target.value)} placeholder="A short introduction" rows={4} /></label></div><button className="button button-primary" disabled={saving}>{saving ? 'Saving...' : 'Save changes'} <span>→</span></button></form></section></main>;
}
