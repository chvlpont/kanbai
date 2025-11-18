"use client";

import { useState, useEffect, useRef } from "react";
import { X, Send, Sparkles, Loader2 } from "lucide-react";
import ChatMessage from "./ChatMessage";
import { createClient } from "@/lib/supabase/client";
import { Message } from "../types";

interface ChatSidebarProps {
  boardId: string;
  isOpen: boolean;
  onClose: () => void;
}

export default function ChatSidebar({
  boardId,
  isOpen,
  onClose,
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
      const userIds = [...new Set(
        (data || [])
          .filter(msg => msg.user_id)
          .map(msg => msg.user_id)
      )];

      if (userIds.length > 0) {
        const { data: profiles } = await supabase
          .from("profiles")
          .select("id, username")
          .in("id", userIds);

        if (profiles) {
          const usernameMap: Record<string, string> = {};
          profiles.forEach(profile => {
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
          if (newMessage.user_id && newMessage.role === 'user') {
            const { data: profile } = await supabase
              .from("profiles")
              .select("username")
              .eq("id", newMessage.user_id)
              .single();

            if (profile) {
              setUsernames(prev => ({
                ...prev,
                [newMessage.user_id!]: profile.username
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
        alert("You must be logged in to send messages");
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
        alert("Failed to save message");
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
    } catch (error) {
      console.error("Error:", error);
      alert(error instanceof Error ? error.message : "Failed to send message");
    } finally {
      setIsLoading(false);
    }
  }

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop for mobile */}
      <div
        className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
        onClick={onClose}
      />

      {/* Sidebar */}
      <div
        className="fixed right-0 top-0 h-full w-full sm:w-96 bg-[#1a1a2e] border-l border-[#2a2a3e] shadow-2xl flex
  flex-col z-50"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-[#2a2a3e] bg-[#0a0a0f]">
          <div className="flex items-center gap-2">
            <div
              className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center
  justify-center"
            >
              <Sparkles className="w-4 h-4 text-white" />
            </div>
            <div>
              <h2 className="text-sm font-semibold text-white">
                Board Chat (AI Assistant)
              </h2>
              <p className="text-xs text-gray-400">Everyone can see this</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto">
          {messages.length === 0 && !isLoading && (
            <div className="h-full flex flex-col items-center justify-center text-center p-4">
              <div
                className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center
  justify-center mb-4"
              >
                <Sparkles className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">
                Board Chat
              </h3>
              <p className="text-sm text-gray-400 mb-6">
                Chat with AI - everyone on the board can see the conversation
              </p>

              <div className="w-full max-w-xs space-y-3 text-left">
                <p className="text-xs text-gray-500 font-semibold uppercase">
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
                      className="w-full text-left px-3 py-2 rounded-lg bg-[#2a2a3e] hover:bg-[#3a3a4e] text-xs text-gray-300
   transition border border-transparent hover:border-blue-500"
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
              username={message.user_id ? usernames[message.user_id] : undefined}
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
          className="p-4 border-t border-[#2a2a3e] bg-[#0a0a0f]"
        >
          <div className="flex gap-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask AI anything..."
              className="flex-1 bg-[#1a1a2e] border border-[#2a2a3e] rounded-lg px-4 py-2.5 text-sm text-white
  placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
              disabled={isLoading}
            />
            <button
              type="submit"
              disabled={isLoading || !input.trim()}
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700
  disabled:from-gray-700 disabled:to-gray-700 disabled:cursor-not-allowed text-white rounded-lg px-4 py-2.5 transition flex
  items-center justify-center min-w-[44px]"
            >
              {isLoading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <Send className="w-5 h-5" />
              )}
            </button>
          </div>
        </form>
      </div>
    </>
  );
}
