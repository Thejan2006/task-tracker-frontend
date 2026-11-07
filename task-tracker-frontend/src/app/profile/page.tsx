'use client';

import { ChangeEvent, FormEvent, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { OrganizoLayout } from '@/components/layout/OrganizoLayout';
import toast, { Toaster } from 'react-hot-toast';

interface Profile {
  id?: number;
  username?: string;
  email?: string;
  name?: string;
  full_name?: string;
  bio?: string;
  avatar_url?: string;
  is_admin?: boolean;
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

      setProfile(await response.json());
      toast.success('Profile updated successfully');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Could not save profile');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <OrganizoLayout activeNav="profile">
        <div className="grid h-96 place-items-center">
          <div className="flex flex-col items-center gap-2">
            <div className="h-7 w-7 animate-spin rounded-full border-2 border-[var(--text-main)] border-t-transparent" />
            <span className="text-xs text-[var(--text-muted)]">Loading profile...</span>
          </div>
        </div>
      </OrganizoLayout>
    );
  }

  return (
    <OrganizoLayout activeNav="profile">
      <Toaster position="top-right" />

      <div className="max-w-3xl space-y-6">
        <div>
          <span className="eyebrow">Settings</span>
          <h1 className="text-2xl font-bold tracking-tight text-[var(--text-main)]">
            Account & Profile
          </h1>
          <p className="mt-1 text-xs text-[var(--text-muted)]">
            Manage your personal identity, display name, and avatar.
          </p>
        </div>

        <div className="organizo-card p-6 sm:p-8">
          <form onSubmit={handleSave} className="space-y-6">
            {/* Avatar header */}
            <div className="flex flex-col sm:flex-row items-center gap-5">
              <div className="h-20 w-20 rounded-2xl flex items-center justify-center bg-[var(--canvas-bg)] border border-[var(--card-border)] text-2xl font-bold text-[var(--text-main)] shadow-xs overflow-hidden">
                {profile?.avatar_url ? (
                  <img className="h-full w-full object-cover" src={profile.avatar_url} alt="" />
                ) : (
                  (name || profile?.username || 'U').charAt(0).toUpperCase()
                )}
              </div>
              <div>
                <label className="btn-ghost-mono text-xs cursor-pointer">
                  <span>Change photo</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e: ChangeEvent<HTMLInputElement>) => setAvatar(e.target.files?.[0] || null)}
                    className="hidden"
                  />
                </label>
                <div className="mt-1.5 text-[0.68rem] text-[var(--text-subtle)]">
                  PNG, JPG or WebP up to 5MB.
                </div>
              </div>
            </div>

            {/* Form Fields */}
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-1 block text-xs font-semibold text-[var(--text-muted)]">
                  Username
                </label>
                <input
                  type="text"
                  value={profile?.username || ''}
                  readOnly
                  disabled
                  className="search-pill text-xs py-2.5 rounded-xl opacity-60 cursor-not-allowed"
                />
              </div>

              <div>
                <label className="mb-1 block text-xs font-semibold text-[var(--text-muted)]">
                  Email
                </label>
                <input
                  type="text"
                  value={profile?.email || ''}
                  readOnly
                  disabled
                  className="search-pill text-xs py-2.5 rounded-xl opacity-60 cursor-not-allowed"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="mb-1 block text-xs font-semibold text-[var(--text-muted)]">
                  Full Display Name
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Your full name"
                  className="search-pill text-xs py-2.5 rounded-xl"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="mb-1 block text-xs font-semibold text-[var(--text-muted)]">
                  About You / Bio
                </label>
                <textarea
                  rows={3}
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  placeholder="A brief bio..."
                  className="search-pill text-xs py-2.5 rounded-xl w-full"
                />
              </div>
            </div>

            <div className="flex justify-end pt-4 border-t border-[var(--card-border)]">
              <button
                type="submit"
                disabled={saving}
                className="btn-primary-mono text-xs"
              >
                {saving ? 'Saving...' : 'Save Profile Changes'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </OrganizoLayout>
  );
}
