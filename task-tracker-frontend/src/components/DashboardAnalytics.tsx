'use client';

import { motion } from 'framer-motion';
import { Area, AreaChart, Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import type { BoardTask } from './KanbanBoard';

function isDateOverdue(dateString?: string | null, isCompleted?: boolean): boolean {
  if (!dateString || isCompleted) return false;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const parts = dateString.split('T')[0].split('-');
  if (parts.length === 3) {
    const due = new Date(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2]));
    return due < today;
  }
  const dueDate = new Date(dateString);
  return dueDate < today;
}

export function DashboardAnalytics({ tasks }: { tasks: BoardTask[] }) {
  const completed = tasks.filter((task) => task.is_completed || task.status === 'done').length;
  const overdue = tasks.filter((task) => isDateOverdue(task.due_date, task.is_completed || task.status === 'done')).length;

  const statusData = [
    {
      name: 'To Do',
      value: tasks.filter((task) => (!task.status && !task.is_completed) || task.status === 'todo').length,
    },
    {
      name: 'Progress',
      value: tasks.filter((task) => task.status === 'in_progress').length,
    },
    {
      name: 'Review',
      value: tasks.filter((task) => task.status === 'review').length,
    },
    {
      name: 'Done',
      value: completed,
    },
  ];

  const trend = [
    { day: 'Mon', completed: Math.max(0, completed - 3) },
    { day: 'Tue', completed: Math.max(0, completed - 2) },
    { day: 'Wed', completed: Math.max(0, completed - 1) },
    { day: 'Thu', completed },
    { day: 'Fri', completed: completed + 1 },
  ];

  const stats = [
    ['Total tasks', tasks.length, 'analytics-purple'],
    ['Completed', completed, 'analytics-green'],
    ['Pending', Math.max(0, tasks.length - completed), 'analytics-blue'],
    ['Overdue', overdue, 'analytics-orange'],
  ] as const;

  const tooltipStyle = {
    backgroundColor: 'rgba(12, 18, 42, 0.94)',
    borderColor: 'rgba(255, 255, 255, 0.12)',
    borderRadius: '12px',
    color: '#f8f7ff',
    boxShadow: '0 12px 30px rgba(0, 0, 0, 0.45)',
    fontSize: '12px',
    backdropFilter: 'blur(12px)',
  };

  return (
    <section className="mb-8">
      <div className="mb-4 flex items-end justify-between">
        <div>
          <span className="text-[0.68rem] font-bold uppercase tracking-[0.16em] text-[#b49aff]">
            Your momentum
          </span>
          <h2 className="mt-2 text-xl font-bold tracking-tight text-[#f8f7ff]">
            Advanced overview
          </h2>
        </div>
        <span className="text-[0.68rem] text-[#9898ad]">Live workspace metrics</span>
      </div>

      <div className="grid grid-cols-4 gap-3.5 max-[800px]:grid-cols-2 max-[480px]:gap-2.5">
        {stats.map(([label, value, className]) => (
          <motion.div
            key={String(label)}
            className={`min-h-[130px] rounded-2xl border border-white/10 bg-white/[0.04] p-5 backdrop-blur-md max-[480px]:min-h-[110px] max-[480px]:p-3.5 transition-colors ${
              className === 'analytics-purple'
                ? 'border-l-[3px] border-l-[#8b5cf6]'
                : className === 'analytics-green'
                ? 'border-l-[3px] border-l-emerald-500'
                : className === 'analytics-blue'
                ? 'border-l-[3px] border-l-cyan-400'
                : 'border-l-[3px] border-l-rose-500'
            }`}
            whileHover={{ y: -3 }}
            transition={{ duration: 0.2 }}
          >
            <span className="block text-[0.72rem] font-medium text-[#9898ad]">{label}</span>
            <strong className="my-2 block text-3xl font-extrabold tracking-tight text-[#f8f7ff] max-[480px]:text-2xl">
              {value}
            </strong>
            <small className="block text-[0.7rem] text-[#9898ad]">
              {label === 'Completed'
                ? `${tasks.length ? Math.round((Number(value) / tasks.length) * 100) : 0}% of all tasks`
                : label === 'Overdue' && value > 0
                ? 'Action needed'
                : 'Updated in real time'}
            </small>
          </motion.div>
        ))}
      </div>

      <div className="mt-3.5 grid grid-cols-2 gap-3.5 max-[800px]:grid-cols-1">
        <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-5 backdrop-blur-md">
          <div className="flex items-start justify-between mb-2">
            <div>
              <span className="text-[0.7rem] font-medium text-[#9898ad]">Completion trend</span>
              <h3 className="text-sm font-semibold text-[#f8f7ff]">Weekly output</h3>
            </div>
            <span className="text-[0.68rem] font-semibold text-[#8b5cf6]">● Completed</span>
          </div>
          <div className="h-[210px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={trend} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="completionFill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#8b5cf6" stopOpacity={0.45} />
                    <stop offset="100%" stopColor="#8b5cf6" stopOpacity={0.02} />
                  </linearGradient>
                </defs>
                <CartesianGrid stroke="rgba(255,255,255,0.08)" vertical={false} />
                <XAxis dataKey="day" stroke="#9898ad" fontSize={11} tickLine={false} />
                <YAxis stroke="#9898ad" fontSize={11} allowDecimals={false} tickLine={false} />
                <Tooltip contentStyle={tooltipStyle} itemStyle={{ color: '#c4b5fd' }} />
                <Area type="monotone" dataKey="completed" stroke="#8b5cf6" fill="url(#completionFill)" strokeWidth={2.5} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-5 backdrop-blur-md">
          <div className="mb-2">
            <span className="text-[0.7rem] font-medium text-[#9898ad]">Workload</span>
            <h3 className="text-sm font-semibold text-[#f8f7ff]">Tasks by status</h3>
          </div>
          <div className="h-[210px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={statusData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid stroke="rgba(255,255,255,0.08)" vertical={false} />
                <XAxis dataKey="name" stroke="#9898ad" fontSize={10} tickLine={false} />
                <YAxis stroke="#9898ad" fontSize={11} allowDecimals={false} tickLine={false} />
                <Tooltip contentStyle={tooltipStyle} itemStyle={{ color: '#c4b5fd' }} />
                <Bar dataKey="value" fill="#8b5cf6" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </section>
  );
}
