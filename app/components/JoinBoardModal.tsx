"use client";

import { useState } from "react";
import { X } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";

interface JoinBoardModalProps {
  isOpen: boolean;
  onClose: () => void;
  userId: string;
}

export default function JoinBoardModal({
  isOpen,
  onClose,
  userId,
}: JoinBoardModalProps) {
  const [inviteCode, setInviteCode] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  if (!isOpen) return null;

  const handleJoinBoard = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Find board by invite code
      const { data: board, error: boardError } = await supabase
        .from("boards")
        .select("id, title")
        .eq("invite_code", inviteCode.toUpperCase())
        .single();

      if (boardError || !board) {
        toast.error("Invalid invite code");
        setLoading(false);
        return;
      }

      // Check if already a member
      const { data: existingMember } = await supabase
        .from("board_members")
        .select("id")
        .eq("board_id", board.id)
        .eq("user_id", userId)
        .single();

      if (existingMember) {
        toast.error("You are already a member of this board");
        setLoading(false);
        return;
      }

      // Add user to board
      const { error: memberError } = await supabase
        .from("board_members")
        .insert([
          {
            board_id: board.id,
            user_id: userId,
          },
        ]);

      if (memberError) {
        toast.error("Failed to join board");
        console.error(memberError);
        setLoading(false);
        return;
      }

      toast.success(`Joined ${board.title} successfully!`);
      onClose();
      router.push(`/boards/${board.id}`);
    } catch (error) {
      console.error("Error joining board:", error);
      toast.error("Failed to join board");
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
        <div className="relative bg-[#1a1a2e] rounded-2xl border border-[#2a2a3e] overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-[#2a2a3e]">
            <h2 className="text-2xl font-bold text-white">Join Board</h2>
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-white hover:bg-[#2a2a3e] rounded-lg transition-all"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleJoinBoard} className="p-6 space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Invite Code
              </label>
              <input
                type="text"
                value={inviteCode}
                onChange={(e) => setInviteCode(e.target.value.toUpperCase())}
                className="w-full px-4 py-3 bg-[#0f0f1a] border border-[#2a2a3e] rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-green-500 transition-colors text-center text-lg font-mono tracking-widest"
                placeholder="XXXXXX"
                required
                maxLength={6}
              />
              <p className="mt-2 text-sm text-gray-400">
                Enter the 6-character invite code shared by the board owner
              </p>
            </div>

            <button
              type="submit"
              disabled={loading || inviteCode.length !== 6}
              className="w-full py-3 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-500 hover:to-emerald-500 text-white font-semibold rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "Joining..." : "Join Board"}
            </button>
          </form>
        </div>
      </div>
    </>
  );
}
