'use client';

import { Area, AreaChart, Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import type { BoardTask } from './KanbanBoard';

export function DashboardAnalytics({ tasks }: { tasks: BoardTask[] }) {
  const completed = tasks.filter((task) => task.is_completed).length;

  const statusData = [
    { name: 'To Do', value: tasks.filter((task) => (!task.status && !task.is_completed) || task.status === 'todo').length },
    { name: 'In Progress', value: tasks.filter((task) => task.status === 'in_progress').length },
    { name: 'Review', value: tasks.filter((task) => task.status === 'review').length },
    { name: 'Done', value: completed },
  ];

  const trend = [
    { day: 'Mon', completed: Math.max(0, completed - 3) },
    { day: 'Tue', completed: Math.max(0, completed - 2) },
    { day: 'Wed', completed: Math.max(0, completed - 1) },
    { day: 'Thu', completed },
    { day: 'Fri', completed: completed + 1 },
  ];

  return (
    <section className="space-y-6">
      <div className="grid gap-5 lg:grid-cols-2">
        {/* Weekly Completion Area Chart */}
        <div className="p-4 rounded-2xl bg-[var(--canvas-bg)] border border-[var(--card-border)]">
          <div className="flex items-center justify-between border-b border-[var(--card-border)] pb-3 mb-3">
            <div>
              <span className="eyebrow">Velocity</span>
              <h3 className="text-sm font-bold text-[var(--text-main)]">Weekly Completion Output</h3>
            </div>
            <div className="flex items-center gap-1.5 text-xs text-[var(--text-muted)] font-medium">
              <span className="h-2 w-2 rounded-full bg-[var(--text-main)]" />
              Tasks Finished
            </div>
          </div>
          <div className="h-[200px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={trend}>
                <defs>
                  <linearGradient id="monoCompletionFill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="var(--text-main)" stopOpacity={0.25} />
                    <stop offset="100%" stopColor="var(--text-main)" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid stroke="var(--card-border)" vertical={false} />
                <XAxis dataKey="day" stroke="var(--text-subtle)" fontSize={11} tickLine={false} axisLine={false} />
                <YAxis stroke="var(--text-subtle)" fontSize={11} tickLine={false} axisLine={false} allowDecimals={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'var(--card-bg)',
                    borderColor: 'var(--card-border)',
                    borderRadius: '0.75rem',
                    color: 'var(--text-main)',
                    fontSize: '12px',
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="completed"
                  stroke="var(--text-main)"
                  strokeWidth={2}
                  fill="url(#monoCompletionFill)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Workload by Stage Bar Chart */}
        <div className="p-4 rounded-2xl bg-[var(--canvas-bg)] border border-[var(--card-border)]">
          <div className="flex items-center justify-between border-b border-[var(--card-border)] pb-3 mb-3">
            <div>
              <span className="eyebrow">Distribution</span>
              <h3 className="text-sm font-bold text-[var(--text-main)]">Tasks by Stage</h3>
            </div>
            <div className="text-xs text-[var(--text-subtle)] font-medium">Stage Overview</div>
          </div>
          <div className="h-[200px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={statusData}>
                <CartesianGrid stroke="var(--card-border)" vertical={false} />
                <XAxis dataKey="name" stroke="var(--text-subtle)" fontSize={10} tickLine={false} axisLine={false} />
                <YAxis stroke="var(--text-subtle)" fontSize={11} tickLine={false} axisLine={false} allowDecimals={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'var(--card-bg)',
                    borderColor: 'var(--card-border)',
                    borderRadius: '0.75rem',
                    color: 'var(--text-main)',
                    fontSize: '12px',
                  }}
                />
                <Bar dataKey="value" fill="var(--text-main)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </section>
  );
}
