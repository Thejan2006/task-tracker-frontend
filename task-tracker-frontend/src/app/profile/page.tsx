'use client';

import { ChangeEvent, FormEvent, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ThemeControls } from '@/components/ThemeControls';
import { BrandLogo } from '@/components/BrandLogo';
import Link from 'next/link';
import toast, { Toaster } from 'react-hot-toast';

interface Profile {
  id?: number;
  username?: string;
  email?: string;
  name?: string;
  full_name?: string;
  bio?: string;
  avatar_url?: string;
}

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
    if (!token) {
      router.replace('/login');
      return;
    }
    fetch('http://localhost:8000/users/me', { headers: { Authorization: `Bearer ${token}` } })
      .then(async (response) => {
        if (response.status === 401) {
          localStorage.removeItem('token');
          router.replace('/login');
          return;
        }
        if (!response.ok) throw new Error('Profile endpoint is unavailable');
        return response.json();
      })
      .then((data) => {
        if (!data) return;
        setProfile(data);
        setName(data.name || data.full_name || '');
        setBio(data.bio || '');
      })
      .catch((error) => toast.error(error instanceof Error ? error.message : 'Could not load profile'))
      .finally(() => setLoading(false));
  }, [router]);

  const handleSave = async (event: FormEvent) => {
    event.preventDefault();
    const token = localStorage.getItem('token');
    if (!token) {
      router.replace('/login');
      return;
    }
    setSaving(true);
    try {
      const form = new FormData();
      form.append('name', name);
      form.append('bio', bio);
      if (avatar) form.append('avatar', avatar);

      const response = await fetch('http://localhost:8000/users/me', {
        method: 'PUT',
        headers: { Authorization: `Bearer ${token}` },
        body: form,
      });

      if (response.status === 401) {
        localStorage.removeItem('token');
        router.replace('/login');
        return;
      }
      if (!response.ok) throw new Error('Could not save profile changes');

      const updated = await response.json();
      setProfile(updated);
      toast.success('Profile updated successfully');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Could not save profile');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="neon-page grid min-h-screen place-items-center">
        <div className="glass-panel animate-pulse rounded-2xl px-9 py-8 text-center">
          <div className="mx-auto mb-4 h-9 w-9 rounded-full border-2 border-neon-cyan/20 border-t-neon-cyan animate-spin" />
          <p className="text-sm font-medium text-[#9aa4c7]">Loading your profile...</p>
        </div>
      </div>
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
            Back to dashboard
          </Link>
        </div>
      </header>

      <section className="mx-auto max-w-[1180px] px-7 pb-24 pt-10 max-[800px]:px-4">
        <div className="pb-8 pt-4">
          <span className="eyebrow">Your workspace identity</span>
          <h1 className="my-3 text-[clamp(2.4rem,5vw,4rem)] font-bold tracking-tight text-[#f8f7ff]">
            Make it <span className="bg-[linear-gradient(90deg,#9b6cff,#27d7ff)] bg-clip-text text-transparent">yours.</span>
          </h1>
          <p className="max-w-[510px] text-sm text-[#9aa4c7] leading-relaxed">
            Keep your profile details current so your team knows who is moving work forward.
          </p>
        </div>

        <form className="glass-panel max-w-[620px] rounded-2xl p-7 max-[480px]:p-5" onSubmit={handleSave}>
          <div className="mb-4 flex items-center gap-4">
            <div className="grid h-20 w-20 place-items-center overflow-hidden rounded-2xl border border-white/20 bg-gradient-to-br from-violet-600/30 to-cyan-500/20 text-2xl font-bold text-[#c4b5fd] shadow-lg">
              {profile?.avatar_url ? (
                <img className="h-full w-full object-cover" src={profile.avatar_url} alt="" />
              ) : (
                (name || profile?.username || 'U').charAt(0).toUpperCase()
              )}
            </div>

            <label className="glass-button relative cursor-pointer px-4 py-2 text-xs font-semibold">
              Change photo
              <input
                className="absolute inset-0 cursor-pointer opacity-0"
                type="file"
                accept="image/*"
                onChange={(event: ChangeEvent<HTMLInputElement>) => setAvatar(event.target.files?.[0] || null)}
              />
            </label>
          </div>

          <div className="grid grid-cols-2 gap-4 max-[800px]:grid-cols-1">
            <div>
              <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-[#cbd3ee]">
                Username
              </label>
              <input
                className="neon-input p-3 text-sm opacity-70 cursor-not-allowed"
                value={profile?.username || ''}
                readOnly
              />
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-[#cbd3ee]">
                Display Name
              </label>
              <input
                className="neon-input p-3 text-sm"
                value={name}
                onChange={(event) => setName(event.target.value)}
                placeholder="Your name"
              />
            </div>

            <div className="col-span-full">
              <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-[#cbd3ee]">
                Email
              </label>
              <input
                className="neon-input p-3 text-sm opacity-70 cursor-not-allowed"
                value={profile?.email || ''}
                readOnly
              />
            </div>

            <div className="col-span-full">
              <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-[#cbd3ee]">
                About you
              </label>
              <textarea
                className="neon-input p-3 text-sm"
                value={bio}
                onChange={(event) => setBio(event.target.value)}
                placeholder="A short introduction about your role"
                rows={4}
              />
            </div>
          </div>

          <div className="mt-6 flex justify-end">
            <button
              type="submit"
              className="neon-button px-6 py-2.5 text-sm font-semibold disabled:opacity-50"
              disabled={saving}
            >
              {saving ? 'Saving...' : 'Save changes'} <span>→</span>
            </button>
          </div>
        </form>
      </section>
    </main>
  );
}
