'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { SiteHeader } from '@/components/SiteHeader';
import { Reveal } from '@/components/LandingLayout';

const features = [
  ['01', 'One calm workspace', 'Bring tasks, priorities, and progress into one focused view.'],
  ['02', 'Momentum, measured', 'See what is moving and what needs your attention without the noise.'],
  ['03', 'Made for humans', 'Thoughtful defaults help your team do its best work every day.'],
];

export default function Home() {
  const router = useRouter();
  const [checkingAuth, setCheckingAuth] = useState(true);

  useEffect(() => {
    if (localStorage.getItem('token')) router.replace('/dashboard');
    else setCheckingAuth(false);
  }, [router]);

  if (checkingAuth) return <div className="auth-loading">Loading Taskflow...</div>;

  return (
    <div className="landing-shell">
      <SiteHeader />
      <section className="hero-grid">
        <div className="hero-copy">
          <span className="eyebrow">The operating system for momentum</span>
          <h1>Make progress <span>feel effortless.</span></h1>
          <p>Taskflow gives ambitious teams a beautiful, focused space to plan clearly, collaborate deeply, and ship their best work.</p>
          <div className="hero-actions">
            <Link href="/users/create" className="button button-primary">Start for free <span>→</span></Link>
            <Link href="/login" className="text-link">Sign in <span>↗</span></Link>
          </div>
          <div className="social-proof"><div className="avatar-stack"><i>A</i><i>M</i><i>J</i><i>+</i></div><span>Trusted by 2,000+ focused teams</span></div>
        </div>
        <motion.div className="hero-visual" initial={{ opacity: 0, scale: .95 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: .7 }}>
          <div className="orb orb-one" /><div className="orb orb-two" />
          <div className="preview-window"><div className="preview-top"><span className="window-dots">● ● ●</span><span>My workspace</span><span>•••</span></div><div className="preview-content"><div className="preview-sidebar"><b>Workspace</b><span className="active">Overview</span><span>My tasks</span><span>Projects</span><span>Insights</span></div><div className="preview-main"><small>MONDAY, SEPTEMBER 14</small><h3>Good morning, Alex <span>✦</span></h3><p>Here&apos;s what&apos;s moving today.</p><div className="mini-cards"><div><strong>12</strong><span>In progress</span></div><div><strong>84%</strong><span>On track</span></div></div><div className="progress-card"><span>This week&apos;s focus</span><b>84%</b><div className="progress-bar"><i /></div></div></div></div></div>
        </motion.div>
      </section>
      <section className="feature-section"><Reveal><span className="eyebrow">Less managing. More making.</span><h2>Everything your team needs<br /><span>to move as one.</span></h2></Reveal><div className="feature-grid">{features.map(([number, title, text]) => <Reveal key={number} className="feature-card"><span className="feature-number">{number}</span><h3>{title}</h3><p>{text}</p><span className="feature-arrow">↗</span></Reveal>)}</div></section>
      <section className="cta-section"><Reveal><h2>Ready to find your flow?</h2><p>Join thousands of teams building their next big thing with less friction.</p><Link href="/users/create" className="button button-primary">Get started free <span>→</span></Link></Reveal></section>
      <footer className="site-footer"><div><Link href="/" className="brand"><span className="brand-mark">T</span><span>Taskflow</span></Link><p>Make space for the work that matters.</p></div><span>© 2026 Taskflow. Built for focused teams.</span></footer>
    </div>
  );
}
