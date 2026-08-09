'use client'

import { useParams } from 'next/navigation'
import { CheckCircle2, Circle, Lock } from 'lucide-react'

const LESSONS = [
  { id: 1, title: 'Tổng quan chương trình Văn 9', status: 'completed' },
  { id: 2, title: 'Phân tích nhân vật Phương Định', status: 'completed' },
  { id: 3, title: 'Chiếc lược ngà - Bài học về tình cha con', status: 'current' },
  { id: 4, title: 'Đề thi thử số 1 (Tổng hợp)', status: 'locked' },
]

export default function RoadmapDetailPage() {
  const params = useParams()
  
  return (
    <div className="min-h-screen bg-slate-50 p-8">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-3xl font-bold text-slate-900 mb-6">Chiến dịch ôn thi vào 10</h1>
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          {LESSONS.map((lesson, idx) => (
            <div key={lesson.id} className={`flex items-center gap-4 p-5 border-b ${idx === LESSONS.length - 1 ? 'border-none' : ''}`}>
              {lesson.status === 'completed' && <CheckCircle2 className="text-emerald-500" />}
              {lesson.status === 'current' && <Circle className="text-blue-500 fill-blue-500" />}
              {lesson.status === 'locked' && <Lock className="text-slate-300" />}
              
              <span className={`font-medium ${lesson.status === 'locked' ? 'text-slate-400' : 'text-slate-800'}`}>
                {lesson.title}
              </span>
              {lesson.status === 'current' && <span className="ml-auto text-xs font-bold bg-blue-100 text-blue-700 px-3 py-1 rounded-full">Đang học</span>}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}