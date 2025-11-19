"use client";

import { useState } from "react";
import { X } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";

interface CreateBoardModalProps {
  isOpen: boolean;
  onClose: () => void;
  userId: string;
}

export default function CreateBoardModal({
  isOpen,
  onClose,
  userId,
}: CreateBoardModalProps) {
  const [title, setTitle] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  if (!isOpen) return null;

  const handleCreateBoard = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { data: board, error } = await supabase
        .from("boards")
        .insert([
          {
            title,
            user_id: userId,
          },
        ])
        .select()
        .single();

      if (error) {
        toast.error("Failed to create board");
        console.error(error);
        setLoading(false);
        return;
      }

      toast.success("Board created successfully!");
      onClose();
      router.push(`/boards/${board.id}`);
    } catch (error) {
      console.error("Error creating board:", error);
      toast.error("Failed to create board");
      setLoading(false);
    }
  };

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/40 z-50 animate-in fade-in duration-300"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-full max-w-md px-4 animate-in zoom-in-95 fade-in duration-300">
        <div className="relative bg-surface rounded-2xl border border-border overflow-hidden shadow-xl">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-border">
            <h2 className="text-2xl font-bold text-text-primary">Create New Board</h2>
            <button
              onClick={onClose}
              className="p-2 text-text-secondary hover:text-text-primary hover:bg-surface-muted rounded-lg transition-all"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleCreateBoard} className="p-6 space-y-4">
            <div>
              <label className="block text-sm font-medium text-text-secondary mb-2">
                Board Name
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-4 py-3 bg-background border border-border rounded-lg text-text-primary placeholder-text-secondary focus:outline-none focus:border-primary transition-colors"
                placeholder="Enter board name"
                required
                autoFocus
              />
            </div>

            <button
              type="submit"
              disabled={loading || !title.trim()}
              className="w-full py-3 bg-gradient-to-r from-primary to-accent-purple hover:from-primary-hover hover:to-accent-purple text-white font-semibold rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
            >
              {loading ? "Creating..." : "Create Board"}
            </button>
          </form>
        </div>
      </div>
    </>
  );
}
