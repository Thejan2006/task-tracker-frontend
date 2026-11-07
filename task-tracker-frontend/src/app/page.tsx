'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { PublicLayout, Reveal } from '@/components/layout/PublicLayout';

const features = [
  {
    number: '01',
    title: 'Integrated Monthly Calendar',
    desc: 'Plan, view, and place tasks directly on calendar dates. Switch between timeline groups, kanban, and full-month views with a click.',
    tag: 'Calendar'
  },
  {
    number: '02',
    title: 'High-Contrast Monochrome UI',
    desc: 'Clean, distraction-free black and white aesthetic that looks sharp and stays 100% readable in both light and dark modes.',
    tag: 'Minimalist'
  },
  {
    number: '03',
    title: 'Live Task Velocity Tracking',
    desc: 'Keep track of real task execution duration with live timer widgets, clear completion states, and progress telemetry.',
    tag: 'Velocity'
  },
];

export default function Home() {
  const router = useRouter();
  const [checkingAuth, setCheckingAuth] = useState(true);

  useEffect(() => {
    if (localStorage.getItem('token')) {
      router.replace('/dashboard');
    } else {
      setCheckingAuth(false);
    }
  }, [router]);

  if (checkingAuth) {
    return (
      <div className="grid min-h-screen place-items-center bg-[var(--canvas-bg)] text-[var(--text-main)]">
        <div className="flex flex-col items-center gap-3">
          <div className="h-7 w-7 animate-spin rounded-full border-2 border-[var(--text-main)] border-t-transparent" />
          <span className="text-xs font-medium text-[var(--text-muted)]">Entering Organizo...</span>
        </div>
      </div>
    );
  }

  return (
    <PublicLayout>
      {/* ── HERO SECTION ───────────────────────────────────────── */}
      <section className="relative mx-auto max-w-6xl px-6 pt-16 pb-24 md:pt-24 md:pb-32">
        <div className="grid items-center gap-12 lg:grid-cols-[1.1fr_0.9fr]">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-[var(--card-border)] bg-[var(--card-bg)] px-3.5 py-1.5 text-xs font-semibold text-[var(--text-main)] shadow-xs">
              <span className="flex h-2 w-2 rounded-full bg-[var(--text-main)] animate-pulse" />
              Minimalist Black & White Task Tracker
            </div>

            <h1 className="mt-6 text-4xl font-extrabold tracking-tight sm:text-6xl text-[var(--text-main)] leading-[1.1]">
              Order and execution, <br className="hidden sm:inline" />
              pure and simple.
            </h1>

            <p className="mt-6 max-w-xl text-base leading-relaxed text-[var(--text-muted)]">
              Organizo gives teams a high-contrast, distraction-free space. Schedule tasks directly on an interactive calendar, track time, and keep your daily momentum focused.
            </p>

            <div className="mt-8 flex flex-wrap items-center gap-4">
              <Link href="/users/create" className="btn-primary-mono text-sm px-6 py-3">
                Get started free →
              </Link>
              <Link href="/login" className="btn-ghost-mono text-sm px-6 py-3">
                Sign in to workspace
              </Link>
            </div>

            <div className="mt-12 flex items-center gap-4 border-t border-[var(--card-border)] pt-8 text-xs text-[var(--text-muted)]">
              <span className="font-bold text-[var(--text-main)]">3,500+ professionals</span>
              <span>•</span>
              <span>Zero clutter</span>
              <span>•</span>
              <span>Dark & light contrast guaranteed</span>
            </div>
          </div>

          {/* ── MOCKUP PREVIEW ─────────────────────────────────────── */}
          <motion.div
            className="relative"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="glass-card p-6 shadow-2xl space-y-4">
              <div className="flex items-center justify-between border-b border-[var(--card-border)] pb-3">
                <div className="flex items-center gap-2">
                  <span className="h-6 w-6 rounded-lg bg-[var(--btn-primary-bg)] text-[var(--btn-primary-text)] flex items-center justify-center text-xs font-bold">
                    AZ
                  </span>
                  <span className="font-bold text-xs text-[var(--text-main)]">Organizo Calendar Preview</span>
                </div>
                <span className="pill-badge pill-medium text-[0.65rem]">Active Workspace</span>
              </div>

              {/* Sample Task Rows */}
              <div className="space-y-2">
                {[
                  { title: 'System architecture review', stage: 'In progress', priority: 'High', date: 'March 15' },
                  { title: 'Sprint backlog refinement', stage: 'In progress', priority: 'Medium', date: 'March 16' },
                  { title: 'Dashboard component refactor', stage: 'To Do', priority: 'Low', date: 'March 18' },
                ].map((item, i) => (
                  <div
                    key={i}
                    className="flex items-center justify-between p-3 rounded-xl bg-[var(--card-bg)] border border-[var(--card-border)] shadow-xs text-xs"
                  >
                    <div className="flex items-center gap-2.5">
                      <span className="h-4 w-4 rounded-full border border-[var(--card-border)] flex items-center justify-center text-[8px] font-bold">
                        ✓
                      </span>
                      <span className="font-semibold text-[var(--text-main)]">{item.title}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="pill-badge pill-stage text-[0.65rem]">{item.stage}</span>
                      <span className={`pill-badge ${item.priority === 'High' ? 'pill-high' : item.priority === 'Medium' ? 'pill-medium' : 'pill-low'} text-[0.65rem]`}>
                        {item.priority}
                      </span>
                      <span className="text-[0.68rem] text-[var(--text-muted)]">{item.date}</span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Mini Calendar Snippet */}
              <div className="p-3 rounded-xl bg-[var(--canvas-bg)] border border-[var(--card-border)] flex items-center justify-between text-xs">
                <span className="font-semibold text-[var(--text-main)]">📅 Click any date to place your task</span>
                <span className="pill-badge pill-high text-[0.65rem]">Calendar Ready</span>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── FEATURES SECTION ───────────────────────────────────── */}
      <section className="relative mx-auto max-w-6xl px-6 py-16">
        <Reveal className="text-center">
          <span className="eyebrow">Simplicity by Design</span>
          <h2 className="mt-3 text-3xl font-extrabold sm:text-5xl text-[var(--text-main)]">
            Focused features, no visual noise
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-sm text-[var(--text-muted)]">
            A balanced interface engineered with high-contrast monochrome design and integrated monthly calendar scheduling.
          </p>
        </Reveal>

        <div className="mt-14 grid gap-6 md:grid-cols-3">
          {features.map((f, i) => (
            <Reveal key={i}>
              <div className="glass-card flex h-full flex-col justify-between p-8">
                <div>
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-xs font-bold text-[var(--text-muted)]">{f.number}</span>
                    <span className="pill-badge pill-medium">{f.tag}</span>
                  </div>
                  <h3 className="mt-6 text-base font-bold text-[var(--text-main)]">{f.title}</h3>
                  <p className="mt-3 text-xs leading-relaxed text-[var(--text-muted)]">{f.desc}</p>
                </div>
                <div className="mt-6 flex items-center gap-1 text-xs font-semibold text-[var(--text-main)]">
                  <span>Explore feature →</span>
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* ── BOTTOM CTA ─────────────────────────────────────────── */}
      <section className="relative mx-auto max-w-6xl px-6 py-20">
        <Reveal>
          <div className="glass-card p-10 text-center sm:p-16 border border-[var(--card-border)]">
            <h2 className="text-3xl font-extrabold sm:text-5xl text-[var(--text-main)]">
              Bring clarity to your tasks today.
            </h2>
            <p className="mx-auto mt-4 max-w-lg text-xs sm:text-sm text-[var(--text-muted)]">
              Sign up in seconds and experience calm, high-contrast task tracking.
            </p>
            <div className="mt-8 flex justify-center">
              <Link href="/users/create" className="btn-primary-mono px-8 py-3.5 text-sm">
                Create Free Workspace →
              </Link>
            </div>
          </div>
        </Reveal>
      </section>
    </PublicLayout>
  );
}
