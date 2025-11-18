"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function NewBoardPage() {
  const [title, setTitle] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();
  const supabase = createClient();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      router.push("/login");
      return;
    }

    // Generate random 6-character invite code
    const generateInviteCode = () =>
      Math.random().toString(36).substring(2, 8).toUpperCase();

    const { data: board, error: boardError } = await supabase
      .from("boards")
      .insert([{ title, user_id: user.id, invite_code: generateInviteCode() }])
      .select()
      .single();

    if (boardError) {
      setError(boardError.message);
      setLoading(false);
      return;
    }

    // Create default columns
    const defaultColumns = [
      { board_id: board.id, title: "To Do", position: 0 },
      { board_id: board.id, title: "In Progress", position: 1 },
      { board_id: board.id, title: "Done", position: 2 },
    ];

    const { error: columnsError } = await supabase
      .from("columns")
      .insert(defaultColumns);

    if (columnsError) {
      setError(columnsError.message);
      setLoading(false);
      return;
    }

    router.push(`/boards/${board.id}`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0a0a0f] via-[#0f0f1a] to-[#1a1a2e] flex items-center justify-center p-4">
      <div className="bg-[#1a1a2e] rounded-lg shadow-xl shadow-blue-500/10 max-w-md w-full p-8 border border-[#2a2a3e]">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-white mb-2">
            Create New Board
          </h1>
          <p className="text-[#9ca3af]">
            Give your board a name to get started
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="bg-red-500/10 border border-red-500/50 text-red-400 px-4 py-3 rounded-md text-sm">
              {error}
            </div>
          )}

          <div>
            <label
              htmlFor="title"
              className="block text-sm font-medium text-white mb-2"
            >
              Board Title *
            </label>
            <input
              type="text"
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-4 py-3 bg-[#0f0f1a] border border-[#2a2a3e] text-white rounded-md focus:outline-none focus:ring-2 focus:ring-[#3b82f6] focus:border-transparent"
              placeholder="e.g., My Project, Team Tasks"
              autoFocus
              required
            />
          </div>

          <div className="flex gap-3">
            <Link
              href="/boards"
              className="flex-1 px-4 py-3 border border-[#2a2a3e] text-white text-center rounded-md hover:bg-[#2a2a3e] transition-colors"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={loading || !title.trim()}
              className="flex-1 px-4 py-3 bg-gradient-to-r from-[#3b82f6] to-[#8b5cf6] hover:from-[#60a5fa] hover:to-[#a78bfa] text-white font-semibold rounded-md transition-all shadow-lg shadow-blue-500/20 disabled:opacity-50"
            >
              {loading ? "Creating..." : "Create Board"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
