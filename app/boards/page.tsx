import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";

export default async function BoardsPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // Get board IDs where user is a member
  const { data: memberBoards, error: memberError } = await supabase
    .from("board_members")
    .select("board_id")
    .eq("user_id", user.id);

  const memberBoardIds = memberBoards
    ? memberBoards.map((bm) => bm.board_id)
    : [];

  // Fetch boards where user is owner or member
  const { data: boards, error: boardsError } = await supabase
    .from("boards")
    .select("*")
    .or(
      [
        `user_id.eq.${user.id}`,
        memberBoardIds.length > 0 ? `id.in.(${memberBoardIds.join(",")})` : "",
      ]
        .filter(Boolean)
        .join(",")
    )
    .order("created_at", { ascending: false });

  const handleSignOut = async () => {
    "use server";
    const supabase = await createClient();
    await supabase.auth.signOut();
    redirect("/login");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0a0a0f] via-[#0f0f1a] to-[#1a1a2e]">
      {/* Navigation */}
      <nav className="bg-[#0a0a0f]/95 backdrop-blur-md border-b border-[#2a2a3e] sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link href="/" className="text-white font-bold text-xl">
              KanbAI
            </Link>
            <div className="flex items-center gap-4">
              <span className="text-[#9ca3af] text-sm">{user.email}</span>
              <form action={handleSignOut}>
                <button
                  type="submit"
                  className="px-4 py-2 text-[#9ca3af] hover:text-white font-medium transition-colors"
                >
                  Sign Out
                </button>
              </form>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-white">My Boards</h1>
          <div className="flex gap-4">
            <Link
              href="/boards/new"
              className="px-6 py-3 bg-gradient-to-r from-[#3b82f6] to-[#8b5cf6] hover:from-[#60a5fa] hover:to-[#a78bfa] text-white font-semibold rounded-md transition-all shadow-lg shadow-blue-500/20"
            >
              + Create Board
            </Link>
            <Link
              href="/boards/join"
              className="px-6 py-3 bg-gradient-to-r from-[#34d399] to-[#4ade80] hover:from-[#6ee7b7] hover:to-[#a7f3d0] text-white font-semibold rounded-md transition-all shadow-lg shadow-green-500/20"
            >
              Join Board
            </Link>
          </div>
        </div>

        {boards && boards.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {boards.map((board) => (
              <Link
                key={board.id}
                href={`/boards/${board.id}`}
                className="bg-[#1a1a2e] rounded-lg border border-[#2a2a3e] p-6 hover:border-[#3b82f6] hover:shadow-md hover:shadow-blue-500/20 transition-all"
              >
                <h3 className="text-xl font-semibold text-white mb-2">
                  {board.title}
                </h3>
                <p className="text-[#9ca3af] text-sm">
                  Created {new Date(board.created_at).toLocaleDateString()}
                </p>
              </Link>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-[#9ca3af] mb-4">
              No boards yet. Create your first board!
            </p>
            <Link
              href="/boards/new"
              className="inline-block px-6 py-3 bg-gradient-to-r from-[#3b82f6] to-[#8b5cf6] hover:from-[#60a5fa] hover:to-[#a78bfa] text-white font-semibold rounded-md transition-all shadow-lg shadow-blue-500/20"
            >
              Create Your First Board
            </Link>
          </div>
        )}
      </main>
    </div>
  );
}
