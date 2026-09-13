'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { ThemeControls } from '@/components/ThemeControls';

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
      const response = await fetch('http://localhost:8000/login', { method: 'POST', headers: { 'Content-Type': 'application/x-www-form-urlencoded' }, body: formData });
      if (!response.ok) throw new Error('Invalid username or password');
      const data = await response.json();
      localStorage.setItem('token', data.access_token);
      router.push('/dashboard');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to sign in');
    } finally {
      setIsLoading(false);
    }
  };

  return <main className="login-shell"><section className="login-art"><Link href="/" className="brand"><span className="brand-mark">T</span><span>Taskflow</span></Link><motion.h1 initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: .5 }}>Your best work starts with a little <span>clarity.</span></motion.h1><ThemeControls /></section><section className="login-form-wrap"><motion.div className="login-card" initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: .5, delay: .1 }}><h1>Welcome back</h1><p>Sign in to continue to your workspace.</p>{error && <div className="error-message">{error}</div>}<form onSubmit={handleLogin}><label className="field">Username<input type="text" placeholder="you@example.com" value={username} onChange={(e) => setUsername(e.target.value)} required disabled={isLoading} /></label><label className="field">Password<input type="password" placeholder="Your password" value={password} onChange={(e) => setPassword(e.target.value)} required disabled={isLoading} /></label><button type="submit" className="button button-primary" disabled={isLoading}>{isLoading ? 'Signing in...' : 'Sign in'} <span>→</span></button></form><p className="login-footer">New to Taskflow? <Link href="/">Explore the product</Link></p></motion.div></section></main>;
}
