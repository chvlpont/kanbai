"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Sun, Moon, Sparkles, Zap, Bot } from "lucide-react";
import { motion } from "framer-motion";
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
                className="p-2 text-text-secondary hover:text-text-primary hover:bg-surface-muted rounded-lg transition-all border border-transparent hover:border-border cursor-pointer"
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
                    className="px-4 py-2 text-text-secondary hover:text-text-primary font-medium transition-colors cursor-pointer"
                  >
                    Log in
                  </button>
                  <button
                    onClick={() => setIsSignupOpen(true)}
                    className="px-5 py-2.5 bg-gradient-to-r from-primary to-accent-purple hover:from-primary-hover hover:to-accent-purple text-white font-medium rounded-md transition-all duration-300 shadow-lg cursor-pointer"
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
      <main className="flex-1 px-4 py-12 sm:py-20 relative overflow-hidden">
        <div className="max-w-7xl mx-auto relative z-10">
          <div className="text-center max-w-4xl mx-auto mb-12">
            {/* Badge */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 border border-primary/20 rounded-full mb-6"
            >
              <Sparkles className="w-4 h-4 text-primary" />
              <span className="text-sm font-medium text-primary">
                Powered by AI
              </span>
            </motion.div>

            {/* Headline */}
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="text-5xl sm:text-6xl lg:text-7xl font-bold text-text-primary mb-6 leading-[1.1] tracking-tight"
            >
              Manage tasks
              <br />
              <span className="bg-gradient-to-r from-primary via-accent-purple to-accent-orange bg-clip-text text-transparent">
                with AI
              </span>
            </motion.h1>

            {/* Subheadline */}
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="text-xl sm:text-2xl text-text-secondary mb-10 max-w-3xl mx-auto leading-relaxed font-light"
            >
              Let AI handle your entire{" "}
              <span className="whitespace-nowrap">Kanban board.</span> Create,
              move, and organize tasks through simple conversation.
            </motion.p>

            {/* CTA Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="flex justify-center items-center"
            >
              <button
                onClick={() => setIsSignupOpen(true)}
                className="group relative px-8 py-4 bg-gradient-to-r from-primary to-accent-purple hover:from-primary-hover hover:to-accent-purple text-white font-semibold rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105 text-lg cursor-pointer"
              >
                <span className="relative z-10 flex items-center gap-2">
                  Start for free
                  <Zap className="w-5 h-5 group-hover:rotate-12 transition-transform" />
                </span>
              </button>
            </motion.div>
          </div>

          {/* Product Preview */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.5 }}
            className="max-w-5xl mx-auto"
          >
            <div className="bg-surface rounded-2xl overflow-hidden border border-border relative">
              {/* Browser-like header */}
              <div className="bg-surface-muted border-b border-border px-4 py-3 flex items-center gap-2 relative z-10">
                <div className="flex gap-2">
                  <div className="w-3 h-3 rounded-full bg-red-400"></div>
                  <div className="w-3 h-3 rounded-full bg-yellow-400"></div>
                  <div className="w-3 h-3 rounded-full bg-accent-green"></div>
                </div>
              </div>

              {/* Kanban Board Preview */}
              <div className="bg-gradient-to-br from-primary via-accent-purple to-accent-green p-8 sm:p-12 relative z-10">
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
          </motion.div>

          {/* Feature highlights */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto mt-24">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="group text-center p-6 rounded-2xl hover:bg-surface/50 transition-all duration-300"
            >
              <div className="w-14 h-14 bg-gradient-to-br from-primary/20 to-accent-purple/20 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                <Bot className="w-7 h-7 text-primary" />
              </div>
              <h3 className="font-bold text-text-primary mb-3 text-xl">
                AI-Powered Control
              </h3>
              <p className="text-text-secondary leading-relaxed">
                Chat naturally with AI to create, move, and manage tasks. No
                clicks, no complexity—just conversation.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="group text-center p-6 rounded-2xl hover:bg-surface/50 transition-all duration-300"
            >
              <div className="w-14 h-14 bg-gradient-to-br from-accent-purple/20 to-accent-purple/20 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                <Zap className="w-7 h-7 text-accent-purple" />
              </div>
              <h3 className="font-bold text-text-primary mb-3 text-xl">
                Lightning Fast
              </h3>
              <p className="text-text-secondary leading-relaxed">
                Manage your workflow 10x faster. AI understands context and
                executes instantly.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="group text-center p-6 rounded-2xl hover:bg-surface/50 transition-all duration-300"
            >
              <div className="w-14 h-14 bg-gradient-to-br from-accent-green/20 to-accent-green/20 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                <Sparkles className="w-7 h-7 text-accent-green" />
              </div>
              <h3 className="font-bold text-text-primary mb-3 text-xl">
                Smart & Intuitive
              </h3>
              <p className="text-text-secondary leading-relaxed">
                AI learns your workflow patterns and suggests optimizations
                automatically.
              </p>
            </motion.div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-surface border-t border-border py-8 mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col items-center justify-center gap-4 text-center">
            <div className="text-sm text-text-secondary">
              © 2025 Kanb
              <span className="bg-gradient-to-r from-primary via-accent-purple to-accent-orange bg-clip-text text-transparent">
                ai
              </span>
              . All rights reserved.
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
