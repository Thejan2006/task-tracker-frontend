'use client';

import Link from 'next/link';
import { FormEvent, useState } from 'react';
import { useRouter } from 'next/navigation';

const API_URL = 'http://localhost:8000';

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

      router.push('/login?registered=true');
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : 'Unable to connect to the server.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-slate-950 px-4 py-10">
      <div className="absolute -left-24 -top-24 h-72 w-72 rounded-full bg-cyan-400/20 blur-3xl" />
      <div className="absolute -bottom-32 -right-20 h-96 w-96 rounded-full bg-blue-600/20 blur-3xl" />

      <div className="relative grid w-full max-w-5xl overflow-hidden rounded-3xl border border-white/10 bg-white shadow-2xl lg:grid-cols-[0.9fr_1.1fr]">
        <section className="hidden bg-gradient-to-br from-blue-700 to-cyan-500 p-10 text-white lg:flex lg:flex-col lg:justify-between">
          <div>
            <Link href="/" className="text-sm font-bold uppercase tracking-[0.25em]">TaskFlow</Link>
            <h1 className="mt-16 text-4xl font-bold leading-tight">Turn busy days into clear next steps.</h1>
            <p className="mt-5 max-w-sm text-blue-50">
              Organize tasks, group your work, and keep momentum with a workspace built for focus.
            </p>
          </div>
          <p className="text-sm text-blue-100">Simple planning. Better progress.</p>
        </section>

        <section className="p-7 sm:p-10">
          <div className="mb-8">
            <p className="text-sm font-semibold uppercase tracking-wider text-blue-600">Get started</p>
            <h2 className="mt-2 text-3xl font-bold tracking-tight text-slate-900">Create your account</h2>
            <p className="mt-2 text-sm text-slate-500">Join TaskFlow and start managing your work today.</p>
          </div>

          {error && <div className="mb-5 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">{error}</div>}

          <form onSubmit={handleCreateUser} className="space-y-4">
            <div>
              <label htmlFor="username" className="mb-1.5 block text-sm font-medium text-slate-700">Username</label>
              <input id="username" value={username} onChange={(event) => setUsername(event.target.value)} required minLength={3} autoComplete="username" placeholder="e.g. alex" disabled={isSubmitting} className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 outline-none transition focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/10 disabled:opacity-60" />
            </div>
            <div>
              <label htmlFor="email" className="mb-1.5 block text-sm font-medium text-slate-700">Email address</label>
              <input id="email" type="email" value={email} onChange={(event) => setEmail(event.target.value)} required autoComplete="email" placeholder="you@example.com" disabled={isSubmitting} className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 outline-none transition focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/10 disabled:opacity-60" />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label htmlFor="password" className="mb-1.5 block text-sm font-medium text-slate-700">Password</label>
                <input id="password" type="password" value={password} onChange={(event) => setPassword(event.target.value)} required minLength={8} autoComplete="new-password" placeholder="8+ characters" disabled={isSubmitting} className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 outline-none transition focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/10 disabled:opacity-60" />
              </div>
              <div>
                <label htmlFor="confirm-password" className="mb-1.5 block text-sm font-medium text-slate-700">Confirm password</label>
                <input id="confirm-password" type="password" value={confirmPassword} onChange={(event) => setConfirmPassword(event.target.value)} required minLength={8} autoComplete="new-password" placeholder="Repeat password" disabled={isSubmitting} className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 outline-none transition focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/10 disabled:opacity-60" />
              </div>
            </div>
            <button type="submit" disabled={isSubmitting} className="w-full rounded-xl bg-blue-600 px-4 py-3.5 font-semibold text-white shadow-lg shadow-blue-600/20 transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-blue-300">
              {isSubmitting ? 'Creating account...' : 'Create account'}
            </button>
          </form>

          <p className="mt-7 text-center text-sm text-slate-500">
            Already have an account? <Link href="/login" className="font-semibold text-blue-600 hover:text-blue-700">Sign in</Link>
          </p>
        </section>
      </div>
    </main>
  );
}
