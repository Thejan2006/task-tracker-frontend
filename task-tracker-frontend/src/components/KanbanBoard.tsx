'use client';

import { useMemo, useState } from 'react';
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

/* --- Presentation Card (Used inside regular list & DragOverlay) --- */
function TaskCardUI({ task, isOverlay = false }: { task: BoardTask; isOverlay?: boolean }) {
  return (
    <article
      className={`glass-panel mb-[9px] select-none rounded-xl p-3.5 transition-shadow ${
        isOverlay
          ? 'cursor-grabbing shadow-[0_12px_30px_rgba(139,92,246,0.3)] border-[#8b5cf6] bg-[#16132a]'
          : 'cursor-grab hover:-translate-y-0.5 active:cursor-grabbing'
      }`}
    >
      <div className="flex min-h-2.5 items-center gap-1.5">
        <span
          className={`h-2 w-2 rounded-full shadow-[0_0_10px_currentColor] ${
            task.priority === 'High'
              ? 'bg-rose-400 text-rose-400'
              : task.priority === 'Medium'
              ? 'bg-amber-300 text-amber-300'
              : task.priority === 'Low'
              ? 'bg-neon-lime text-neon-lime'
              : 'bg-[#9898ad]'
          }`}
        />
        {task.priority && <small className="text-[0.6rem] text-[#9aa4c7]">{task.priority}</small>}
      </div>
      <h4 className="my-2.5 mb-[5px] text-[0.8rem] leading-[1.3] text-[#f8f7ff]">{task.title}</h4>
      {task.description && <p className="m-0 text-[0.67rem] leading-[1.4] text-[#9898ad]">{task.description}</p>}
      {task.due_date && <time className="mt-2.5 block text-[0.6rem] text-[#9898ad]">Due {new Date(task.due_date).toLocaleDateString()}</time>}
    </article>
  );
}

/* --- Draggable Sortable Card Wrapper --- */
function SortableCard({ task }: { task: BoardTask }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: task.id });

  const style = {
    // Translate instead of Transform prevents scale jittering during drag
    transform: CSS.Translate.toString(transform),
    transition,
    opacity: isDragging ? 0.3 : 1,
  };

  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners} className="touch-none">
      <TaskCardUI task={task} />
    </div>
  );
}

/* --- Droppable Column Container --- */
function Column({ id, label, color, tasks }: { id: TaskStatus; label: string; color: string; tasks: BoardTask[] }) {
  const { setNodeRef, isOver } = useDroppable({ id });
  return (
    <section
      ref={setNodeRef}
      className={`min-w-0 rounded-2xl border transition-colors ${
        isOver ? 'border-neon-cyan bg-neon-cyan/10 shadow-neon' : 'border-white/10 bg-black/10'
      }`}
    >
      <header className="flex justify-between px-3.5 pb-2.5 pt-[15px]">
        <span className="flex items-center gap-[7px] text-[0.76rem] font-bold">
          <i
            className={`h-[7px] w-[7px] rounded-full ${
              id === 'todo'
                ? 'bg-slate-400'
                : id === 'in_progress'
                ? 'bg-violet-500'
                : id === 'review'
                ? 'bg-amber-500'
                : 'bg-green-500'
            }`}
          />
          {label}
        </span>
        <b className="grid h-[21px] min-w-[21px] place-items-center rounded-full bg-white/10 text-[0.65rem] text-[#9898ad]">
          {tasks.length}
        </b>
      </header>
      <SortableContext items={tasks.map((task) => task.id)} strategy={verticalListSortingStrategy}>
        <div className="min-h-[160px] px-[9px] pb-2.5 pt-[5px] max-[480px]:min-h-[110px]">
          {tasks.map((task) => (
            <SortableCard key={task.id} task={task} />
          ))}
          {tasks.length === 0 && (
            <span className="grid min-h-[100px] place-items-center rounded-lg border border-dashed border-white/10 text-[0.7rem] text-[#9898ad]">
              Drop tasks here
            </span>
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
  onReorder,
  onPersist,
}: {
  tasks: BoardTask[];
  onReorder: (tasks: BoardTask[]) => void;
  onPersist: (task: BoardTask, status: TaskStatus, position: number) => Promise<void>;
}) {
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5, // Instant drag start with slight jitter protection
      },
    })
  );

  const [activeId, setActiveId] = useState<number | null>(null);

  const grouped = useMemo(() => {
    return columns.reduce<Record<TaskStatus, BoardTask[]>>(
      (result, column) => {
        result[column.id] = tasks
          .filter((task) => getStatus(task) === column.id)
          .sort((a, b) => (a.position ?? a.id) - (b.position ?? b.id));
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

    // Check if dragging over a column container or another card
    const overStatus: TaskStatus | null = columns.some((c) => c.id === overId)
      ? (overId as TaskStatus)
      : tasks.find((t) => t.id === overId)
      ? getStatus(tasks.find((t) => t.id === overId)!)
      : null;

    if (!overStatus || activeStatus === overStatus) return;

    // Dynamically update task status live while hovering over new columns
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
        <div className="grid grid-cols-4 gap-3.5 max-[800px]:grid-cols-2 max-[480px]:grid-cols-1">
          {columns.map((column) => (
            <Column key={column.id} {...column} tasks={grouped[column.id]} />
          ))}
        </div>

        <DragOverlay dropAnimation={dropAnimation}>
          {activeTask ? <TaskCardUI task={activeTask} isOverlay /> : null}
        </DragOverlay>
      </DndContext>
    </div>
  );
}