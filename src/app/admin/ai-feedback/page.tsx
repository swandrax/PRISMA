// c:\Users\user\Desktop\prisma\src\app\admin\ai-feedback\page.tsx
import { createClient } from '@/utils/supabase/client'

interface FeedbackStat {
  feedback: string | null;
  feedback_reason: string | null;
  system_prompt_version: string | null;
}

export default async function AIFeedbackDashboard() {
  const supabase = createClient()

  // Agregat feedback per prompt version
  const { data: stats } = await supabase
    .from('ai_feedback')
    .select('feedback, feedback_reason, system_prompt_version')
    .eq('project', 'prisma') as { data: FeedbackStat[] | null }

  const likes = stats?.filter(s => s.feedback === 'like').length ?? 0
  const dislikes = stats?.filter(s => s.feedback === 'dislike').length ?? 0
  const likeRate = likes + dislikes > 0
    ? Math.round((likes / (likes + dislikes)) * 100)
    : 0

  // Top alasan dislike
  const reasons = stats
    ?.filter(s => s.feedback_reason)
    .reduce((acc: Record<string, number>, s) => {
      const r = s.feedback_reason!
      acc[r] = (acc[r] ?? 0) + 1
      return acc
    }, {})

  return (
    <div className="p-6">
      <h1 className="text-xl font-bold mb-6">AI Feedback Dashboard</h1>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        <div className="bg-green-50 p-4 rounded-lg">
          <p className="text-2xl font-bold text-green-600">{likes}</p>
          <p className="text-sm text-gray-600">👍 Like</p>
        </div>
        <div className="bg-red-50 p-4 rounded-lg">
          <p className="text-2xl font-bold text-red-600">{dislikes}</p>
          <p className="text-sm text-gray-600">👎 Dislike</p>
        </div>
        <div className="bg-blue-50 p-4 rounded-lg">
          <p className="text-2xl font-bold text-blue-600">{likeRate}%</p>
          <p className="text-sm text-gray-600">📈 Like Rate</p>
        </div>
      </div>

      {/* Top Dislike Reasons */}
      <div>
        <h2 className="font-semibold mb-3">
          Top Alasan Dislike
        </h2>
        {Object.entries(reasons ?? {})
          .sort(([, a], [, b]) => (b as number) - (a as number))
          .map(([reason, count]) => (
            <div key={reason}
              className="flex justify-between py-2 border-b text-sm">
              <span>{reason}</span>
              <span className="font-medium text-red-500">{count as number}x</span>
            </div>
          ))}
      </div>
    </div>
  )
}
