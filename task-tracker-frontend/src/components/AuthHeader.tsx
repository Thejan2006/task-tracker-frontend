'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { BrandLogo } from './BrandLogo';
import { ThemeControls } from './ThemeControls';

export function AuthHeader({ page }: { page: 'login' | 'register' }) {
  const isLogin = page === 'login';
  return <motion.header className="glass-panel absolute left-4 right-4 top-4 z-20 mx-auto flex h-16 max-w-[1180px] items-center rounded-2xl px-4 sm:px-5" initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: .4 }}><BrandLogo /><nav className="ml-10 hidden gap-6 text-sm text-[#9aa4c7] md:flex"><Link href="/" className="hover:text-neon-cyan">Home</Link><Link href="/about" className="hover:text-neon-cyan">About</Link><Link href="/pricing" className="hover:text-neon-cyan">Pricing</Link></nav><div className="ml-auto flex items-center gap-3"><ThemeControls /><span className="hidden text-xs text-[#9aa4c7] sm:inline">{isLogin ? 'New here?' : 'Already a member?'}</span><Link href={isLogin ? '/users/create' : '/login'} className={isLogin ? 'neon-button px-3.5 py-2 text-xs' : 'glass-button px-3.5 py-2 text-xs'}>{isLogin ? 'Create account' : 'Sign in'}</Link></div></motion.header>;
}
