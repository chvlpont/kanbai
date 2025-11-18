"use client";

import { useState, useEffect } from "react";

interface ColumnModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (title: string) => void;
  existingTitle?: string;
}

export default function ColumnModal({ isOpen, onClose, onSave, existingTitle }: ColumnModalProps) {
  const [title, setTitle] = useState("");

  useEffect(() => {
    setTitle(existingTitle || "");
  }, [existingTitle, isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    onSave(title.trim());
    setTitle("");
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-3 sm:p-4">
      <div className="bg-[#1a1a2e] rounded-lg shadow-xl shadow-blue-500/10 max-w-md w-full border border-[#2a2a3e]">
        {/* Header */}
        <div className="flex justify-between items-center p-4 sm:p-6 border-b border-[#2a2a3e]">
          <h2 className="text-lg sm:text-xl font-semibold text-white">
            {existingTitle ? "Edit Column" : "Add New Column"}
          </h2>
          <button
            onClick={onClose}
            className="text-[#9ca3af] hover:text-white transition-colors"
          >
            <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-4 sm:p-6 space-y-4">
          <div>
            <label htmlFor="columnTitle" className="block text-sm font-medium text-white mb-2">
              Column Title *
            </label>
            <input
              type="text"
              id="columnTitle"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3 py-2 bg-[#0f0f1a] border border-[#2a2a3e] text-white rounded-md focus:outline-none focus:ring-2 focus:ring-[#3b82f6] focus:border-transparent placeholder-[#6a6a6a]"
              placeholder="e.g., In Review, Testing, Blocked"
              autoFocus
              required
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
              {existingTitle ? "Update" : "Add"} Column
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
