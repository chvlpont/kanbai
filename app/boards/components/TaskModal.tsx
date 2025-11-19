"use client";

import { useState, useEffect } from "react";
import { Task } from "../types";

interface TaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (task: { title: string; description: string }) => void;
  task?: Task;
}

export default function TaskModal({
  isOpen,
  onClose,
  onSave,
  task,
}: TaskModalProps) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");

  useEffect(() => {
    if (task) {
      setTitle(task.title);
      setDescription(task.description || "");
    } else {
      setTitle("");
      setDescription("");
    }
  }, [task]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    onSave({
      title: title.trim(),
      description: description.trim(),
    });

    setTitle("");
    setDescription("");
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-3 sm:p-4">
      <div className="bg-[#1a1a2e] rounded-lg shadow-xl shadow-blue-500/10 max-w-md w-full max-h-[90vh] overflow-y-auto border border-[#2a2a3e]">
        {/* Header */}
        <div className="flex justify-between items-center p-4 sm:p-6 border-b border-[#2a2a3e]">
          <h2 className="text-lg sm:text-xl font-semibold text-white">
            {task ? "Edit Task" : "Add New Task"}
          </h2>
          <button
            onClick={onClose}
            className="text-[#9ca3af] hover:text-white transition-colors"
          >
            <svg
              className="w-5 h-5 sm:w-6 sm:h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-4 sm:p-6 space-y-4">
          {/* Title Input */}
          <div>
            <label
              htmlFor="title"
              className="block text-sm font-medium text-white mb-2"
            >
              Title *
            </label>
            <input
              type="text"
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3 py-2 bg-[#0f0f1a] border border-[#2a2a3e] text-white rounded-md focus:outline-none focus:ring-2 focus:ring-[#3b82f6] focus:border-transparent placeholder-[#6a6a6a]"
              placeholder="Enter task title"
              autoFocus
              required
            />
          </div>

          {/* Description Input */}
          <div>
            <label
              htmlFor="description"
              className="block text-sm font-medium text-white mb-2"
            >
              Description
            </label>
            <textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3 py-2 bg-[#0f0f1a] border border-[#2a2a3e] text-white rounded-md focus:outline-none focus:ring-2 focus:ring-[#3b82f6] focus:border-transparent resize-none placeholder-[#6a6a6a]"
              placeholder="Add more details..."
              rows={4}
            />
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-[#2a2a3e] text-white rounded-md hover:bg-[#2a2a3e] transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2 bg-gradient-to-r from-[#3b82f6] to-[#8b5cf6] hover:from-[#60a5fa] hover:to-[#a78bfa] text-white font-medium rounded-md transition-all shadow-lg shadow-blue-500/20"
            >
              {task ? "Update" : "Add"} Task
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
