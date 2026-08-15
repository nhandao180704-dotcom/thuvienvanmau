'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { supabase } from '@/lib/supabase-client'
import AdminSidebar from '@/components/AdminSidebar'
import AdminHeader from '@/components/AdminHeader'
import { Plus, Search, Trash2, Eye, Loader2, Copy, CheckCircle2 } from 'lucide-react'

export default function AdminQuizzesPage() {
  const [quizzes, setQuizzes] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [copiedId, setCopiedId] = useState<string | null>(null)

  const fetchQuizzes = async () => {
    try {
      const { data, error } = await supabase
        .from('quizzes')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error
      if (data) setQuizzes(data)
    } catch (error) {
      console.error("Lỗi tải danh sách đề thi:", error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchQuizzes()
  }, [])

  const handleDelete = async (id: string, title: string) => {
    if (!window.confirm(`Bạn có chắc muốn xóa đề thi "${title}"? Toàn bộ câu hỏi và kết quả làm bài của học sinh sẽ bị xóa theo.`)) return

    try {
      const { error } = await supabase.from('quizzes').delete().eq('id', id)
      if (error) throw error
      
      alert('Đã xóa đề thi thành công!')
      fetchQuizzes()
    } catch (error) {
      alert('Có lỗi xảy ra khi xóa.')
    }
  }

  const handleCopyLink = (id: string) => {
    const link = `${window.location.origin}/quizzes/${id}`
    navigator.clipboard.writeText(link)
    setCopiedId(id)
    setTimeout(() => setCopiedId(null), 2000)
  }

  const filteredQuizzes = quizzes.filter(q => 
    q.title.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <div className="min-h-screen bg-slate-50">
      <AdminSidebar />
      <AdminHeader onSearch={() => {}} />

      <main className="fixed top-16 right-0 left-0 md:left-64 bottom-0 overflow-y-auto p-4 md:p-8">
        <div className="max-w-6xl mx-auto space-y-6">
          
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-black text-slate-800">Quản lý Đề Thi</h1>
              <p className="text-slate-500 mt-1 font-medium">Tổng số: {quizzes.length} đề kiểm tra</p>
            </div>
            
            <Link href="/admin/quizzes/new" className="flex items-center justify-center gap-2 px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-md transition-all shrink-0">
              <Plus size={18} />
              <span>Tạo đề thi mới</span>
            </Link>
          </div>

          <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-200 flex items-center gap-3">
            <Search className="text-slate-400 w-5 h-5 ml-2" />
            <input 
              type="text" 
              placeholder="Tìm kiếm đề thi..." 
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
                    <th className="p-4 pl-6">Tên đề thi</th>
                    <th className="p-4 text-center">Khối</th>
                    <th className="p-4 text-center">Thời gian</th>
                    <th className="p-4 text-center">Ngày tạo</th>
                    <th className="p-4 pr-6 text-right">Thao tác</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium">
                  {loading ? (
                    <tr>
                      <td colSpan={5} className="p-8 text-center"><Loader2 className="w-8 h-8 text-blue-500 animate-spin mx-auto" /></td>
                    </tr>
                  ) : filteredQuizzes.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="p-8 text-center text-slate-500">Chưa có đề thi nào.</td>
                    </tr>
                  ) : (
                    filteredQuizzes.map((quiz) => (
                      <tr key={quiz.id} className="hover:bg-slate-50 transition-colors">
                        <td className="p-4 pl-6 text-slate-800 font-bold max-w-md truncate">{quiz.title}</td>
                        <td className="p-4 text-center text-blue-600 bg-blue-50/50 rounded-lg">{quiz.grade}</td>
                        <td className="p-4 text-center text-slate-600">{quiz.duration} phút</td>
                        <td className="p-4 text-center text-slate-500 text-sm">
                          {new Date(quiz.created_at).toLocaleDateString('vi-VN')}
                        </td>
                        <td className="p-4 pr-6 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <button 
                              onClick={() => handleCopyLink(quiz.id)}
                              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-bold transition-colors ${copiedId === quiz.id ? 'bg-emerald-100 text-emerald-700' : 'bg-indigo-50 text-indigo-600 hover:bg-indigo-100'}`}
                              title="Copy link gửi cho học sinh"
                            >
                              {copiedId === quiz.id ? <CheckCircle2 size={16} /> : <Copy size={16} />}
                              {copiedId === quiz.id ? 'Đã copy' : 'Copy Link'}
                            </button>
                            <Link href={`/quiz/${quiz.id}`} target="_blank" className="p-2 text-slate-400 hover:text-blue-500 hover:bg-blue-50 rounded-lg transition-colors" title="Xem thử đề thi">
                              <Eye size={18} />
                            </Link>
                            <button onClick={() => handleDelete(quiz.id, quiz.title)} className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors" title="Xóa đề thi">
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