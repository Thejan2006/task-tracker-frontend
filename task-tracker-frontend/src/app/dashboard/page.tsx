'use client';

import { useEffect, useState } from 'react';
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

  // Filtering states
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'completed' | 'pending'>('all');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

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
    }
  }, [router]);

  const fetchCategories = async (token: string) => {
    try {
      const response = await fetch('http://localhost:8000/categories/', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });
      if (response.ok) {
        const data = await response.json();
        setCategories(data);
      }
    } catch (err) {
      toast.error('Failed to load categories');
    }
  };

  const fetchTasks = async (token: string) => {
    try {
      const response = await fetch('http://localhost:8000/tasks/', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
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
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setIsLoadingTasks(false);
    }
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
          'Authorization': `Bearer ${token}`,
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

      // Reset form
      setTitle('');
      setDescription('');
      setCategoryId('');
      setDueDate('');
      setPriority('');
      toast.success('Task created successfully!', { id: toastId });
    } catch (err: any) {
      toast.error(err.message, { id: toastId });
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
          'Authorization': `Bearer ${token}`,
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
    } catch (err: any) {
      toast.error(err.message, { id: toastId });
    }
  };

  const handleToggleComplete = async (task: Task) => {
    const token = localStorage.getItem('token');
    if (!token) return;

    try {
      const response = await fetch(`http://localhost:8000/tasks/${task.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          ...task,
          is_completed: !task.is_completed,
        }),
      });

      if (!response.ok) throw new Error('Failed to update status');

      const updatedTask = await response.json();
      setTasks((prev) => prev.map((t) => (t.id === task.id ? updatedTask : t)));
      if (updatedTask.is_completed) toast.success('Task marked as completed!');
    } catch (err: any) {
      toast.error(err.message);
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
    if (!editingTask || !editTitle.trim()) return;

    setIsUpdating(true);
    const toastId = toast.loading('Updating task...');
    const token = localStorage.getItem('token');
    if (!token) return;

    try {
      const response = await fetch(`http://localhost:8000/tasks/${editingTask.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
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
    } catch (err: any) {
      toast.error(err.message, { id: toastId });
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
        headers: { 'Authorization': `Bearer ${token}` },
      });

      if (!response.ok) throw new Error('Failed to delete task');

      setTasks((prev) => prev.filter((task) => task.id !== taskToDelete));
      setTaskToDelete(null);
      toast.success('Task deleted successfully!', { id: toastId });
    } catch (err: any) {
      toast.error(err.message, { id: toastId });
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
    const dueDate = new Date(dateString);
    return dueDate < today;
  };

  // Helper function: Get priority badge styles
  const getPriorityStyles = (priority?: string | null) => {
    switch (priority) {
      case 'High': return 'bg-red-100 text-red-800 border-red-200';
      case 'Medium': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'Low': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'hidden'; // Hide if no priority
    }
  };

  // FILTER LOGIC
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
      <div className="flex min-h-screen items-center justify-center bg-[#080812]">
        <div className="animate-pulse flex flex-col items-center">
          <div className="h-8 w-32 bg-gray-300 rounded mb-4"></div>
          <p className="text-gray-500 font-medium">Checking authentication...</p>
        </div>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_85%_0,rgba(139,92,246,0.13),transparent_28%),#080812] text-[#f8f7ff]">
      <Toaster position="top-right" reverseOrder={false} />

      <header className="border-b border-white/10">
        <div className="mx-auto flex max-w-[1000px] items-center justify-between px-4 py-4">
          <h1 className="inline-flex items-center gap-2.5 text-[1.1rem] font-bold"><span className="grid h-[29px] w-[29px] place-items-center rounded-[9px] bg-[linear-gradient(135deg,#8b5cf6,#c084fc)] text-white">T</span><span>Taskflow</span></h1>
          <nav className="ml-auto mr-[18px] flex gap-[18px] text-[0.78rem] text-[#9898ad] max-[800px]:hidden">
            <Link className="hover:text-[#f8f7ff]" href="/profile">Profile</Link>
            <Link className="hover:text-[#f8f7ff]" href="/admin">Admin</Link>
          </nav>
          <ThemeControls />
          <button
            onClick={handleLogout}
            className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-md font-medium transition-colors"
          >
            Logout
          </button>
        </div>
      </header>

      <div className="mx-auto max-w-[1180px] px-7 pb-[100px] pt-[55px] max-[800px]:px-[18px] max-[800px]:pb-[70px] max-[800px]:pt-10">
        <div className="mb-[35px] flex justify-between">
          <div><span className="text-[0.68rem] font-bold uppercase tracking-[0.16em] text-[#b49aff]">Workspace overview</span><h2 className="my-3 text-[clamp(2rem,4vw,3rem)] tracking-[-0.07em]">Keep the momentum going.</h2><p className="m-0 text-[#9898ad]">Plan, prioritize, and move every important task forward.</p></div>
        </div>
        <DashboardAnalytics tasks={tasks} />
        <section className="rounded-2xl border border-white/10 bg-white/[0.04] p-6 backdrop-blur-[14px] max-[800px]:p-[17px]">
          <div className="mb-[17px] flex items-end justify-between max-[480px]:flex-col max-[480px]:items-start max-[480px]:gap-2.5"><div><span className="text-[0.68rem] font-bold uppercase tracking-[0.16em] text-[#b49aff]">Drag to organize</span><h2 className="mt-2.5 text-[1.3rem] tracking-[-0.04em]">Workboard</h2></div><span className="text-[0.68rem] text-[#9898ad]">Changes sync to your workspace</span></div>
          <KanbanBoard tasks={tasks} onReorder={(nextTasks) => setTasks(nextTasks as Task[])} onPersist={async (task, status, position) => { try { await persistKanbanChange(task as Task, status, position); toast.success('Task position saved'); } catch (error) { toast.error(error instanceof Error ? error.message : 'Could not save task position'); fetchTasks(localStorage.getItem('token') || ''); } }} />
        </section>
      </div>

      {/* --- Modals for Category & Delete kept the same --- */}
      {showCategoryModal && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center p-4 z-50">
          <div className="w-full max-w-sm space-y-4 rounded-lg border border-white/10 bg-white/[0.04] p-6 shadow-[0_18px_45px_rgba(0,0,0,0.15)]">
            <h3 className="text-lg font-bold text-[#f8f7ff]">Add New Category</h3>
            <form onSubmit={handleCreateCategory} className="space-y-4">
              <div>
                <label className="mb-1 block text-sm font-medium text-[#f8f7ff]">Category Name *</label>
                <input
                  type="text"
                  value={newCategoryName}
                  onChange={(e) => setNewCategoryName(e.target.value)}
                  required
                  className="w-full rounded-md border border-white/10 bg-white/[0.045] p-2 text-[#f8f7ff] focus:border-[#8b5cf6] focus:outline-none"
                />
              </div>
              <div className="flex justify-end space-x-3 pt-2">
                <button type="button" onClick={() => setShowCategoryModal(false)} className="rounded-md border border-white/10 px-4 py-2 text-[#9898ad] hover:bg-white/[0.06]">Cancel</button>
                <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">Create</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {taskToDelete !== null && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center p-4 z-50">
          <div className="w-full max-w-sm space-y-4 rounded-lg border border-white/10 bg-white/[0.04] p-6 shadow-[0_18px_45px_rgba(0,0,0,0.15)]">
            <h3 className="text-lg font-bold text-[#f8f7ff]">Delete Task?</h3>
            <p className="text-sm text-[#9898ad]">Are you sure you want to delete this task? This action cannot be undone.</p>
            <div className="flex justify-end space-x-3 pt-4">
              <button type="button" onClick={() => setTaskToDelete(null)} disabled={isDeleting} className="rounded-md border border-white/10 px-4 py-2 text-[#9898ad] hover:bg-white/[0.06]">Cancel</button>
              <button type="button" onClick={confirmDeleteTask} disabled={isDeleting} className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700">{isDeleting ? 'Deleting...' : 'Yes, Delete'}</button>
            </div>
          </div>
        </div>
      )}

      <div className="max-w-6xl mx-auto px-4 py-8 space-y-6">

        {/* ADD TASK FORM */}
        <div className="rounded-lg border border-white/10 bg-white/[0.04] p-6 shadow-[0_18px_45px_rgba(0,0,0,0.15)]">
          <h2 className="mb-4 text-xl font-semibold text-[#f8f7ff]">Add New Task</h2>
          <form onSubmit={handleCreateTask} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label className="mb-1 block text-sm font-medium text-[#f8f7ff]">Task Title *</label>
                <input
                  type="text"
                  placeholder="Enter task title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                  disabled={isSubmitting}
                  className="w-full rounded-md border border-white/10 bg-white/[0.045] p-2 text-[#f8f7ff] focus:border-[#8b5cf6] focus:outline-none"
                />
              </div>
              <div className="md:col-span-2">
                <label className="mb-1 block text-sm font-medium text-[#f8f7ff]">Description</label>
                <textarea
                  placeholder="Enter task description (optional)"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={2}
                  disabled={isSubmitting}
                  className="w-full rounded-md border border-white/10 bg-white/[0.045] p-2 text-[#f8f7ff] focus:border-[#8b5cf6] focus:outline-none"
                />
              </div>

              {/* Category */}
              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="block text-sm font-medium text-gray-700">Category</label>
                  <button type="button" onClick={() => setShowCategoryModal(true)} className="text-xs text-blue-600 hover:underline font-medium">+ Add New</button>
                </div>
                <select value={categoryId} onChange={(e) => setCategoryId(e.target.value)} disabled={isSubmitting} className="w-full rounded-md border border-gray-300 p-2 text-gray-900 focus:border-blue-500 focus:outline-none">
                  <option value="">No Category</option>
                  {categories.map((cat) => <option key={cat.id} value={cat.id}>{cat.name}</option>)}
                </select>
              </div>

              {/* Priority */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
                <select value={priority} onChange={(e) => setPriority(e.target.value as any)} disabled={isSubmitting} className="w-full rounded-md border border-gray-300 p-2 text-gray-900 focus:border-blue-500 focus:outline-none">
                  <option value="">None</option>
                  <option value="High">High</option>
                  <option value="Medium">Medium</option>
                  <option value="Low">Low</option>
                </select>
              </div>

              {/* Due Date */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Due Date</label>
                <input
                  type="date"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  disabled={isSubmitting}
                  className="w-full rounded-md border border-gray-300 p-2 text-gray-900 focus:border-blue-500 focus:outline-none"
                />
              </div>
            </div>

            <button type="submit" disabled={isSubmitting} className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md font-medium transition-colors disabled:bg-blue-300 mt-2">
              {isSubmitting ? 'Adding Task...' : 'Add Task'}
            </button>
          </form>
        </div>

        {/* TASKS LIST */}
        <div className="space-y-4 rounded-lg border border-white/10 bg-white/[0.04] p-6 shadow-[0_18px_45px_rgba(0,0,0,0.15)]">
          <div className="flex flex-col border-b pb-4 gap-4">
            <h2 className="text-xl font-semibold text-[#f8f7ff]">Your Tasks</h2>
            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
              <div className="w-full sm:w-1/2">
                <input type="text" placeholder="Search tasks..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full rounded-md border border-white/10 bg-white/[0.045] p-2 text-sm text-[#f8f7ff] focus:border-[#8b5cf6] focus:outline-none"/>
              </div>
              <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
                <div className="flex items-center space-x-2">
                  <span className="text-sm font-medium text-gray-600">Status:</span>
                  <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value as any)} className="rounded-md border border-gray-300 p-1.5 text-sm">
                    <option value="all">All</option>
                    <option value="pending">Pending</option>
                    <option value="completed">Completed</option>
                  </select>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-sm font-medium text-gray-600">Category:</span>
                  <select value={selectedCategory} onChange={(e) => setSelectedCategory(e.target.value)} className="rounded-md border border-gray-300 p-1.5 text-sm">
                    <option value="all">All</option>
                    <option value="none">Uncategorized</option>
                    {categories.map((cat) => <option key={cat.id} value={cat.id}>{cat.name}</option>)}
                  </select>
                </div>
              </div>
            </div>
          </div>

          {isLoadingTasks ? (
            /* --- LOADING SKELETON ANIMATION --- */
            <div className="space-y-3">
              {[1, 2, 3].map((n) => (
                <div key={n} className="p-4 border rounded-md animate-pulse flex items-center justify-between bg-gray-50">
                  <div className="flex items-start space-x-3 w-full">
                    <div className="mt-1 h-5 w-5 bg-gray-300 rounded"></div>
                    <div className="space-y-2 w-full">
                      <div className="h-4 bg-gray-300 rounded w-1/3"></div>
                      <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                      <div className="flex gap-2">
                        <div className="h-4 w-16 bg-gray-200 rounded-full"></div>
                        <div className="h-4 w-20 bg-gray-200 rounded-full"></div>
                      </div>
                    </div>
                  </div>
                  <div className="flex space-x-2 ml-4">
                    <div className="h-8 w-12 bg-gray-300 rounded"></div>
                    <div className="h-8 w-16 bg-gray-300 rounded"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : filteredTasks.length === 0 ? (
            <p className="text-gray-500 text-center py-6">No tasks found.</p>
          ) : (
            <ul className="space-y-3">
              {filteredTasks.map((task) => {
                const categoryObj = categories.find((c) => String(c.id) === String(task.category_id));
                const taskIsOverdue = isOverdue(task.due_date, task.is_completed);

                return (
                  <li key={task.id} className={`p-4 border rounded-md flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-colors ${taskIsOverdue ? 'bg-red-50 border-red-200' : 'hover:bg-gray-50'}`}>
                    <div className="flex items-start space-x-3">
                      <input type="checkbox" checked={task.is_completed} onChange={() => handleToggleComplete(task)} className="mt-1 h-5 w-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500 cursor-pointer"/>

                      <div>
                        <div className="flex flex-wrap items-center gap-2">
                          <h3 className={`font-medium ${task.is_completed ? 'line-through text-gray-400' : taskIsOverdue ? 'text-red-700' : 'text-gray-800'}`}>
                            {task.title}
                          </h3>

                          {/* Priority Badge */}
                          {task.priority && (
                            <span className={`text-xs px-2 py-0.5 rounded-full font-semibold border ${getPriorityStyles(task.priority)} ${task.is_completed ? 'opacity-50' : ''}`}>
                              {task.priority}
                            </span>
                          )}

                          {/* Category Badge */}
                          {categoryObj && (
                            <span className={`text-xs bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full font-medium ${task.is_completed ? 'opacity-50' : ''}`}>
                              {categoryObj.name}
                            </span>
                          )}
                        </div>

                        {task.description && (
                          <p className={`text-sm mt-1 ${task.is_completed ? 'text-gray-400' : 'text-gray-600'}`}>{task.description}</p>
                        )}

                        {/* Due Date Display */}
                        {task.due_date && (
                          <p className={`text-xs mt-1.5 flex items-center font-medium ${task.is_completed ? 'text-gray-400' : taskIsOverdue ? 'text-red-600' : 'text-gray-500'}`}>
                            📅 Due: {new Date(task.due_date).toLocaleDateString()}
                            {taskIsOverdue && ' (Overdue)'}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center space-x-2 shrink-0">
                      <button onClick={() => handleStartEdit(task)} className="text-blue-600 hover:text-blue-800 font-medium text-sm px-3 py-1 rounded border border-blue-200 hover:bg-blue-50 bg-white">Edit</button>
                      <button onClick={() => setTaskToDelete(task.id)} className="text-red-500 hover:text-red-700 font-medium text-sm px-3 py-1 rounded border border-red-200 hover:bg-red-50 bg-white">Delete</button>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </div>

      {/* EDIT TASK MODAL */}
      {editingTask && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full p-6 space-y-4 shadow-xl">
            <h3 className="text-lg font-bold text-[#f8f7ff]">Edit Task</h3>
            <form onSubmit={handleUpdateTask} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Task Title *</label>
                <input type="text" value={editTitle} onChange={(e) => setEditTitle(e.target.value)} required disabled={isUpdating} className="w-full rounded-md border border-gray-300 p-2 text-gray-900 focus:border-blue-500 focus:outline-none"/>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea value={editDescription} onChange={(e) => setEditDescription(e.target.value)} rows={2} disabled={isUpdating} className="w-full rounded-md border border-gray-300 p-2 text-gray-900 focus:border-blue-500 focus:outline-none"/>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                  <select value={editCategoryId} onChange={(e) => setEditCategoryId(e.target.value)} disabled={isUpdating} className="w-full rounded-md border border-gray-300 p-2 text-gray-900 focus:border-blue-500 focus:outline-none">
                    <option value="">No Category</option>
                    {categories.map((cat) => <option key={cat.id} value={cat.id}>{cat.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
                  <select value={editPriority} onChange={(e) => setEditPriority(e.target.value as any)} disabled={isUpdating} className="w-full rounded-md border border-gray-300 p-2 text-gray-900 focus:border-blue-500 focus:outline-none">
                    <option value="">None</option>
                    <option value="High">High</option>
                    <option value="Medium">Medium</option>
                    <option value="Low">Low</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Due Date</label>
                <input type="date" value={editDueDate} onChange={(e) => setEditDueDate(e.target.value)} disabled={isUpdating} className="w-full rounded-md border border-gray-300 p-2 text-gray-900 focus:border-blue-500 focus:outline-none"/>
              </div>

              <div className="flex justify-end space-x-3 pt-2">
                <button type="button" onClick={() => setEditingTask(null)} disabled={isUpdating} className="px-4 py-2 border rounded-md text-gray-600 hover:bg-gray-100">Cancel</button>
                <button type="submit" disabled={isUpdating} className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-blue-300">{isUpdating ? 'Saving...' : 'Save Changes'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </main>
  );
}
