'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { ThemeControls } from './ThemeControls';
import { BrandLogo } from './BrandLogo';

export function SiteHeader() {
  return (
    <motion.header
      className="glass-panel relative z-[5] mx-auto mt-4 flex h-[66px] max-w-[1200px] items-center gap-9 rounded-2xl px-5 max-[800px]:mx-3 max-[800px]:gap-4 max-[800px]:px-4"
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.45 }}
    >
      <BrandLogo />
      <nav className="flex gap-[26px] text-[0.88rem] text-[#9898ad] max-[800px]:hidden" aria-label="Main navigation">
        <Link className="transition-colors hover:text-neon-cyan" href="/about">About</Link>
        <Link className="transition-colors hover:text-neon-cyan" href="/pricing">Pricing</Link>
        <Link className="transition-colors hover:text-neon-cyan" href="/reviews">Reviews</Link>
      </nav>
      <div className="ml-auto flex items-center gap-2.5">
        <ThemeControls />
        <Link href="/login" className="glass-button px-3.5 py-2 text-[0.78rem] font-semibold max-[800px]:hidden">Sign in</Link>
        <Link href="/login" className="neon-button px-3.5 py-2 text-[0.78rem]">Get started</Link>
      </div>
    </motion.header>
  );
}
