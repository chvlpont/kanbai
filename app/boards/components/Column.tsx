"use client";

import { useDroppable } from "@dnd-kit/core";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import {
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { AnimatePresence } from "framer-motion";
import { Column as ColumnType, Task } from "../types";
import TaskCard from "./TaskCard";

interface ColumnProps {
  column: ColumnType;
  onAddTask: (status: ColumnType["id"]) => void;
  onEditTask: (task: Task) => void;
  onDeleteTask: (taskId: string) => void;
  onDeleteColumn: (columnId: string) => void;
  onEditColumn: (columnId: string) => void;
  isDraggingColumn?: boolean;
  members?: { id: string; username: string }[];
  onAssignMembers?: (taskId: string, memberIds: string[]) => void;
}

export default function Column({
  column,
  onAddTask,
  onEditTask,
  onDeleteTask,
  onDeleteColumn,
  onEditColumn,
  isDraggingColumn,
  members = [],
  onAssignMembers,
}: ColumnProps) {
  const { setNodeRef: setDroppableNodeRef } = useDroppable({
    id: column.id,
  });

  const {
    attributes,
    listeners,
    setNodeRef: setSortableNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: column.id,
    disabled: isDraggingColumn === false,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setSortableNodeRef}
      style={style}
      className="bg-surface rounded-xl border border-border shadow-sm p-3 sm:p-4 flex flex-col"
    >
      {/* Column Header with subtle gradient */}
      <div className="pb-2 sm:pb-3 mb-2 sm:mb-3 border-b border-border bg-gradient-to-br from-[var(--column-from)] to-[var(--column-to)] rounded-t-lg -mx-3 sm:-mx-4 -mt-3 sm:-mt-4 px-3 sm:px-4 pt-3 sm:pt-4">
        <div className="flex justify-between items-center mb-1.5 sm:mb-2">
          <div className="flex items-center gap-1.5 sm:gap-2 flex-1">
            <button
              {...attributes}
              {...listeners}
              className="text-text-secondary hover:text-text-primary cursor-grab active:cursor-grabbing transition-colors touch-none"
              title="Drag to reorder column"
            >
              <svg
                className="w-3.5 h-3.5 sm:w-4 sm:h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 8h16M4 16h16"
                />
              </svg>
            </button>
            <h2 className="font-semibold text-text-primary text-sm sm:text-base flex-1 truncate">
              {column.title}
            </h2>
            <span className="px-1.5 sm:px-2 py-0.5 bg-primary-bg text-primary text-xs font-medium rounded-full flex-shrink-0">
              {column.tasks.length}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-1">
          <button
            onClick={() => onEditColumn(column.id)}
            className="text-text-secondary hover:text-primary hover:bg-primary/10 transition-colors p-1.5 rounded-md"
            title="Edit column"
          >
            <svg
              className="w-3.5 h-3.5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
              />
            </svg>
          </button>
          <button
            onClick={() => onDeleteColumn(column.id)}
            className="text-text-secondary hover:text-red-400 hover:bg-red-500/10 transition-colors p-1.5 rounded-md"
            title="Delete column"
          >
            <svg
              className="w-3.5 h-3.5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
              />
            </svg>
          </button>
          <button
            onClick={() => onAddTask(column.id)}
            className="text-text-secondary hover:text-primary hover:bg-primary/10 transition-colors p-1.5 rounded-md"
            title="Add task"
          >
            <svg
              className="w-3.5 h-3.5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 4v16m8-8H4"
              />
            </svg>
          </button>
        </div>
      </div>

      {/* Tasks Container */}
      <div ref={setDroppableNodeRef} className="space-y-2 mb-3">
        <SortableContext
          items={column.tasks.map((task) => task.id)}
          strategy={verticalListSortingStrategy}
        >
          <AnimatePresence mode="popLayout">
            {column.tasks.map((task) => (
              <TaskCard
                key={task.id}
                task={task}
                onEdit={onEditTask}
                onDelete={onDeleteTask}
                members={members}
                onAssignMembers={onAssignMembers}
              />
            ))}
          </AnimatePresence>
        </SortableContext>
      </div>

      {/* Add Task Button */}
      <button
        onClick={() => onAddTask(column.id)}
        className="w-full py-2 text-sm text-text-secondary hover:bg-surface-muted hover:text-text-primary rounded-lg transition-colors flex items-center justify-center gap-1.5 border border-dashed border-border hover:border-primary"
      >
        <svg
          className="w-4 h-4"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 4v16m8-8H4"
          />
        </svg>
        Add card
      </button>
    </div>
  );
}
