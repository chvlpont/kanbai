'use client'

import { Check, Bot } from 'lucide-react'

interface ChatMessageProps {
  role: 'user' | 'assistant'
  content: string
  actions?: any[]
  actionResults?: any[]
  timestamp?: string
  username?: string
}

export default function ChatMessage({
  role,
  content,
  actions,
  actionResults,
  timestamp,
  username = 'User',
}: ChatMessageProps) {
  const isAI = role === 'assistant'

  const formatTime = (isoString?: string) => {
    if (!isoString) return ''
    const date = new Date(isoString)
    const today = new Date()
    const isToday = date.toDateString() === today.toDateString()

    if (isToday) {
      return date.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: false
      })
    } else {
      return date.toLocaleDateString('en-US', {
        month: '2-digit',
        day: '2-digit',
        year: 'numeric'
      }) + ' ' + date.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: false
      })
    }
  }

  return (
    <div className="group px-4 py-2 hover:bg-[#2a2a3e]/30 transition-colors">
      {/* Username and timestamp line */}
      <div className="flex items-baseline gap-2 mb-1">
        {isAI && (
          <Bot className="w-4 h-4 text-purple-400 flex-shrink-0 mt-0.5" />
        )}
        <span className={`font-semibold text-sm ${
          isAI ? 'text-purple-400' : 'text-blue-400'
        }`}>
          {isAI ? 'AI Assistant' : username}
        </span>
        {timestamp && (
          <span className="text-xs text-gray-500">
            {formatTime(timestamp)}
          </span>
        )}
      </div>

      {/* Message content */}
      <div className="pl-0">
        <p className="text-sm text-gray-200 whitespace-pre-wrap leading-relaxed">
          {content}
        </p>

        {/* Actions performed (for AI messages) */}
        {isAI && actions && actions.length > 0 && (
          <div className="mt-2 p-3 bg-[#1a1a2e] border-l-2 border-green-500 rounded">
            <p className="text-xs text-gray-400 mb-2 font-semibold">Actions performed:</p>
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
      </div>
    </div>
  )
}
