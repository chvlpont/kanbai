"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Sun, Moon } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import LoginModal from "@/app/components/LoginModal";
import SignupModal from "@/app/components/SignupModal";
import { useTheme } from "@/app/components/ThemeProvider";

const HomePage = () => {
  const [user, setUser] = useState<any>(null);
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [isSignupOpen, setIsSignupOpen] = useState(false);
  const supabase = createClient();
  const { theme, toggleTheme } = useTheme();

  useEffect(() => {
    const checkUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      setUser(user);
    };
    checkUser();
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* Navigation */}
      <nav className="bg-surface/95 backdrop-blur-sm border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <h2 className="text-2xl font-bold text-text-primary">
                Kanb
                <span className="bg-gradient-to-r from-primary via-accent-purple to-accent-orange bg-clip-text text-transparent">
                  ai
                </span>
              </h2>
            </div>
            <div className="flex items-center gap-3">
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
              {user ? (
                <Link
                  href="/boards"
                  className="px-5 py-2.5 bg-surface hover:bg-surface-muted border border-border hover:border-primary text-text-primary font-semibold rounded-xl transition-all"
                >
                  Dashboard
                </Link>
              ) : (
                <>
                  <button
                    onClick={() => setIsLoginOpen(true)}
                    className="px-4 py-2 text-text-secondary hover:text-text-primary font-medium transition-colors"
                  >
                    Log in
                  </button>
                  <button
                    onClick={() => setIsSignupOpen(true)}
                    className="px-5 py-2.5 bg-gradient-to-r from-primary to-accent-purple hover:from-primary-hover hover:to-accent-purple text-white font-medium rounded-md transition-all duration-300 shadow-lg"
                  >
                    Get started
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="flex-1 px-4 py-16 sm:py-24">
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-4xl mx-auto mb-16">
            {/* Headline */}
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-text-primary mb-6 leading-tight">
              Let AI manage your{" "}
              <span className="bg-gradient-to-r from-primary via-accent-purple to-accent-orange bg-clip-text text-transparent">
                entire board
              </span>
            </h1>

            {/* Subheadline */}
            <p className="text-lg sm:text-xl text-text-secondary mb-8 max-w-2xl mx-auto leading-relaxed">
              Just chat with AI to create tasks, move cards, organize columns, and manage your workflow.
              Your AI assistant has full control. No clicking required.
            </p>

            {/* CTA Buttons */}
            <div className="flex justify-center items-center mb-4">
              <button
                onClick={() => setIsSignupOpen(true)}
                className="px-8 py-3.5 bg-gradient-to-r from-primary to-accent-purple hover:from-primary-hover hover:to-accent-purple text-white font-semibold rounded-md transition-all duration-300 shadow-lg text-base"
              >
                Sign up - it's free!
              </button>
            </div>
          </div>

          {/* Product Preview */}
          <div className="max-w-5xl mx-auto">
            <div className="bg-surface rounded-lg shadow-2xl overflow-hidden border border-border">
              {/* Browser-like header */}
              <div className="bg-surface-muted border-b border-border px-4 py-3 flex items-center gap-2">
                <div className="flex gap-2">
                  <div className="w-3 h-3 rounded-full bg-red-400"></div>
                  <div className="w-3 h-3 rounded-full bg-yellow-400"></div>
                  <div className="w-3 h-3 rounded-full bg-accent-green"></div>
                </div>
              </div>

              {/* Kanban Board Preview */}
              <div className="bg-gradient-to-br from-primary via-accent-purple to-accent-green p-8 sm:p-12">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {/* Column 1 - To Do */}
                  <div className="bg-surface/95 backdrop-blur rounded-lg p-4 shadow-md border border-border">
                    <h3 className="font-semibold text-text-primary mb-3 text-sm">
                      To Do
                    </h3>
                    <div className="space-y-2">
                      <div className="bg-background rounded-md p-3 shadow-sm border border-border">
                        <p className="text-sm text-text-primary font-medium">
                          Design new feature
                        </p>
                        <div className="flex items-center gap-2 mt-2">
                          <span className="text-xs bg-primary text-white px-2 py-1 rounded">
                            Design
                          </span>
                        </div>
                      </div>
                      <div className="bg-background rounded-md p-3 shadow-sm border border-border">
                        <p className="text-sm text-text-primary font-medium">
                          Write documentation
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Column 2 - In Progress */}
                  <div className="bg-surface/95 backdrop-blur rounded-lg p-4 shadow-md border border-border">
                    <h3 className="font-semibold text-text-primary mb-3 text-sm">
                      In Progress
                    </h3>
                    <div className="space-y-2">
                      <div className="bg-background rounded-md p-3 shadow-sm border border-border">
                        <p className="text-sm text-text-primary font-medium">
                          Build AI integration
                        </p>
                        <div className="flex items-center gap-2 mt-2">
                          <span className="text-xs bg-accent-purple text-white px-2 py-1 rounded">
                            AI
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Column 3 - Done */}
                  <div className="bg-surface/95 backdrop-blur rounded-lg p-4 shadow-md border border-border">
                    <h3 className="font-semibold text-text-primary mb-3 text-sm">
                      Done
                    </h3>
                    <div className="space-y-2">
                      <div className="bg-background rounded-md p-3 shadow-sm border border-border">
                        <p className="text-sm text-text-primary font-medium">
                          Setup project
                        </p>
                        <div className="flex items-center gap-2 mt-2">
                          <span className="text-xs bg-accent-green text-white px-2 py-1 rounded">
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
              <div className="w-12 h-12 bg-gradient-to-br from-primary/20 to-accent-purple/20 rounded-lg flex items-center justify-center mx-auto mb-4">
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
                    d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"
                  />
                </svg>
              </div>
              <h3 className="font-semibold text-text-primary mb-2 text-lg">
                Chat to Control
              </h3>
              <p className="text-text-secondary text-sm">
                Tell AI what to do. Create tasks, move cards, organize everything with simple commands.
              </p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-gradient-to-br from-accent-purple/20 to-accent-purple/20 rounded-lg flex items-center justify-center mx-auto mb-4">
                <svg
                  className="w-6 h-6 text-accent-purple"
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
              <h3 className="font-semibold text-text-primary mb-2 text-lg">
                Full AI Control
              </h3>
              <p className="text-text-secondary text-sm">
                AI has complete access to your board. No manual clicking, just natural conversation.
              </p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-gradient-to-br from-accent-green/20 to-accent-green/20 rounded-lg flex items-center justify-center mx-auto mb-4">
                <svg
                  className="w-6 h-6 text-accent-green"
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
              <h3 className="font-semibold text-text-primary mb-2 text-lg">
                Team Collaboration
              </h3>
              <p className="text-text-secondary text-sm">
                Everyone sees AI changes in real-time. Shared boards, shared AI assistant.
              </p>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-surface border-t border-border py-8 mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="text-sm text-text-secondary">
              © 2025 Kanb<span className="bg-gradient-to-r from-primary via-accent-purple to-accent-orange bg-clip-text text-transparent">ai</span>. All rights reserved.
            </div>
            <div className="flex gap-6">
              <Link
                href="/about"
                className="text-text-secondary hover:text-text-primary text-sm transition-colors"
              >
                About
              </Link>
              <Link
                href="/contact"
                className="text-text-secondary hover:text-text-primary text-sm transition-colors"
              >
                Contact
              </Link>
              <Link
                href="/privacy"
                className="text-text-secondary hover:text-text-primary text-sm transition-colors"
              >
                Privacy
              </Link>
              <Link
                href="/terms"
                className="text-text-secondary hover:text-text-primary text-sm transition-colors"
              >
                Terms
              </Link>
            </div>
          </div>
        </div>
      </footer>

      {/* Modals */}
      <LoginModal
        isOpen={isLoginOpen}
        onClose={() => setIsLoginOpen(false)}
        onSwitchToSignup={() => setIsSignupOpen(true)}
      />
      <SignupModal
        isOpen={isSignupOpen}
        onClose={() => setIsSignupOpen(false)}
        onSwitchToLogin={() => setIsLoginOpen(true)}
      />
    </div>
  );
};

export default HomePage;
