'use client';

import Link from 'next/link';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { AnimatePresence, motion } from 'framer-motion';
import { ThemeControls } from '@/components/ThemeControls';
import toast from 'react-hot-toast';

export interface UrgentNotificationItem {
  id: number;
  title: string;
  due_date?: string | null;
  priority?: string | null;
  label: string;
}

export function OrganizoLayout({
  children,
  activeNav = 'dashboard',
  onNewTaskClick,
  searchTerm = '',
  onSearchChange,
  urgentTasks = [],
}: {
  children: React.ReactNode;
  activeNav?: 'dashboard' | 'tasks' | 'profile' | 'admin';
  onNewTaskClick?: () => void;
  searchTerm?: string;
  onSearchChange?: (val: string) => void;
  urgentTasks?: UrgentNotificationItem[];
}) {
  const router = useRouter();
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [showNotificationsModal, setShowNotificationsModal] = useState(false);

  const handleLogout = () => {
    localStorage.removeItem('token');
    router.push('/login');
    toast.success('Logged out successfully');
  };

  const urgentCount = urgentTasks.length;

  return (
    <div className="min-h-screen bg-[var(--canvas-bg)] p-3 sm:p-5 flex gap-5 text-[var(--text-main)]">
      {/* ── DESKTOP SIDEBAR ───────────────────────────────────── */}
      <aside className="hidden lg:flex w-64 flex-col justify-between organizo-card p-6 h-[calc(100vh-2.5rem)] sticky top-5 shrink-0">
        <div>
          {/* Brand Logo */}
          <Link href="/dashboard" className="flex items-center gap-3 mb-10">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-[var(--btn-primary-bg)] text-[var(--btn-primary-text)] font-extrabold text-sm shadow-xs">
              AZ
            </span>
            <span className="font-sans text-lg font-bold tracking-tight text-[var(--text-main)]">
              Organizo
            </span>
          </Link>

          {/* Navigation Links */}
          <nav className="space-y-1.5" aria-label="Main menu">
            <Link
              href="/dashboard"
              className={`flex items-center gap-3.5 px-4 py-3 rounded-2xl text-xs font-semibold transition-all ${
                activeNav === 'dashboard'
                  ? 'bg-[var(--active-highlight)] text-[var(--text-main)] border-l-4 border-l-[var(--active-bar)] shadow-xs'
                  : 'text-[var(--text-muted)] hover:bg-[var(--active-highlight)] hover:text-[var(--text-main)]'
              }`}
            >
              <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="3" width="7" height="7" />
                <rect x="14" y="3" width="7" height="7" />
                <rect x="14" y="14" width="7" height="7" />
                <rect x="3" y="14" width="7" height="7" />
              </svg>
              <span>Dashboard</span>
            </Link>

            <Link
              href="/dashboard?view=tasks"
              className={`flex items-center gap-3.5 px-4 py-3 rounded-2xl text-xs font-semibold transition-all ${
                activeNav === 'tasks'
                  ? 'bg-[var(--active-highlight)] text-[var(--text-main)] border-l-4 border-l-[var(--active-bar)] shadow-xs'
                  : 'text-[var(--text-muted)] hover:bg-[var(--active-highlight)] hover:text-[var(--text-main)]'
              }`}
            >
              <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                <polyline points="22 4 12 14.01 9 11.01" />
              </svg>
              <span>My tasks</span>
            </Link>

            {/* Notifications button with red badge count */}
            <button
              onClick={() => setShowNotificationsModal(true)}
              className="w-full flex items-center justify-between px-4 py-3 rounded-2xl text-xs font-semibold text-[var(--text-muted)] hover:bg-[var(--active-highlight)] hover:text-[var(--text-main)] transition-all"
            >
              <div className="flex items-center gap-3.5">
                <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
                  <path d="M13.73 21a2 2 0 0 1-3.46 0" />
                </svg>
                <span>Notifications</span>
              </div>
              {urgentCount > 0 && (
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-white text-[10px] font-bold animate-pulse">
                  {urgentCount}
                </span>
              )}
            </button>
          </nav>
        </div>

        {/* Bottom Actions */}
        <div className="space-y-1.5 border-t border-[var(--card-border)] pt-4">
          <Link
            href="/profile"
            className={`flex items-center gap-3.5 px-4 py-3 rounded-2xl text-xs font-semibold transition-all ${
              activeNav === 'profile'
                ? 'bg-[var(--active-highlight)] text-[var(--text-main)] border-l-4 border-l-[var(--active-bar)]'
                : 'text-[var(--text-muted)] hover:bg-[var(--active-highlight)] hover:text-[var(--text-main)]'
            }`}
          >
            <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="4" y1="21" x2="4" y2="14" /><line x1="4" y1="10" x2="4" y2="3" />
              <line x1="12" y1="21" x2="12" y2="12" /><line x1="12" y1="8" x2="12" y2="3" />
              <line x1="20" y1="21" x2="20" y2="16" /><line x1="20" y1="12" x2="20" y2="3" />
              <line x1="1" y1="14" x2="7" y2="14" /><line x1="9" y1="8" x2="15" y2="8" /><line x1="17" y1="16" x2="23" y2="16" />
            </svg>
            <span>Settings</span>
          </Link>

          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3.5 px-4 py-3 rounded-2xl text-xs font-semibold text-[var(--text-muted)] hover:text-red-500 hover:bg-[var(--active-highlight)] transition-all"
          >
            <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
              <polyline points="16 17 21 12 16 7" />
              <line x1="21" y1="12" x2="9" y2="12" />
            </svg>
            <span>Log out</span>
          </button>
        </div>
      </aside>

      {/* ── MOBILE SIDEBAR DRAWER ──────────────────────────────── */}
      <AnimatePresence>
        {mobileSidebarOpen && (
          <>
            <motion.div
              className="fixed inset-0 z-40 bg-black/60 backdrop-blur-xs lg:hidden"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileSidebarOpen(false)}
            />
            <motion.aside
              className="fixed inset-y-0 left-0 z-50 flex w-72 flex-col justify-between organizo-card p-6 lg:hidden m-3"
              initial={{ x: -300 }}
              animate={{ x: 0 }}
              exit={{ x: -300 }}
            >
              <div>
                <div className="flex items-center justify-between mb-8">
                  <div className="flex items-center gap-3">
                    <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-[var(--btn-primary-bg)] text-[var(--btn-primary-text)] font-extrabold text-sm">
                      AZ
                    </span>
                    <span className="font-sans text-lg font-bold">Organizo</span>
                  </div>
                  <button onClick={() => setMobileSidebarOpen(false)} className="text-xl">✕</button>
                </div>
                <nav className="space-y-2">
                  <Link
                    href="/dashboard"
                    onClick={() => setMobileSidebarOpen(false)}
                    className="flex items-center gap-3 px-4 py-3 rounded-2xl text-xs font-semibold bg-[var(--active-highlight)]"
                  >
                    <span>Dashboard</span>
                  </Link>
                  <Link
                    href="/dashboard?view=tasks"
                    onClick={() => setMobileSidebarOpen(false)}
                    className="flex items-center gap-3 px-4 py-3 rounded-2xl text-xs font-semibold hover:bg-[var(--canvas-bg)]"
                  >
                    <span>My tasks</span>
                  </Link>
                  <button
                    onClick={() => {
                      setMobileSidebarOpen(false);
                      setShowNotificationsModal(true);
                    }}
                    className="w-full flex items-center justify-between px-4 py-3 rounded-2xl text-xs font-semibold hover:bg-[var(--canvas-bg)]"
                  >
                    <span>Notifications</span>
                    {urgentCount > 0 && (
                      <span className="h-5 w-5 rounded-full bg-red-500 text-white text-[10px] font-bold flex items-center justify-center">
                        {urgentCount}
                      </span>
                    )}
                  </button>
                  <Link
                    href="/profile"
                    onClick={() => setMobileSidebarOpen(false)}
                    className="flex items-center gap-3 px-4 py-3 rounded-2xl text-xs font-semibold hover:bg-[var(--canvas-bg)]"
                  >
                    <span>Settings</span>
                  </Link>
                </nav>
              </div>
              <button
                onClick={handleLogout}
                className="flex items-center gap-3 px-4 py-3 text-xs font-semibold text-red-500"
              >
                Log out
              </button>
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* ── MAIN CONTENT AREA ─────────────────────────────────── */}
      <div className="flex-1 flex flex-col min-w-0">
        <header className="flex items-center justify-between gap-4 mb-6">
          <button
            onClick={() => setMobileSidebarOpen(true)}
            className="lg:hidden h-10 w-10 flex items-center justify-center rounded-2xl bg-[var(--card-bg)] border border-[var(--card-border)] text-[var(--text-main)]"
          >
            ☰
          </button>

          <div className="flex-1 max-w-xl">
            <input
              type="text"
              placeholder="Search tasks..."
              value={searchTerm}
              onChange={(e) => onSearchChange?.(e.target.value)}
              className="search-pill text-xs"
            />
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={onNewTaskClick}
              className="btn-primary-mono"
            >
              <span className="text-sm font-bold leading-none">+</span>
              <span>New task</span>
            </button>

            {/* Notification bell with count badge */}
            <button
              onClick={() => setShowNotificationsModal(true)}
              className="h-10 w-10 relative flex items-center justify-center rounded-2xl bg-[var(--card-bg)] border border-[var(--card-border)] text-[var(--text-main)] hover:bg-[var(--canvas-bg)] transition-colors shadow-xs"
              title="System Notifications"
            >
              <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
                <path d="M13.73 21a2 2 0 0 1-3.46 0" />
              </svg>
              {urgentCount > 0 && (
                <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-white text-[9px] font-bold">
                  {urgentCount}
                </span>
              )}
            </button>

            <ThemeControls />

            <Link
              href="/profile"
              className="h-10 w-10 flex items-center justify-center rounded-2xl bg-[var(--card-bg)] border border-[var(--card-border)] text-xs font-bold text-[var(--text-main)] shadow-xs hover:border-[var(--text-muted)] transition-colors"
              title="Profile"
            >
              U
            </Link>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto">
          {children}
        </main>
      </div>

      {/* ── NOTIFICATIONS MODAL ────────────────────────────────── */}
      {showNotificationsModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs">
          <div className="organizo-card w-full max-w-md p-6 sm:p-7 shadow-2xl">
            <div className="flex items-center justify-between border-b border-[var(--card-border)] pb-3">
              <div className="flex items-center gap-2">
                <span className="text-base">🔔</span>
                <h3 className="text-base font-bold text-[var(--text-main)]">
                  System Notifications
                </h3>
              </div>
              <button
                onClick={() => setShowNotificationsModal(false)}
                className="text-xs font-bold text-[var(--text-muted)] hover:text-[var(--text-main)]"
              >
                ✕
              </button>
            </div>

            <div className="mt-4 space-y-3">
              {urgentTasks.length === 0 ? (
                <div className="py-8 text-center text-xs text-[var(--text-muted)]">
                  All caught up! No urgent task deadlines in the next 1-2 days.
                </div>
              ) : (
                <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
                  <div className="text-[0.68rem] font-bold uppercase tracking-wider text-red-500 mb-1 flex items-center gap-1.5">
                    <span className="h-2 w-2 rounded-full bg-red-500 animate-pulse" />
                    <span>Urgent: Due in 1-2 Days / Overdue ({urgentTasks.length})</span>
                  </div>
                  {urgentTasks.map((task) => (
                    <div
                      key={task.id}
                      className="p-3 rounded-xl border border-red-400/40 bg-red-500/10 flex items-center justify-between gap-2"
                    >
                      <div className="min-w-0">
                        <div className="text-xs font-semibold text-[var(--text-main)] truncate">
                          {task.title}
                        </div>
                        <div className="text-[0.68rem] text-red-500 font-medium mt-0.5">
                          {task.label}
                        </div>
                      </div>
                      <Link
                        href="/dashboard?view=tasks"
                        onClick={() => setShowNotificationsModal(false)}
                        className="btn-primary-mono text-[0.68rem] py-1 px-2.5 shrink-0"
                      >
                        View
                      </Link>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="mt-5 pt-3 border-t border-[var(--card-border)] flex justify-end">
              <button
                onClick={() => setShowNotificationsModal(false)}
                className="btn-ghost-mono text-xs py-1.5 px-3"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
