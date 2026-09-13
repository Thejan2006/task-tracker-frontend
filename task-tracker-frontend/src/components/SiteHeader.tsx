'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { ThemeControls } from './ThemeControls';

export function SiteHeader() {
  return (
    <motion.header
      className="site-header"
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.45 }}
    >
      <Link href="/" className="brand">
        <span className="brand-mark">T</span>
        <span>Taskflow</span>
      </Link>
      <nav className="site-nav" aria-label="Main navigation">
        <Link href="/about">About</Link>
        <Link href="/pricing">Pricing</Link>
        <Link href="/reviews">Reviews</Link>
      </nav>
      <div className="header-actions">
        <ThemeControls />
        <Link href="/login" className="button button-small button-ghost">Sign in</Link>
        <Link href="/login" className="button button-small button-primary">Get started</Link>
      </div>
    </motion.header>
  );
}
