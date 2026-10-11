'use client';

import { useMemo, useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import {
  DndContext,
  DragEndEvent,
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

export type TaskStatus = 'todo' | 'in_progress' | 'review' | 'done';

export interface BoardTask {
  id: number;
  title: string;
  description?: string;
  is_completed: boolean;
  category_id?: number | null;
  category?: { id: number; name: string };
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

function formatDate(dateString?: string | null): string {
  if (!dateString) return '';
  const parts = dateString.split('T')[0].split('-');
  if (parts.length === 3) {
    const d = new Date(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2]));
    return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
  }
  return new Date(dateString).toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
}

/* --- Presentation Card (Used inside regular list & DragOverlay) --- */
function TaskCardUI({
  task,
  categoryName,
  isOverlay = false,
  onClick,
}: {
  task: BoardTask;
  categoryName?: string;
  isOverlay?: boolean;
  onClick?: () => void;
}) {
  const overdue = isDateOverdue(task.due_date, task.is_completed || task.status === 'done');

  return (
    <article
      onClick={onClick}
      className={`glass-panel mb-2.5 select-none rounded-xl p-3.5 transition-colors ${
        isOverlay
          ? 'w-[270px] max-w-[90vw] rotate-1 cursor-grabbing border-[#8b5cf6] bg-[#121633] shadow-[0_16px_36px_rgba(139,92,246,0.35)] backdrop-blur-xl'
          : 'cursor-grab hover:border-white/20 active:cursor-grabbing'
      } ${overdue ? 'border-rose-400/40 bg-rose-500/[0.07]' : ''}`}
    >
      <div className="flex min-h-3 items-center justify-between gap-1.5">
        <div className="flex items-center gap-1.5">
          <span
            className={`h-2 w-2 rounded-full shadow-[0_0_8px_currentColor] ${
              task.priority === 'High'
                ? 'bg-rose-400 text-rose-400'
                : task.priority === 'Medium'
                ? 'bg-amber-300 text-amber-300'
                : task.priority === 'Low'
                ? 'bg-emerald-400 text-emerald-400'
                : 'bg-[#9898ad] text-[#9898ad]'
            }`}
          />
          {task.priority && (
            <small className="text-[0.62rem] font-medium text-[#9aa4c7]">{task.priority}</small>
          )}
        </div>

        {categoryName && (
          <span className="truncate rounded-md border border-cyan-400/20 bg-cyan-400/10 px-1.5 py-0.5 text-[0.58rem] font-medium text-cyan-300">
            {categoryName}
          </span>
        )}
      </div>

      <h4 className="my-2 text-[0.82rem] font-semibold leading-[1.3] text-[#f8f7ff] break-words">
        {task.title}
      </h4>

      {task.description && (
        <p className="m-0 line-clamp-2 text-[0.68rem] leading-[1.4] text-[#9898ad] break-words">
          {task.description}
        </p>
      )}

      {task.due_date && (
        <time
          className={`mt-2.5 flex items-center gap-1 text-[0.62rem] ${
            overdue ? 'font-semibold text-rose-300' : 'text-[#9898ad]'
          }`}
        >
          <span>📅</span>
          <span>Due {formatDate(task.due_date)}</span>
          {overdue && <span className="ml-0.5 text-rose-400 font-bold">(Overdue)</span>}
        </time>
      )}
    </article>
  );
}

/* --- Draggable Sortable Card Wrapper --- */
function SortableCard({
  task,
  categoryName,
  onClick,
}: {
  task: BoardTask;
  categoryName?: string;
  onClick?: () => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: task.id });

  const style = {
    transform: CSS.Translate.toString(transform),
    transition,
    opacity: isDragging ? 0.25 : 1,
  };

  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners} className="touch-none select-none">
      <TaskCardUI task={task} categoryName={categoryName} onClick={onClick} />
    </div>
  );
}

