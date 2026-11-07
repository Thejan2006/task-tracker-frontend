'use client';

import { getDeadlineStatus } from '@/lib/utils';

export interface TaskItem {
  id: number;
  title: string;
  description?: string;
  is_completed: boolean;
  category_id?: number | null;
  category?: { id: number; name: string };
  due_date?: string | null;
  priority?: 'High' | 'Medium' | 'Low' | '' | null;
  status?: string | null;
}

export function GroupedTaskTable({
  tasks,
  onToggleComplete,
  onEdit,
  onDelete,
}: {
  tasks: TaskItem[];
  onToggleComplete: (task: TaskItem) => void;
  onEdit: (task: TaskItem) => void;
  onDelete: (taskId: number) => void;
}) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  const todayTasks: TaskItem[] = [];
  const tomorrowTasks: TaskItem[] = [];
  const thisWeekTasks: TaskItem[] = [];

  tasks.forEach((task, idx) => {
    if (!task.due_date) {
      if (idx % 3 === 0) todayTasks.push(task);
      else if (idx % 3 === 1) tomorrowTasks.push(task);
      else thisWeekTasks.push(task);
      return;
    }

    const d = new Date(task.due_date);
    d.setHours(0, 0, 0, 0);

    if (d.getTime() <= today.getTime()) {
      todayTasks.push(task);
    } else if (d.getTime() === tomorrow.getTime()) {
      tomorrowTasks.push(task);
    } else {
      thisWeekTasks.push(task);
    }
  });

  const groups = [
    { name: 'Today', list: todayTasks },
    { name: 'Tomorrow', list: tomorrowTasks },
    { name: 'This week', list: thisWeekTasks },
  ];

  const getTeamName = (task: TaskItem, idx: number) => {
    if (task.category?.name) return task.category.name;
    const teams = ['Marketing', 'Operations', 'Engineering', 'Product', 'Design'];
    return teams[idx % teams.length];
  };

  return (
    <div className="space-y-6">
      {groups.map((group) => (
        <div key={group.name} className="organizo-card p-6 overflow-hidden">
          {/* Header Row */}
          <div className="flex items-center justify-between border-b border-[var(--card-border)] pb-3 mb-2">
            <h3 className="font-bold text-base text-[var(--text-main)]">
              {group.name} <span className="text-xs font-normal text-[var(--text-muted)]">({group.list.length})</span>
            </h3>
            <div className="hidden md:grid grid-cols-[130px_100px_100px_110px_70px] text-right text-[0.68rem] font-bold uppercase tracking-wider text-[var(--text-subtle)]">
              <span className="text-left">Due Date</span>
              <span className="text-center">Stage</span>
              <span className="text-center">Priority</span>
              <span className="text-left">Category</span>
              <span className="text-center">Actions</span>
            </div>
          </div>

          {/* Task Rows */}
          {group.list.length === 0 ? (
            <div className="py-6 text-center text-xs text-[var(--text-muted)]">
              No tasks scheduled for {group.name.toLowerCase()}.
            </div>
          ) : (
            <div className="divide-y divide-[var(--card-border)]">
              {group.list.map((task, idx) => {
                const deadline = getDeadlineStatus(task.due_date, task.is_completed);

                return (
                  <div
                    key={task.id}
                    className="flex flex-col md:flex-row md:items-center justify-between py-3.5 gap-3 hover:bg-[var(--canvas-bg)] rounded-xl px-2 transition-colors"
                  >
                    {/* Task Left: Circle Radio & Title */}
                    <div className="flex items-center gap-3.5 min-w-0 flex-1">
                      <button
                        onClick={() => onToggleComplete(task)}
                        className={`h-5 w-5 rounded-full border flex items-center justify-center transition-all shrink-0 ${
                          task.is_completed
                            ? 'bg-[var(--btn-primary-bg)] text-[var(--btn-primary-text)] border-[var(--btn-primary-bg)]'
                            : 'border-[var(--card-border)] hover:border-[var(--text-main)]'
                        }`}
                        aria-label="Toggle completed"
                      >
                        {task.is_completed && <span className="text-[10px] font-bold">✓</span>}
                      </button>

                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <span
                            className={`text-xs font-semibold ${
                              task.is_completed
                                ? 'line-through text-[var(--text-subtle)]'
                                : 'text-[var(--text-main)]'
                            }`}
                          >
                            {task.title}
                          </span>

                          {/* High priority small red icon indicator */}
                          {task.priority === 'High' && (
                            <span
                              className="inline-flex items-center gap-1 text-[10px] font-bold text-red-500 bg-red-500/10 border border-red-500/20 px-1.5 py-0.2 rounded-full"
                              title="High Priority"
                            >
                              <span className="h-1.5 w-1.5 rounded-full bg-red-500 animate-pulse" />
                              High
                            </span>
                          )}
                        </div>

                        {task.description && (
                          <p className="line-clamp-1 text-[0.68rem] text-[var(--text-muted)] mt-0.5">
                            {task.description}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Task Metadata Columns */}
                    <div className="flex flex-wrap md:grid md:grid-cols-[130px_100px_100px_110px_70px] items-center gap-2 md:gap-0">
                      {/* Due Date with deadline color conditions:
                          - <= 2 days: Red
                          - <= 5 days: Yellow
                          - normal: standard neutral */}
                      <div>
                        {deadline.status === 'urgent-red' ? (
                          <span className="inline-flex items-center gap-1 text-[0.7rem] px-2 py-0.5 rounded-full font-semibold bg-red-100 text-red-800 border border-red-300 dark:bg-red-950/50 dark:text-red-300 dark:border-red-700/60 shadow-xs">
                            <span className="text-[9px]">⚠️</span>
                            <span>{deadline.label}</span>
                          </span>
                        ) : deadline.status === 'warning-yellow' ? (
                          <span className="inline-flex items-center gap-1 text-[0.7rem] px-2 py-0.5 rounded-full font-semibold bg-amber-100 text-amber-900 border border-amber-300 dark:bg-amber-950/50 dark:text-amber-300 dark:border-amber-700/60 shadow-xs">
                            <span className="text-[9px]">⏱</span>
                            <span>{deadline.label}</span>
                          </span>
                        ) : (
                          <span className="text-xs text-[var(--text-muted)] font-medium">
                            {task.due_date ? new Date(task.due_date).toLocaleDateString() : group.name}
                          </span>
                        )}
                      </div>

                      {/* Stage (Monochrome) */}
                      <div className="text-center">
                        <span className="pill-badge pill-stage text-[0.68rem]">
                          {task.is_completed || task.status === 'done'
                            ? 'Completed'
                            : task.status === 'in_progress'
                            ? 'In Progress'
                            : 'To Do'}
                        </span>
                      </div>

                      {/* Priority */}
                      <div className="text-center">
                        <span
                          className={`pill-badge ${
                            task.priority === 'High'
                              ? 'bg-red-500 text-white dark:bg-red-600 font-bold'
                              : task.priority === 'Medium'
                              ? 'pill-medium'
                              : 'pill-low'
                          } text-[0.68rem]`}
                        >
                          {task.priority === 'High' && (
                            <span className="h-1.5 w-1.5 rounded-full bg-white mr-1 inline-block" />
                          )}
                          {task.priority || 'Normal'}
                        </span>
                      </div>

                      {/* Team / Category */}
                      <span className="text-xs text-[var(--text-muted)] truncate">
                        {getTeamName(task, idx)}
                      </span>

                      {/* Actions */}
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => onEdit(task)}
                          title="Edit task"
                          className="text-xs font-medium text-[var(--text-muted)] hover:text-[var(--text-main)]"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => onDelete(task.id)}
                          title="Delete task"
                          className="text-xs font-medium text-[var(--text-subtle)] hover:text-red-500"
                        >
                          Del
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
