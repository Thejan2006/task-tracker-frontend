'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
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
    if (localStorage.getItem('token')) router.replace('/dashboard');
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
      if (!response.ok) throw new Error('Invalid username or password');
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
    window.location.assign(`${API_URL}${GOOGLE_LOGIN_PATH}?redirect_uri=${encodeURIComponent(`${window.location.origin}/auth/callback`)}`);
  };

  return (
    <main className="grid min-h-screen grid-cols-2 bg-[radial-gradient(circle_at_20%_20%,rgba(139,92,246,0.2),transparent_35%),#080812] text-[#f8f7ff] max-[800px]:grid-cols-1">
      <section className="flex flex-col justify-between border-r border-white/10 p-[45px] max-[800px]:min-h-[240px] max-[800px]:p-7">
        <Link href="/" className="inline-flex items-center gap-2.5 text-[1.1rem] font-bold tracking-[-0.03em]"><span className="grid h-[29px] w-[29px] place-items-center rounded-[9px] bg-[linear-gradient(135deg,#8b5cf6,#c084fc)] text-white shadow-[0_0_22px_rgba(139,92,246,0.45)]">T</span><span>Taskflow</span></Link>
        <motion.h1 className="my-auto max-w-[450px] text-[clamp(3rem,5vw,5rem)] leading-[0.95] tracking-[-0.07em] max-[800px]:mt-[50px] max-[800px]:text-5xl" initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: .5 }}>
          Your best work starts with a little <span>clarity.</span>
        </motion.h1>
        <ThemeControls />
      </section>
      <section className="grid place-items-center p-[30px] max-[800px]:px-[18px] max-[800px]:py-[25px]">
        <motion.div className="w-full max-w-[390px] rounded-[18px] border border-white/10 bg-white/[0.04] p-[35px] backdrop-blur-[16px]" initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: .5, delay: .1 }}>
          <h1 className="mb-2 tracking-[-0.04em]">Welcome back</h1>
          <p className="mb-7 text-[0.85rem] text-[#9898ad]">Sign in to continue to your workspace.</p>
          {error && <div className="mb-[15px] rounded-lg bg-[rgba(239,68,68,0.12)] p-2.5 text-[0.78rem] text-[#fca5a5]">{error}</div>}
          <form onSubmit={handleLogin}>
            <label className="mb-4 block text-[0.75rem] text-[#9898ad]">Username<input className="mt-[7px] block w-full rounded-[9px] border border-white/10 bg-white/[0.045] px-3.5 py-[13px] text-[#f8f7ff] outline-none focus:border-[#8b5cf6] focus:ring-4 focus:ring-[rgba(139,92,246,0.16)]" type="text" placeholder="you@example.com" value={username} onChange={(event) => setUsername(event.target.value)} required disabled={isLoading} /></label>
            <label className="mb-4 block text-[0.75rem] text-[#9898ad]">Password<input className="mt-[7px] block w-full rounded-[9px] border border-white/10 bg-white/[0.045] px-3.5 py-[13px] text-[#f8f7ff] outline-none focus:border-[#8b5cf6] focus:ring-4 focus:ring-[rgba(139,92,246,0.16)]" type="password" placeholder="Your password" value={password} onChange={(event) => setPassword(event.target.value)} required disabled={isLoading} /></label>
            <button type="submit" className="mt-[7px] inline-flex w-full items-center justify-center gap-2.5 rounded-[10px] bg-[linear-gradient(135deg,#8b5cf6,#6d28d9)] px-5 py-3 text-[0.88rem] font-semibold text-white shadow-[0_8px_25px_rgba(139,92,246,0.25)] transition hover:-translate-y-0.5 disabled:opacity-60" disabled={isLoading}>{isLoading ? 'Signing in...' : 'Sign in'} <span>→</span></button>
          </form>
          <div className="my-6 flex items-center gap-3 text-[0.7rem] uppercase tracking-[0.14em] text-[#6f6f86]">
            <span className="h-px flex-1 bg-white/10" />or<span className="h-px flex-1 bg-white/10" />
          </div>
          <button type="button" onClick={handleGoogleLogin} className="inline-flex w-full items-center justify-center gap-3 rounded-[10px] border border-white/10 bg-white/[0.06] px-5 py-3 text-[0.88rem] font-semibold text-[#f8f7ff] transition hover:-translate-y-0.5 hover:bg-white/10">
            <span className="grid h-5 w-5 place-items-center rounded-full bg-white text-sm font-bold text-[#4285f4]">G</span>
            Continue with Google
          </button>
          <p className="mt-7 text-[0.8rem] text-[#9898ad]">New to Taskflow? <Link className="text-[#8b5cf6]" href="/users/create">Create an account</Link></p>
        </motion.div>
      </section>
    </main>
  );
}
