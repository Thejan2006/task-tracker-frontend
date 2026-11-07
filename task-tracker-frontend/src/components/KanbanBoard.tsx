'use client';

import { useMemo, useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import {
  DndContext,
  DragEndEvent,
  DragOverEvent,
  DragOverlay,
  PointerSensor,
  useDroppable,
  useSensor,
  useSensors,
  closestCorners,
  defaultDropAnimationSideEffects,
  DropAnimation,
} from '@dnd-kit/core';
import { arrayMove, SortableContext, useSortable, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { getDeadlineStatus } from '@/lib/utils';

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

const columns: { id: TaskStatus; label: string }[] = [
  { id: 'todo', label: 'To Do' },
  { id: 'in_progress', label: 'In Progress' },
  { id: 'review', label: 'Review' },
  { id: 'done', label: 'Done' },
];

function getStatus(task: BoardTask): TaskStatus {
  if (task.status && columns.some((column) => column.id === task.status)) return task.status as TaskStatus;
  return task.is_completed ? 'done' : 'todo';
}

function TaskCardUI({ task, isOverlay = false, onClick }: { task: BoardTask; isOverlay?: boolean; onClick?: () => void }) {
  const deadline = getDeadlineStatus(task.due_date, task.is_completed);

  return (
    <article
      onClick={onClick}
      className={`group relative mb-2.5 select-none rounded-xl border p-3.5 transition-all ${
        isOverlay
          ? 'cursor-grabbing border-[var(--text-main)] bg-[var(--card-bg)] shadow-2xl scale-105'
          : 'cursor-grab border-[var(--card-border)] bg-[var(--card-bg)] hover:border-[var(--text-main)] shadow-xs active:cursor-grabbing'
      }`}
    >
      <div className="flex items-center justify-between gap-2">
        {task.priority ? (
          <span
            className={`pill-badge text-[0.65rem] ${
              task.priority === 'High'
                ? 'bg-red-500 text-white dark:bg-red-600 font-bold'
                : task.priority === 'Medium'
                ? 'pill-medium'
                : 'pill-low'
            }`}
          >
            {task.priority === 'High' && (
              <span className="h-1.5 w-1.5 rounded-full bg-white mr-1 inline-block" />
            )}
            {task.priority}
          </span>
        ) : (
          <span className="text-[0.65rem] text-[var(--text-subtle)] font-mono">#{task.id}</span>
        )}

        {task.is_completed && (
          <span className="flex h-4 w-4 items-center justify-center rounded-full bg-[var(--btn-primary-bg)] text-[var(--btn-primary-text)] text-[9px] font-bold">
            ✓
          </span>
        )}
      </div>

      <h4 className="mt-2 text-xs font-semibold text-[var(--text-main)] leading-snug">
        {task.title}
      </h4>

      {task.description && (
        <p className="mt-1 line-clamp-2 text-[0.68rem] leading-relaxed text-[var(--text-muted)]">
          {task.description}
        </p>
      )}

      {/* Due date with deadline urgency colors */}
      {task.due_date && (
        <div className="mt-2.5 flex items-center justify-between gap-1 text-[0.68rem]">
          {deadline.status === 'urgent-red' ? (
            <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md font-bold bg-red-100 text-red-800 border border-red-300 dark:bg-red-950/50 dark:text-red-300 dark:border-red-700/60 text-[0.65rem]">
              <span>⚠️</span>
              <span>{deadline.label}</span>
            </span>
          ) : deadline.status === 'warning-yellow' ? (
            <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md font-bold bg-amber-100 text-amber-900 border border-amber-300 dark:bg-amber-950/50 dark:text-amber-300 dark:border-amber-700/60 text-[0.65rem]">
              <span>⏱</span>
              <span>{deadline.label}</span>
            </span>
          ) : (
            <span className="text-[var(--text-subtle)] font-medium">
              📅 {new Date(task.due_date).toLocaleDateString()}
            </span>
          )}
        </div>
      )}
    </article>
  );
}

function SortableCard({ task, onClick }: { task: BoardTask; onClick?: () => void }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: task.id });

  const style = {
    transform: CSS.Translate.toString(transform),
    transition,
    opacity: isDragging ? 0.25 : 1,
  };

  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners} className="touch-none">
      <TaskCardUI task={task} onClick={onClick} />
    </div>
  );
}

