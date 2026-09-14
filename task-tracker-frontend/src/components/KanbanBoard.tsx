'use client';

import { useMemo, useState } from 'react';
import { DndContext, DragEndEvent, DragOverlay, PointerSensor, useDroppable, useSensor, useSensors } from '@dnd-kit/core';
import { arrayMove, SortableContext, useSortable, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { motion } from 'framer-motion';

export type TaskStatus = 'todo' | 'in_progress' | 'review' | 'done';

export interface BoardTask {
  id: number;
  title: string;
  description?: string;
  is_completed: boolean;
  status?: TaskStatus | string | null;
  position?: number;
  priority?: string | null;
  due_date?: string | null;
}

const columns: { id: TaskStatus; label: string; color: string }[] = [
  { id: 'todo', label: 'To Do', color: '#94a3b8' },
  { id: 'in_progress', label: 'In Progress', color: '#8b5cf6' },
  { id: 'review', label: 'Review', color: '#f59e0b' },
  { id: 'done', label: 'Done', color: '#22c55e' },
];

function getStatus(task: BoardTask): TaskStatus {
  if (task.status && columns.some((column) => column.id === task.status)) return task.status as TaskStatus;
  return task.is_completed ? 'done' : 'todo';
}

function SortableCard({ task }: { task: BoardTask }) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useSortable({ id: task.id });
  return (
    <motion.article
      ref={setNodeRef}
      animate={{ transform: CSS.Transform.toString(transform) }}
      {...attributes}
      {...listeners}
      layout
      className={`mb-[9px] cursor-grab touch-none rounded-[10px] border border-white/10 bg-[#15152a] p-3.5 shadow-[0_8px_20px_rgba(0,0,0,0.1)] transition-transform active:cursor-grabbing ${isDragging ? 'opacity-50' : ''}`}
      whileHover={{ y: -3 }}
    >
      <div className="flex min-h-2.5 items-center gap-1.5"><span className={`h-1.5 w-1.5 rounded-full ${task.priority === 'High' ? 'bg-red-500' : task.priority === 'Medium' ? 'bg-amber-500' : task.priority === 'Low' ? 'bg-green-500' : 'bg-[#9898ad]'}`} />{task.priority && <small className="text-[0.6rem] text-[#9898ad]">{task.priority}</small>}</div>
      <h4 className="my-2.5 mb-[5px] text-[0.8rem] leading-[1.3]">{task.title}</h4>
      {task.description && <p className="m-0 text-[0.67rem] leading-[1.4] text-[#9898ad]">{task.description}</p>}
      {task.due_date && <time className="mt-2.5 block text-[0.6rem] text-[#9898ad]">Due {new Date(task.due_date).toLocaleDateString()}</time>}
    </motion.article>
  );
}

function Column({ id, label, color, tasks }: { id: TaskStatus; label: string; color: string; tasks: BoardTask[] }) {
  const { setNodeRef, isOver } = useDroppable({ id });
  return (
    <section ref={setNodeRef} className={`min-w-0 rounded-xl border transition-colors ${isOver ? 'border-[#8b5cf6] bg-[rgba(139,92,246,0.16)]' : 'border-transparent bg-black/10'}`}>
      <header className="flex justify-between px-3.5 pb-2.5 pt-[15px]"><span className="flex items-center gap-[7px] text-[0.76rem] font-bold"><i className={`h-[7px] w-[7px] rounded-full ${id === 'todo' ? 'bg-slate-400' : id === 'in_progress' ? 'bg-violet-500' : id === 'review' ? 'bg-amber-500' : 'bg-green-500'}`} />{label}</span><b className="grid h-[21px] min-w-[21px] place-items-center rounded-full bg-white/10 text-[0.65rem] text-[#9898ad]">{tasks.length}</b></header>
      <SortableContext items={tasks.map((task) => task.id)} strategy={verticalListSortingStrategy}>
        <div className="min-h-[160px] px-[9px] pb-2.5 pt-[5px] max-[480px]:min-h-[110px]">{tasks.map((task) => <SortableCard key={task.id} task={task} />)}{tasks.length === 0 && <span className="grid min-h-[100px] place-items-center rounded-lg border border-dashed border-white/10 text-[0.7rem] text-[#9898ad]">Drop tasks here</span>}</div>
      </SortableContext>
    </section>
  );
}

export function KanbanBoard({ tasks, onReorder, onPersist }: { tasks: BoardTask[]; onReorder: (tasks: BoardTask[]) => void; onPersist: (task: BoardTask, status: TaskStatus, position: number) => Promise<void> }) {
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 6 } }));
  const [activeId, setActiveId] = useState<number | null>(null);
  const grouped = useMemo(() => columns.reduce<Record<TaskStatus, BoardTask[]>>((result, column) => { result[column.id] = tasks.filter((task) => getStatus(task) === column.id).sort((a, b) => (a.position ?? a.id) - (b.position ?? b.id)); return result; }, { todo: [], in_progress: [], review: [], done: [] }), [tasks]);

  const handleDragEnd = async ({ active, over }: DragEndEvent) => {
    setActiveId(null);
    if (!over) return;
    const current = tasks.find((task) => task.id === active.id);
    if (!current) return;
    const sourceStatus = getStatus(current);
    const destinationStatus = columns.some((column) => column.id === over.id) ? over.id as TaskStatus : tasks.find((task) => task.id === over.id) ? getStatus(tasks.find((task) => task.id === over.id) as BoardTask) : sourceStatus;
    const destination = [...grouped[destinationStatus]];
    const fromIndex = destination.findIndex((task) => task.id === current.id);
    const overIndex = destination.findIndex((task) => task.id === over.id);
    if (sourceStatus === destinationStatus && fromIndex === overIndex) return;
    const nextColumn = sourceStatus === destinationStatus ? arrayMove(destination, fromIndex, overIndex < 0 ? destination.length - 1 : overIndex) : [...destination.filter((task) => task.id !== current.id), current];
    const nextTasks = tasks.map((task) => task.id === current.id ? { ...task, status: destinationStatus, is_completed: destinationStatus === 'done', position: nextColumn.findIndex((item) => item.id === current.id) } : task).map((task) => task.status === destinationStatus ? { ...task, position: nextColumn.findIndex((item) => item.id === task.id) } : task);
    onReorder(nextTasks);
    await onPersist({ ...current, status: destinationStatus }, destinationStatus, nextColumn.findIndex((task) => task.id === current.id));
  };

  const activeTask = activeId ? tasks.find((task) => task.id === activeId) : null;
  return <div><DndContext sensors={sensors} onDragStart={({ active }) => setActiveId(Number(active.id))} onDragCancel={() => setActiveId(null)} onDragEnd={handleDragEnd}><div className="grid grid-cols-4 gap-3.5 max-[800px]:grid-cols-2 max-[480px]:grid-cols-1">{columns.map((column) => <Column key={column.id} {...column} tasks={grouped[column.id]} />)}</div><DragOverlay>{activeTask ? <div className="w-[240px] rotate-3 rounded-[10px] border border-white/10 bg-[#15152a] p-3.5"><h4>{activeTask.title}</h4></div> : null}</DragOverlay></DndContext></div>;
}
