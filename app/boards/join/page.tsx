"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function JoinBoardPage() {
  const [inviteCode, setInviteCode] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  const handleJoin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      setError("You must be logged in to join a board.");
      setLoading(false);
      return;
    }

    const { data: board, error: boardError } = await supabase
      .from("boards")
      .select("id")
      .eq("invite_code", inviteCode.trim().toUpperCase())
      .single();

    if (boardError || !board) {
      setError("Invalid invite code or board not found.");
      setLoading(false);
      return;
    }

    // Add user to board_members
    const { error: memberError } = await supabase
      .from("board_members")
      .insert([{ board_id: board.id, user_id: user.id }]);

    if (memberError) {
      setError("Could not join board. You may already be a member.");
      setLoading(false);
      return;
    }

    router.push(`/boards/${board.id}`);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0a0a0f] p-4">
      <div className="bg-[#1a1a2e] rounded-lg shadow-xl max-w-md w-full p-8 border border-[#2a2a3e]">
        <h1 className="text-2xl font-bold text-white mb-4">Join Board</h1>
        <form onSubmit={handleJoin} className="space-y-6">
          {error && (
            <div className="bg-red-500/10 border border-red-500/50 text-red-400 px-4 py-3 rounded-md text-sm">
              {error}
            </div>
          )}
          <div>
            <label
              htmlFor="inviteCode"
              className="block text-sm font-medium text-white mb-2"
            >
              Invite Code
            </label>
            <input
              type="text"
              id="inviteCode"
              value={inviteCode}
              onChange={(e) => setInviteCode(e.target.value)}
              className="w-full px-4 py-3 bg-[#0f0f1a] border border-[#2a2a3e] text-white rounded-md focus:outline-none focus:ring-2 focus:ring-[#3b82f6] focus:border-transparent"
              placeholder="Enter invite code"
              required
            />
          </div>
          <button
            type="submit"
            disabled={loading || !inviteCode.trim()}
            className="w-full py-3 bg-gradient-to-r from-[#34d399] to-[#4ade80] hover:from-[#6ee7b7] hover:to-[#a7f3d0] text-white font-semibold rounded-md transition-all shadow-lg shadow-green-500/20 disabled:opacity-50"
          >
            {loading ? "Joining..." : "Join Board"}
          </button>
        </form>
      </div>
    </div>
  );
}
