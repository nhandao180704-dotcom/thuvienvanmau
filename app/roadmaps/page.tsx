'use client'

import Link from 'next/link'
import { BookOpen, Target, ChevronRight } from 'lucide-react'

const ROADMAPS = [
  { slug: 'on-thi-vao-10', title: 'Chiến dịch ôn thi vào 10', desc: 'Lộ trình 30 ngày bao quát toàn bộ chương trình Ngữ Văn 9.', icon: '🚀', progress: 75 },
  { slug: 'nghi-luan-xa-hoi', title: 'Chuyên đề Nghị luận xã hội', desc: 'Tổng hợp các kỹ năng viết đoạn văn NLXH đạt điểm tối đa.', icon: '✍️', progress: 30 },
]

export default function RoadmapsPage() {
  return (
    <div className="min-h-screen bg-slate-50 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-slate-900 mb-8">Lộ trình học tập</h1>
        <div className="grid gap-6">
          {ROADMAPS.map((rm) => (
            <Link href={`/roadmaps/${rm.slug}`} key={rm.slug} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:border-blue-500 transition group flex items-center gap-6">
              <div className="text-4xl">{rm.icon}</div>
              <div className="flex-1">
                <h2 className="text-xl font-bold text-slate-800 mb-1">{rm.title}</h2>
                <p className="text-slate-500">{rm.desc}</p>
              </div>
              <div className="text-right">
                <p className="text-emerald-600 font-bold">{rm.progress}% hoàn thành</p>
                <div className="w-32 h-2 bg-slate-100 rounded-full mt-2"><div className="h-2 bg-emerald-500 rounded-full" style={{width: `${rm.progress}%`}}></div></div>
              </div>
              <ChevronRight className="text-slate-400 group-hover:text-blue-600" />
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}