function Column({
  id,
  label,
  tasks,
  onTaskClick,
}: {
  id: TaskStatus;
  label: string;
  tasks: BoardTask[];
  onTaskClick?: (task: BoardTask) => void;
}) {
  const { setNodeRef, isOver } = useDroppable({ id });

  return (
    <section
      ref={setNodeRef}
      className={`flex flex-col rounded-2xl border p-3.5 transition-colors ${
        isOver
          ? 'border-[var(--text-main)] bg-[var(--active-highlight)]'
          : 'border-[var(--card-border)] bg-[var(--canvas-bg)]'
      }`}
    >
      <header className="mb-3 flex items-center justify-between px-1.5 py-1">
        <h3 className="text-xs font-bold uppercase tracking-wider text-[var(--text-main)]">{label}</h3>
        <span className="flex h-5 min-w-[20px] items-center justify-center rounded-full border border-[var(--card-border)] bg-[var(--card-bg)] px-1.5 text-xs font-semibold text-[var(--text-muted)]">
          {tasks.length}
        </span>
      </header>

      <SortableContext items={tasks.map((task) => task.id)} strategy={verticalListSortingStrategy}>
        <div className="min-h-[160px] flex-1">
          {tasks.map((task) => (
            <SortableCard key={task.id} task={task} onClick={() => onTaskClick?.(task)} />
          ))}
          {tasks.length === 0 && (
            <div className="flex h-32 items-center justify-center rounded-xl border border-dashed border-[var(--card-border)] text-xs text-[var(--text-subtle)]">
              Drop tasks here
            </div>
          )}
        </div>
      </SortableContext>
    </section>
  );
}

const dropAnimation: DropAnimation = {
  sideEffects: defaultDropAnimationSideEffects({
    styles: { active: { opacity: '0.4' } },
  }),
};

