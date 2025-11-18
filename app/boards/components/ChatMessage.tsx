'use client'

import { Check } from 'lucide-react'

interface ChatMessageProps {
  role: 'user' | 'assistant'
  content: string
  actions?: any[]
  actionResults?: any[]
  timestamp?: string
}

export default function ChatMessage({
  role,
  content,
  actions,
  actionResults,
  timestamp,
}: ChatMessageProps) {
  const isUser = role === 'user'

  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-4`}>
      <div
        className={`max-w-[85%] rounded-lg px-4 py-3 ${
          isUser
            ? 'bg-blue-600 text-white'
            : 'bg-[#2a2a3e] text-gray-200 border border-[#3a3a4e]'
        }`}
      >
        {/* Message content */}
        <p className="text-sm whitespace-pre-wrap leading-relaxed">{content}</p>

        {/* Actions performed (for AI messages) */}
        {!isUser && actions && actions.length > 0 && (
          <div className="mt-3 pt-3 border-t border-gray-600">
            <p className="text-xs text-gray-400 mb-2">Actions performed:</p>
            <div className="space-y-1">
              {actions.map((action: any, idx: number) => (
                <div
                  key={idx}
                  className="flex items-center gap-2 text-xs text-gray-300"
                >
                  <Check className="w-3 h-3 text-green-400 flex-shrink-0" />
                  <span className="capitalize">
                    {action.type.replace(/_/g, ' ')}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {timestamp && (
          <p className="text-xs text-gray-400 mt-2">
            {new Date(timestamp).toLocaleTimeString()}
          </p>
        )}
      </div>
    </div>
  )
}
