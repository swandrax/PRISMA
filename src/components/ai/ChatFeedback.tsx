// c:\Users\user\Desktop\prisma\src\components\ai\ChatFeedback.tsx
'use client'

import { useState } from 'react'
import { createClient } from '@/utils/supabase/client'
import { ThumbsUp, ThumbsDown } from 'lucide-react'

interface ChatFeedbackProps {
  sessionId: string
  userMessage: string
  aiResponse: string
  responseTimeMs: number
}

const DISLIKE_REASONS = [
  'Jawaban tidak relevan',
  'Jawaban terlalu singkat',
  'Informasi tidak akurat',
  'Tidak menjawab pertanyaan saya',
  'Lainnya',
]

export default function ChatFeedback({
  sessionId,
  userMessage,
  aiResponse,
  responseTimeMs,
}: ChatFeedbackProps) {
  const [feedback, setFeedback] = useState<'like' | 'dislike' | null>(null)
  const [showReasons, setShowReasons] = useState(false)
  const supabase = createClient()

  const saveFeedback = async (
    type: 'like' | 'dislike',
    reason?: string
  ) => {
    setFeedback(type)
    setShowReasons(false)

    await supabase.from('ai_feedback').insert({
      session_id: sessionId,
      project: 'prisma',
      user_message: userMessage,
      ai_response: aiResponse,
      model_used: 'llama3-8b-8192',
      system_prompt_version: 'v1.0',
      feedback: type,
      feedback_reason: reason ?? null,
      response_time_ms: responseTimeMs,
    })
  }

  if (feedback) {
    return (
      <p className="text-xs text-gray-400 mt-1">
        {feedback === 'like' ? '👍 Terima kasih!' : '📝 Feedback diterima'}
      </p>
    )
  }

  return (
    <div className="mt-2">
      <div className="flex items-center gap-2">
        <span className="text-xs text-gray-400">
          Apakah jawaban ini membantu?
        </span>
        <button
          onClick={() => saveFeedback('like')}
          className="p-1 hover:text-green-500 text-gray-400 transition-colors"
          aria-label="Jawaban membantu"
        >
          <ThumbsUp size={14} />
        </button>
        <button
          onClick={() => setShowReasons(true)}
          className="p-1 hover:text-red-500 text-gray-400 transition-colors"
          aria-label="Jawaban tidak membantu"
        >
          <ThumbsDown size={14} />
        </button>
      </div>

      {showReasons && (
        <div className="mt-2 p-3 bg-gray-50 rounded-lg border text-sm">
          <p className="font-medium mb-2 text-gray-700">
            Apa yang kurang?
          </p>
          {DISLIKE_REASONS.map((reason) => (
            <button
              key={reason}
              onClick={() => saveFeedback('dislike', reason)}
              className="block w-full text-left px-2 py-1.5 hover:bg-gray-100 
                         rounded text-gray-600 text-xs"
            >
              {reason}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
