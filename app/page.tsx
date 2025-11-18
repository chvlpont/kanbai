import React from "react";
import Link from "next/link";

const HomePage = () => {
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-[#0a0a0f] via-[#0f0f1a] to-[#1a1a2e]">
      {/* Navigation */}
      <nav className="bg-[#0a0a0f]/80 backdrop-blur-sm border-b border-[#2a2a3e]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <h2 className="text-2xl font-bold text-white">KanbAI</h2>
            </div>
            <div className="flex items-center gap-3">
              <Link
                href="/login"
                className="px-4 py-2 text-[#9ca3af] hover:text-white font-medium transition-colors"
              >
                Log in
              </Link>
              <Link
                href="/signup"
                className="px-5 py-2.5 bg-gradient-to-r from-[#3b82f6] to-[#8b5cf6] hover:from-[#60a5fa] hover:to-[#a78bfa] text-white font-medium rounded-md transition-all duration-300 shadow-lg shadow-blue-500/20 hover:shadow-blue-500/40"
              >
                Get started
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="flex-1 px-4 py-16 sm:py-24">
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-4xl mx-auto mb-16">
            {/* Headline */}
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white mb-6 leading-tight">
              AI brings all your tasks and team together
            </h1>

            {/* Subheadline */}
            <p className="text-lg sm:text-xl text-[#9ca3af] mb-8 max-w-2xl mx-auto leading-relaxed">
              Keep everything in the same place—even if your team isn't. Powered
              by AI to help you work smarter, faster, and better.
            </p>

            {/* CTA Buttons */}
            <div className="flex justify-center items-center mb-4">
              <Link
                href="/signup"
                className="px-8 py-3.5 bg-gradient-to-r from-[#3b82f6] to-[#8b5cf6] hover:from-[#60a5fa] hover:to-[#a78bfa] text-white font-semibold rounded-md transition-all duration-300 shadow-lg shadow-blue-500/30 hover:shadow-blue-500/50 text-base"
              >
                Sign up - it's free!
              </Link>
            </div>
          </div>

          {/* Product Preview */}
          <div className="max-w-5xl mx-auto">
            <div className="bg-[#1a1a2e] rounded-lg shadow-2xl overflow-hidden border border-[#2a2a3e] shadow-blue-500/10">
              {/* Browser-like header */}
              <div className="bg-[#0f0f1a] border-b border-[#2a2a3e] px-4 py-3 flex items-center gap-2">
                <div className="flex gap-2">
                  <div className="w-3 h-3 rounded-full bg-red-400"></div>
                  <div className="w-3 h-3 rounded-full bg-yellow-400"></div>
                  <div className="w-3 h-3 rounded-full bg-green-400"></div>
                </div>
              </div>

              {/* Kanban Board Preview */}
              <div className="bg-gradient-to-br from-[#3b82f6] via-[#8b5cf6] to-[#14b8a6] p-8 sm:p-12">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {/* Column 1 - To Do */}
                  <div className="bg-[#1a1a2e]/95 backdrop-blur rounded-lg p-4 shadow-md border border-[#2a2a3e]">
                    <h3 className="font-semibold text-white mb-3 text-sm">
                      To Do
                    </h3>
                    <div className="space-y-2">
                      <div className="bg-[#0f0f1a] rounded-md p-3 shadow-sm border border-[#2a2a3e]">
                        <p className="text-sm text-white font-medium">
                          Design new feature
                        </p>
                        <div className="flex items-center gap-2 mt-2">
                          <span className="text-xs bg-blue-600 text-white px-2 py-1 rounded">
                            Design
                          </span>
                        </div>
                      </div>
                      <div className="bg-[#0f0f1a] rounded-md p-3 shadow-sm border border-[#2a2a3e]">
                        <p className="text-sm text-white font-medium">
                          Write documentation
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Column 2 - In Progress */}
                  <div className="bg-[#1a1a2e]/95 backdrop-blur rounded-lg p-4 shadow-md border border-[#2a2a3e]">
                    <h3 className="font-semibold text-white mb-3 text-sm">
                      In Progress
                    </h3>
                    <div className="space-y-2">
                      <div className="bg-[#0f0f1a] rounded-md p-3 shadow-sm border border-[#2a2a3e]">
                        <p className="text-sm text-white font-medium">
                          Build AI integration
                        </p>
                        <div className="flex items-center gap-2 mt-2">
                          <span className="text-xs bg-purple-600 text-white px-2 py-1 rounded">
                            AI
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Column 3 - Done */}
                  <div className="bg-[#1a1a2e]/95 backdrop-blur rounded-lg p-4 shadow-md border border-[#2a2a3e]">
                    <h3 className="font-semibold text-white mb-3 text-sm">
                      Done
                    </h3>
                    <div className="space-y-2">
                      <div className="bg-[#0f0f1a] rounded-md p-3 shadow-sm border border-[#2a2a3e]">
                        <p className="text-sm text-white font-medium">
                          Setup project
                        </p>
                        <div className="flex items-center gap-2 mt-2">
                          <span className="text-xs bg-green-600 text-white px-2 py-1 rounded">
                            Complete
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Feature highlights */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto mt-20">
            <div className="text-center">
              <div className="w-12 h-12 bg-gradient-to-br from-[#3b82f6]/20 to-[#8b5cf6]/20 rounded-lg flex items-center justify-center mx-auto mb-4">
                <svg
                  className="w-6 h-6 text-[#60a5fa]"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13 10V3L4 14h7v7l9-11h-7z"
                  />
                </svg>
              </div>
              <h3 className="font-semibold text-white mb-2 text-lg">
                AI-Powered
              </h3>
              <p className="text-[#9ca3af] text-sm">
                Smart task suggestions and automation to boost productivity
              </p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-gradient-to-br from-[#8b5cf6]/20 to-[#a78bfa]/20 rounded-lg flex items-center justify-center mx-auto mb-4">
                <svg
                  className="w-6 h-6 text-[#a78bfa]"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                  />
                </svg>
              </div>
              <h3 className="font-semibold text-white mb-2 text-lg">
                Team Collaboration
              </h3>
              <p className="text-[#9ca3af] text-sm">
                Work together seamlessly with real-time updates
              </p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-gradient-to-br from-[#14b8a6]/20 to-[#06b6d4]/20 rounded-lg flex items-center justify-center mx-auto mb-4">
                <svg
                  className="w-6 h-6 text-[#14b8a6]"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                  />
                </svg>
              </div>
              <h3 className="font-semibold text-white mb-2 text-lg">
                Track Progress
              </h3>
              <p className="text-[#9ca3af] text-sm">
                Visualize your workflow and stay on top of deadlines
              </p>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-[#0a0a0f] border-t border-[#2a2a3e] py-8 mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="text-[#9ca3af] text-sm">
              © 2025 KanbAI. All rights reserved.
            </div>
            <div className="flex gap-6">
              <Link
                href="/about"
                className="text-[#9ca3af] hover:text-white text-sm transition-colors"
              >
                About
              </Link>
              <Link
                href="/contact"
                className="text-[#9ca3af] hover:text-white text-sm transition-colors"
              >
                Contact
              </Link>
              <Link
                href="/privacy"
                className="text-[#9ca3af] hover:text-white text-sm transition-colors"
              >
                Privacy
              </Link>
              <Link
                href="/terms"
                className="text-[#9ca3af] hover:text-white text-sm transition-colors"
              >
                Terms
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default HomePage;
