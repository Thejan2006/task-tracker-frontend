'use client';

import Link from 'next/link';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { AnimatePresence, motion } from 'framer-motion';
import { ThemeControls } from '@/components/ThemeControls';
import toast from 'react-hot-toast';

const navItems = [
  { href: '/dashboard', label: 'Dashboard', icon: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-4 0a1 1 0 01-1-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 01-1 1' },
  { href: '/profile', label: 'Profile', icon: 'M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z' },
];

function NavIcon({ d }: { d: string }) {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d={d} />
    </svg>
  );
}

export function DashboardLayout({
  children,
  isAdmin = false,
}: {
  children: React.ReactNode;
  isAdmin?: boolean;
}) {
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [currentPath, setCurrentPath] = useState('');

  // Get current path for active state
  if (typeof window !== 'undefined' && currentPath !== window.location.pathname) {
    setCurrentPath(window.location.pathname);
  }

  const handleLogout = () => {
    localStorage.removeItem('token');
    router.push('/login');
    toast.success('Logged out successfully');
  };

  const allNavItems = isAdmin
    ? [...navItems, { href: '/admin', label: 'Admin', icon: 'M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m3-2.803a4 4 0 11-8 0 4 4 0 018 0z' }]
    : navItems;

  return (
    <div className="flex min-h-screen bg-[var(--bg)]">
      {/* Sidebar — Desktop */}
      <aside className="hidden w-64 flex-col border-r border-[var(--sidebar-border)] bg-[var(--sidebar-bg)] lg:flex">
        {/* Logo */}
        <div className="flex h-16 items-center gap-2.5 border-b border-[var(--sidebar-border)] px-5">
          <span className="grid h-8 w-8 place-items-center rounded-xl bg-gradient-to-br from-[var(--primary)] to-[var(--secondary)] text-sm font-bold text-white">T</span>
          <span className="text-lg font-bold tracking-tight text-[var(--fg)]">Taskflow</span>
        </div>

        {/* Nav links */}
        <nav className="flex flex-1 flex-col gap-1 p-3" aria-label="Sidebar navigation">
          {allNavItems.map((item) => {
            const isActive = currentPath === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all ${
                  isActive
                    ? 'bg-[var(--sidebar-active)] text-[var(--primary)]'
                    : 'text-[var(--sidebar-text)] hover:bg-[var(--sidebar-active)] hover:text-[var(--sidebar-text-active)]'
                }`}
              >
                <NavIcon d={item.icon} />
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* Bottom */}
        <div className="border-t border-[var(--sidebar-border)] p-3">
          <button
            onClick={handleLogout}
            className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-[var(--danger)] transition-colors hover:bg-[rgba(239,68,68,0.08)]"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4M16 17l5-5-5-5M21 12H9" />
            </svg>
            Sign out
          </button>
        </div>
      </aside>

      {/* Mobile sidebar overlay */}
      <AnimatePresence>
        {sidebarOpen && (
          <>
            <motion.div
              className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm lg:hidden"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSidebarOpen(false)}
            />
            <motion.aside
              className="fixed inset-y-0 left-0 z-50 flex w-64 flex-col border-r border-[var(--sidebar-border)] bg-[var(--sidebar-bg)] lg:hidden"
              initial={{ x: -256 }}
              animate={{ x: 0 }}
              exit={{ x: -256 }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            >
              <div className="flex h-16 items-center justify-between border-b border-[var(--sidebar-border)] px-5">
                <span className="flex items-center gap-2.5 text-lg font-bold text-[var(--fg)]">
                  <span className="grid h-8 w-8 place-items-center rounded-xl bg-gradient-to-br from-[var(--primary)] to-[var(--secondary)] text-sm text-white">T</span>
                  Taskflow
                </span>
                <button onClick={() => setSidebarOpen(false)} className="text-[var(--fg-muted)]">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
                </button>
              </div>
              <nav className="flex flex-1 flex-col gap-1 p-3">
                {allNavItems.map((item) => {
                  const isActive = currentPath === item.href;
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setSidebarOpen(false)}
                      className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all ${
                        isActive
                          ? 'bg-[var(--sidebar-active)] text-[var(--primary)]'
                          : 'text-[var(--sidebar-text)] hover:bg-[var(--sidebar-active)] hover:text-[var(--sidebar-text-active)]'
                      }`}
                    >
                      <NavIcon d={item.icon} />
                      {item.label}
                    </Link>
                  );
                })}
              </nav>
              <div className="border-t border-[var(--sidebar-border)] p-3">
                <button onClick={handleLogout} className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-[var(--danger)] hover:bg-[rgba(239,68,68,0.08)]">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4M16 17l5-5-5-5M21 12H9" /></svg>
                  Sign out
                </button>
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Main content */}
      <div className="flex flex-1 flex-col">
        {/* Top header */}
        <header className="flex h-16 items-center justify-between border-b border-[var(--card-border)] bg-[var(--bg-secondary)] px-4 sm:px-6">
          <div className="flex items-center gap-3">
            {/* Mobile hamburger */}
            <button
              className="flex h-9 w-9 items-center justify-center rounded-xl border border-[var(--card-border)] lg:hidden"
              onClick={() => setSidebarOpen(true)}
              aria-label="Open menu"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <line x1="3" y1="6" x2="21" y2="6" /><line x1="3" y1="12" x2="21" y2="12" /><line x1="3" y1="18" x2="21" y2="18" />
              </svg>
            </button>
            <h2 className="text-sm font-semibold text-[var(--fg)]">
              {currentPath === '/dashboard' ? 'Dashboard' : currentPath === '/profile' ? 'Profile' : currentPath === '/admin' ? 'Admin Panel' : 'Taskflow'}
            </h2>
          </div>
          <div className="flex items-center gap-3">
            <ThemeControls />
            <div className="hidden h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-[var(--primary)] to-[var(--secondary)] text-xs font-bold text-white sm:grid">
              U
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
