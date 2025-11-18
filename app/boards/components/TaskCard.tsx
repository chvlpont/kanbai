"use client";

import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { motion } from "framer-motion";
import { Task } from "../types";

interface TaskCardProps {
  task: Task;
  onEdit: (task: Task) => void;
  onDelete: (taskId: string) => void;
}

export default function TaskCard({ task, onEdit, onDelete }: TaskCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: task.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <motion.div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      layout
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: isDragging ? 0.5 : 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.8 }}
      transition={{
        layout: { duration: 0.3, ease: "easeInOut" },
        opacity: { duration: 0.2 },
        scale: { duration: 0.2 },
      }}
      className="group bg-[#0f0f1a] rounded-lg p-2.5 sm:p-3 shadow-sm border border-[#2a2a3e] hover:border-[#3b82f6] hover:shadow-md hover:shadow-blue-500/20 transition-all cursor-grab active:cursor-grabbing touch-none"
    >
      <div className="flex justify-between items-start gap-2">
        <h3 className="font-medium text-white text-sm flex-1 leading-snug">
          {task.title}
        </h3>
        <div className="flex gap-0.5 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity flex-shrink-0">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onEdit(task);
            }}
            className="text-[#9ca3af] hover:text-[#60a5fa] hover:bg-[#3b82f6]/10 p-1 rounded transition-colors"
            title="Edit task"
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onDelete(task.id);
            }}
            className="text-[#9ca3af] hover:text-red-400 hover:bg-red-500/10 p-1 rounded transition-colors"
            title="Delete task"
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
        </div>
      </div>
      {task.description && (
        <p className="text-xs text-[#9ca3af] mt-1.5 sm:mt-2 line-clamp-2 leading-relaxed">
          {task.description}
        </p>
      )}
    </motion.div>
  );
}
