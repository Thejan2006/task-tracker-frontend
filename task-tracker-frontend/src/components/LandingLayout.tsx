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
    <main className="neon-page grid-overlay overflow-hidden">
      <motion.video autoPlay muted loop playsInline preload="metadata" className="fixed inset-0 z-0 h-screen w-screen object-cover opacity-[0.22] mix-blend-screen" aria-hidden="true" initial={{ scale: 1.08, x: -12, y: -4 }} animate={{ scale: [1.08, 1.15, 1.08], x: [-12, 10, -12], y: [-4, 8, -4] }} transition={{ duration: 18, ease: 'easeInOut', repeat: Infinity }}>
        {/* Full-page ambient video: served directly from the public folder. */}
        <source src="/124825-731960032.mp4" type="video/mp4" />
      </motion.video>
      <SiteHeader />
      <section className="mx-auto max-w-[900px] px-7 pb-[55px] pt-[110px] text-center max-[480px]:pt-[70px]">
        <span className="eyebrow">{eyebrow}</span>
        <h1 className="mx-auto my-[22px] mb-5 max-w-[650px] text-[clamp(3rem,6vw,5rem)] leading-[0.98] tracking-[-0.075em] [&>span]:bg-[linear-gradient(90deg,#9b6cff,#27d7ff)] [&>span]:bg-clip-text [&>span]:text-transparent">{title}</h1>
        <p className="mx-auto max-w-[510px] text-[1.08rem] leading-[1.7] text-[#9898ad]">{description}</p>
      </section>
      {children}
      <footer className="mx-auto flex max-w-[1180px] items-end justify-between px-7 pb-10 text-[0.75rem] text-[#9898ad] max-[800px]:items-start max-[800px]:flex-col max-[800px]:gap-6">
        <div>
          <Link href="/" className="inline-flex items-center gap-2.5 text-[1.1rem] font-bold tracking-[-0.03em] text-[#f8f7ff]"><span className="grid h-9 w-9 place-items-center rounded-xl bg-[linear-gradient(135deg,#9b6cff,#27d7ff)] text-white shadow-neon">T</span><span>Taskflow</span></Link>
          <p>Make space for the work that matters.</p>
        </div>
        <span>© 2026 Taskflow. Built for focused teams.</span>
      </footer>
    </main>
  );
}
