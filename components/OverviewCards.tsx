'use client'

import { BookOpen, Eye, CheckCircle, Clock, TrendingUp, Sparkles } from 'lucide-react'

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
      trend: 'Dữ liệu toàn hệ thống',
      color: 'from-blue-500 to-indigo-600',
      bgColor: 'bg-blue-50',
      iconColor: 'text-blue-600'
    },
    {
      title: 'Tổng lượt xem',
      // Giữ nguyên fallback an toàn tránh lỗi NaN của bạn
      value: (totalViews || 0).toLocaleString('vi-VN'),
      icon: Eye,
      trend: 'Tăng trưởng ổn định',
      color: 'from-emerald-400 to-teal-500',
      bgColor: 'bg-emerald-50',
      iconColor: 'text-emerald-600'
    },
    {
      title: 'Đã xuất bản',
      value: publishedCount || 0,
      icon: CheckCircle,
      trend: 'Hiển thị công khai',
      color: 'from-purple-500 to-fuchsia-600',
      bgColor: 'bg-purple-50',
      iconColor: 'text-purple-600'
    },
    {
      title: 'Bài nháp',
      value: draftCount || 0,
      icon: Clock,
      trend: 'Đang chờ hoàn thiện',
      color: 'from-amber-400 to-orange-500',
      bgColor: 'bg-amber-50',
      iconColor: 'text-amber-600'
    }
  ]

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      {cards.map((card, index) => {
        const Icon = card.icon
        return (
          <div 
            key={index} 
            className="group relative bg-white rounded-[24px] p-6 border border-slate-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-500 overflow-hidden cursor-pointer"
          >
            {/* Hiệu ứng ánh sáng nền mờ mờ ở góc */}
            <div className={`absolute -right-6 -top-6 w-24 h-24 bg-gradient-to-br ${card.color} opacity-5 rounded-full blur-2xl group-hover:opacity-20 transition-opacity duration-500`}></div>
            
            <div className="flex items-start justify-between mb-4 relative z-10">
              <div className={`p-3.5 rounded-2xl ${card.bgColor} ring-4 ring-white shadow-inner group-hover:scale-110 transition-transform duration-500`}>
                <Icon size={22} className={card.iconColor} />
              </div>
              <Sparkles size={16} className="text-slate-200 group-hover:text-amber-400 transition-colors duration-500" />
            </div>
            
            <div className="relative z-10">
              <h3 className="text-slate-500 text-sm font-bold mb-1">{card.title}</h3>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-black text-slate-800 tracking-tight">{card.value}</span>
              </div>
              <div className="mt-3 flex items-center gap-1.5 text-[11px] font-bold text-slate-400">
                <TrendingUp size={14} className={index < 2 ? 'text-emerald-500' : 'text-slate-400'} />
                <span className={index < 2 ? 'text-emerald-600' : ''}>{card.trend}</span>
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}