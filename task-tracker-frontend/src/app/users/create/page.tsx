'use client';

import Link from 'next/link';
import { FormEvent, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { ThemeControls } from '@/components/ThemeControls';

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
        body: JSON.stringify({
          username: username.trim(),
          email: email.trim(),
          password,
        }),
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
    <main className="glass-page flex min-h-screen items-center justify-center p-4 sm:p-6 text-[var(--text-main)]">
      {/* Top Bar */}
      <header className="fixed top-0 left-0 right-0 z-20 flex h-16 items-center justify-between px-6">
        <Link href="/" className="flex items-center gap-2.5">
          <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-[var(--btn-primary-bg)] text-[var(--btn-primary-text)] font-extrabold text-xs shadow-xs">
            AZ
          </span>
          <span className="font-sans text-lg font-bold text-[var(--text-main)]">
            Organizo
          </span>
        </Link>
        <div className="flex items-center gap-3">
          <ThemeControls />
          <Link href="/login" className="text-xs font-semibold text-[var(--text-muted)] hover:text-[var(--text-main)] transition-colors">
            Sign in →
          </Link>
        </div>
      </header>

      {/* Register Card */}
      <motion.div
        className="glass-card relative z-10 w-full max-w-lg p-8 sm:p-10 shadow-2xl"
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
      >
        <div className="text-center">
          <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-xl bg-[var(--btn-primary-bg)] text-[var(--btn-primary-text)] font-extrabold text-sm mb-4 shadow-xs">
            AZ
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-[var(--text-main)]">Create your account</h1>
          <p className="mt-1 text-xs text-[var(--text-muted)]">
            Start organizing your tasks with clean calendar scheduling. Free forever.
          </p>
        </div>

        {error && (
          <div className="mt-5 rounded-2xl border border-red-500/20 bg-red-500/10 p-3 text-xs text-red-600 dark:text-red-400">
            {error}
          </div>
        )}

        <form onSubmit={handleCreateUser} className="mt-6 space-y-4">
          <div>
            <label className="mb-1.5 block text-xs font-semibold text-[var(--text-muted)]">
              Username *
            </label>
            <input
              type="text"
              required
              minLength={3}
              disabled={isSubmitting}
              placeholder="e.g. alexvance"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="search-pill text-xs py-2.5 rounded-2xl"
            />
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-semibold text-[var(--text-muted)]">
              Email Address *
            </label>
            <input
              type="email"
              required
              disabled={isSubmitting}
              placeholder="you@company.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="search-pill text-xs py-2.5 rounded-2xl"
            />
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <label className="mb-1.5 block text-xs font-semibold text-[var(--text-muted)]">
                Password *
              </label>
              <input
                type="password"
                required
                minLength={8}
                disabled={isSubmitting}
                placeholder="8+ characters"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="search-pill text-xs py-2.5 rounded-2xl"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-semibold text-[var(--text-muted)]">
                Confirm Password *
              </label>
              <input
                type="password"
                required
                minLength={8}
                disabled={isSubmitting}
                placeholder="Repeat password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="search-pill text-xs py-2.5 rounded-2xl"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="btn-primary-mono w-full justify-center py-2.5 text-xs mt-3"
          >
            {isSubmitting ? 'Creating account...' : 'Create Account →'}
          </button>
        </form>

        <p className="mt-8 text-center text-xs text-[var(--text-muted)]">
          Already have an account?{' '}
          <Link href="/login" className="font-semibold text-[var(--text-main)] hover:underline">
            Sign in
          </Link>
        </p>
      </motion.div>
    </main>
  );
}
