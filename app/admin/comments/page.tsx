'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase-client'
import AdminSidebar from '@/components/AdminSidebar'
import AdminHeader from '@/components/AdminHeader'
import { Search, Trash2, Loader2, MessageSquare, CheckCircle, XCircle } from 'lucide-react'

export default function AdminCommentsPage() {
  const [comments, setComments] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')

  const fetchComments = async () => {
    try {
      // Lưu ý: Đảm bảo bạn có bảng 'comments' trong Supabase
      const { data, error } = await supabase
        .from('comments')
        .select(`
          *,
          profiles(full_name),
          essays(title)
        `)
        .order('created_at', { ascending: false })

      if (error) throw error
      if (data) setComments(data)
    } catch (error) {
      console.error("Lỗi tải danh sách bình luận:", error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchComments()
  }, [])

  const handleDelete = async (id: string) => {
    if (!window.confirm(`Bạn có chắc muốn xóa bình luận này?`)) return

    try {
      const { error } = await supabase.from('comments').delete().eq('id', id)
      if (error) throw error
      
      alert('Đã xóa bình luận thành công!')
      fetchComments()
    } catch (error) {
      alert('Có lỗi xảy ra khi xóa.')
    }
  }

  const handleUpdateStatus = async (id: string, newStatus: string) => {
    try {
      const { error } = await supabase.from('comments').update({ status: newStatus }).eq('id', id)
      if (error) throw error
      fetchComments()
    } catch (error) {
      alert('Không thể cập nhật trạng thái.')
    }
  }

  const filteredComments = comments.filter(c => 
    (c.content || '').toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <div className="min-h-screen bg-slate-50">
      <AdminSidebar />
      <AdminHeader onSearch={() => {}} />

      <main className="fixed top-16 right-0 left-0 md:left-64 bottom-0 overflow-y-auto p-4 md:p-8">
        <div className="max-w-6xl mx-auto space-y-6">
          
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-black text-slate-800 flex items-center gap-2">
                <MessageSquare className="text-emerald-600" size={28} /> Quản lý Bình luận
              </h1>
              <p className="text-slate-500 mt-1 font-medium">Tổng số: {comments.length} bình luận</p>
            </div>
          </div>

          <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-200 flex items-center gap-3">
            <Search className="text-slate-400 w-5 h-5 ml-2" />
            <input 
              type="text" 
              placeholder="Tìm kiếm nội dung bình luận..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-transparent border-none outline-none text-slate-700 font-medium placeholder:text-slate-400"
            />
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-sm text-slate-500 font-bold uppercase tracking-wider">
                    <th className="p-4 pl-6 w-1/3">Nội dung</th>
                    <th className="p-4">Người đăng & Bài viết</th>
                    <th className="p-4 text-center">Trạng thái</th>
                    <th className="p-4 pr-6 text-right">Thao tác</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium">
                  {loading ? (
                    <tr>
                      <td colSpan={4} className="p-8 text-center"><Loader2 className="w-8 h-8 text-emerald-500 animate-spin mx-auto" /></td>
                    </tr>
                  ) : filteredComments.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="p-8 text-center text-slate-500">Chưa có bình luận nào.</td>
                    </tr>
                  ) : (
                    filteredComments.map((comment) => (
                      <tr key={comment.id} className="hover:bg-slate-50 transition-colors">
                        <td className="p-4 pl-6 text-slate-700 text-sm">
                          <p className="line-clamp-2">{comment.content}</p>
                          <span className="text-[11px] text-slate-400 mt-1 block">
                            {new Date(comment.created_at).toLocaleString('vi-VN')}
                          </span>
                        </td>
                        <td className="p-4">
                          <p className="text-slate-800 font-bold text-sm">{comment.profiles?.full_name || 'Học sinh'}</p>
                          <p className="text-slate-500 text-xs truncate max-w-[200px]" title={comment.essays?.title}>
                            Tại: {comment.essays?.title || 'Chưa rõ bài viết'}
                          </p>
                        </td>
                        <td className="p-4 text-center">
                          <span className={`inline-block px-2.5 py-1 rounded-lg text-xs font-bold ${comment.status === 'approved' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>
                            {comment.status === 'approved' ? 'Đã duyệt' : 'Chờ duyệt'}
                          </span>
                        </td>
                        <td className="p-4 pr-6 text-right">
                          <div className="flex items-center justify-end gap-1">
                            {comment.status !== 'approved' && (
                              <button onClick={() => handleUpdateStatus(comment.id, 'approved')} className="p-2 text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors" title="Duyệt bình luận">
                                <CheckCircle size={18} />
                              </button>
                            )}
                            {comment.status === 'approved' && (
                              <button onClick={() => handleUpdateStatus(comment.id, 'pending')} className="p-2 text-amber-600 hover:bg-amber-50 rounded-lg transition-colors" title="Ẩn bình luận">
                                <XCircle size={18} />
                              </button>
                            )}
                            <button onClick={() => handleDelete(comment.id)} className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors" title="Xóa vĩnh viễn">
                              <Trash2 size={18} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}