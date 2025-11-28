"use client";

import Link from "next/link";
import { MessageSquare, Sun, Moon } from "lucide-react";
import { useTheme } from "@/app/components/ThemeProvider";
import MembersDisplay from "./MembersDisplay";
import BoardMenu from "./BoardMenu";

interface BoardNavbarProps {
  boardId: string;
  boardTitle: string;
  members: { id: string; username: string }[];
  inviteCode: string;
  onInviteCodeUpdate: (code: string) => void;
  onToggleChat: () => void;
  onAddColumn: () => void;
}

export default function BoardNavbar({
  boardId,
  boardTitle,
  members,
  inviteCode,
  onInviteCodeUpdate,
  onToggleChat,
  onAddColumn,
}: BoardNavbarProps) {
  const { theme, toggleTheme } = useTheme();

  return (
    <nav className="bg-surface/95 backdrop-blur-xl border-b border-border sticky top-0 z-50 shadow-lg">
      <div className="max-w-[1920px] mx-auto px-3 sm:px-4 lg:px-8">
        <div className="flex items-center h-14 sm:h-16">
          <div className="flex items-center gap-3 sm:gap-6 flex-1">
            <Link
              href="/"
              className="font-bold text-xl sm:text-2xl tracking-tight hover:scale-105 transition-transform text-text-primary"
            >
              Kanb
              <span className="bg-gradient-to-r from-primary via-accent-purple to-accent-orange bg-clip-text text-transparent">
                ai
              </span>
            </Link>
            <div className="hidden sm:block h-6 w-px bg-border"></div>
            <div className="hidden sm:flex items-center gap-2">
              <svg
                className="w-5 h-5 text-primary"
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
              <h1 className="text-text-primary font-semibold text-base sm:text-lg">
                {boardTitle}
              </h1>
            </div>
            <MembersDisplay members={members} />
            <div className="hidden sm:block h-6 w-px bg-border"></div>
            <div className="flex items-center gap-2 sm:gap-3">
              {/* Theme Toggle */}
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

              {/* Menu Dropdown */}
              <BoardMenu
                boardId={boardId}
                inviteCode={inviteCode}
                onInviteCodeUpdate={onInviteCodeUpdate}
              />

              <button
                onClick={onToggleChat}
                className="px-3 sm:px-4 py-1.5 sm:py-2 bg-surface hover:bg-surface-muted border border-border hover:border-accent-purple text-text-primary text-xs sm:text-sm font-semibold rounded-xl transition-all flex items-center gap-1 sm:gap-2"
              >
                <MessageSquare className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-accent-purple" />
                <span className="hidden sm:inline">AI Assistant</span>
              </button>
              <button
                onClick={onAddColumn}
                className="px-3 sm:px-4 py-1.5 sm:py-2 bg-surface hover:bg-surface-muted border border-border hover:border-primary text-text-primary text-xs sm:text-sm font-semibold rounded-xl transition-all flex items-center gap-1 sm:gap-2"
              >
                <svg
                  className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-primary"
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
                <span className="hidden sm:inline">Add Column</span>
                <span className="sm:hidden">Add</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}
