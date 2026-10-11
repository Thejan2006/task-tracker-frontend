'use client';

import Link from 'next/link';
import { FormEvent, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { AuthHeader } from '@/components/AuthHeader';
import { BrandLogo } from '@/components/BrandLogo';

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8000';

function getErrorMessage(payload: unknown) {
  if (typeof payload === 'object' && payload !== null && 'detail' in payload) {
    const detail = payload.detail;
    if (typeof detail === 'string') return detail;
    if (Array.isArray(detail)) return 'Please check the form fields and try again.';
  }
  return 'We could not create your account. Please try again.';
}

export default function CreateUserPage() {
  const router = useRouter();
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleCreateUser = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await fetch(`${API_URL}/users/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: username.trim(), email: email.trim(), password }),
      });

      if (!response.ok) {
        let payload: unknown;
        try {
          payload = await response.json();
        } catch {
          throw new Error('We could not create your account. Please try again.');
        }
        throw new Error(getErrorMessage(payload));
      }

      router.push(`/verify-otp?email=${encodeURIComponent(email.trim())}`);
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : 'Unable to connect to the server.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="neon-page grid-overlay relative flex min-h-screen items-center justify-center overflow-hidden px-4 py-24">
      <AuthHeader page="register" />
      <motion.video autoPlay muted loop playsInline preload="metadata" className="fixed inset-0 z-0 h-screen w-screen object-cover opacity-[0.22] mix-blend-screen" aria-hidden="true" initial={{ scale: 1.08, x: -12, y: -4 }} animate={{ scale: [1.08, 1.15, 1.08], x: [-12, 10, -12], y: [-4, 8, -4] }} transition={{ duration: 18, ease: 'easeInOut', repeat: Infinity }}>
        {/* Full-page ambient video: served directly from the public folder. */}
        <source src="/124825-731960032.mp4" type="video/mp4" />
      </motion.video>
      <div className="absolute -left-24 -top-24 h-72 w-72 rounded-full bg-cyan-400/20 blur-3xl" />
      <div className="absolute -bottom-32 -right-20 h-96 w-96 rounded-full bg-blue-600/20 blur-3xl" />

      <div className="glass-panel relative grid w-full max-w-5xl overflow-hidden rounded-3xl lg:grid-cols-[0.9fr_1.1fr]">
        <section className="hidden bg-[radial-gradient(circle_at_20%_20%,rgba(39,215,255,.3),transparent_32%),linear-gradient(145deg,rgba(80,45,185,.82),rgba(8,20,54,.88))] p-10 text-white lg:flex lg:flex-col lg:justify-between">
          <div>
            <BrandLogo />
            <h1 className="mt-16 text-4xl font-bold leading-tight">Turn busy days into clear next steps.</h1>
            <p className="mt-5 max-w-sm text-blue-50">
              Organize tasks, group your work, and keep momentum with a workspace built for focus.
            </p>
          </div>
          <p className="text-sm text-blue-100">Simple planning. Better progress.</p>
        </section>

        <section className="bg-[rgba(7,12,32,.5)] p-7 sm:p-10">
          <div className="mb-8">
            <p className="eyebrow">Get started</p>
            <h2 className="mt-2 text-3xl font-bold tracking-tight text-white">Create your account</h2>
            <p className="mt-2 text-sm text-[#9aa4c7]">Join TaskFlow and start managing your work today.</p>
          </div>

          {error && <div className="mb-5 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">{error}</div>}

          <form onSubmit={handleCreateUser} className="space-y-4">
            <div>
              <label htmlFor="username" className="mb-1.5 block text-sm font-medium text-[#cbd3ee]">Username</label>
              <input id="username" value={username} onChange={(event) => setUsername(event.target.value)} required minLength={3} autoComplete="username" placeholder="e.g. alex" disabled={isSubmitting} className="neon-input px-4 py-3 disabled:opacity-60" />
            </div>
            <div>
              <label htmlFor="email" className="mb-1.5 block text-sm font-medium text-[#cbd3ee]">Email address</label>
              <input id="email" type="email" value={email} onChange={(event) => setEmail(event.target.value)} required autoComplete="email" placeholder="you@example.com" disabled={isSubmitting} className="neon-input px-4 py-3 disabled:opacity-60" />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label htmlFor="password" className="mb-1.5 block text-sm font-medium text-[#cbd3ee]">Password</label>
                <input id="password" type="password" value={password} onChange={(event) => setPassword(event.target.value)} required minLength={8} autoComplete="new-password" placeholder="8+ characters" disabled={isSubmitting} className="neon-input px-4 py-3 disabled:opacity-60" />
              </div>
              <div>
                <label htmlFor="confirm-password" className="mb-1.5 block text-sm font-medium text-[#cbd3ee]">Confirm password</label>
                <input id="confirm-password" type="password" value={confirmPassword} onChange={(event) => setConfirmPassword(event.target.value)} required minLength={8} autoComplete="new-password" placeholder="Repeat password" disabled={isSubmitting} className="neon-input px-4 py-3 disabled:opacity-60" />
              </div>
            </div>
            <button type="submit" disabled={isSubmitting} className="neon-button w-full px-4 py-3.5 disabled:cursor-not-allowed disabled:opacity-50">
              {isSubmitting ? 'Creating account...' : 'Create account'}
            </button>
          </form>

          <p className="mt-7 text-center text-sm text-[#9aa4c7]">
            Already have an account? <Link href="/login" className="font-semibold text-neon-cyan hover:text-white">Sign in</Link>
          </p>
        </section>
      </div>
    </main>
  );
}