/* --- Droppable Column Container --- */
function Column({
  id,
  label,
  tasks,
  categoriesMap,
  onTaskClick,
}: {
  id: TaskStatus;
  label: string;
  color: string;
  tasks: BoardTask[];
  categoriesMap: Map<number, string>;
  onTaskClick?: (task: BoardTask) => void;
}) {
  const { setNodeRef, isOver } = useDroppable({ id });

  return (
    <section
      ref={setNodeRef}
      className={`min-w-0 rounded-2xl border transition-colors ${
        isOver
          ? 'border-neon-cyan bg-neon-cyan/[0.08] shadow-[0_0_24px_rgba(39,215,255,0.18)]'
          : 'border-white/10 bg-white/[0.02]'
      }`}
    >
      <header className="flex items-center justify-between px-3.5 pb-2.5 pt-3.5 border-b border-white/[0.06]">
        <span className="flex items-center gap-2 text-[0.78rem] font-bold tracking-tight text-[#f8f7ff]">
          <i
            className={`h-2 w-2 rounded-full ${
              id === 'todo'
                ? 'bg-slate-400'
                : id === 'in_progress'
                ? 'bg-violet-400 shadow-[0_0_8px_rgba(139,92,246,0.5)]'
                : id === 'review'
                ? 'bg-amber-400 shadow-[0_0_8px_rgba(245,158,11,0.5)]'
                : 'bg-emerald-400 shadow-[0_0_8px_rgba(34,197,94,0.5)]'
            }`}
          />
          {label}
        </span>
        <b className="grid h-5 min-w-5 place-items-center rounded-full bg-white/10 px-1.5 text-[0.68rem] font-semibold text-[#9898ad]">
          {tasks.length}
        </b>
      </header>

      <SortableContext items={tasks.map((task) => task.id)} strategy={verticalListSortingStrategy}>
        <div className="min-h-[170px] p-2.5 max-[480px]:min-h-[120px]">
          {tasks.map((task) => (
            <SortableCard
              key={task.id}
              task={task}
              categoryName={task.category?.name || (task.category_id ? categoriesMap.get(task.category_id) : undefined)}
              onClick={() => onTaskClick?.(task)}
            />
          ))}
          {tasks.length === 0 && (
            <div className="grid min-h-[120px] place-items-center rounded-xl border border-dashed border-white/10 text-[0.72rem] text-[#9898ad]">
              Drop tasks here
            </div>
          )}
        </div>
      </SortableContext>
    </section>
  );
}

/* --- Smooth Drop Animation Config --- */
const dropAnimation: DropAnimation = {
  sideEffects: defaultDropAnimationSideEffects({
    styles: {
      active: {
        opacity: '0.4',
      },
    },
  }),
};

