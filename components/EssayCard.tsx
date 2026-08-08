'use client'

import { Bookmark, BookmarkCheck, Eye } from 'lucide-react'
import { useState } from 'react'

interface EssayCardProps {
  id: string
  title: string
  author: string
  summary: string
  classLevel: string
  category: string
  views: number
  initialSaved?: boolean
  onSaveToggle?: (id: string, saved: boolean) => void
}

const CATEGORY_COLORS: Record<string, string> = {
  'biểu cảm': 'bg-blue-100 text-blue-800',
  'tự sự': 'bg-green-100 text-green-800',
  'thuyết minh': 'bg-purple-100 text-purple-800',
  'nghị luận': 'bg-orange-100 text-orange-800',
  'phân tích': 'bg-red-100 text-red-800',
}

const CLASS_BADGE_COLORS: Record<string, string> = {
  '6': 'bg-blue-50 text-blue-700',
  '7': 'bg-indigo-50 text-indigo-700',
  '8': 'bg-cyan-50 text-cyan-700',
  '9': 'bg-teal-50 text-teal-700',
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

  const handleSaveToggle = () => {
    const newSavedState = !isSaved
    setIsSaved(newSavedState)
    onSaveToggle?.(id, newSavedState)
  }

  const categoryColor = CATEGORY_COLORS[category] || 'bg-gray-100 text-gray-800'
  const classBadgeColor = CLASS_BADGE_COLORS[classLevel] || 'bg-gray-50 text-gray-700'

  return (
    <div className="bg-white rounded-lg border border-border shadow-sm hover:shadow-md transition-shadow duration-300 overflow-hidden h-full flex flex-col">
      {/* Header */}
      <div className="p-4 flex-1 flex flex-col">
        {/* Badges */}
        <div className="flex gap-2 mb-3 flex-wrap">
          <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${classBadgeColor}`}>
            Lớp {classLevel}
          </span>
          <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${categoryColor}`}>
            {category}
          </span>
        </div>

        {/* Title */}
        <h3 className="text-base font-bold text-foreground mb-2 line-clamp-2 hover:text-primary transition-colors cursor-pointer">
          {title}
        </h3>

        {/* Author */}
        <p className="text-sm text-muted-foreground mb-3">
          {author}
        </p>

        {/* Summary */}
        <p className="text-sm text-foreground/70 line-clamp-2 mb-4 flex-grow">
          {summary}
        </p>
      </div>

      {/* Footer */}
      <div className="px-4 py-3 bg-secondary border-t border-border flex items-center justify-between">
        <div className="flex items-center gap-1 text-xs text-muted-foreground">
          <Eye className="w-4 h-4" />
          <span>{views} lượt</span>
        </div>
        <button
          onClick={handleSaveToggle}
          className="p-2 hover:bg-primary/10 rounded-md transition-colors"
          aria-label={isSaved ? 'Bỏ lưu bài viết' : 'Lưu bài viết'}
        >
          {isSaved ? (
            <BookmarkCheck className="w-5 h-5 text-primary" />
          ) : (
            <Bookmark className="w-5 h-5 text-muted-foreground hover:text-primary" />
          )}
        </button>
      </div>
    </div>
  )
}
