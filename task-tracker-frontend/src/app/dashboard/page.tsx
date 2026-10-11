'use client';

import { useEffect, useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { ThemeControls } from '@/components/ThemeControls';
import toast, { Toaster } from 'react-hot-toast';
import { KanbanBoard, TaskStatus } from '@/components/KanbanBoard';
import { DashboardAnalytics } from '@/components/DashboardAnalytics';
import Link from 'next/link';

interface Category {
  id: number;
  name: string;
}

interface Task {
  id: number;
  title: string;
  description?: string;
  is_completed: boolean;
  category_id?: number | null;
  category?: { id: number; name: string };
  due_date?: string | null;
  priority?: 'High' | 'Medium' | 'Low' | '' | null;
  status?: TaskStatus | string | null;
  position?: number;
}

export default function DashboardPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoadingTasks, setIsLoadingTasks] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

  // Filtering and sorting states
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'completed' | 'pending'>('all');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [priorityFilter, setPriorityFilter] = useState<'all' | 'High' | 'Medium' | 'Low' | 'none'>('all');
  const [sortBy, setSortBy] = useState<'default' | 'priority' | 'due_date' | 'title'>('default');

  // Create Task Form states
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [categoryId, setCategoryId] = useState<string>('');
  const [dueDate, setDueDate] = useState<string>('');
  const [priority, setPriority] = useState<'High' | 'Medium' | 'Low' | ''>('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Edit Task Modal states
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [editCategoryId, setEditCategoryId] = useState<string>('');
  const [editDueDate, setEditDueDate] = useState<string>('');
  const [editPriority, setEditPriority] = useState<'High' | 'Medium' | 'Low' | ''>('');
  const [isUpdating, setIsUpdating] = useState(false);

  // New Category Modal states
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [isCreatingCategory, setIsCreatingCategory] = useState(false);

  // Delete Confirmation Modal states
  const [taskToDelete, setTaskToDelete] = useState<number | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const router = useRouter();

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

  // Handle ESC key to close open modals
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (editingTask) setEditingTask(null);
        if (showCategoryModal) setShowCategoryModal(false);
        if (taskToDelete !== null) setTaskToDelete(null);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [editingTask, showCategoryModal, taskToDelete]);

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
      toast.error(err instanceof Error ? err.message : 'Could not fetch tasks');
    } finally {
      setIsLoadingTasks(false);
    }
  };

  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || isSubmitting) return;

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
          title: title.trim(),
          description: description.trim(),
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

      // Reset form
      setTitle('');
      setDescription('');
      setCategoryId('');
      setDueDate('');
      setPriority('');
      toast.success('Task created successfully!', { id: toastId });
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Error creating task', { id: toastId });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCreateCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCategoryName.trim() || isCreatingCategory) return;

    setIsCreatingCategory(true);
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
        body: JSON.stringify({ name: newCategoryName.trim() }),
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
      toast.error(err instanceof Error ? err.message : 'Error creating category', { id: toastId });
    } finally {
      setIsCreatingCategory(false);
    }
  };

  const handleToggleComplete = async (task: Task) => {
    const token = localStorage.getItem('token');
    if (!token) return;

    try {
      const nextCompleted = !task.is_completed;
      const response = await fetch(`http://localhost:8000/tasks/${task.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          title: task.title,
          description: task.description || '',
          category_id: task.category_id ?? null,
          due_date: task.due_date ?? null,
          priority: task.priority || null,
          is_completed: nextCompleted,
          status: nextCompleted ? 'done' : 'todo',
          position: task.position ?? 0,
        }),
      });

      if (!response.ok) throw new Error('Failed to update status');

      const updatedTask = await response.json();
      setTasks((prev) => prev.map((t) => (t.id === task.id ? updatedTask : t)));
      if (updatedTask.is_completed) toast.success('Task marked as completed!');
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Error updating task');
    }
  };

  const persistKanbanChange = async (task: Task, status: TaskStatus, position: number) => {
    const token = localStorage.getItem('token');
    if (!token) return;
    const response = await fetch(`http://localhost:8000/tasks/${task.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({
        title: task.title,
        description: task.description || '',
        category_id: task.category_id ?? null,
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
    if (!response.ok) throw new Error('Could not save the task position');
  };

  const handleStartEdit = (task: Task) => {
    setEditingTask(task);
    setEditTitle(task.title);
    setEditDescription(task.description || '');
    setEditCategoryId(task.category_id ? String(task.category_id) : '');
    setEditDueDate(task.due_date ? task.due_date.split('T')[0] : '');
    setEditPriority(task.priority || '');
  };

  const handleUpdateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingTask || !editTitle.trim() || isUpdating) return;

    setIsUpdating(true);
    const toastId = toast.loading('Updating task...');
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
          title: editTitle.trim(),
          description: editDescription.trim(),
          is_completed: editingTask.is_completed,
          category_id: editCategoryId ? Number(editCategoryId) : null,
          due_date: editDueDate || null,
          priority: editPriority || null,
          status: editingTask.status || (editingTask.is_completed ? 'done' : 'todo'),
          position: editingTask.position ?? 0,
        }),
      });

      if (!response.ok) throw new Error('Failed to update task');

      const updatedTask = await response.json();
      setTasks((prev) => prev.map((t) => (t.id === editingTask.id ? updatedTask : t)));
      setEditingTask(null);
      toast.success('Task updated successfully!', { id: toastId });
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Error updating task', { id: toastId });
    } finally {
      setIsUpdating(false);
    }
  };

  const confirmDeleteTask = async () => {
    if (!taskToDelete || isDeleting) return;
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
      toast.error(err instanceof Error ? err.message : 'Error deleting task', { id: toastId });
    } finally {
      setIsDeleting(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    router.push('/login');
    toast.success('Logged out successfully');
  };

  // Helper function: Check if task is overdue
  const isOverdue = (dateString?: string | null, isCompleted?: boolean) => {
    if (!dateString || isCompleted) return false;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const parts = dateString.split('T')[0].split('-');
    if (parts.length === 3) {
      const dueDate = new Date(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2]));
      return dueDate < today;
    }
    const dueDate = new Date(dateString);
    return dueDate < today;
  };

  // Helper function: Get priority badge styles
  const getPriorityStyles = (priority?: string | null) => {
    switch (priority) {
      case 'High':
        return 'border border-rose-500/30 bg-rose-500/15 text-rose-300';
      case 'Medium':
        return 'border border-amber-500/30 bg-amber-500/15 text-amber-300';
      case 'Low':
        return 'border border-emerald-500/30 bg-emerald-500/15 text-emerald-300';
      default:
        return 'hidden';
    }
  };

  const getPriorityWeight = (priority?: string | null) => {
    if (priority === 'High') return 3;
    if (priority === 'Medium') return 2;
    if (priority === 'Low') return 1;
    return 0;
  };

  // FILTER & SORT LOGIC
  const filteredTasks = useMemo(() => {
    const list = tasks.filter((task) => {
      // Category filter
      if (selectedCategory !== 'all') {
        if (selectedCategory === 'none' && task.category_id) return false;
        if (selectedCategory !== 'none' && String(task.category_id) !== String(selectedCategory)) return false;
      }
      // Status filter
      if (statusFilter === 'completed' && !task.is_completed) return false;
      if (statusFilter === 'pending' && task.is_completed) return false;

      // Priority filter
      if (priorityFilter !== 'all') {
        if (priorityFilter === 'none') {
          if (task.priority) return false;
        } else if (task.priority !== priorityFilter) {
          return false;
        }
      }

      // Search term
      if (searchTerm.trim() !== '') {
        const term = searchTerm.toLowerCase();
        const matchTitle = task.title.toLowerCase().includes(term);
        const matchDesc = task.description?.toLowerCase().includes(term) ?? false;
        if (!matchTitle && !matchDesc) return false;
      }
      return true;
    });

    // Sorting
    return list.sort((a, b) => {
      if (sortBy === 'priority') {
        // Highest-priority tasks appear first (High -> Medium -> Low -> None)
        const weightA = getPriorityWeight(a.priority);
        const weightB = getPriorityWeight(b.priority);
        if (weightA !== weightB) return weightB - weightA;
        if (a.due_date && b.due_date) return new Date(a.due_date).getTime() - new Date(b.due_date).getTime();
        return b.id - a.id;
      }
      if (sortBy === 'due_date') {
        if (a.due_date && b.due_date) return new Date(a.due_date).getTime() - new Date(b.due_date).getTime();
        if (a.due_date) return -1;
        if (b.due_date) return 1;
        return 0;
      }
      if (sortBy === 'title') {
        return a.title.localeCompare(b.title);
      }
      return 0;
    });
  }, [tasks, selectedCategory, statusFilter, priorityFilter, searchTerm, sortBy]);

  const hasActiveFilters =
    searchTerm.trim() !== '' ||
    statusFilter !== 'all' ||
    selectedCategory !== 'all' ||
    priorityFilter !== 'all' ||
    sortBy !== 'default';

  const resetFilters = () => {
    setSearchTerm('');
    setStatusFilter('all');
    setSelectedCategory('all');
    setPriorityFilter('all');
    setSortBy('default');
  };

  if (!isAuthenticated) {
    return (
      <div className="neon-page grid place-items-center">
        <div className="glass-panel animate-pulse rounded-2xl px-9 py-8 text-center">
          <div className="mx-auto mb-4 h-9 w-9 rounded-full border-2 border-neon-cyan/20 border-t-neon-cyan animate-spin" />
          <p className="text-sm font-medium text-[#9aa4c7]">Checking authentication...</p>
        </div>
      </div>
    );
  }

  return (
    <main className="neon-page grid-overlay min-h-screen">
      <Toaster position="top-right" reverseOrder={false} />

      <header className="mx-auto max-w-[1240px] px-4 pt-4">
        <div className="glass-panel flex items-center justify-between rounded-2xl px-5 py-3">
          <Link href="/dashboard" className="inline-flex items-center gap-2.5 text-[1.1rem] font-bold">
            <span className="grid h-9 w-9 place-items-center overflow-hidden rounded-xl border border-white/20 bg-[#11142c] shadow-neon">
              <img src="/taskflow-logo.png" alt="Taskflow" className="h-full w-full object-cover" />
            </span>
            <span className="text-[#f8f7ff]">Taskflow</span>
          </Link>
          <nav className="ml-auto mr-5 flex items-center gap-5 text-sm text-[#9898ad] max-[800px]:hidden">
            <Link className="transition-colors hover:text-neon-cyan" href="/profile">
              Profile
            </Link>
            {isAdmin && (
              <Link className="transition-colors hover:text-neon-cyan" href="/admin">
                Admin panel
              </Link>
            )}
          </nav>
          <div className="flex items-center gap-2">
            <ThemeControls />
            <button
              onClick={handleLogout}
              className="glass-button border-rose-400/30 px-3.5 py-1.5 text-xs font-semibold text-rose-300 hover:border-rose-400/60 hover:bg-rose-500/10"
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-[1180px] px-7 pb-12 pt-10 max-[800px]:px-4 max-[800px]:pt-6">
        <div className="mb-8 flex justify-between">
          <div>
            <span className="eyebrow">Command center · synced live</span>
            <h2 className="my-2.5 text-[clamp(2rem,4vw,3rem)] font-bold tracking-tight text-[#f8f7ff]">
              Keep the <span className="bg-[linear-gradient(90deg,#9b6cff,#27d7ff)] bg-clip-text text-transparent">momentum</span> going.
            </h2>
            <p className="m-0 text-sm text-[#9aa4c7]">
              Plan, prioritize, and move every important task forward.
            </p>
          </div>
        </div>

        <DashboardAnalytics tasks={tasks} />

        {/* WORKBOARD SECTION */}
        <section className="glass-panel rounded-2xl p-6 max-[800px]:p-4">
          <div className="mb-4 flex items-end justify-between max-[480px]:flex-col max-[480px]:items-start max-[480px]:gap-2">
            <div>
              <span className="text-[0.68rem] font-bold uppercase tracking-[0.16em] text-[#b49aff]">
                Drag to organize
              </span>
              <h2 className="mt-1.5 text-xl font-bold tracking-tight text-[#f8f7ff]">Workboard</h2>
            </div>
            <span className="text-xs text-[#9898ad]">Changes sync to your workspace</span>
          </div>

          <KanbanBoard
            tasks={tasks}
            categories={categories}
            onReorder={(nextTasks) => setTasks(nextTasks as Task[])}
            onPersist={async (task, status, position) => {
              try {
                await persistKanbanChange(task as Task, status, position);
                toast.success('Task position saved');
              } catch (error) {
                toast.error(error instanceof Error ? error.message : 'Could not save task position');
                fetchTasks(localStorage.getItem('token') || '');
              }
            }}
          />
        </section>
      </div>

      <div className="mx-auto max-w-[1180px] space-y-6 px-7 pb-20 max-[800px]:px-4">
        {/* ADD TASK FORM */}
        <div className="glass-panel rounded-2xl p-6 max-[800px]:p-4">
          <div className="mb-5 flex items-center justify-between">
            <div>
              <span className="eyebrow">New task</span>
              <h2 className="mt-1 text-xl font-bold text-[#f8f7ff]">Add a task</h2>
            </div>
            <span className="rounded-full border border-neon-lime/30 bg-neon-lime/10 px-3 py-1 text-xs font-semibold text-neon-lime">
              Ready
            </span>
          </div>

          <form onSubmit={handleCreateTask} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-[#cbd3ee]">
                  Task Title *
                </label>
                <input
                  type="text"
                  placeholder="Enter task title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                  disabled={isSubmitting}
                  className="neon-input p-3 text-sm"
                />
              </div>

              <div className="md:col-span-2">
                <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-[#cbd3ee]">
                  Description
                </label>
                <textarea
                  placeholder="Enter task description (optional)"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={2}
                  disabled={isSubmitting}
                  className="neon-input p-3 text-sm"
                />
              </div>

              {/* Category */}
              <div>
                <div className="flex justify-between items-center mb-1.5">
                  <label className="block text-xs font-semibold uppercase tracking-wider text-[#cbd3ee]">
                    Category
                  </label>
                  <button
                    type="button"
                    onClick={() => setShowCategoryModal(true)}
                    className="text-xs font-medium text-neon-cyan hover:underline"
                  >
                    + Add New
                  </button>
                </div>
                <select
                  value={categoryId}
                  onChange={(e) => setCategoryId(e.target.value)}
                  disabled={isSubmitting}
                  className="neon-input p-3 text-sm"
                >
                  <option value="">No Category</option>
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Priority */}
              <div>
                <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-[#cbd3ee]">
                  Priority
                </label>
                <select
                  value={priority}
                  onChange={(e) => setPriority(e.target.value as any)}
                  disabled={isSubmitting}
                  className="neon-input p-3 text-sm"
                >
                  <option value="">None</option>
                  <option value="High">High</option>
                  <option value="Medium">Medium</option>
                  <option value="Low">Low</option>
                </select>
              </div>

              {/* Due Date */}
              <div className="md:col-span-2">
                <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-[#cbd3ee]">
                  Due Date
                </label>
                <input
                  type="date"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  disabled={isSubmitting}
                  className="neon-input p-3 text-sm"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="neon-button mt-2 px-6 py-2.5 text-sm font-semibold disabled:opacity-50"
            >
              {isSubmitting ? 'Adding Task...' : 'Add Task'}
            </button>
          </form>
        </div>

        {/* TASKS LIST */}
        <div className="glass-panel space-y-4 rounded-2xl p-6 max-[800px]:p-4">
          <div className="flex flex-col border-b border-white/[0.08] pb-4 gap-4">
            <div className="flex items-center justify-between">
              <div>
                <span className="eyebrow">Task signal</span>
                <h2 className="mt-1 text-xl font-bold text-[#f8f7ff]">Your tasks</h2>
              </div>
              <span className="text-xs text-[#9898ad]">
                Showing {filteredTasks.length} of {tasks.length}
              </span>
            </div>

            {/* Comprehensive Filters & Priority Sorting */}
            <div className="flex flex-col gap-3">
              <div className="w-full">
                <input
                  type="text"
                  placeholder="Search tasks by title or description..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="neon-input p-3 text-sm"
                />
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                {/* Status Filter */}
                <div>
                  <label className="mb-1 block text-[0.65rem] font-bold uppercase tracking-wider text-[#9aa4c7]">
                    Status
                  </label>
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value as any)}
                    className="neon-input p-2 text-xs"
                  >
                    <option value="all">All Statuses</option>
                    <option value="pending">Pending</option>
                    <option value="completed">Completed</option>
                  </select>
                </div>

                {/* Category Filter */}
                <div>
                  <label className="mb-1 block text-[0.65rem] font-bold uppercase tracking-wider text-[#9aa4c7]">
                    Category
                  </label>
                  <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="neon-input p-2 text-xs"
                  >
                    <option value="all">All Categories</option>
                    <option value="none">Uncategorized</option>
                    {categories.map((cat) => (
                      <option key={cat.id} value={cat.id}>
                        {cat.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Priority Filter */}
                <div>
                  <label className="mb-1 block text-[0.65rem] font-bold uppercase tracking-wider text-[#9aa4c7]">
                    Priority
                  </label>
                  <select
                    value={priorityFilter}
                    onChange={(e) => setPriorityFilter(e.target.value as any)}
                    className="neon-input p-2 text-xs"
                  >
                    <option value="all">All Priorities</option>
                    <option value="High">High Priority</option>
                    <option value="Medium">Medium Priority</option>
                    <option value="Low">Low Priority</option>
                    <option value="none">No Priority</option>
                  </select>
                </div>

                {/* Sort By */}
                <div>
                  <label className="mb-1 block text-[0.65rem] font-bold uppercase tracking-wider text-[#9aa4c7]">
                    Sort By
                  </label>
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value as any)}
                    className="neon-input p-2 text-xs"
                  >
                    <option value="default">Default Order</option>
                    <option value="priority">Priority (Highest first)</option>
                    <option value="due_date">Due Date</option>
                    <option value="title">Title (A-Z)</option>
                  </select>
                </div>
              </div>

              {hasActiveFilters && (
                <div className="flex items-center justify-between pt-1 text-xs text-[#9aa4c7]">
                  <span>Filters are active</span>
                  <button
                    onClick={resetFilters}
                    className="text-neon-cyan hover:underline font-medium"
                  >
                    Reset all filters
                  </button>
                </div>
              )}
            </div>
          </div>

          {isLoadingTasks ? (
            /* --- REFINED DARK GLASS LOADING SKELETON --- */
            <div className="space-y-3">
              {[1, 2, 3].map((n) => (
                <div
                  key={n}
                  className="glass-panel p-4 rounded-xl animate-pulse flex items-center justify-between border-white/[0.06] bg-white/[0.02]"
                >
                  <div className="flex items-start space-x-3 w-full">
                    <div className="mt-1 h-5 w-5 bg-white/10 rounded"></div>
                    <div className="space-y-2 w-full">
                      <div className="h-4 bg-white/10 rounded w-1/3"></div>
                      <div className="h-3 bg-white/[0.06] rounded w-1/2"></div>
                      <div className="flex gap-2">
                        <div className="h-4 w-16 bg-white/[0.06] rounded-full"></div>
                        <div className="h-4 w-20 bg-white/[0.06] rounded-full"></div>
                      </div>
                    </div>
                  </div>
                  <div className="flex space-x-2 ml-4">
                    <div className="h-8 w-12 bg-white/10 rounded-lg"></div>
                    <div className="h-8 w-16 bg-white/10 rounded-lg"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : filteredTasks.length === 0 ? (
            <div className="py-12 text-center rounded-xl border border-dashed border-white/10 bg-white/[0.02]">
              <span className="text-3xl block mb-2">📋</span>
              <p className="text-sm font-semibold text-[#f8f7ff]">No tasks found</p>
              <p className="mt-1 text-xs text-[#9aa4c7]">
                {hasActiveFilters
                  ? 'Try adjusting your filters or search query.'
                  : 'Get started by creating your first task above.'}
              </p>
              {hasActiveFilters && (
                <button
                  onClick={resetFilters}
                  className="glass-button mt-4 px-4 py-2 text-xs font-medium"
                >
                  Reset filters
                </button>
              )}
            </div>
          ) : (
            <ul className="space-y-2.5">
              {filteredTasks.map((task) => {
                const categoryObj = categories.find((c) => String(c.id) === String(task.category_id));
                const taskIsOverdue = isOverdue(task.due_date, task.is_completed);

                return (
                  <li
                    key={task.id}
                    className={`glass-panel flex flex-col justify-between gap-4 rounded-xl p-4 transition-all sm:flex-row sm:items-center ${
                      taskIsOverdue
                        ? 'border-rose-400/40 bg-rose-500/[0.07]'
                        : 'hover:border-white/20'
                    }`}
                  >
                    <div className="flex items-start space-x-3 min-w-0">
                      <input
                        type="checkbox"
                        checked={task.is_completed}
                        onChange={() => handleToggleComplete(task)}
                        aria-label={`Mark task ${task.title} as ${task.is_completed ? 'incomplete' : 'completed'}`}
                        className="mt-1 h-5 w-5 cursor-pointer rounded border-white/30 bg-black/40 text-[#8b5cf6] focus:ring-neon-cyan focus:ring-offset-0"
                      />

                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <h3
                            className={`font-semibold text-sm break-words ${
                              task.is_completed
                                ? 'text-[#7882a5] line-through'
                                : taskIsOverdue
                                ? 'text-rose-300'
                                : 'text-[#f6f7ff]'
                            }`}
                          >
                            {task.title}
                          </h3>

                          {/* Priority Badge */}
                          {task.priority && (
                            <span
                              className={`text-[0.65rem] px-2 py-0.5 rounded-full font-semibold ${getPriorityStyles(
                                task.priority
                              )} ${task.is_completed ? 'opacity-50' : ''}`}
                            >
                              {task.priority}
                            </span>
                          )}

                          {/* Category Badge */}
                          {categoryObj && (
                            <span
                              className={`text-[0.65rem] border border-cyan-400/25 bg-cyan-400/10 text-cyan-300 px-2 py-0.5 rounded-full font-medium ${
                                task.is_completed ? 'opacity-50' : ''
                              }`}
                            >
                              {categoryObj.name}
                            </span>
                          )}
                        </div>

                        {task.description && (
                          <p
                            className={`mt-1 text-xs break-words ${
                              task.is_completed ? 'text-[#7882a5]' : 'text-[#9aa4c7]'
                            }`}
                          >
                            {task.description}
                          </p>
                        )}

                        {/* Due Date Display */}
                        {task.due_date && (
                          <p
                            className={`mt-1.5 flex items-center gap-1 text-[0.68rem] font-medium ${
                              task.is_completed
                                ? 'text-[#7882a5]'
                                : taskIsOverdue
                                ? 'text-rose-300 font-semibold'
                                : 'text-[#9aa4c7]'
                            }`}
                          >
                            <span>📅 Due:</span>
                            <span>{new Date(task.due_date).toLocaleDateString()}</span>
                            {taskIsOverdue && <span className="font-bold text-rose-400">(Overdue)</span>}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center space-x-2 shrink-0 self-end sm:self-center">
                      <button
                        onClick={() => handleStartEdit(task)}
                        className="glass-button px-3.5 py-1.5 text-xs font-semibold text-neon-cyan hover:border-cyan-400/50"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => setTaskToDelete(task.id)}
                        className="glass-button border-rose-400/30 px-3.5 py-1.5 text-xs font-semibold text-rose-300 hover:border-rose-400/60 hover:bg-rose-500/10"
                      >
                        Delete
                      </button>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </div>

      {/* --- ADD CATEGORY MODAL --- */}
      {showCategoryModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-md"
          onClick={() => setShowCategoryModal(false)}
          role="dialog"
          aria-modal="true"
        >
          <div
            className="glass-panel w-full max-w-sm space-y-4 rounded-2xl bg-[#0c122b]/95 p-6 border border-white/10 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-[#f8f7ff]">Add New Category</h3>
              <button
                type="button"
                onClick={() => setShowCategoryModal(false)}
                className="text-[#9898ad] hover:text-white"
              >
                ✕
              </button>
            </div>
            <form onSubmit={handleCreateCategory} className="space-y-4">
              <div>
                <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-[#cbd3ee]">
                  Category Name *
                </label>
                <input
                  type="text"
                  value={newCategoryName}
                  onChange={(e) => setNewCategoryName(e.target.value)}
                  placeholder="e.g. Design, Sprint, Marketing"
                  required
                  disabled={isCreatingCategory}
                  className="neon-input p-3 text-sm"
                />
              </div>
              <div className="flex justify-end space-x-2.5 pt-2">
                <button
                  type="button"
                  onClick={() => setShowCategoryModal(false)}
                  disabled={isCreatingCategory}
                  className="glass-button px-4 py-2 text-xs font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isCreatingCategory}
                  className="neon-button px-5 py-2 text-xs font-semibold disabled:opacity-50"
                >
                  {isCreatingCategory ? 'Creating...' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* --- DELETE CONFIRMATION MODAL --- */}
      {taskToDelete !== null && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-md"
          onClick={() => setTaskToDelete(null)}
          role="dialog"
          aria-modal="true"
        >
          <div
            className="glass-panel w-full max-w-sm space-y-4 rounded-2xl bg-[#0c122b]/95 p-6 border border-white/10 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-lg font-bold text-[#f8f7ff]">Delete Task?</h3>
            <p className="text-sm text-[#9898ad] leading-relaxed">
              Are you sure you want to delete this task? This action cannot be undone.
            </p>
            <div className="flex justify-end space-x-2.5 pt-3">
              <button
                type="button"
                onClick={() => setTaskToDelete(null)}
                disabled={isDeleting}
                className="glass-button px-4 py-2 text-xs font-medium"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={confirmDeleteTask}
                disabled={isDeleting}
                className="rounded-xl border border-rose-500/40 bg-rose-500/20 px-4 py-2 text-xs font-semibold text-rose-300 hover:bg-rose-500/30 transition-colors disabled:opacity-50"
              >
                {isDeleting ? 'Deleting...' : 'Yes, Delete'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* --- EDIT TASK MODAL (DARK THEME & CONSISTENT) --- */}
      {editingTask && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-md"
          onClick={() => setEditingTask(null)}
          role="dialog"
          aria-modal="true"
        >
          <div
            className="glass-panel w-full max-w-md space-y-4 rounded-2xl bg-[#0c122b]/95 p-6 border border-white/10 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-[#f8f7ff]">Edit Task</h3>
              <button
                type="button"
                onClick={() => setEditingTask(null)}
                className="text-[#9898ad] hover:text-white"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleUpdateTask} className="space-y-4">
              <div>
                <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-[#cbd3ee]">
                  Task Title *
                </label>
                <input
                  type="text"
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  required
                  disabled={isUpdating}
                  className="neon-input p-3 text-sm"
                />
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-[#cbd3ee]">
                  Description
                </label>
                <textarea
                  value={editDescription}
                  onChange={(e) => setEditDescription(e.target.value)}
                  rows={2}
                  disabled={isUpdating}
                  className="neon-input p-3 text-sm"
                />
              </div>

              <div className="grid grid-cols-2 gap-3.5">
                <div>
                  <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-[#cbd3ee]">
                    Category
                  </label>
                  <select
                    value={editCategoryId}
                    onChange={(e) => setEditCategoryId(e.target.value)}
                    disabled={isUpdating}
                    className="neon-input p-2.5 text-sm"
                  >
                    <option value="">No Category</option>
                    {categories.map((cat) => (
                      <option key={cat.id} value={cat.id}>
                        {cat.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-[#cbd3ee]">
                    Priority
                  </label>
                  <select
                    value={editPriority}
                    onChange={(e) => setEditPriority(e.target.value as any)}
                    disabled={isUpdating}
                    className="neon-input p-2.5 text-sm"
                  >
                    <option value="">None</option>
                    <option value="High">High</option>
                    <option value="Medium">Medium</option>
                    <option value="Low">Low</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-[#cbd3ee]">
                  Due Date
                </label>
                <input
                  type="date"
                  value={editDueDate}
                  onChange={(e) => setEditDueDate(e.target.value)}
                  disabled={isUpdating}
                  className="neon-input p-2.5 text-sm"
                />
              </div>

              <div className="flex justify-end space-x-2.5 pt-2">
                <button
                  type="button"
                  onClick={() => setEditingTask(null)}
                  disabled={isUpdating}
                  className="glass-button px-4 py-2 text-xs font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isUpdating}
                  className="neon-button px-5 py-2 text-xs font-semibold disabled:opacity-50"
                >
                  {isUpdating ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </main>
  );
}