export function KanbanBoard({
  tasks,
  categories = [],
  onReorder,
  onPersist,
}: {
  tasks: BoardTask[];
  categories?: { id: number; name: string }[];
  onReorder: (tasks: BoardTask[]) => void;
  onPersist: (task: BoardTask, status: TaskStatus, position: number) => Promise<void>;
}) {
  const [mounted, setMounted] = useState(false);
  const [selectedTask, setSelectedTask] = useState<BoardTask | null>(null);
  const [activeId, setActiveId] = useState<number | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Close modal on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setSelectedTask(null);
      }
    };
    if (selectedTask) {
      window.addEventListener('keydown', handleKeyDown);
      return () => window.removeEventListener('keydown', handleKeyDown);
    }
  }, [selectedTask]);

  const categoriesMap = useMemo(() => {
    const map = new Map<number, string>();
    categories.forEach((cat) => map.set(cat.id, cat.name));
    return map;
  }, [categories]);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5, // Allows clicks to open modal while enabling smooth drag
      },
    })
  );

  const getPriorityWeight = (priority?: string | null) => {
    if (priority === 'High') return 3;
    if (priority === 'Medium') return 2;
    if (priority === 'Low') return 1;
    return 0;
  };

  const grouped = useMemo(() => {
    return columns.reduce<Record<TaskStatus, BoardTask[]>>(
      (result, column) => {
        result[column.id] = tasks
          .filter((task) => getStatus(task) === column.id)
          .sort((a, b) => {
            const hasPosA = typeof a.position === 'number';
            const hasPosB = typeof b.position === 'number';

            // Explicit positions take highest precedence for drag ordering
            if (hasPosA && hasPosB && a.position !== b.position) {
              return a.position! - b.position!;
            }
            if (hasPosA && !hasPosB) return -1;
            if (!hasPosA && hasPosB) return 1;

            // When positions are equal or unset, sort by Priority (Highest first: High -> Medium -> Low -> None)
            const weightA = getPriorityWeight(a.priority);
            const weightB = getPriorityWeight(b.priority);
            if (weightA !== weightB) {
              return weightB - weightA;
            }

            // Next sort by due date
            if (a.due_date && b.due_date) {
              return new Date(a.due_date).getTime() - new Date(b.due_date).getTime();
            }
            if (a.due_date) return -1;
            if (b.due_date) return 1;

            return a.id - b.id;
          });
        return result;
      },
      { todo: [], in_progress: [], review: [], done: [] }
    );
  }, [tasks]);

  const handleDragEnd = async ({ active, over }: DragEndEvent) => {
    setActiveId(null);
    if (!over) return;

    const current = tasks.find((task) => task.id === active.id);
    if (!current) return;

    const sourceStatus = getStatus(current);
    const destinationStatus: TaskStatus = columns.some((column) => column.id === over.id)
      ? (over.id as TaskStatus)
      : tasks.find((task) => task.id === over.id)
      ? getStatus(tasks.find((task) => task.id === over.id) as BoardTask)
      : sourceStatus;

    if (sourceStatus === destinationStatus) {
      // Reordering within the same column
      const columnTasks = [...grouped[destinationStatus]];
      const fromIndex = columnTasks.findIndex((task) => task.id === current.id);
      const overIndex = columnTasks.findIndex((task) => task.id === over.id);

      if (fromIndex === overIndex || fromIndex < 0) return;

      const targetIndex = overIndex >= 0 ? overIndex : columnTasks.length - 1;
      const reorderedColumn = arrayMove(columnTasks, fromIndex, targetIndex);
      const updatedColumnTasks = reorderedColumn.map((task, idx) => ({
        ...task,
        position: idx,
      }));

      const finalPosition = updatedColumnTasks.findIndex((t) => t.id === current.id);
      const updatedMap = new Map<number, BoardTask>();
      updatedColumnTasks.forEach((t) => updatedMap.set(t.id, t));

      const nextTasks = tasks.map((t) => updatedMap.get(t.id) || t);
      onReorder(nextTasks);
      await onPersist(
        { ...current, position: finalPosition, status: destinationStatus },
        destinationStatus,
        finalPosition
      );
    } else {
      // Moving to a different column
      const destTasks = [...grouped[destinationStatus]].filter((t) => t.id !== current.id);
      const overIndex = destTasks.findIndex((task) => task.id === over.id);
      const insertIndex = overIndex >= 0 ? overIndex : destTasks.length;

      const movedTask: BoardTask = {
        ...current,
        status: destinationStatus,
        is_completed: destinationStatus === 'done',
      };

      destTasks.splice(insertIndex, 0, movedTask);
      const updatedDestTasks = destTasks.map((task, idx) => ({
        ...task,
        position: idx,
      }));

      const sourceTasks = [...grouped[sourceStatus]]
        .filter((t) => t.id !== current.id)
        .map((task, idx) => ({ ...task, position: idx }));

      const updatedMap = new Map<number, BoardTask>();
      updatedDestTasks.forEach((t) => updatedMap.set(t.id, t));
      sourceTasks.forEach((t) => updatedMap.set(t.id, t));

      const finalPosition = updatedDestTasks.findIndex((t) => t.id === current.id);
      const nextTasks = tasks.map((t) => updatedMap.get(t.id) || t);

      onReorder(nextTasks);
      await onPersist(
        { ...movedTask, position: finalPosition },
        destinationStatus,
        finalPosition
      );
    }
  };

  const activeTask = activeId ? tasks.find((task) => task.id === activeId) : null;

  return (
    <div>
      <DndContext
        sensors={sensors}
        collisionDetection={closestCorners}
        onDragStart={({ active }) => setActiveId(Number(active.id))}
        onDragCancel={() => setActiveId(null)}
        onDragEnd={handleDragEnd}
      >
        <div className="grid grid-cols-4 gap-3.5 max-[800px]:grid-cols-2 max-[480px]:grid-cols-1">
          {columns.map((column) => (
            <Column
              key={column.id}
              {...column}
              tasks={grouped[column.id]}
              categoriesMap={categoriesMap}
              onTaskClick={setSelectedTask}
            />
          ))}
        </div>

        {/* Drag Overlay Portal */}
        {mounted &&
          createPortal(
            <DragOverlay dropAnimation={dropAnimation}>
              {activeTask ? (
                <TaskCardUI
                  task={activeTask}
                  categoryName={
                    activeTask.category?.name ||
                    (activeTask.category_id ? categoriesMap.get(activeTask.category_id) : undefined)
                  }
                  isOverlay
                />
              ) : null}
            </DragOverlay>,
            document.body
          )}

        {/* Task Detail Modal Portal */}
        {mounted && selectedTask &&
          createPortal(
            <div
              className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-md transition-opacity"
              onClick={() => setSelectedTask(null)}
              role="dialog"
              aria-modal="true"
              aria-labelledby="modal-task-title"
            >
              <div
                className="glass-panel w-full max-w-lg rounded-2xl bg-[#0c122b]/95 p-6 shadow-2xl border border-white/10"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="mb-4 flex items-start justify-between gap-3">
                  <h2 id="modal-task-title" className="text-lg font-bold text-[#f8f7ff] break-words">
                    {selectedTask.title}
                  </h2>
                  <button
                    onClick={() => setSelectedTask(null)}
                    aria-label="Close modal"
                    className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-white/10 text-[#9898ad] transition-colors hover:bg-white/20 hover:text-white"
                  >
                    ✕
                  </button>
                </div>

                <div className="space-y-4">
                  <div className="grid grid-cols-3 gap-3 rounded-xl border border-white/[0.08] bg-black/30 p-3 max-[480px]:grid-cols-1">
                    <div>
                      <span className="mb-1 block text-[0.65rem] font-bold uppercase tracking-wider text-[#9aa4c7]">
                        Status
                      </span>
                      <span className="text-sm font-medium text-[#f8f7ff] capitalize">
                        {columns.find((c) => c.id === getStatus(selectedTask))?.label || getStatus(selectedTask)}
                      </span>
                    </div>

                    <div>
                      <span className="mb-1 block text-[0.65rem] font-bold uppercase tracking-wider text-[#9aa4c7]">
                        Priority
                      </span>
                      <div className="flex items-center gap-1.5 mt-0.5">
                        <span
                          className={`h-2 w-2 rounded-full shadow-[0_0_8px_currentColor] ${
                            selectedTask.priority === 'High'
                              ? 'bg-rose-400 text-rose-400'
                              : selectedTask.priority === 'Medium'
                              ? 'bg-amber-300 text-amber-300'
                              : selectedTask.priority === 'Low'
                              ? 'bg-emerald-400 text-emerald-400'
                              : 'bg-[#9898ad]'
                          }`}
                        />
                        <span className="text-sm text-[#f8f7ff] font-medium">{selectedTask.priority || 'None'}</span>
                      </div>
                    </div>

                    <div>
                      <span className="mb-1 block text-[0.65rem] font-bold uppercase tracking-wider text-[#9aa4c7]">
                        Category
                      </span>
                      <span className="text-sm font-medium text-cyan-300">
                        {selectedTask.category?.name ||
                          (selectedTask.category_id ? categoriesMap.get(selectedTask.category_id) : 'Uncategorized') ||
                          'Uncategorized'}
                      </span>
                    </div>
                  </div>

                  {selectedTask.due_date && (
                    <div className="rounded-xl border border-white/[0.08] bg-black/20 p-3">
                      <span className="mb-1 block text-[0.65rem] font-bold uppercase tracking-wider text-[#9aa4c7]">
                        Due Date
                      </span>
                      <p className="text-sm text-[#f8f7ff] font-medium">
                        {new Date(selectedTask.due_date).toLocaleDateString(undefined, {
                          weekday: 'long',
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                        })}
                        {isDateOverdue(selectedTask.due_date, selectedTask.is_completed || selectedTask.status === 'done') && (
                          <span className="ml-2 font-bold text-rose-400">(Overdue)</span>
                        )}
                      </p>
                    </div>
                  )}

                  <div>
                    <span className="mb-1 block text-[0.65rem] font-bold uppercase tracking-wider text-[#9aa4c7]">
                      Description
                    </span>
                    <div className="rounded-xl border border-white/[0.08] bg-black/20 p-3.5 text-sm text-[#cbd3ee] min-h-[90px]">
                      {selectedTask.description ? (
                        <p className="whitespace-pre-wrap leading-relaxed">{selectedTask.description}</p>
                      ) : (
                        <p className="italic text-white/30">No description provided for this task.</p>
                      )}
                    </div>
                  </div>
                </div>

                <div className="mt-6 flex justify-end">
                  <button
                    onClick={() => setSelectedTask(null)}
                    className="glass-button px-5 py-2.5 text-sm font-medium"
                  >
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