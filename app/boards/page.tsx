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

  // Get user profile with username
  const { data: profile } = await supabase
    .from("profiles")
    .select("username")
    .eq("id", user.id)
    .single();

  const username = profile?.username || user.email?.split("@")[0] || "User";

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
      <nav className="bg-[#0a0a0f]/80 backdrop-blur-xl border-b border-[#2a2a3e]/50 sticky top-0 z-50 shadow-lg shadow-black/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link
              href="/"
              className="text-white font-bold text-2xl tracking-tight bg-gradient-to-r from-blue-400 via-purple-400 to-cyan-400 bg-clip-text text-transparent hover:scale-105 transition-transform"
            >
              KanbAI
            </Link>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-3 px-4 py-2 bg-[#1a1a2e]/50 rounded-full border border-[#2a2a3e]/50">
                <div className="w-2 h-2 bg-green-500 rounded-full shadow-sm shadow-green-500/50"></div>
                <span className="text-white text-sm font-semibold">{username}</span>
              </div>
              <form action={handleSignOut}>
                <button
                  type="submit"
                  className="px-5 py-2 text-[#9ca3af] hover:text-white font-medium transition-all hover:bg-[#1a1a2e]/50 rounded-lg border border-transparent hover:border-[#2a2a3e]/50"
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
            <h1 className="text-5xl font-bold text-white mb-2 bg-gradient-to-r from-white via-blue-100 to-purple-100 bg-clip-text text-transparent">
              My Boards
            </h1>
            <p className="text-[#9ca3af] text-lg">
              Manage and organize your kanban boards
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link
              href="/boards/new"
              className="group px-6 py-3 bg-[#1a1a2e] hover:bg-[#1f1f35] border border-[#2a2a3e] hover:border-blue-500/50 text-white font-semibold rounded-xl transition-all hover:shadow-lg hover:shadow-blue-500/20 flex items-center gap-2"
            >
              <svg className="w-5 h-5 text-blue-400 transition-transform group-hover:rotate-90" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Create Board
            </Link>
            <Link
              href="/boards/join"
              className="group px-6 py-3 bg-[#1a1a2e] hover:bg-[#1f1f35] border border-[#2a2a3e] hover:border-green-500/50 text-white font-semibold rounded-xl transition-all hover:shadow-lg hover:shadow-green-500/20 flex items-center gap-2"
            >
              <svg className="w-5 h-5 text-green-400 transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
              Join Board
            </Link>
          </div>
        </div>

        {boards && boards.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {boards.map((board, index) => (
              <Link
                key={board.id}
                href={`/boards/${board.id}`}
                className="group relative bg-gradient-to-br from-[#1a1a2e] to-[#15152a] rounded-2xl border border-[#2a2a3e]/50 p-6 hover:border-[#3b82f6]/50 transition-all duration-300 hover:shadow-xl hover:shadow-blue-500/10 hover:-translate-y-1 overflow-hidden"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                {/* Card Gradient Overlay */}
                <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>

                {/* Ownership Badge */}
                {board.user_id === user.id && (
                  <div className="absolute top-4 right-4 px-3 py-1 bg-blue-500/20 border border-blue-500/30 rounded-full text-blue-300 text-xs font-semibold backdrop-blur-sm">
                    Owner
                  </div>
                )}

                <div className="relative z-10">
                  {/* Board Icon */}
                  <div className="w-12 h-12 mb-4 bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-xl flex items-center justify-center border border-blue-500/20 group-hover:scale-110 transition-transform duration-300">
                    <svg className="w-6 h-6 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 10V7m0 10a2 2 0 002 2h2a2 2 0 002-2V7a2 2 0 00-2-2h-2a2 2 0 00-2 2" />
                    </svg>
                  </div>

                  <h3 className="text-xl font-bold text-white mb-3 group-hover:text-blue-300 transition-colors line-clamp-2">
                    {board.title}
                  </h3>

                  <div className="flex items-center gap-2 text-[#9ca3af] text-sm">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <span>Created {new Date(board.created_at).toLocaleDateString()}</span>
                  </div>
                </div>

                {/* Hover Indicator */}
                <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 to-purple-500 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300"></div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="text-center py-20">
            <div className="max-w-md mx-auto">
              {/* Empty State Illustration */}
              <div className="w-32 h-32 mx-auto mb-8 bg-gradient-to-br from-blue-500/10 to-purple-500/10 rounded-full flex items-center justify-center border border-blue-500/20 backdrop-blur-sm">
                <svg className="w-16 h-16 text-blue-400/50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 10V7m0 10a2 2 0 002 2h2a2 2 0 002-2V7a2 2 0 00-2-2h-2a2 2 0 00-2 2" />
                </svg>
              </div>

              <h3 className="text-2xl font-bold text-white mb-3">
                No boards yet
              </h3>
              <p className="text-[#9ca3af] mb-8 text-lg">
                Create your first board to start organizing your tasks
              </p>

              <Link
                href="/boards/new"
                className="group inline-flex items-center gap-3 px-8 py-4 bg-[#1a1a2e] hover:bg-[#1f1f35] border border-[#2a2a3e] hover:border-blue-500/50 text-white font-semibold rounded-xl transition-all hover:shadow-lg hover:shadow-blue-500/20"
              >
                <svg className="w-5 h-5 text-blue-400 transition-transform group-hover:rotate-90" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Create Your First Board
              </Link>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
