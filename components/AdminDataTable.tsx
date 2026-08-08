'use client'

import Link from 'next/link'
import { Edit2, Trash2, ChevronLeft, ChevronRight } from 'lucide-react'
import { useState, useMemo } from 'react'
import { type Essay } from '@/lib/supabase-client'

interface AdminDataTableProps {
  essays: Essay[]
  filter: 'all' | 'published' | 'draft' | 'hidden'
  statusCounts: Record<string, number>
  onFilterChange: (filter: 'all' | 'published' | 'draft' | 'hidden') => void
  onDelete: (essayId: string, essayTitle?: string) => void
  onStatusChange: (essayId: string, newStatus: string) => void
  onAddEssay: () => void
  searchQuery?: string
}

export default function AdminDataTable({
  essays,
  filter,
  statusCounts,
  onFilterChange,
  onDelete,
  onStatusChange,
  onAddEssay,
  searchQuery = '',
}: AdminDataTableProps) {
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 10

  // Filter essays by search query
  const filteredEssays = useMemo(() => {
    if (!searchQuery.trim()) return essays
    
    const query = searchQuery.toLowerCase()
    return essays.filter(
      essay =>
        essay.title.toLowerCase().includes(query) ||
        essay.author.toLowerCase().includes(query)
    )
  }, [essays, searchQuery])

  // Pagination
  const totalPages = Math.ceil(filteredEssays.length / itemsPerPage)
  const paginatedEssays = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage
    return filteredEssays.slice(start, start + itemsPerPage)
  }, [filteredEssays, currentPage])

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case 'published':
        return 'bg-green-100 text-green-700'
      case 'draft':
        return 'bg-amber-100 text-amber-700'
      case 'hidden':
        return 'bg-slate-100 text-slate-700'
      default:
        return 'bg-slate-100 text-slate-700'
    }
  }

  const getStatusBadgeLabel = (status: string) => {
    switch (status) {
      case 'published':
        return 'Đã xuất bản'
      case 'draft':
        return 'Nháp'
      case 'hidden':
        return 'Ẩn'
      default:
        return status
    }
  }

  const getCategoryDisplay = (category: string) => {
    return category
      .replace('văn_', '')
      .replace(/_/g, ' ')
      .split(' ')
      .map(w => w.charAt(0).toUpperCase() + w.slice(1))
      .join(' ')
  }

  const tabs = [
    { id: 'all', label: 'Tất cả', count: statusCounts.all },
    { id: 'published', label: 'Đã xuất bản', count: statusCounts.published },
    { id: 'draft', label: 'Nháp', count: statusCounts.draft },
    { id: 'hidden', label: 'Ẩn', count: statusCounts.hidden },
  ]

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
      {/* Table Header with Tabs */}
      <div className="border-b border-slate-200 p-6 flex items-center justify-between flex-wrap gap-4">
        <div className="flex gap-2 flex-wrap">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => {
                onFilterChange(tab.id as any)
                setCurrentPage(1)
              }}
              className={`px-4 py-2 rounded-lg font-medium text-sm transition-colors ${
                filter === tab.id
                  ? 'bg-primary text-white'
                  : 'text-foreground hover:bg-slate-100 bg-slate-50'
              }`}
            >
              {tab.label} ({tab.count})
            </button>
          ))}
        </div>

        <Link
          href="/admin/dashboard/new"
          onClick={onAddEssay}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-white font-medium hover:bg-primary/90 transition-colors whitespace-nowrap"
        >
          <span className="text-xl">+</span>
          <span>Thêm bài</span>
        </Link>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200">
              <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">Tiêu đề</th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">Tác giả</th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">Lớp</th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">Thể loại</th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">Trạng thái</th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">Lượt xem</th>
              <th className="px-6 py-4 text-right text-sm font-semibold text-foreground">Hành động</th>
            </tr>
          </thead>
          <tbody>
            {paginatedEssays.length > 0 ? (
              paginatedEssays.map(essay => (
                <tr key={essay.id} className="border-b border-slate-200 hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4 text-sm font-medium text-foreground truncate max-w-xs">
                    {essay.title}
                  </td>
                  <td className="px-6 py-4 text-sm text-foreground">{essay.author}</td>
                  <td className="px-6 py-4 text-sm text-foreground">Lớp {essay.class_level}</td>
                  <td className="px-6 py-4 text-sm text-foreground">
                    {getCategoryDisplay(essay.category)}
                  </td>
                  <td className="px-6 py-4">
                    <select
                      value={essay.status}
                      onChange={(e) => onStatusChange(essay.id, e.target.value)}
                      className={`text-xs font-semibold px-3 py-1 rounded-full cursor-pointer border-0 outline-none transition-colors ${getStatusBadgeColor(
                        essay.status
                      )}`}
                    >
                      <option value="published">Đã xuất bản</option>
                      <option value="draft">Nháp</option>
                      <option value="hidden">Ẩn</option>
                    </select>
                  </td>
                  <td className="px-6 py-4 text-sm text-foreground text-center">
                    {essay.views}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-end gap-2">
                      <Link
                        href={`/admin/dashboard/edit/${essay.id}`}
                        className="p-2 text-slate-600 hover:bg-blue-50 hover:text-primary rounded-lg transition-colors"
                        title="Sửa"
                      >
                        <Edit2 size={18} />
                      </Link>
                      <button
                        onClick={() => onDelete(essay.id, essay.title)}
                        className="p-2 text-slate-600 hover:bg-red-50 hover:text-red-600 rounded-lg transition-colors"
                        title="Xóa"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={7} className="px-6 py-12 text-center">
                  <div className="flex flex-col items-center justify-center">
                    <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center mb-4">
                      <span className="text-3xl">📄</span>
                    </div>
                    <p className="text-foreground font-medium">Không có bài viết nào</p>
                    <p className="text-muted-foreground text-sm">
                      {searchQuery ? 'Thử thay đổi từ khóa tìm kiếm' : 'Bắt đầu bằng cách thêm bài viết đầu tiên'}
                    </p>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="border-t border-slate-200 px-6 py-4 flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Hiển thị {(currentPage - 1) * itemsPerPage + 1} đến{' '}
            {Math.min(currentPage * itemsPerPage, filteredEssays.length)} trong{' '}
            {filteredEssays.length} bài viết
          </p>
          <div className="flex gap-2">
            <button
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="p-2 text-slate-600 hover:bg-slate-100 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronLeft size={18} />
            </button>
            <div className="flex items-center gap-1">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                <button
                  key={page}
                  onClick={() => setCurrentPage(page)}
                  className={`w-8 h-8 rounded-lg font-medium text-sm transition-colors ${
                    page === currentPage
                      ? 'bg-primary text-white'
                      : 'text-foreground hover:bg-slate-100'
                  }`}
                >
                  {page}
                </button>
              ))}
            </div>
            <button
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="p-2 text-slate-600 hover:bg-slate-100 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronRight size={18} />
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
