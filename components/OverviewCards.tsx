'use client'

import { BookOpen, Eye, CheckCircle, Clock } from 'lucide-react'

interface OverviewCardsProps {
  totalEssays: number
  totalViews: number
  publishedCount: number
  draftCount: number
}

export default function OverviewCards({
  totalEssays,
  totalViews,
  publishedCount,
  draftCount,
}: OverviewCardsProps) {
  const cards = [
    {
      title: 'Tổng số bài viết',
      value: totalEssays || 0,
      icon: BookOpen,
      color: 'from-blue-500 to-blue-600',
      bgColor: 'bg-blue-50',
      textColor: 'text-blue-600',
    },
    {
      title: 'Tổng lượt xem',
      // Thêm fallback an toàn tránh lỗi NaN
      value: (totalViews || 0).toLocaleString('vi-VN'),
      icon: Eye,
      color: 'from-purple-500 to-purple-600',
      bgColor: 'bg-purple-50',
      textColor: 'text-purple-600',
    },
    {
      title: 'Đã xuất bản',
      value: publishedCount || 0,
      icon: CheckCircle,
      color: 'from-green-500 to-green-600',
      bgColor: 'bg-green-50',
      textColor: 'text-green-600',
    },
    {
      title: 'Bài nháp',
      value: draftCount || 0,
      icon: Clock,
      color: 'from-amber-500 to-amber-600',
      bgColor: 'bg-amber-50',
      textColor: 'text-amber-600',
    },
  ]

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      {cards.map((card, idx) => {
        const Icon = card.icon
        return (
          <div
            key={idx}
            className="bg-white rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow p-6"
          >
            <div className="flex items-start justify-between mb-4">
              <h3 className="text-sm font-medium text-slate-500">{card.title}</h3>
              <div className={`p-2 rounded-lg ${card.bgColor}`}>
                <Icon size={20} className={card.textColor} />
              </div>
            </div>
            <div>
              <p className="text-3xl font-black text-slate-800">{card.value}</p>
            </div>
          </div>
        )
      })}
    </div>
  )
}