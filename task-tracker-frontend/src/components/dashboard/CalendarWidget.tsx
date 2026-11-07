'use client';

import { useState } from 'react';
import { TaskItem } from './GroupedTaskTable';
import { getDeadlineStatus } from '@/lib/utils';

export function CalendarWidget({
  tasks = [],
  selectedDate,
  onSelectDate,
  onPlaceTaskOnDate,
  onToggleComplete,
}: {
  tasks?: TaskItem[];
  selectedDate?: string;
  onSelectDate?: (dateStr: string) => void;
  onPlaceTaskOnDate?: (dateStr: string) => void;
  onToggleComplete?: (task: TaskItem) => void;
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

  const activeDateKey = selectedDate || formatDateKey(new Date());
  const selectedDateTasks = tasksByDate[activeDateKey] || [];

  return (
    <div className="organizo-card p-6 flex flex-col justify-between">
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold text-sm text-[var(--text-main)]">
            {monthNames[month]} {year}
          </h3>
          <div className="flex items-center gap-1">
            <button
              onClick={prevMonth}
              className="h-7 w-7 flex items-center justify-center rounded-full hover:bg-[var(--canvas-bg)] text-xs text-[var(--text-muted)] hover:text-[var(--text-main)] transition-colors"
              title="Previous month"
            >
              ‹
            </button>
            <button
              onClick={nextMonth}
              className="h-7 w-7 flex items-center justify-center rounded-full hover:bg-[var(--canvas-bg)] text-xs text-[var(--text-muted)] hover:text-[var(--text-main)] transition-colors"
              title="Next month"
            >
              ›
            </button>
          </div>
        </div>

        <div className="grid grid-cols-7 text-center text-[0.68rem] font-bold uppercase tracking-wider text-[var(--text-subtle)] mb-2">
          {['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su'].map((d) => (
            <div key={d} className="py-1">
              {d}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-7 gap-y-1 text-center text-xs">
          {days.map((item, idx) => {
            const isSelected = item.dateKey === activeDateKey;
            const dayTasks = tasksByDate[item.dateKey] || [];
            const hasTasks = dayTasks.length > 0;

            // Check if day has urgent or warning tasks
            const hasUrgent = dayTasks.some((t) => getDeadlineStatus(t.due_date, t.is_completed).status === 'urgent-red');
            const hasWarning = dayTasks.some((t) => getDeadlineStatus(t.due_date, t.is_completed).status === 'warning-yellow');

            return (
              <div key={idx} className="flex flex-col items-center justify-center py-0.5">
                <button
                  onClick={() => onSelectDate?.(item.dateKey)}
                  className={`h-7 w-7 flex flex-col items-center justify-center rounded-full transition-all text-xs relative ${
                    isSelected
                      ? 'bg-[var(--btn-primary-bg)] text-[var(--btn-primary-text)] font-bold shadow-xs'
                      : item.isCurrentMonth
                      ? 'text-[var(--text-main)] hover:bg-[var(--canvas-bg)]'
                      : 'text-[var(--text-subtle)] opacity-40 hover:opacity-70'
                  }`}
                >
                  <span>{item.dayNumber}</span>
                  {hasTasks && !isSelected && (
                    <span
                      className={`h-1.5 w-1.5 rounded-full absolute bottom-0.5 ${
                        hasUrgent
                          ? 'bg-red-500'
                          : hasWarning
                          ? 'bg-amber-500'
                          : 'bg-[var(--text-main)]'
                      }`}
                    />
                  )}
                </button>
              </div>
            );
          })}
        </div>
      </div>

      <div className="mt-5 pt-4 border-t border-[var(--card-border)]">
        <div className="flex items-center justify-between mb-2.5">
          <span className="text-[0.72rem] font-bold uppercase tracking-wider text-[var(--text-muted)]">
            {activeDateKey === formatDateKey(new Date()) ? 'Today' : activeDateKey} ({selectedDateTasks.length})
          </span>
          <button
            onClick={() => onPlaceTaskOnDate?.(activeDateKey)}
            className="text-[0.72rem] font-bold text-[var(--text-main)] hover:underline flex items-center gap-1"
          >
            <span>+</span>
            <span>Place task here</span>
          </button>
        </div>

        {selectedDateTasks.length === 0 ? (
          <p className="text-[0.7rem] text-[var(--text-subtle)] py-1">
            No tasks scheduled for this day.
          </p>
        ) : (
          <div className="space-y-1.5 max-h-36 overflow-y-auto pr-1">
            {selectedDateTasks.map((task) => {
              const deadline = getDeadlineStatus(task.due_date, task.is_completed);

              return (
                <div
                  key={task.id}
                  className="flex items-center justify-between p-2 rounded-xl bg-[var(--canvas-bg)] text-xs"
                >
                  <div className="flex items-center gap-2 truncate">
                    <button
                      onClick={() => onToggleComplete?.(task)}
                      className={`h-4 w-4 rounded-full border flex items-center justify-center text-[9px] shrink-0 ${
                        task.is_completed
                          ? 'bg-[var(--btn-primary-bg)] text-[var(--btn-primary-text)] border-[var(--btn-primary-bg)]'
                          : 'border-[var(--card-border)]'
                      }`}
                    >
                      {task.is_completed && '✓'}
                    </button>
                    <span
                      className={`truncate text-xs font-medium ${
                        task.is_completed ? 'line-through text-[var(--text-subtle)]' : 'text-[var(--text-main)]'
                      }`}
                    >
                      {task.title}
                    </span>
                  </div>

                  <div className="flex items-center gap-1 shrink-0 ml-1">
                    {deadline.status === 'urgent-red' && (
                      <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-red-100 text-red-800 dark:bg-red-950/60 dark:text-red-300">
                        {deadline.label}
                      </span>
                    )}
                    {deadline.status === 'warning-yellow' && (
                      <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-amber-100 text-amber-900 dark:bg-amber-950/60 dark:text-amber-300">
                        {deadline.label}
                      </span>
                    )}
                    {task.priority === 'High' && (
                      <span className="h-2 w-2 rounded-full bg-red-500 animate-pulse ml-0.5" title="High Priority" />
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
