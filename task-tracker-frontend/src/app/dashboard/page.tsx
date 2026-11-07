'use client';

import { useEffect, useState, useRef, useMemo } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { OrganizoLayout } from '@/components/layout/OrganizoLayout';
import { CalendarWidget } from '@/components/dashboard/CalendarWidget';
import { CalendarView } from '@/components/dashboard/CalendarView';
import { TrackingWidget } from '@/components/dashboard/TrackingWidget';
import { CategoriesWidget } from '@/components/dashboard/CategoriesWidget';
import { GroupedTaskTable, TaskItem } from '@/components/dashboard/GroupedTaskTable';
import { KanbanBoard, TaskStatus, BoardTask } from '@/components/KanbanBoard';
import { DashboardAnalytics } from '@/components/DashboardAnalytics';
import { getDeadlineStatus, triggerSystemNotification } from '@/lib/utils';
import toast, { Toaster } from 'react-hot-toast';

interface Category {
  id: number;
  name: string;
}

export default function DashboardPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [tasks, setTasks] = useState<TaskItem[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoadingTasks, setIsLoadingTasks] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

  // View mode: 'dashboard' or 'tasks'
  const searchParams = useSearchParams();
  const viewParam = searchParams.get('view');
  const [currentView, setCurrentView] = useState<'dashboard' | 'tasks'>(
    viewParam === 'tasks' ? 'tasks' : 'dashboard'
  );

  // Sub-view toggle for tasks: 'table' vs 'kanban' vs 'calendar'
  const [tasksSubView, setTasksSubView] = useState<'table' | 'kanban' | 'calendar'>('table');

  // Selected date on calendar
  const [selectedCalendarDate, setSelectedCalendarDate] = useState<string>(() => {
    const today = new Date();
    return `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
  });

  // Search and filters
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'completed' | 'pending'>('all');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  // Modal states
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [categoryId, setCategoryId] = useState<string>('');
  const [dueDate, setDueDate] = useState<string>('');
  const [priority, setPriority] = useState<'High' | 'Medium' | 'Low' | ''>('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Edit Task Modal
  const [editingTask, setEditingTask] = useState<TaskItem | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [editCategoryId, setEditCategoryId] = useState<string>('');
  const [editDueDate, setEditDueDate] = useState<string>('');
  const [editPriority, setEditPriority] = useState<'High' | 'Medium' | 'Low' | ''>('');
  const [isUpdating, setIsUpdating] = useState(false);

  // Category Modal
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');

  // Delete Confirmation Modal
  const [taskToDelete, setTaskToDelete] = useState<number | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const router = useRouter();

  // Urgent tasks calculation (<= 2 days deadline or overdue)
  const urgentTasks = useMemo(() => {
    return tasks
      .filter((t) => !t.is_completed && t.due_date)
      .map((t) => {
        const statusInfo = getDeadlineStatus(t.due_date, t.is_completed);
        return {
          id: t.id,
          title: t.title,
          due_date: t.due_date,
          priority: t.priority,
          label: statusInfo.label,
          status: statusInfo.status,
        };
      })
      .filter((t) => t.status === 'urgent-red');
  }, [tasks]);

  // System notification for urgent tasks (within 1-2 days or overdue)
  const hasNotifiedRef = useRef(false);
  useEffect(() => {
    if (urgentTasks.length > 0 && !hasNotifiedRef.current) {
      hasNotifiedRef.current = true;
      triggerSystemNotification('Task Tracker Alert', {
        body: `You have ${urgentTasks.length} urgent task(s) due within 1-2 days or overdue!`,
      });
    }
  }, [urgentTasks]);

  useEffect(() => {
    if (viewParam === 'tasks') setCurrentView('tasks');
    else setCurrentView('dashboard');
  }, [viewParam]);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/login');
    } else {
      setIsAuthenticated(true);
      fetchTasks(token);
      fetchCategories(token);
      fetch('http://localhost:8000/users/me', { headers: { Authorization: `Bearer ${token}` } })
        .then((response) => (response.ok ? response.json() : null))
        .then((user) => setIsAdmin(user?.is_admin === true))
        .catch(() => setIsAdmin(false));
    }
  }, [router]);

  const fetchCategories = async (token: string) => {
    try {
      const response = await fetch('http://localhost:8000/categories/', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });
      if (response.ok) {
        const data = await response.json();
        setCategories(data);
      }
    } catch {
      toast.error('Failed to load categories');
    }
  };

  const fetchTasks = async (token: string) => {
    try {
      const response = await fetch('http://localhost:8000/tasks/', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });
      if (response.status === 401) {
        localStorage.removeItem('token');
        router.push('/login');
        return;
      }
      if (!response.ok) throw new Error('Failed to fetch tasks');
      const data = await response.json();
      setTasks(data);
    } catch (err: unknown) {
      if (err instanceof Error) toast.error(err.message);
    } finally {
      setIsLoadingTasks(false);
    }
  };

  const handlePlaceTaskOnDate = (dateStr: string) => {
    setDueDate(dateStr);
    setSelectedCalendarDate(dateStr);
    setShowCreateModal(true);
  };

  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    setIsSubmitting(true);
    const toastId = toast.loading('Adding task...');
    const token = localStorage.getItem('token');

    if (!token) {
      router.push('/login');
      return;
    }

    try {
      const response = await fetch('http://localhost:8000/tasks/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          title,
          description,
          category_id: categoryId ? Number(categoryId) : null,
          due_date: dueDate || null,
          priority: priority || null,
        }),
      });

      if (response.status === 401) {
        localStorage.removeItem('token');
        router.push('/login');
        return;
      }
      if (!response.ok) throw new Error('Failed to create task');

      const newTask = await response.json();
      setTasks((prev) => [newTask, ...prev]);

      setTitle('');
      setDescription('');
      setCategoryId('');
      setDueDate('');
      setPriority('');
      setShowCreateModal(false);
      toast.success('Task scheduled successfully!', { id: toastId });
    } catch (err: unknown) {
      if (err instanceof Error) toast.error(err.message, { id: toastId });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCreateCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCategoryName.trim()) return;

    const toastId = toast.loading('Creating category...');
    const token = localStorage.getItem('token');
    if (!token) return;

    try {
      const response = await fetch('http://localhost:8000/categories/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ name: newCategoryName }),
      });

      if (response.ok) {
        const createdCategory = await response.json();
        setCategories((prev) => [...prev, createdCategory]);
        setCategoryId(String(createdCategory.id));
        setNewCategoryName('');
        setShowCategoryModal(false);
        toast.success('Category added!', { id: toastId });
      } else {
        throw new Error('Failed to create category');
      }
    } catch (err: unknown) {
      if (err instanceof Error) toast.error(err.message, { id: toastId });
    }
  };

  const handleToggleComplete = async (task: TaskItem) => {
    const token = localStorage.getItem('token');
    if (!token) return;

    try {
      const response = await fetch(`http://localhost:8000/tasks/${task.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          ...task,
          is_completed: !task.is_completed,
        }),
      });

      if (!response.ok) throw new Error('Failed to update status');

      const updatedTask = await response.json();
      setTasks((prev) => prev.map((t) => (t.id === task.id ? updatedTask : t)));
      if (updatedTask.is_completed) toast.success('Task marked as completed');
    } catch (err: unknown) {
      if (err instanceof Error) toast.error(err.message);
    }
  };

  const persistKanbanChange = async (task: BoardTask, status: TaskStatus, position: number) => {
    const token = localStorage.getItem('token');
    if (!token) return;
    const response = await fetch(`http://localhost:8000/tasks/${task.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({
        title: task.title,
        description: task.description || '',
        category_id: (task as any).category_id ?? null,
        due_date: task.due_date ?? null,
        priority: task.priority || null,
        is_completed: status === 'done',
        status,
        position,
      }),
    });
    if (response.status === 401) {
      localStorage.removeItem('token');
      router.push('/login');
      return;
    }
    if (!response.ok) throw new Error('Could not save task position');
  };

  const handleStartEdit = (task: TaskItem) => {
    setEditingTask(task);
    setEditTitle(task.title);
    setEditDescription(task.description || '');
    setEditCategoryId(task.category_id ? String(task.category_id) : '');
    setEditDueDate(task.due_date ? task.due_date.split('T')[0] : '');
    setEditPriority(task.priority || '');
  };

  const handleUpdateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingTask || !editTitle.trim()) return;

    setIsUpdating(true);
    const toastId = toast.loading('Saving changes...');
    const token = localStorage.getItem('token');
    if (!token) return;

    try {
      const response = await fetch(`http://localhost:8000/tasks/${editingTask.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          title: editTitle,
          description: editDescription,
          is_completed: editingTask.is_completed,
          category_id: editCategoryId ? Number(editCategoryId) : null,
          due_date: editDueDate || null,
          priority: editPriority || null,
        }),
      });

      if (!response.ok) throw new Error('Failed to update task');

      const updatedTask = await response.json();
      setTasks((prev) => prev.map((t) => (t.id === editingTask.id ? updatedTask : t)));
      setEditingTask(null);
      toast.success('Task updated successfully!', { id: toastId });
    } catch (err: unknown) {
      if (err instanceof Error) toast.error(err.message, { id: toastId });
    } finally {
      setIsUpdating(false);
    }
  };

  const confirmDeleteTask = async () => {
    if (!taskToDelete) return;
    setIsDeleting(true);
    const toastId = toast.loading('Deleting task...');
    const token = localStorage.getItem('token');
    if (!token) return;

    try {
      const response = await fetch(`http://localhost:8000/tasks/${taskToDelete}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!response.ok) throw new Error('Failed to delete task');

      setTasks((prev) => prev.filter((task) => task.id !== taskToDelete));
      setTaskToDelete(null);
      toast.success('Task deleted successfully!', { id: toastId });
    } catch (err: unknown) {
      if (err instanceof Error) toast.error(err.message, { id: toastId });
    } finally {
      setIsDeleting(false);
    }
  };

  // Filtered task logic
  const filteredTasks = tasks.filter((task) => {
    if (selectedCategory !== 'all') {
      if (selectedCategory === 'none' && task.category_id) return false;
      if (selectedCategory !== 'none' && String(task.category_id) !== String(selectedCategory)) return false;
    }
    if (statusFilter === 'completed' && !task.is_completed) return false;
    if (statusFilter === 'pending' && task.is_completed) return false;
    if (searchTerm.trim() !== '') {
      const term = searchTerm.toLowerCase();
      const matchTitle = task.title.toLowerCase().includes(term);
      const matchDesc = task.description?.toLowerCase().includes(term) ?? false;
      if (!matchTitle && !matchDesc) return false;
    }
    return true;
  });

  if (!isAuthenticated) {
    return (
      <div className="grid min-h-screen place-items-center bg-[var(--canvas-bg)] text-[var(--text-main)]">
        <div className="flex flex-col items-center gap-3">
          <div className="h-7 w-7 animate-spin rounded-full border-2 border-[var(--text-main)] border-t-transparent" />
          <p className="text-xs text-[var(--text-muted)] font-medium">Loading workspace...</p>
        </div>
      </div>
    );
  }

  return (
    <OrganizoLayout
      activeNav={currentView === 'dashboard' ? 'dashboard' : 'tasks'}
      onNewTaskClick={() => setShowCreateModal(true)}
      searchTerm={searchTerm}
      onSearchChange={setSearchTerm}
      urgentTasks={urgentTasks}
    >
      <Toaster position="top-right" />

      {/* ────────────────────────────────────────────────────────
          VIEW 1: DASHBOARD OVERVIEW WITH CALENDAR & WIDGETS
          ──────────────────────────────────────────────────────── */}
      {currentView === 'dashboard' ? (
        <div className="space-y-6">
          {/* Main 3-column widgets grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {/* 1. Interactive Calendar Widget (View & place tasks on dates) */}
            <CalendarWidget
              tasks={tasks}
              selectedDate={selectedCalendarDate}
              onSelectDate={setSelectedCalendarDate}
              onPlaceTaskOnDate={handlePlaceTaskOnDate}
              onToggleComplete={handleToggleComplete}
            />

            {/* 2. My Tasks Widget */}
            <div className="organizo-card p-6 flex flex-col justify-between">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-sm text-[var(--text-main)]">
                  My Tasks ({String(tasks.length).padStart(2, '0')})
                </h3>
                <span className="text-xs text-[var(--text-subtle)]">Active</span>
              </div>

              <div className="space-y-2.5">
                {tasks.slice(0, 5).map((t) => {
                  const deadline = getDeadlineStatus(t.due_date, t.is_completed);
                  return (
                    <div key={t.id} className="flex items-center justify-between py-1 gap-2">
                      <div className="flex items-center gap-2.5 min-w-0">
                        <button
                          onClick={() => handleToggleComplete(t)}
                          className={`h-4 w-4 rounded-full border flex items-center justify-center transition-all shrink-0 ${
                            t.is_completed
                              ? 'bg-[var(--btn-primary-bg)] text-[var(--btn-primary-text)] border-[var(--btn-primary-bg)]'
                              : 'border-[var(--card-border)] hover:border-[var(--text-main)]'
                          }`}
                        >
                          {t.is_completed && <span className="text-[8px] font-bold">✓</span>}
                        </button>
                        {t.priority === 'High' && (
                          <span className="h-2 w-2 rounded-full bg-red-500 shrink-0 inline-block" title="High Priority" />
                        )}
                        <span
                          className={`text-xs font-semibold truncate ${
                            t.is_completed ? 'line-through text-[var(--text-subtle)]' : 'text-[var(--text-main)]'
                          }`}
                        >
                          {t.title}
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5 shrink-0">
                        {deadline.status === 'urgent-red' && (
                          <span className="px-1.5 py-0.5 rounded-full text-[9px] font-bold bg-red-500/10 text-red-600 dark:text-red-400 border border-red-500/30">
                            {deadline.label}
                          </span>
                        )}
                        {deadline.status === 'warning-yellow' && (
                          <span className="px-1.5 py-0.5 rounded-full text-[9px] font-bold bg-amber-500/10 text-amber-700 dark:text-amber-300 border border-amber-500/30">
                            {deadline.label}
                          </span>
                        )}
                        {deadline.status === 'normal' && (
                          <span className="text-[0.68rem] text-[var(--text-muted)]">
                            {t.due_date ? new Date(t.due_date).toLocaleDateString() : 'Today'}
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
                {tasks.length === 0 && (
                  <div className="py-8 text-center text-xs text-[var(--text-muted)]">
                    No active tasks. Click &quot;New task&quot; to begin.
                  </div>
                )}
              </div>

              <div className="mt-4 pt-3 border-t border-[var(--card-border)] flex justify-between items-center text-xs">
                <button
                  onClick={() => setCurrentView('tasks')}
                  className="font-semibold text-[var(--text-main)] hover:underline"
                >
                  View all tasks →
                </button>
                <button
                  onClick={() => setShowCreateModal(true)}
                  className="font-bold text-[var(--text-main)] hover:underline"
                >
                  + Add task
                </button>
              </div>
            </div>

            {/* 3. Timer Tracking Widget */}
            <TrackingWidget />

            {/* 4. Categories & Teams Widget */}
            <CategoriesWidget
              categories={categories}
              onAddClick={() => setShowCategoryModal(true)}
            />

            {/* 5. Quick Schedule Widget */}
            <div
              onClick={() => {
                setDueDate(selectedCalendarDate);
                setShowCreateModal(true);
              }}
              className="organizo-card border-dashed border-2 flex flex-col items-center justify-center p-6 text-center cursor-pointer hover:border-[var(--text-main)] hover:bg-[var(--canvas-bg)] transition-all group min-h-[220px]"
            >
              <div className="h-10 w-10 rounded-full flex items-center justify-center bg-[var(--canvas-bg)] text-base font-bold mb-2 group-hover:bg-[var(--btn-primary-bg)] group-hover:text-[var(--btn-primary-text)] transition-colors">
                +
              </div>
              <span className="text-xs font-bold text-[var(--text-main)]">Place task on calendar</span>
              <p className="text-[0.68rem] text-[var(--text-muted)] mt-1">
                Selected: {selectedCalendarDate}
              </p>
            </div>

            {/* 6. Overview Metrics */}
            <div className="organizo-card p-6 flex flex-col justify-between">
              <div>
                <span className="eyebrow">Momentum</span>
                <h3 className="font-bold text-sm text-[var(--text-main)] mt-1">Workspace Summary</h3>
              </div>
              <div className="grid grid-cols-2 gap-3 my-3">
                <div className="p-3 rounded-2xl bg-[var(--canvas-bg)] border border-[var(--card-border)]">
                  <span className="text-[0.65rem] text-[var(--text-muted)] block">Total Tasks</span>
                  <span className="text-xl font-bold text-[var(--text-main)]">{tasks.length}</span>
                </div>
                <div className="p-3 rounded-2xl bg-[var(--canvas-bg)] border border-[var(--card-border)]">
                  <span className="text-[0.65rem] text-[var(--text-muted)] block">Completed</span>
                  <span className="text-xl font-bold text-[var(--text-main)]">
                    {tasks.filter((t) => t.is_completed).length}
                  </span>
                </div>
              </div>
              <div className="text-[0.68rem] text-[var(--text-subtle)] text-right">
                {tasks.length ? Math.round((tasks.filter((t) => t.is_completed).length / tasks.length) * 100) : 0}% completion velocity
              </div>
            </div>
          </div>

          {/* Performance Analytics */}
          <div className="organizo-card p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <span className="eyebrow">Telemetry</span>
                <h3 className="font-bold text-base text-[var(--text-main)]">Performance Analytics</h3>
              </div>
              <button
                onClick={() => setCurrentView('tasks')}
                className="btn-ghost-mono text-xs py-1.5 px-3"
              >
                Go to Task Board →
              </button>
            </div>
            <DashboardAnalytics tasks={tasks as BoardTask[]} />
          </div>
        </div>
      ) : (
        /* ────────────────────────────────────────────────────────
           VIEW 2: TASKS VIEW (TABLE / KANBAN / FULL CALENDAR)
           ──────────────────────────────────────────────────────── */
        <div className="space-y-6">
          {/* Subheader with View Switcher */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <span className="eyebrow">Task Management</span>
              <h1 className="text-2xl font-bold tracking-tight text-[var(--text-main)]">
                My tasks
              </h1>
            </div>

            <div className="flex flex-wrap items-center gap-2.5">
              {/* 3 View Tabs: Table | Kanban | Calendar */}
              <div className="flex items-center bg-[var(--card-bg)] border border-[var(--card-border)] rounded-full p-1 shadow-xs">
                <button
                  onClick={() => setTasksSubView('table')}
                  className={`px-3 py-1 text-xs font-semibold rounded-full transition-all ${
                    tasksSubView === 'table'
                      ? 'bg-[var(--btn-primary-bg)] text-[var(--btn-primary-text)] shadow-xs'
                      : 'text-[var(--text-muted)] hover:text-[var(--text-main)]'
                  }`}
                >
                  Table View
                </button>
                <button
                  onClick={() => setTasksSubView('kanban')}
                  className={`px-3 py-1 text-xs font-semibold rounded-full transition-all ${
                    tasksSubView === 'kanban'
                      ? 'bg-[var(--btn-primary-bg)] text-[var(--btn-primary-text)] shadow-xs'
                      : 'text-[var(--text-muted)] hover:text-[var(--text-main)]'
                  }`}
                >
                  Kanban Board
                </button>
                <button
                  onClick={() => setTasksSubView('calendar')}
                  className={`px-3 py-1 text-xs font-semibold rounded-full transition-all ${
                    tasksSubView === 'calendar'
                      ? 'bg-[var(--btn-primary-bg)] text-[var(--btn-primary-text)] shadow-xs'
                      : 'text-[var(--text-muted)] hover:text-[var(--text-main)]'
                  }`}
                >
                  📅 Calendar View
                </button>
              </div>

              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as any)}
                className="search-pill text-xs max-w-[130px] py-1.5"
              >
                <option value="all">All Stages</option>
                <option value="pending">In Progress</option>
                <option value="completed">Completed</option>
              </select>

              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="search-pill text-xs max-w-[140px] py-1.5"
              >
                <option value="all">All Categories</option>
                <option value="none">Uncategorized</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Subview Content */}
          {isLoadingTasks ? (
            <div className="space-y-4">
              {[1, 2, 3].map((n) => (
                <div key={n} className="organizo-card h-36 animate-pulse p-6 bg-[var(--card-bg)]" />
              ))}
            </div>
          ) : tasksSubView === 'table' ? (
            <GroupedTaskTable
              tasks={filteredTasks}
              onToggleComplete={handleToggleComplete}
              onEdit={handleStartEdit}
              onDelete={(id) => setTaskToDelete(id)}
            />
          ) : tasksSubView === 'kanban' ? (
            <div className="organizo-card p-6">
              <KanbanBoard
                tasks={tasks as BoardTask[]}
                onReorder={(next) => setTasks(next as TaskItem[])}
                onPersist={persistKanbanChange}
              />
            </div>
          ) : (
            /* Dedicated Full-Month Calendar View */
            <CalendarView
              tasks={filteredTasks}
              onToggleComplete={handleToggleComplete}
              onEdit={handleStartEdit}
              onPlaceTaskOnDate={handlePlaceTaskOnDate}
            />
          )}
        </div>
      )}

      {/* ── CREATE TASK MODAL ──────────────────────────────────── */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs">
          <div className="organizo-card w-full max-w-lg p-6 sm:p-8 shadow-2xl">
            <div className="flex items-center justify-between border-b border-[var(--card-border)] pb-4">
              <h3 className="text-base font-bold text-[var(--text-main)]">Add New Task</h3>
              <button onClick={() => setShowCreateModal(false)} className="text-sm font-bold text-[var(--text-muted)] hover:text-[var(--text-main)]">
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateTask} className="mt-5 space-y-4">
              <div>
                <label className="mb-1 block text-xs font-semibold text-[var(--text-muted)]">
                  Task Title *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Contract review"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="search-pill text-xs py-2 rounded-xl"
                  disabled={isSubmitting}
                />
              </div>

              <div>
                <label className="mb-1 block text-xs font-semibold text-[var(--text-muted)]">
                  Description
                </label>
                <textarea
                  rows={2}
                  placeholder="Optional details..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="search-pill text-xs py-2 rounded-xl w-full"
                  disabled={isSubmitting}
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="mb-1 block text-xs font-semibold text-[var(--text-muted)]">
                    Category
                  </label>
                  <select
                    value={categoryId}
                    onChange={(e) => setCategoryId(e.target.value)}
                    className="search-pill text-xs py-2 rounded-xl"
                    disabled={isSubmitting}
                  >
                    <option value="">None</option>
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="mb-1 block text-xs font-semibold text-[var(--text-muted)]">
                    Priority
                  </label>
                  <select
                    value={priority}
                    onChange={(e) => setPriority(e.target.value as any)}
                    className="search-pill text-xs py-2 rounded-xl"
                    disabled={isSubmitting}
                  >
                    <option value="">None</option>
                    <option value="High">High</option>
                    <option value="Medium">Medium</option>
                    <option value="Low">Low</option>
                  </select>
                </div>

                <div>
                  <label className="mb-1 block text-xs font-semibold text-[var(--text-muted)]">
                    Due Date
                  </label>
                  <input
                    type="date"
                    value={dueDate}
                    onChange={(e) => setDueDate(e.target.value)}
                    className="search-pill text-xs py-2 rounded-xl"
                    disabled={isSubmitting}
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="btn-ghost-mono text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="btn-primary-mono text-xs"
                >
                  {isSubmitting ? 'Adding...' : 'Create Task'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── EDIT TASK MODAL ────────────────────────────────────── */}
      {editingTask && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs">
          <div className="organizo-card w-full max-w-lg p-6 sm:p-8 shadow-2xl">
            <div className="flex items-center justify-between border-b border-[var(--card-border)] pb-4">
              <h3 className="text-base font-bold text-[var(--text-main)]">Edit Task</h3>
              <button onClick={() => setEditingTask(null)} className="text-sm font-bold text-[var(--text-muted)] hover:text-[var(--text-main)]">
                ✕
              </button>
            </div>

            <form onSubmit={handleUpdateTask} className="mt-5 space-y-4">
              <div>
                <label className="mb-1 block text-xs font-semibold text-[var(--text-muted)]">
                  Task Title *
                </label>
                <input
                  type="text"
                  required
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  className="search-pill text-xs py-2 rounded-xl"
                  disabled={isUpdating}
                />
              </div>

              <div>
                <label className="mb-1 block text-xs font-semibold text-[var(--text-muted)]">
                  Description
                </label>
                <textarea
                  rows={2}
                  value={editDescription}
                  onChange={(e) => setEditDescription(e.target.value)}
                  className="search-pill text-xs py-2 rounded-xl w-full"
                  disabled={isUpdating}
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="mb-1 block text-xs font-semibold text-[var(--text-muted)]">
                    Category
                  </label>
                  <select
                    value={editCategoryId}
                    onChange={(e) => setEditCategoryId(e.target.value)}
                    className="search-pill text-xs py-2 rounded-xl"
                    disabled={isUpdating}
                  >
                    <option value="">None</option>
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="mb-1 block text-xs font-semibold text-[var(--text-muted)]">
                    Priority
                  </label>
                  <select
                    value={editPriority}
                    onChange={(e) => setEditPriority(e.target.value as any)}
                    className="search-pill text-xs py-2 rounded-xl"
                    disabled={isUpdating}
                  >
                    <option value="">None</option>
                    <option value="High">High</option>
                    <option value="Medium">Medium</option>
                    <option value="Low">Low</option>
                  </select>
                </div>

                <div>
                  <label className="mb-1 block text-xs font-semibold text-[var(--text-muted)]">
                    Due Date
                  </label>
                  <input
                    type="date"
                    value={editDueDate}
                    onChange={(e) => setEditDueDate(e.target.value)}
                    className="search-pill text-xs py-2 rounded-xl"
                    disabled={isUpdating}
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setEditingTask(null)}
                  className="btn-ghost-mono text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isUpdating}
                  className="btn-primary-mono text-xs"
                >
                  {isUpdating ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── CREATE CATEGORY MODAL ──────────────────────────────── */}
      {showCategoryModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs">
          <div className="organizo-card w-full max-w-sm p-6 shadow-2xl">
            <h3 className="text-base font-bold text-[var(--text-main)]">Add Category</h3>
            <form onSubmit={handleCreateCategory} className="mt-4 space-y-4">
              <div>
                <label className="mb-1 block text-xs font-semibold text-[var(--text-muted)]">
                  Category Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Operations, Legal"
                  value={newCategoryName}
                  onChange={(e) => setNewCategoryName(e.target.value)}
                  className="search-pill text-xs py-2 rounded-xl"
                />
              </div>
              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowCategoryModal(false)}
                  className="btn-ghost-mono text-xs"
                >
                  Cancel
                </button>
                <button type="submit" className="btn-primary-mono text-xs">
                  Create Category
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── DELETE TASK MODAL ──────────────────────────────────── */}
      {taskToDelete !== null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs">
          <div className="organizo-card w-full max-w-sm p-6 shadow-2xl">
            <h3 className="text-base font-bold text-[var(--text-main)]">Delete Task?</h3>
            <p className="mt-2 text-xs leading-relaxed text-[var(--text-muted)]">
              Are you sure you want to delete this task? This action cannot be undone.
            </p>
            <div className="mt-5 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setTaskToDelete(null)}
                disabled={isDeleting}
                className="btn-ghost-mono text-xs"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={confirmDeleteTask}
                disabled={isDeleting}
                className="btn-primary-mono bg-red-600 hover:bg-red-700 text-white text-xs"
              >
                {isDeleting ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </OrganizoLayout>
  );
}
