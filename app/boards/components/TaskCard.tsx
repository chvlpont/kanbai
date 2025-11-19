"use client";

import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { motion } from "framer-motion";
import { Task } from "../types";
import { useState, useRef, useEffect } from "react";

interface TaskCardProps {
  task: Task;
  onEdit: (task: Task) => void;
  onDelete: (taskId: string) => void;
  members?: { id: string; username: string }[];
  onAssignMembers?: (taskId: string, memberIds: string[]) => void;
}

export default function TaskCard({ task, onEdit, onDelete, members = [], onAssignMembers }: TaskCardProps) {
  const [showAssignMenu, setShowAssignMenu] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: task.id });

  const assignedMembers = members.filter(m =>
    task.assigned_user_ids?.includes(m.id)
  );

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowAssignMenu(false);
      }
    };

    if (showAssignMenu) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showAssignMenu]);

  const toggleMemberAssignment = (memberId: string) => {
    if (!onAssignMembers) return;

    const currentIds = task.assigned_user_ids || [];
    const newIds = currentIds.includes(memberId)
      ? currentIds.filter(id => id !== memberId)
      : [...currentIds, memberId];

    onAssignMembers(task.id, newIds);
  };

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    boxShadow: isDragging ? '0 0 30px rgba(59, 130, 246, 0.15)' : undefined,
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
      className="group bg-[#0f0f1a] rounded-xl p-2.5 sm:p-3 shadow-sm border border-[#2a2a3e]/50 hover:border-[#3b82f6]/30 hover:shadow-[0_0_20px_rgba(59,130,246,0.08)] transition-all duration-200 cursor-grab active:cursor-grabbing touch-none relative"
    >
      <div className="flex justify-between items-start gap-2">
        <h3 className="font-medium text-white text-sm leading-snug flex-1">
          {task.title}
        </h3>
        <div className="flex items-center gap-0.5 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity flex-shrink-0">
          <button
            onClick={(e) => {
              e.stopPropagation();
              setShowAssignMenu(!showAssignMenu);
            }}
            className="text-[#9ca3af] hover:text-purple-400 hover:bg-purple-400/10 p-1 rounded transition-colors"
            title="Assign member"
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
            </svg>
          </button>
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

      {/* Member Selection Menu - positioned relative to card */}
      {showAssignMenu && members.length > 0 && (
        <div ref={menuRef} className="absolute right-2 top-10 bg-[#1a1a2e] border border-[#2a2a3e] rounded-lg shadow-xl shadow-black/20 z-50 min-w-[160px] py-1">
          <div className="px-3 py-1.5 text-xs text-purple-400 font-semibold uppercase tracking-wide border-b border-[#2a2a3e]">
            Assign Members
          </div>
          {members.map((member) => {
            const isAssigned = task.assigned_user_ids?.includes(member.id);
            return (
              <button
                key={member.id}
                onClick={(e) => {
                  e.stopPropagation();
                  toggleMemberAssignment(member.id);
                }}
                className="w-full px-3 py-2 text-left text-sm text-white hover:bg-[#2a2a3e] transition-colors flex items-center gap-2"
              >
                <div className={`w-4 h-4 rounded border-2 flex items-center justify-center ${
                  isAssigned
                    ? 'bg-blue-400 border-blue-400'
                    : 'border-[#2a2a3e]'
                }`}>
                  {isAssigned && (
                    <svg
                      className="w-3 h-3 text-white"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={3}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                  )}
                </div>
                <span>{member.username}</span>
              </button>
            );
          })}
        </div>
      )}

      {task.description && (
        <p className="text-xs text-[#9ca3af] mt-1.5 sm:mt-2 leading-relaxed">
          {task.description}
        </p>
      )}
      {assignedMembers.length > 0 && (
        <div className="mt-2 flex items-center gap-1.5">
          {/* Assigned Member Avatars with colored accent dots */}
          {assignedMembers.map((member, index) => (
            <div key={member.id} className="relative group/avatar">
              <div
                className="w-7 h-7 rounded-full bg-[#1a1a2e] border-2 border-[#2a2a3e] flex items-center justify-center relative overflow-hidden"
                title={`Assigned to ${member.username}`}
              >
                <span className="text-white text-xs font-medium uppercase relative z-10">
                  {member.username.charAt(0)}
                </span>
                {/* Subtle gradient overlay */}
                <div className="absolute inset-0 bg-gradient-to-br from-blue-400/20 to-purple-500/20 opacity-0 group-hover/avatar:opacity-100 transition-opacity"></div>
              </div>
              {/* Colored accent dot */}
              <div
                className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full border-2 border-[#0f0f1a]"
                style={{
                  backgroundColor: `hsl(${(index * 137.5) % 360}, 70%, 60%)`
                }}
              ></div>
            </div>
          ))}
        </div>
      )}
    </motion.div>
  );
}
