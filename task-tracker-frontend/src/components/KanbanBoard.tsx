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
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: task.id });
  return (
    <motion.article
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition }}
      {...attributes}
      {...listeners}
      layout
      className={`kanban-card ${isDragging ? 'is-dragging' : ''}`}
      whileHover={{ y: -3 }}
    >
      <div className="kanban-card-top"><span className={`priority-dot priority-${String(task.priority || '').toLowerCase()}`} />{task.priority && <small>{task.priority}</small>}</div>
      <h4>{task.title}</h4>
      {task.description && <p>{task.description}</p>}
      {task.due_date && <time>Due {new Date(task.due_date).toLocaleDateString()}</time>}
    </motion.article>
  );
}

function Column({ id, label, color, tasks }: { id: TaskStatus; label: string; color: string; tasks: BoardTask[] }) {
  const { setNodeRef, isOver } = useDroppable({ id });
  return (
    <section ref={setNodeRef} className={`kanban-column ${isOver ? 'is-over' : ''}`}>
      <header><span className="column-title"><i style={{ backgroundColor: color }} />{label}</span><b>{tasks.length}</b></header>
      <SortableContext items={tasks.map((task) => task.id)} strategy={verticalListSortingStrategy}>
        <div className="kanban-column-body">{tasks.map((task) => <SortableCard key={task.id} task={task} />)}{tasks.length === 0 && <span className="kanban-empty">Drop tasks here</span>}</div>
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
  return <div className="kanban-wrap"><DndContext sensors={sensors} onDragStart={({ active }) => setActiveId(Number(active.id))} onDragCancel={() => setActiveId(null)} onDragEnd={handleDragEnd}><div className="kanban-board">{columns.map((column) => <Column key={column.id} {...column} tasks={grouped[column.id]} />)}</div><DragOverlay>{activeTask ? <div className="kanban-card kanban-overlay"><h4>{activeTask.title}</h4></div> : null}</DragOverlay></DndContext></div>;
}
