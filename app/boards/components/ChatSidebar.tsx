"use client";

import { useState, useEffect, useRef } from "react";
import { X, Send, Sparkles, Loader2 } from "lucide-react";
import ChatMessage from "./ChatMessage";
import { createClient } from "@/lib/supabase/client";
import { Message } from "../types";
import { toast } from "react-hot-toast";

interface ChatSidebarProps {
  boardId: string;
  isOpen: boolean;
  onClose: () => void;
  onAIActionComplete?: () => void;
}

export default function ChatSidebar({
  boardId,
  isOpen,
  onClose,
  onAIActionComplete,
}: ChatSidebarProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [usernames, setUsernames] = useState<Record<string, string>>({});
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const supabase = createClient();

  // Scroll to bottom when new messages arrive
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Load messages and set up real-time subscription when chat opens
  useEffect(() => {
    if (!isOpen) {
      // Clear messages and usernames when chat closes to ensure fresh load next time
      setMessages([]);
      setUsernames({});
      return;
    }

    // Load all messages from database
    const loadMessages = async () => {
      const { data, error } = await supabase
        .from("board_messages")
        .select("*")
        .eq("board_id", boardId)
        .order("created_at", { ascending: true });

      if (error) {
        console.error("Error loading messages:", error);
        return;
      }

      // Fetch usernames for all user messages FIRST
      const userIds = [
        ...new Set(
          (data || []).filter((msg) => msg.user_id).map((msg) => msg.user_id)
        ),
      ];

      if (userIds.length > 0) {
        const { data: profiles } = await supabase
          .from("profiles")
          .select("id, username")
          .in("id", userIds);

        if (profiles) {
          const usernameMap: Record<string, string> = {};
          profiles.forEach((profile) => {
            usernameMap[profile.id] = profile.username;
          });
          setUsernames(usernameMap);
        }
      }

      // Set messages AFTER usernames are fetched
      setMessages(data || []);
    };

    loadMessages();

    // Set up real-time subscription for new messages
    const channel = supabase
      .channel(`board-messages-${boardId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "board_messages",
          filter: `board_id=eq.${boardId}`,
        },
        async (payload) => {
          console.log("New message received:", payload);
          const newMessage = payload.new as Message;

          // Only add the message if it doesn't already exist
          setMessages((prev) => {
            if (prev.some((msg) => msg.id === newMessage.id)) {
              return prev;
            }
            return [...prev, newMessage];
          });

          // Fetch username if this is a user message
          if (newMessage.user_id && newMessage.role === "user") {
            const { data: profile } = await supabase
              .from("profiles")
              .select("username")
              .eq("id", newMessage.user_id)
              .single();

            if (profile) {
              setUsernames((prev) => ({
                ...prev,
                [newMessage.user_id!]: profile.username,
              }));
            }
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [boardId, isOpen]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!input.trim() || isLoading) return;

    const userMessage = input.trim();
    setInput("");
    setIsLoading(true);

    try {
      // Get current user
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        toast.error("You must be logged in to send messages");
        return;
      }

      // Save user message to database
      const { data: savedMessage, error: saveError } = await supabase
        .from("board_messages")
        .insert([
          {
            board_id: boardId,
            user_id: user.id,
            role: "user",
            content: userMessage,
          },
        ])
        .select()
        .single();

      if (saveError) {
        console.error("Error saving message:", saveError);
        toast.error("Failed to save message");
        return;
      }

      // Optimistically add the user message to the UI immediately
      setMessages((prev) => [...prev, savedMessage]);

      // Call AI API (it will save the AI response to the database)
      const response = await fetch("/api/ai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: userMessage,
          boardId,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to get AI response");
      }

      // Optimistically add the AI response to the UI immediately
      if (data.savedMessage) {
        setMessages((prev) => {
          // Check if message already exists (shouldn't happen, but safety check)
          if (prev.some((msg) => msg.id === data.savedMessage.id)) {
            return prev;
          }
          return [...prev, data.savedMessage];
        });
      }

      // Notify parent component that AI actions completed (so it can refetch board data)
      if (data.actionResults && data.actionResults.length > 0) {
        const hasSuccessfulActions = data.actionResults.some(
          (result: any) => result.success
        );
        if (hasSuccessfulActions && onAIActionComplete) {
          onAIActionComplete();
        }
      }
    } catch (error) {
      console.error("Error:", error);
      toast.error(
        error instanceof Error ? error.message : "Failed to send message"
      );
    } finally {
      setIsLoading(false);
    }
  }

  if (!isOpen) return null;

  return (
    <>
      {/* Sidebar */}
      <div className="fixed right-0 top-0 h-full w-full sm:w-96 bg-gradient-to-b from-[#0f0f1a] to-[#1a1a2e] border-l border-[#2a2a3e]/50 flex flex-col z-50 backdrop-blur-xl">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-[#2a2a3e]/50 bg-[#0a0a0f]/80 backdrop-blur-xl">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500/20 to-blue-500/20 border border-purple-500/30 flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-purple-400" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">AI Assistant</h2>
              <p className="text-xs text-purple-300/70">Shared board chat</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-[#9ca3af] hover:text-white hover:bg-[#1a1a2e]/50 rounded-lg transition-all border border-transparent hover:border-[#2a2a3e]/50"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto">
          {messages.length === 0 && !isLoading && (
            <div className="h-full flex flex-col items-center justify-center text-center p-6">
              <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-purple-500/20 to-blue-500/20 border border-purple-500/30 flex items-center justify-center mb-6">
                <Sparkles className="w-10 h-10 text-purple-400" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">
                Start Chatting
              </h3>
              <p className="text-sm text-[#9ca3af] mb-8">
                Ask the AI anything about your board
              </p>

              <div className="w-full max-w-xs space-y-3 text-left">
                <p className="text-xs text-purple-400/70 font-semibold uppercase tracking-wide">
                  Try asking:
                </p>
                <div className="space-y-2">
                  {[
                    "What's on the board?",
                    "Create a task for testing",
                    "Summarize my tasks",
                    "Move completed tasks",
                  ].map((example, i) => (
                    <button
                      key={i}
                      onClick={() => setInput(example)}
                      className="w-full text-left px-4 py-3 rounded-xl bg-[#1a1a2e] hover:bg-[#1f1f35] border border-[#2a2a3e] hover:border-purple-500/50 text-sm text-white transition-all hover:shadow-lg hover:shadow-purple-500/20"
                    >
                      "{example}"
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {messages.map((message) => (
            <ChatMessage
              key={message.id}
              role={message.role}
              content={message.content}
              timestamp={message.created_at}
              actions={message.actions}
              actionResults={message.action_results}
              username={
                message.user_id ? usernames[message.user_id] : undefined
              }
            />
          ))}

          {isLoading && (
            <div className="px-4 py-2">
              <div className="flex items-center gap-2">
                <Loader2 className="w-4 h-4 text-purple-400 animate-spin" />
                <span className="text-sm text-gray-400">AI is thinking...</span>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <form
          onSubmit={handleSubmit}
          className="p-4 border-t border-[#2a2a3e]/50 bg-[#0a0a0f]/80 backdrop-blur-xl"
        >
          <div className="flex gap-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask AI anything..."
              className="flex-1 bg-[#1a1a2e] border border-[#2a2a3e] hover:border-purple-500/30 focus:border-purple-500/50 rounded-xl px-4 py-3 text-sm text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500/20 transition-all"
              disabled={isLoading}
            />
            <button
              type="submit"
              disabled={isLoading || !input.trim()}
              className="bg-[#1a1a2e] hover:bg-[#1f1f35] border border-[#2a2a3e] hover:border-purple-500/50 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-xl px-4 py-3 transition-all hover:shadow-lg hover:shadow-purple-500/20 flex items-center justify-center min-w-[52px]"
            >
              {isLoading ? (
                <Loader2 className="w-5 h-5 animate-spin text-purple-400" />
              ) : (
                <Send className="w-5 h-5 text-purple-400" />
              )}
            </button>
          </div>
        </form>
      </div>
    </>
  );
}
