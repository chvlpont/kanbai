"use client";

import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { MoreVertical, Trash2, LogOut, Sun, Moon } from "lucide-react";
import ConfirmDialog from "@/app/components/ConfirmDialog";
import JoinBoardModal from "@/app/components/JoinBoardModal";
import CreateBoardModal from "@/app/components/CreateBoardModal";
import { useTheme } from "@/app/components/ThemeProvider";
import Loader from "@/app/components/Loader";

export default function BoardsPage() {
  const router = useRouter();
  const supabase = createClient();
  const { theme, toggleTheme } = useTheme();
  const [user, setUser] = useState<any>(null);
  const [username, setUsername] = useState("");
  const [boards, setBoards] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const [confirmDialog, setConfirmDialog] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    onConfirm: () => void;
  }>({
    isOpen: false,
    title: "",
    message: "",
    onConfirm: () => {},
  });
  const [isJoinModalOpen, setIsJoinModalOpen] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      const {
        data: { user: currentUser },
      } = await supabase.auth.getUser();

      if (!currentUser) {
        router.push("/login");
        return;
      }

      setUser(currentUser);

      // Get user profile with username
      const { data: profile } = await supabase
        .from("profiles")
        .select("username")
        .eq("id", currentUser.id)
        .single();

      setUsername(profile?.username || currentUser.email?.split("@")[0] || "User");

      // Get board IDs where user is a member
      const { data: memberBoards } = await supabase
        .from("board_members")
        .select("board_id")
        .eq("user_id", currentUser.id);

      const memberBoardIds = memberBoards
        ? memberBoards.map((bm) => bm.board_id)
        : [];

      // Fetch boards where user is owner or member
      const { data: boardsData } = await supabase
        .from("boards")
        .select("*")
        .or(
          [
            `user_id.eq.${currentUser.id}`,
            memberBoardIds.length > 0 ? `id.in.(${memberBoardIds.join(",")})` : "",
          ]
            .filter(Boolean)
            .join(",")
        )
        .order("created_at", { ascending: false });

      setBoards(boardsData || []);
      setLoading(false);
    };

    fetchData();
  }, [router]);

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (openMenuId) {
        setOpenMenuId(null);
      }
    };

    if (openMenuId) {
      document.addEventListener("click", handleClickOutside);
    }

    return () => {
      document.removeEventListener("click", handleClickOutside);
    };
  }, [openMenuId]);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push("/login");
  };

  const handleLeaveBoard = async (boardId: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    const board = boards.find((b) => b.id === boardId);
    console.log("Board info:", {
      boardId,
      boardUserId: board?.user_id,
      currentUserId: user.id,
      isOwner: board?.user_id === user.id
    });

    setConfirmDialog({
      isOpen: true,
      title: "Leave Board",
      message: "Are you sure you want to leave this board?",
      onConfirm: async () => {
        console.log("Attempting to leave board:", boardId, "User ID:", user.id);

        const { data, error } = await supabase
          .from("board_members")
          .delete()
          .eq("board_id", boardId)
          .eq("user_id", user.id)
          .select();

        console.log("Delete result:", { data, error });

        if (error) {
          toast.error("Failed to leave board: " + error.message);
          console.error("Delete error:", error);
        } else if (!data || data.length === 0) {
          toast.error("You are not a member of this board");
          console.error("No membership record found");
        } else {
          toast.success("Left board successfully");
          setBoards(boards.filter((b) => b.id !== boardId));
        }
      },
    });
  };

  const handleDeleteBoard = async (boardId: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    setConfirmDialog({
      isOpen: true,
      title: "Delete Board",
      message: "Are you sure you want to delete this board?\n\nThis action cannot be undone.",
      onConfirm: async () => {
        const { error } = await supabase
          .from("boards")
          .delete()
          .eq("id", boardId);

        if (error) {
          toast.error("Failed to delete board");
          console.error(error);
        } else {
          toast.success("Board deleted successfully");
          setBoards(boards.filter((b) => b.id !== boardId));
        }
      },
    });
  };

  if (loading) {
    return <Loader />;
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="bg-surface/95 backdrop-blur-xl border-b border-border sticky top-0 z-50 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link
              href="/"
              className="font-bold text-2xl tracking-tight hover:scale-105 transition-transform text-text-primary"
            >
              Kanb
              <span className="bg-gradient-to-r from-primary via-accent-purple to-accent-orange bg-clip-text text-transparent">
                ai
              </span>
            </Link>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-3 px-4 py-2 bg-surface-muted rounded-full border border-border">
                <div className="w-2 h-2 bg-accent-green rounded-full shadow-sm shadow-accent-green/50"></div>
                <span className="text-text-primary text-sm font-semibold">
                  {username}
                </span>
              </div>
              <button
                onClick={toggleTheme}
                className="p-2 text-text-secondary hover:text-text-primary hover:bg-surface-muted rounded-lg transition-all border border-transparent hover:border-border"
                aria-label="Toggle theme"
              >
                {theme === "light" ? (
                  <Moon className="w-5 h-5" />
                ) : (
                  <Sun className="w-5 h-5" />
                )}
              </button>
              <form action={handleSignOut}>
                <button
                  type="submit"
                  className="px-5 py-2 text-text-secondary hover:text-text-primary font-medium transition-all hover:bg-surface-muted rounded-lg border border-transparent hover:border-border"
                >
                  Sign Out
                </button>
              </form>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 relative z-10">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 mb-12">
          <div>
            <h1 className="text-5xl font-bold text-text-primary mb-2">
              My Boards
            </h1>
            <p className="text-text-secondary text-lg">
              Manage and organize your kanban boards
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <button
              onClick={() => setIsCreateModalOpen(true)}
              className="group px-6 py-3 bg-surface hover:bg-surface-muted border border-border hover:border-primary text-text-primary font-semibold rounded-xl transition-all flex items-center gap-2"
            >
              <svg
                className="w-5 h-5 text-primary transition-transform group-hover:rotate-90"
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
              Create Board
            </button>
            <button
              onClick={() => setIsJoinModalOpen(true)}
              className="group px-6 py-3 bg-surface hover:bg-surface-muted border border-border hover:border-accent-green text-text-primary font-semibold rounded-xl transition-all flex items-center gap-2"
            >
              <svg
                className="w-5 h-5 text-accent-green transition-transform group-hover:translate-x-1"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M17 8l4 4m0 0l-4 4m4-4H3"
                />
              </svg>
              Join Board
            </button>
          </div>
        </div>

        {boards && boards.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {boards.map((board, index) => (
              <Link
                key={board.id}
                href={`/boards/${board.id}`}
                className="group relative bg-surface rounded-2xl border border-border p-6 hover:border-primary transition-all duration-300 hover:shadow-xl hover:-translate-y-1 overflow-visible"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                {/* Card Gradient Overlay */}
                <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-accent-purple/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-2xl"></div>

                {/* Three-dots Menu */}
                <div className="absolute top-4 right-4 z-[100]">
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      setOpenMenuId(openMenuId === board.id ? null : board.id);
                    }}
                    className="p-2 hover:bg-surface-muted rounded-lg transition-colors"
                  >
                    <MoreVertical className="w-4 h-4 text-text-secondary" />
                  </button>

                  {openMenuId === board.id && (
                    <>
                      {/* Dropdown */}
                      <div
                        className="absolute right-0 bottom-full mb-2 w-40 bg-surface border border-border rounded-xl shadow-xl overflow-visible"
                        style={{ zIndex: 9999 }}
                        onClick={(e) => {
                          e.stopPropagation();
                        }}
                      >
                        {board.user_id === user.id ? (
                          <button
                            onClick={(e) => {
                              setOpenMenuId(null);
                              handleDeleteBoard(board.id, e);
                            }}
                            className="w-full flex items-center gap-3 px-4 py-3 text-sm text-red-300 hover:bg-red-500/10 transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                            Delete Board
                          </button>
                        ) : (
                          <button
                            onClick={(e) => {
                              setOpenMenuId(null);
                              handleLeaveBoard(board.id, e);
                            }}
                            className="w-full flex items-center gap-3 px-4 py-3 text-sm text-red-300 hover:bg-red-500/10 transition-colors"
                          >
                            <LogOut className="w-4 h-4" />
                            Leave Board
                          </button>
                        )}
                      </div>
                    </>
                  )}
                </div>

                <div className="relative z-10">
                  {/* Board Icon */}
                  <div className="w-12 h-12 mb-4 bg-gradient-to-br from-primary/20 to-accent-purple/20 rounded-xl flex items-center justify-center border border-primary/20 group-hover:scale-110 transition-transform duration-300">
                    <svg
                      className="w-6 h-6 text-primary"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 10V7m0 10a2 2 0 002 2h2a2 2 0 002-2V7a2 2 0 00-2-2h-2a2 2 0 00-2 2"
                      />
                    </svg>
                  </div>

                  <h3 className="text-xl font-bold text-text-primary mb-3 group-hover:text-primary transition-colors line-clamp-2">
                    {board.title}
                  </h3>

                  <div className="flex items-center gap-2 text-text-secondary text-sm">
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
                        d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                      />
                    </svg>
                    <span>
                      Created {new Date(board.created_at).toLocaleDateString()}
                    </span>
                  </div>
                </div>

                {/* Hover Indicator */}
                <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[80%] h-1 bg-gradient-to-r from-primary to-accent-purple transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 rounded-full"></div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="text-center py-20">
            <div className="max-w-md mx-auto">
              {/* Empty State Illustration */}
              <div className="w-32 h-32 mx-auto mb-8 bg-gradient-to-br from-primary/10 to-accent-purple/10 rounded-full flex items-center justify-center border border-primary/20 backdrop-blur-sm">
                <svg
                  className="w-16 h-16 text-primary/50"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 10V7m0 10a2 2 0 002 2h2a2 2 0 002-2V7a2 2 0 00-2-2h-2a2 2 0 00-2 2"
                  />
                </svg>
              </div>

              <h3 className="text-2xl font-bold text-text-primary mb-3">
                No boards yet
              </h3>
              <p className="text-text-secondary mb-8 text-lg">
                Create your first board to start organizing your tasks
              </p>

              <button
                onClick={() => setIsCreateModalOpen(true)}
                className="group inline-flex items-center gap-3 px-8 py-4 bg-surface hover:bg-surface-muted border border-border hover:border-primary text-text-primary font-semibold rounded-xl transition-all"
              >
                <svg
                  className="w-5 h-5 text-primary transition-transform group-hover:rotate-90"
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
                Create Your First Board
              </button>
            </div>
          </div>
        )}
      </main>

      {/* Confirm Dialog */}
      <ConfirmDialog
        isOpen={confirmDialog.isOpen}
        onClose={() => setConfirmDialog({ ...confirmDialog, isOpen: false })}
        onConfirm={confirmDialog.onConfirm}
        title={confirmDialog.title}
        message={confirmDialog.message}
      />

      {/* Join Board Modal */}
      <JoinBoardModal
        isOpen={isJoinModalOpen}
        onClose={() => setIsJoinModalOpen(false)}
        userId={user?.id || ""}
      />

      {/* Create Board Modal */}
      <CreateBoardModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        userId={user?.id || ""}
      />
    </div>
  );
}
