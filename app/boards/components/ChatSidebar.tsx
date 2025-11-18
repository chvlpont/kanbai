"use client";

import { useState } from "react";
import { X, Send, Sparkles, Loader2 } from "lucide-react";
import ChatMessage from "./ChatMessage";

interface ChatSidebarProps {
  boardId: string;
  isOpen: boolean;
  onClose: () => void;
}

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: string;
  actions?: any[];
  actionResults?: any[];
}

export default function ChatSidebar({
  boardId,
  isOpen,
  onClose,
}: ChatSidebarProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!input.trim() || isLoading) return;

    const userMessage = input.trim();
    const userMessageObj: Message = {
      id: Date.now().toString(),
      role: "user",
      content: userMessage,
      timestamp: new Date().toISOString(),
    };

    // Add user message immediately
    setMessages((prev) => [...prev, userMessageObj]);
    setInput("");
    setIsLoading(true);

    try {
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

      // Add AI response
      const aiMessageObj: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: data.message,
        timestamp: new Date().toISOString(),
        actions: data.actions || [],
        actionResults: data.actionResults || [],
      };

      setMessages((prev) => [...prev, aiMessageObj]);
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
              <h2 className="text-sm font-semibold text-white">AI Assistant</h2>
              <p className="text-xs text-gray-400">Powered by Llama 3.3</p>
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
        <div className="flex-1 overflow-y-auto p-4">
          {messages.length === 0 && !isLoading && (
            <div className="h-full flex flex-col items-center justify-center text-center px-4">
              <div
                className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center
  justify-center mb-4"
              >
                <Sparkles className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">
                AI Assistant Ready
              </h3>
              <p className="text-sm text-gray-400 mb-6">
                Ask me anything about your board
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
                    "Clean up done tasks",
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
              timestamp={message.timestamp}
              actions={message.actions}
              actionResults={message.actionResults}
            />
          ))}

          {isLoading && (
            <div className="flex justify-start mb-4">
              <div className="bg-[#2a2a3e] rounded-lg px-4 py-3 border border-[#3a3a4e]">
                <div className="flex items-center gap-2">
                  <Loader2 className="w-4 h-4 text-blue-400 animate-spin" />
                  <span className="text-sm text-gray-300">Thinking...</span>
                </div>
              </div>
            </div>
          )}
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
              placeholder="Ask me anything..."
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
