'use client';

import { useState } from 'react';
import { TaskItem } from './GroupedTaskTable';
import { getDeadlineStatus } from '@/lib/utils';

export function CalendarView({
  tasks,
  onToggleComplete,
  onEdit,
  onPlaceTaskOnDate,
}: {
  tasks: TaskItem[];
  onToggleComplete: (task: TaskItem) => void;
  onEdit: (task: TaskItem) => void;
  onPlaceTaskOnDate: (dateStr: string) => void;
}) {
  const [currentDate, setCurrentDate] = useState(() => new Date());

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December',
  ];

  const formatDateKey = (d: Date) => {
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
  };

  const tasksByDate = tasks.reduce<Record<string, TaskItem[]>>((acc, task) => {
    if (task.due_date) {
      const dateKey = task.due_date.split('T')[0];
      if (!acc[dateKey]) acc[dateKey] = [];
      acc[dateKey].push(task);
    }
    return acc;
  }, {});

  const firstDayIndex = new Date(year, month, 1).getDay();
  const adjustedFirstDay = (firstDayIndex + 6) % 7;
  const totalDaysInMonth = new Date(year, month + 1, 0).getDate();
  const prevMonthTotalDays = new Date(year, month, 0).getDate();

  const days: { dayNumber: number; isCurrentMonth: boolean; dateKey: string }[] = [];

  for (let i = adjustedFirstDay - 1; i >= 0; i--) {
    const d = new Date(year, month - 1, prevMonthTotalDays - i);
    days.push({
      dayNumber: prevMonthTotalDays - i,
      isCurrentMonth: false,
      dateKey: formatDateKey(d),
    });
  }

  for (let i = 1; i <= totalDaysInMonth; i++) {
    const d = new Date(year, month, i);
    days.push({
      dayNumber: i,
      isCurrentMonth: true,
      dateKey: formatDateKey(d),
    });
  }

  const remaining = (7 - (days.length % 7)) % 7;
  for (let i = 1; i <= remaining; i++) {
    const d = new Date(year, month + 1, i);
    days.push({
      dayNumber: i,
      isCurrentMonth: false,
      dateKey: formatDateKey(d),
    });
  }

  const prevMonth = () => setCurrentDate(new Date(year, month - 1, 1));
  const nextMonth = () => setCurrentDate(new Date(year, month + 1, 1));

  const todayKey = formatDateKey(new Date());

  return (
    <div className="organizo-card p-6">
      {/* Calendar Month Navigation */}
      <div className="flex items-center justify-between pb-4 border-b border-[var(--card-border)] mb-4">
        <div>
          <span className="eyebrow">Monthly Planner</span>
          <h2 className="text-xl font-bold text-[var(--text-main)]">
            {monthNames[month]} {year}
          </h2>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={prevMonth}
            className="btn-ghost-mono px-3 py-1.5 text-xs"
          >
            ‹ Prev
          </button>
          <button
            onClick={() => setCurrentDate(new Date())}
            className="btn-ghost-mono px-3 py-1.5 text-xs font-semibold"
          >
            Today
          </button>
          <button
            onClick={nextMonth}
            className="btn-ghost-mono px-3 py-1.5 text-xs"
          >
            Next ›
          </button>
        </div>
      </div>

      {/* Weekday labels */}
      <div className="grid grid-cols-7 text-center text-xs font-bold uppercase tracking-wider text-[var(--text-muted)] border-b border-[var(--card-border)] pb-2 mb-2">
        {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day) => (
          <div key={day} className="py-1">
            {day}
          </div>
        ))}
      </div>

      {/* Month Days Grid */}
      <div className="grid grid-cols-7 gap-2">
        {days.map((item, idx) => {
          const dayTasks = tasksByDate[item.dateKey] || [];
          const isToday = item.dateKey === todayKey;

          return (
            <div
              key={idx}
              className={`min-h-[110px] rounded-2xl border p-2 flex flex-col justify-between transition-all group ${
                isToday
                  ? 'border-[var(--active-bar)] bg-[var(--active-highlight)]'
                  : item.isCurrentMonth
                  ? 'border-[var(--card-border)] bg-[var(--card-bg)] hover:border-[var(--text-muted)]'
                  : 'border-[var(--card-border)] bg-[var(--canvas-bg)] opacity-50'
              }`}
            >
              <div className="flex items-center justify-between">
                <span
                  className={`h-6 w-6 rounded-full flex items-center justify-center text-xs font-bold ${
                    isToday
                      ? 'bg-[var(--btn-primary-bg)] text-[var(--btn-primary-text)]'
                      : 'text-[var(--text-main)]'
                  }`}
                >
                  {item.dayNumber}
                </span>

                <button
                  onClick={() => onPlaceTaskOnDate(item.dateKey)}
                  className="opacity-0 group-hover:opacity-100 text-xs font-bold text-[var(--text-muted)] hover:text-[var(--text-main)] transition-opacity"
                  title={`Add task for ${item.dateKey}`}
                >
                  + Add
                </button>
              </div>

              {/* Tasks inside this day cell */}
              <div className="mt-1 space-y-1 overflow-y-auto max-h-16 pr-0.5">
                {dayTasks.map((task) => {
                  const deadline = getDeadlineStatus(task.due_date, task.is_completed);

                  return (
                    <div
                      key={task.id}
                      onClick={() => onEdit(task)}
                      className={`p-1 rounded-lg border flex items-center justify-between text-[0.65rem] cursor-pointer transition-colors ${
                        deadline.status === 'urgent-red'
                          ? 'border-red-400/50 bg-red-500/10'
                          : deadline.status === 'warning-yellow'
                          ? 'border-amber-400/50 bg-amber-500/10'
                          : 'bg-[var(--canvas-bg)] border-[var(--card-border)] hover:border-[var(--text-main)]'
                      }`}
                    >
                      <div className="flex items-center gap-1 truncate">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onToggleComplete(task);
                          }}
                          className={`h-3 w-3 rounded-full border flex items-center justify-center text-[7px] shrink-0 ${
                            task.is_completed
                              ? 'bg-[var(--btn-primary-bg)] text-[var(--btn-primary-text)]'
                              : 'border-[var(--card-border)]'
                          }`}
                        >
                          {task.is_completed && '✓'}
                        </button>
                        <span
                          className={`truncate ${
                            task.is_completed ? 'line-through text-[var(--text-subtle)]' : 'text-[var(--text-main)] font-medium'
                          }`}
                        >
                          {task.title}
                        </span>
                      </div>

                      {task.priority === 'High' && (
                        <span className="h-1.5 w-1.5 rounded-full bg-red-500 shrink-0 ml-1" />
                      )}
                    </div>
                  );
                })}
              </div>

              <div className="text-[0.62rem] text-right text-[var(--text-subtle)] font-medium">
                {dayTasks.length > 0 ? `${dayTasks.length} task${dayTasks.length > 1 ? 's' : ''}` : ''}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
