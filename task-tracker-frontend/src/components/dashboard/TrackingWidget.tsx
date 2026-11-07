'use client';

import { useState, useEffect } from 'react';

interface TrackItem {
  id: string;
  title: string;
  seconds: number;
  isActive: boolean;
}

export function TrackingWidget() {
  const [items, setItems] = useState<TrackItem[]>([
    { id: '1', title: 'Sprint backlog refinement', seconds: 5130, isActive: true },
    { id: '2', title: 'System architecture review', seconds: 1818, isActive: false },
    { id: '3', title: 'Dashboard component refactor', seconds: 6502, isActive: false },
    { id: '4', title: 'Client progress report', seconds: 1021, isActive: false },
  ]);

  useEffect(() => {
    const active = items.find((i) => i.isActive);
    if (!active) return;

    const timer = setInterval(() => {
      setItems((prev) =>
        prev.map((i) => (i.id === active.id ? { ...i, seconds: i.seconds + 1 } : i))
      );
    }, 1000);

    return () => clearInterval(timer);
  }, [items]);

  const toggleItem = (id: string) => {
    setItems((prev) =>
      prev.map((i) => ({
        ...i,
        isActive: i.id === id ? !i.isActive : false,
      }))
    );
  };

  const formatTime = (totalSec: number) => {
    const hours = Math.floor(totalSec / 3600);
    const minutes = Math.floor((totalSec % 3600) / 60);
    const seconds = totalSec % 60;

    if (hours > 0) {
      return `${hours}h ${minutes}m ${seconds}s`;
    }
    return `${minutes}m ${seconds}s`;
  };

  return (
    <div className="organizo-card p-6 flex flex-col justify-between">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-bold text-sm text-[var(--text-main)]">Task Timer Tracker</h3>
        <span className="text-xs text-[var(--text-muted)] font-mono">Live</span>
      </div>

      <div className="space-y-2">
        {items.map((item) => (
          <div
            key={item.id}
            className={`flex items-center justify-between p-3 rounded-2xl transition-all border ${
              item.isActive
                ? 'bg-[var(--active-highlight)] border-[var(--active-bar)]'
                : 'border-[var(--card-border)] bg-[var(--card-bg)] hover:bg-[var(--canvas-bg)]'
            }`}
          >
            <div className="flex items-center gap-2.5 truncate">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-[var(--text-muted)] shrink-0">
                <circle cx="12" cy="12" r="10" />
                <polyline points="12 6 12 12 16 14" />
              </svg>
              <span className="text-xs font-semibold text-[var(--text-main)] truncate">
                {item.title}
              </span>
            </div>

            <div className="flex items-center gap-3 shrink-0 ml-2">
              <span className="font-mono text-xs font-semibold text-[var(--text-main)]">
                {formatTime(item.seconds)}
              </span>

              <button
                onClick={() => toggleItem(item.id)}
                className={`h-7 w-7 flex items-center justify-center rounded-full transition-transform hover:scale-105 text-xs ${
                  item.isActive
                    ? 'bg-[var(--btn-primary-bg)] text-[var(--btn-primary-text)] font-bold'
                    : 'bg-[var(--canvas-bg)] border border-[var(--card-border)] text-[var(--text-main)] hover:bg-[var(--card-border)]'
                }`}
                title={item.isActive ? 'Pause' : 'Start'}
              >
                {item.isActive ? '❚❚' : '▶'}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
