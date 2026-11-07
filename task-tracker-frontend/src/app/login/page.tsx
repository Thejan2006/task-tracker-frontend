'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { ThemeControls } from '@/components/ThemeControls';

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8000';
const GOOGLE_LOGIN_PATH = process.env.NEXT_PUBLIC_GOOGLE_LOGIN_PATH ?? '/auth/google';

export default function LoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    if (localStorage.getItem('token')) {
      router.replace('/dashboard');
    }
  }, [router]);

  const handleLogin = async (event: React.FormEvent) => {
    event.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const formData = new URLSearchParams({ username, password });
      const response = await fetch(`${API_URL}/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Invalid username or password');
      }

      const data = await response.json();
      localStorage.setItem('token', data.access_token);
      router.push('/dashboard');
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : 'Unable to sign in');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = () => {
    window.location.assign(
      `${API_URL}${GOOGLE_LOGIN_PATH}?redirect_uri=${encodeURIComponent(`${window.location.origin}/auth/callback`)}`
    );
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
          <Link href="/users/create" className="text-xs font-semibold text-[var(--text-muted)] hover:text-[var(--text-main)] transition-colors">
            Register →
          </Link>
        </div>
      </header>

      {/* Login Card */}
      <motion.div
        className="glass-card relative z-10 w-full max-w-md p-8 sm:p-10 shadow-2xl"
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
      >
        <div className="text-center">
          <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-xl bg-[var(--btn-primary-bg)] text-[var(--btn-primary-text)] font-extrabold text-sm mb-4 shadow-xs">
            AZ
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-[var(--text-main)]">Welcome back</h1>
          <p className="mt-1 text-xs text-[var(--text-muted)]">
            Sign in to continue to your Organizo workspace.
          </p>
        </div>

        {error && (
          <div className="mt-5 rounded-2xl border border-red-500/20 bg-red-500/10 p-3 text-xs text-red-600 dark:text-red-400">
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="mt-6 space-y-4">
          <div>
            <label className="mb-1.5 block text-xs font-semibold text-[var(--text-muted)]">
              Username or Email
            </label>
            <input
              type="text"
              required
              disabled={isLoading}
              placeholder="you@example.com"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="search-pill text-xs py-2.5 rounded-2xl"
            />
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-semibold text-[var(--text-muted)]">
              Password
            </label>
            <input
              type="password"
              required
              disabled={isLoading}
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="search-pill text-xs py-2.5 rounded-2xl"
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="btn-primary-mono w-full justify-center py-2.5 text-xs mt-2"
          >
            {isLoading ? 'Signing in...' : 'Sign in to Organizo →'}
          </button>
        </form>

        <div className="my-6 flex items-center gap-3 text-xs text-[var(--text-subtle)]">
          <div className="h-px flex-1 bg-[var(--card-border)]" />
          <span>or</span>
          <div className="h-px flex-1 bg-[var(--card-border)]" />
        </div>

        <button
          type="button"
          onClick={handleGoogleLogin}
          className="btn-ghost-mono w-full justify-center gap-2.5 py-2 text-xs font-semibold"
        >
          <svg className="h-4 w-4" viewBox="0 0 24 24">
            <path fill="currentColor" d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 14h2v2h-2v-2zm0-10h2v8h-2V6z" />
          </svg>
          Google Authentication
        </button>

        <p className="mt-8 text-center text-xs text-[var(--text-muted)]">
          Don&apos;t have an account?{' '}
          <Link href="/users/create" className="font-semibold text-[var(--text-main)] hover:underline">
            Register now
          </Link>
        </p>
      </motion.div>
    </main>
  );
}
