'use client'

import { AlertTriangle } from 'lucide-react'

interface DeleteConfirmModalProps {
  isOpen: boolean
  essayTitle: string
  onConfirm: () => void
  onCancel: () => void
  isLoading?: boolean
}

export default function DeleteConfirmModal({
  isOpen,
  essayTitle,
  onConfirm,
  onCancel,
  isLoading = false,
}: DeleteConfirmModalProps) {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center">
      <div className="bg-white rounded-lg shadow-lg max-w-md w-full mx-4 animate-in zoom-in duration-300">
        {/* Icon */}
        <div className="flex justify-center pt-6 pb-4">
          <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center">
            <AlertTriangle size={24} className="text-red-600" />
          </div>
        </div>

        {/* Content */}
        <div className="px-6 py-4 text-center">
          <h3 className="text-lg font-bold text-foreground mb-2">Xóa bài viết?</h3>
          <p className="text-sm text-muted-foreground mb-4">
            Bạn có chắc chắn muốn xóa bài viết <strong>"{essayTitle}"</strong>? Hành động này không thể hoàn tác.
          </p>
        </div>

        {/* Actions */}
        <div className="px-6 py-4 flex gap-3 border-t border-slate-200">
          <button
            onClick={onCancel}
            disabled={isLoading}
            className="flex-1 px-4 py-2 rounded-lg border border-slate-300 text-foreground font-medium hover:bg-slate-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Hủy
          </button>
          <button
            onClick={onConfirm}
            disabled={isLoading}
            className="flex-1 px-4 py-2 rounded-lg bg-red-600 text-white font-medium hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {isLoading && <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>}
            {isLoading ? 'Đang xóa...' : 'Xóa'}
          </button>
        </div>
      </div>
    </div>
  )
}
