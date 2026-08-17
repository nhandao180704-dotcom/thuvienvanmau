'use client'

import { Bookmark, BookmarkCheck, Eye } from 'lucide-react'
import { useState } from 'react'
import Link from 'next/link'

interface EssayCardProps {
  id: string
  title: string
  author: string
  summary: string
  classLevel: number
  category: string
  views: number
  initialSaved?: boolean
  onSaveToggle?: (id: string, saved: boolean) => void
}

const CATEGORY_COLORS: Record<string, string> = {
  'biểu cảm': 'bg-blue-50 text-blue-700 border-blue-100',
  'tự sự': 'bg-green-50 text-green-700 border-green-100',
  'thuyết minh': 'bg-purple-50 text-purple-700 border-purple-100',
  'nghị luận': 'bg-orange-50 text-orange-700 border-orange-100',
  'phân tích': 'bg-red-50 text-red-700 border-red-100',
}

const CLASS_BADGE_COLORS: Record<number, string> = {
  6: 'bg-indigo-50 text-indigo-700 border-indigo-100',
  7: 'bg-cyan-50 text-cyan-700 border-cyan-100',
  8: 'bg-teal-50 text-teal-700 border-teal-100',
  9: 'bg-emerald-50 text-emerald-700 border-emerald-100',
  10: 'bg-rose-50 text-rose-700 border-rose-100',
  0: 'bg-slate-100 text-slate-700 border-slate-200' // Văn mẫu chung
}

export default function EssayCard({
  id,
  title,
  author,
  summary,
  classLevel,
  category,
  views,
  initialSaved = false,
  onSaveToggle,
}: EssayCardProps) {
  const [isSaved, setIsSaved] = useState(initialSaved)

  const handleSaveToggle = (e: React.MouseEvent) => {
    e.preventDefault(); // Ngăn không cho click chuyển trang khi bấm nút lưu
    const newSavedState = !isSaved
    setIsSaved(newSavedState)
    onSaveToggle?.(id, newSavedState)
  }

  // Tối ưu tên lớp và màu sắc dựa trên CSDL mới (class_level)
  const categoryColor = CATEGORY_COLORS[category.toLowerCase()] || 'bg-slate-50 text-slate-700 border-slate-100'
  const classBadgeColor = CLASS_BADGE_COLORS[classLevel] || CLASS_BADGE_COLORS[0]
  const classText = classLevel === 0 ? 'Văn chung' : (classLevel === 10 ? 'Ôn thi vào 10' : `Lớp ${classLevel}`)

  return (
    <Link href={`/essay/${id}`} className="block group h-full outline-none">
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-xl hover:-translate-y-1.5 transition-all duration-500 overflow-hidden h-full flex flex-col relative group-hover:border-blue-200">
        
        {/* Background Decorative */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-slate-50 to-slate-100 rounded-bl-full -z-10 group-hover:scale-150 group-hover:from-blue-50/50 transition-all duration-700"></div>

        {/* Header Badges */}
        <div className="p-5 pb-3 flex-1 flex flex-col">
          <div className="flex gap-2 mb-4 flex-wrap relative z-10">
            <span className={`text-[11px] font-bold px-3 py-1 rounded-full border ${classBadgeColor} tracking-wide uppercase shadow-sm`}>
              {classText}
            </span>
            <span className={`text-[11px] font-bold px-3 py-1 rounded-full border ${categoryColor} tracking-wide uppercase shadow-sm line-clamp-1`}>
              {category || 'Văn mẫu'}
            </span>
          </div>

          <h3 className="text-[17px] leading-snug font-bold text-slate-800 mb-3 line-clamp-2 group-hover:text-blue-600 transition-colors relative z-10">
            {title}
          </h3>

          <p className="text-sm text-slate-500 mb-4 flex-grow line-clamp-3 relative z-10">
            {summary || 'Đang cập nhật nội dung...'}
          </p>
        </div>

        {/* Footer Info */}
        <div className="px-5 py-3.5 bg-slate-50/80 border-t border-slate-100 flex items-center justify-between relative z-10">
          <div className="flex items-center gap-1.5 text-xs font-bold text-slate-500">
            <Eye className="w-4 h-4 text-slate-400 group-hover:text-blue-500 transition-colors" />
            <span className="group-hover:text-slate-700 transition-colors">{views || 0} lượt</span>
          </div>
          <button
            onClick={handleSaveToggle}
            className="p-2 hover:bg-white rounded-lg transition-all shadow-sm border border-transparent hover:border-slate-200 group/btn"
            aria-label={isSaved ? 'Bỏ lưu bài viết' : 'Lưu bài viết'}
          >
            {isSaved ? (
              <BookmarkCheck className="w-5 h-5 text-blue-600 drop-shadow-sm" />
            ) : (
              <Bookmark className="w-5 h-5 text-slate-400 group-hover/btn:text-blue-500" />
            )}
          </button>
        </div>
      </div>
    </Link>
  )
}