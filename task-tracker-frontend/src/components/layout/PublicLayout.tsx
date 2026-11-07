'use client';

import Link from 'next/link';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ThemeControls } from '@/components/ThemeControls';

function GlassNavbar() {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <motion.header
      className="glass-card relative z-30 mx-auto mt-5 flex h-16 max-w-6xl items-center justify-between px-6"
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.4 }}
    >
      {/* Monochrome Brand Logo */}
      <Link href="/" className="flex items-center gap-2.5">
        <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-[var(--btn-primary-bg)] text-[var(--btn-primary-text)] font-extrabold text-xs shadow-xs">
          AZ
        </span>
        <span className="font-sans text-lg font-bold tracking-tight text-[var(--text-main)]">
          Organizo
        </span>
      </Link>

      {/* Desktop Navigation */}
      <nav className="hidden items-center gap-8 text-xs font-semibold text-[var(--text-muted)] md:flex" aria-label="Main navigation">
        <Link className="transition-colors hover:text-[var(--text-main)]" href="/about">About</Link>
        <Link className="transition-colors hover:text-[var(--text-main)]" href="/pricing">Pricing</Link>
        <Link className="transition-colors hover:text-[var(--text-main)]" href="/reviews">Reviews</Link>
      </nav>

      {/* Right Actions */}
      <div className="flex items-center gap-3">
        <ThemeControls />
        <Link href="/login" className="btn-ghost-mono text-xs hidden sm:inline-flex py-1.5 px-3.5">
          Sign in
        </Link>
        <Link href="/users/create" className="btn-primary-mono text-xs py-1.5 px-4">
          Get started
        </Link>

        {/* Mobile menu button */}
        <button
          className="flex h-9 w-9 items-center justify-center rounded-xl border border-[var(--card-border)] text-[var(--text-main)] md:hidden"
          onClick={() => setMobileOpen(!mobileOpen)}
          aria-label="Toggle menu"
        >
          {mobileOpen ? '✕' : '☰'}
        </button>
      </div>

      {/* Mobile Drawer */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            className="glass-card absolute left-0 right-0 top-[72px] z-50 mx-4 flex flex-col gap-1 p-4 md:hidden shadow-xl"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
          >
            {[{ href: '/about', label: 'About' }, { href: '/pricing', label: 'Pricing' }, { href: '/reviews', label: 'Reviews' }, { href: '/login', label: 'Sign in' }, { href: '/users/create', label: 'Create Account' }].map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMobileOpen(false)}
                className="rounded-xl px-4 py-2.5 text-xs font-semibold text-[var(--text-main)] hover:bg-[var(--active-highlight)] transition-colors"
              >
                {item.label}
              </Link>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  );
}

function GlassFooter() {
  return (
    <footer className="relative z-10 mx-auto flex max-w-6xl flex-col items-start justify-between gap-6 px-6 pb-12 pt-20 text-xs text-[var(--text-muted)] sm:flex-row sm:items-end">
      <div>
        <Link href="/" className="mb-2 flex items-center gap-2.5 text-base font-bold text-[var(--text-main)]">
          <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-[var(--btn-primary-bg)] text-[var(--btn-primary-text)] font-extrabold text-xs">
            AZ
          </span>
          <span>Organizo</span>
        </Link>
        <p className="text-[0.72rem]">High-contrast, focused, monochrome task management.</p>
      </div>
      <div className="flex gap-6 text-[0.72rem] font-semibold">
        <Link href="/about" className="hover:text-[var(--text-main)]">About</Link>
        <Link href="/pricing" className="hover:text-[var(--text-main)]">Pricing</Link>
        <Link href="/reviews" className="hover:text-[var(--text-main)]">Reviews</Link>
      </div>
      <span className="text-[0.7rem]">© 2026 Organizo. Clean black & white design.</span>
    </footer>
  );
}

export function Reveal({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y: 15 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.15 }}
      transition={{ duration: 0.45, ease: 'easeOut' }}
    >
      {children}
    </motion.div>
  );
}

export function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <main className="glass-page">
      <div className="relative z-10">
        <GlassNavbar />
        {children}
        <GlassFooter />
      </div>
    </main>
  );
}
