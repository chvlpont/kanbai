"use client";

import { X } from "lucide-react";

interface ConfirmDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText?: string;
  confirmStyle?: "danger" | "primary";
}

export default function ConfirmDialog({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = "Confirm",
  confirmStyle = "danger",
}: ConfirmDialogProps) {
  if (!isOpen) return null;

  const handleConfirm = () => {
    onConfirm();
    onClose();
  };

  return (
    <>
      {/* Dialog */}
      <div className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-full max-w-md px-4 animate-in zoom-in-95 fade-in duration-300">
        <div className="relative bg-[#0f0f1a] rounded-2xl border border-[#1a1a2e] overflow-hidden">
          <div className="relative">
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-[#1a1a2e]">
              <h3 className="text-2xl font-bold text-white">
                {title}
              </h3>
              <button
                onClick={onClose}
                className="p-2 text-gray-400 hover:text-white hover:bg-[#1a1a2e] rounded-lg transition-all duration-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Content */}
            <div className="p-8">
              <p className="text-gray-300 text-base leading-relaxed whitespace-pre-line">
                {message}
              </p>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-center gap-3 p-6 bg-[#0a0a0f] border-t border-[#1a1a2e]">
              <button
                onClick={onClose}
                className="px-7 py-3 bg-[#1a1a2e] hover:bg-[#252530] text-gray-200 font-semibold rounded-lg transition-all duration-200"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirm}
                className={`px-7 py-3 font-semibold rounded-lg transition-all duration-200 ${
                  confirmStyle === "danger"
                    ? "bg-red-600 hover:bg-red-500 text-white"
                    : "bg-blue-600 hover:bg-blue-500 text-white"
                }`}
              >
                {confirmText}
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
