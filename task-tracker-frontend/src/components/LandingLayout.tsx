'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { SiteHeader } from './SiteHeader';

export function Reveal({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y: 22 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.15 }}
      transition={{ duration: 0.55, ease: 'easeOut' }}
    >
      {children}
    </motion.div>
  );
}

export function LandingLayout({
  eyebrow,
  title,
  description,
  children,
}: {
  eyebrow: string;
  title: React.ReactNode;
  description: string;
  children: React.ReactNode;
}) {
  return (
    <main className="landing-shell">
      <SiteHeader />
      <section className="page-hero">
        <span className="eyebrow">{eyebrow}</span>
        <h1>{title}</h1>
        <p>{description}</p>
      </section>
      {children}
      <footer className="site-footer">
        <div>
          <Link href="/" className="brand"><span className="brand-mark">T</span><span>Taskflow</span></Link>
          <p>Make space for the work that matters.</p>
        </div>
        <span>© 2026 Taskflow. Built for focused teams.</span>
      </footer>
    </main>
  );
}