export function KanbanBoard({
  tasks,
  onReorder,
  onPersist,
}: {
  tasks: BoardTask[];
  onReorder: (tasks: BoardTask[]) => void;
  onPersist: (task: BoardTask, status: TaskStatus, position: number) => Promise<void>;
}) {
  const [mounted, setMounted] = useState(false);
  const [selectedTask, setSelectedTask] = useState<BoardTask | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 5 },
    })
  );

  const [activeId, setActiveId] = useState<number | null>(null);

  const grouped = useMemo(() => {
    return columns.reduce<Record<TaskStatus, BoardTask[]>>(
      (result, column) => {
        result[column.id] = tasks.filter((task) => getStatus(task) === column.id);
        return result;
      },
      { todo: [], in_progress: [], review: [], done: [] }
    );
  }, [tasks]);

  const handleDragOver = ({ active, over }: DragOverEvent) => {
    if (!over) return;
    const activeTask = tasks.find((t) => t.id === active.id);
    if (!activeTask) return;
    const activeStatus = getStatus(activeTask);
    const overId = over.id;

    const overStatus: TaskStatus | null = columns.some((c) => c.id === overId)
      ? (overId as TaskStatus)
      : tasks.find((t) => t.id === overId)
      ? getStatus(tasks.find((t) => t.id === overId)!)
      : null;

    if (!overStatus || activeStatus === overStatus) return;

    const nextTasks = tasks.map((t) => (t.id === activeTask.id ? { ...t, status: overStatus } : t));
    onReorder(nextTasks);
  };

  const handleDragEnd = async ({ active, over }: DragEndEvent) => {
    setActiveId(null);
    if (!over) return;

    const current = tasks.find((task) => task.id === active.id);
    if (!current) return;

    const sourceStatus = getStatus(current);
    const destinationStatus = columns.some((column) => column.id === over.id)
      ? (over.id as TaskStatus)
      : tasks.find((task) => task.id === over.id)
      ? getStatus(tasks.find((task) => task.id === over.id) as BoardTask)
      : sourceStatus;

    const destination = [...grouped[destinationStatus]];
    const fromIndex = destination.findIndex((task) => task.id === current.id);
    const overIndex = destination.findIndex((task) => task.id === over.id);

    const nextColumn =
      sourceStatus === destinationStatus
        ? arrayMove(destination, fromIndex, overIndex < 0 ? destination.length - 1 : overIndex)
        : [...destination.filter((task) => task.id !== current.id), current];

    const finalPosition = nextColumn.findIndex((item) => item.id === current.id);

    const nextTasks = tasks.map((task) =>
      task.id === current.id
        ? {
            ...task,
            status: destinationStatus,
            is_completed: destinationStatus === 'done',
            position: finalPosition,
          }
        : task
    );

    onReorder(nextTasks);
    await onPersist({ ...current, status: destinationStatus }, destinationStatus, finalPosition);
  };

  const activeTask = activeId ? tasks.find((task) => task.id === activeId) : null;

  return (
    <div>
      <DndContext
        sensors={sensors}
        collisionDetection={closestCorners}
        onDragStart={({ active }) => setActiveId(Number(active.id))}
        onDragOver={handleDragOver}
        onDragCancel={() => setActiveId(null)}
        onDragEnd={handleDragEnd}
      >
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {columns.map((column) => (
            <Column
              key={column.id}
              {...column}
              tasks={grouped[column.id]}
              onTaskClick={setSelectedTask}
            />
          ))}
        </div>

        {mounted &&
          createPortal(
            <DragOverlay dropAnimation={dropAnimation}>
              {activeTask ? <TaskCardUI task={activeTask} isOverlay /> : null}
            </DragOverlay>,
            document.body
          )}

        {mounted &&
          selectedTask &&
          createPortal(
            <div
              className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs"
              onClick={() => setSelectedTask(null)}
            >
              <div
                className="organizo-card w-full max-w-lg p-6 sm:p-8 shadow-2xl"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="flex items-start justify-between border-b border-[var(--card-border)] pb-4">
                  <div>
                    <span className="eyebrow">Task Details</span>
                    <h2 className="mt-1 text-base font-bold text-[var(--text-main)]">{selectedTask.title}</h2>
                  </div>
                  <button
                    onClick={() => setSelectedTask(null)}
                    className="text-sm font-bold text-[var(--text-muted)] hover:text-[var(--text-main)]"
                  >
                    ✕
                  </button>
                </div>

                <div className="mt-4 space-y-3">
                  <div className="grid grid-cols-2 gap-3">
                    <div className="p-3 rounded-xl bg-[var(--canvas-bg)] border border-[var(--card-border)]">
                      <span className="text-[0.65rem] text-[var(--text-subtle)] uppercase tracking-wider block">Stage</span>
                      <span className="text-xs font-semibold text-[var(--text-main)] capitalize">
                        {columns.find((c) => c.id === getStatus(selectedTask))?.label || getStatus(selectedTask)}
                      </span>
                    </div>

                    <div className="p-3 rounded-xl bg-[var(--canvas-bg)] border border-[var(--card-border)]">
                      <span className="text-[0.65rem] text-[var(--text-subtle)] uppercase tracking-wider block">Priority</span>
                      <span className="text-xs font-semibold text-[var(--text-main)]">
                        {selectedTask.priority || 'Normal'}
                      </span>
                    </div>
                  </div>

                  {selectedTask.due_date && (
                    <div className="p-3 rounded-xl bg-[var(--canvas-bg)] border border-[var(--card-border)]">
                      <span className="text-[0.65rem] text-[var(--text-subtle)] uppercase tracking-wider block">Due Date</span>
                      <span className="text-xs font-semibold text-[var(--text-main)]">
                        {new Date(selectedTask.due_date).toLocaleDateString(undefined, {
                          weekday: 'long',
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                        })}
                      </span>
                    </div>
                  )}

                  <div className="p-3 rounded-xl bg-[var(--canvas-bg)] border border-[var(--card-border)]">
                    <span className="text-[0.65rem] text-[var(--text-subtle)] uppercase tracking-wider block mb-1">Description</span>
                    <p className="text-xs text-[var(--text-muted)] whitespace-pre-wrap leading-relaxed">
                      {selectedTask.description || 'No description provided.'}
                    </p>
                  </div>
                </div>

                <div className="mt-5 flex justify-end">
                  <button onClick={() => setSelectedTask(null)} className="btn-ghost-mono text-xs">
                    Close
                  </button>
                </div>
              </div>
            </div>,
            document.body
          )}
      </DndContext>
    </div>
  );
}
