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
    <main className="min-h-screen overflow-hidden bg-[radial-gradient(circle_at_78%_8%,rgba(139,92,246,0.14),transparent_28%),radial-gradient(circle_at_10%_42%,rgba(6,182,212,0.08),transparent_25%),#080812] text-[#f8f7ff]">
      <SiteHeader />
      <section className="mx-auto max-w-[900px] px-7 pb-[55px] pt-[110px] text-center max-[480px]:pt-[70px]">
        <span className="text-[0.68rem] font-bold uppercase tracking-[0.16em] text-[#b49aff]">{eyebrow}</span>
        <h1 className="mx-auto my-[22px] mb-5 max-w-[650px] text-[clamp(3rem,6vw,5rem)] leading-[0.98] tracking-[-0.075em] [&>span]:text-[#8b5cf6]">{title}</h1>
        <p className="mx-auto max-w-[510px] text-[1.08rem] leading-[1.7] text-[#9898ad]">{description}</p>
      </section>
      {children}
      <footer className="mx-auto flex max-w-[1180px] items-end justify-between px-7 pb-10 text-[0.75rem] text-[#9898ad] max-[800px]:items-start max-[800px]:flex-col max-[800px]:gap-6">
        <div>
          <Link href="/" className="inline-flex items-center gap-2.5 text-[1.1rem] font-bold tracking-[-0.03em] text-[#f8f7ff]"><span className="grid h-[29px] w-[29px] place-items-center rounded-[9px] bg-[linear-gradient(135deg,#8b5cf6,#c084fc)] text-white shadow-[0_0_22px_rgba(139,92,246,0.45)]">T</span><span>Taskflow</span></Link>
          <p>Make space for the work that matters.</p>
        </div>
        <span>© 2026 Taskflow. Built for focused teams.</span>
      </footer>
    </main>
  );
}
