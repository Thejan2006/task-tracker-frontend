'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { ThemeControls } from './ThemeControls';

export function SiteHeader() {
  return (
    <motion.header
      className="relative z-[5] mx-auto flex h-[82px] max-w-[1240px] items-center gap-9 px-7 max-[800px]:gap-4 max-[800px]:px-[18px]"
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.45 }}
    >
      <Link href="/" className="inline-flex items-center gap-2.5 text-[1.1rem] font-bold tracking-[-0.03em]">
        <span className="grid h-[29px] w-[29px] place-items-center rounded-[9px] bg-[linear-gradient(135deg,#8b5cf6,#c084fc)] text-white shadow-[0_0_22px_rgba(139,92,246,0.45)]">T</span>
        <span>Taskflow</span>
      </Link>
      <nav className="flex gap-[26px] text-[0.88rem] text-[#9898ad] max-[800px]:hidden" aria-label="Main navigation">
        <Link className="transition-colors hover:text-[#f8f7ff]" href="/about">About</Link>
        <Link className="transition-colors hover:text-[#f8f7ff]" href="/pricing">Pricing</Link>
        <Link className="transition-colors hover:text-[#f8f7ff]" href="/reviews">Reviews</Link>
      </nav>
      <div className="ml-auto flex items-center gap-2.5">
        <ThemeControls />
        <Link href="/login" className="inline-flex items-center justify-center gap-2.5 rounded-[10px] border border-white/10 bg-white/[0.04] px-3.5 py-[9px] text-[0.78rem] font-semibold text-[#f8f7ff] transition hover:-translate-y-0.5 max-[800px]:hidden">Sign in</Link>
        <Link href="/login" className="inline-flex items-center justify-center gap-2.5 rounded-[10px] bg-[linear-gradient(135deg,#8b5cf6,#6d28d9)] px-3.5 py-[9px] text-[0.78rem] font-semibold text-white shadow-[0_8px_25px_rgba(139,92,246,0.25)] transition hover:-translate-y-0.5 hover:shadow-[0_12px_32px_rgba(139,92,246,0.4)]">Get started</Link>
      </div>
    </motion.header>
  );
}
