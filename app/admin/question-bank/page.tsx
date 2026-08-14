'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { supabase } from '@/lib/supabase-client'
import AdminSidebar from '@/components/AdminSidebar'
import AdminHeader from '@/components/AdminHeader'
import { Plus, Search, Edit, Trash2, Database, Loader2 } from 'lucide-react'

export default function QuestionBankPage() {
  const [questions, setQuestions] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')

  useEffect(() => {
    fetchQuestions()
  }, [])

  // Tải danh sách câu hỏi từ bảng question_bank
  const fetchQuestions = async () => {
    setLoading(true)
    try {
      const { data, error } = await supabase
        .from('question_bank')
        .select('*')
        .order('created_at', { ascending: false })
      
      if (error) throw error
      if (data) setQuestions(data)
    } catch (error) {
      console.error('Lỗi khi tải câu hỏi:', error)
    } finally {
      setLoading(false)
    }
  }

  // Xử lý xóa câu hỏi
  const handleDelete = async (id: string) => {
    if (!window.confirm('Bạn có chắc chắn muốn xóa câu hỏi này khỏi ngân hàng?')) return

    try {
      const { error } = await supabase.from('question_bank').delete().eq('id', id)
      if (error) throw error
      setQuestions(questions.filter(q => q.id !== id))
      alert('Đã xóa câu hỏi thành công!')
    } catch (error) {
      console.error('Lỗi khi xóa câu hỏi:', error)
      alert('Có lỗi xảy ra khi xóa câu hỏi.')
    }
  }

  const filteredQuestions = questions.filter(q => 
    (q.content && q.content.toLowerCase().includes(searchQuery.toLowerCase())) ||
    (q.grade && q.grade.toLowerCase().includes(searchQuery.toLowerCase()))
  )

  return (
    <div className="min-h-screen bg-slate-50 flex">
      <AdminSidebar />
      <div className="flex-1 ml-0 md:ml-64 flex flex-col">
        <AdminHeader onSearch={() => {}} />
        
        <main className="flex-1 p-4 md:p-8 overflow-y-auto mt-16 max-w-7xl mx-auto w-full">
          <div className="space-y-6">
            
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h1 className="text-2xl md:text-3xl font-black text-slate-900 flex items-center gap-3">
                  <Database className="text-[#0052CC]" /> Ngân hàng câu hỏi
                </h1>
                <p className="text-slate-500 mt-1 font-medium">
                  Tổng số: <span className="text-[#0052CC] font-bold">{questions.length}</span> câu hỏi lưu trữ
                </p>
              </div>
              
              <Link 
                href="/admin/question-bank/new" 
                className="flex items-center justify-center gap-2 px-6 py-3 bg-[#0052CC] hover:bg-blue-700 text-white font-bold rounded-xl shadow-sm transition-all shrink-0 active:scale-95"
              >
                <Plus size={18} />
                <span>Thêm câu hỏi mới</span>
              </Link>
            </div>

            <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-200 flex items-center gap-3">
              <Search className="text-slate-400 w-5 h-5 ml-2" />
              <input 
                type="text" 
                placeholder="Tìm kiếm nội dung câu hỏi, đoạn trích hoặc khối lớp..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-transparent border-none outline-none text-slate-700 font-medium placeholder:text-slate-400"
              />
            </div>

            <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse min-w-[800px]">
                  <thead>
                    <tr className="bg-slate-50/80 border-b border-slate-200 text-sm text-slate-500 font-bold uppercase tracking-wider">
                      <th className="p-5 pl-6 w-[55%]">Nội dung câu hỏi</th>
                      <th className="p-5 text-center">Khối Lớp</th>
                      <th className="p-5 text-center">Đáp án đúng</th>
                      <th className="p-5 pr-6 text-right">Thao tác</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-sm font-medium">
                    {loading ? (
                      <tr>
                        <td colSpan={4} className="p-12 text-center">
                          <Loader2 className="w-8 h-8 text-[#0052CC] animate-spin mx-auto mb-3" />
                          <p className="text-slate-500 font-bold">Đang tải dữ liệu...</p>
                        </td>
                      </tr>
                    ) : filteredQuestions.length === 0 ? (
                      <tr>
                        <td colSpan={4} className="p-12 text-center text-slate-500 font-medium">
                          Kho câu hỏi đang trống hoặc không tìm thấy câu hỏi phù hợp.
                        </td>
                      </tr>
                    ) : (
                      filteredQuestions.map((q) => (
                        <tr key={q.id} className="hover:bg-slate-50 transition-colors group">
                          <td className="p-5 pl-6">
                            <div 
                              className="font-medium text-slate-800 line-clamp-2 leading-snug group-hover:text-[#0052CC] transition-colors"
                              dangerouslySetInnerHTML={{ __html: q.content }}
                            />
                          </td>
                          <td className="p-5 text-center">
                            <span className="px-3 py-1.5 bg-blue-50 text-[#0052CC] rounded-lg text-xs font-black uppercase tracking-wider whitespace-nowrap">
                              {q.grade || 'Chung'}
                            </span>
                          </td>
                          <td className="p-5 text-center text-emerald-600 font-bold">
                            <span className="px-2.5 py-1 bg-emerald-50 rounded-md border border-emerald-200">
                              {q.correct_answer || '---'}
                            </span>
                          </td>
                          <td className="p-5 pr-6 text-right whitespace-nowrap">
                            <div className="flex items-center justify-end gap-2">
                              <Link 
                                href={`/admin/question-bank/edit/${q.id}`}
                                className="p-2 text-slate-400 hover:text-[#0052CC] hover:bg-blue-50 rounded-lg transition-colors"
                                title="Chỉnh sửa câu hỏi"
                              >
                                <Edit size={18} />
                              </Link>
                              <button 
                                onClick={() => handleDelete(q.id)}
                                className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                                title="Xóa câu hỏi"
                              >
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
    </div>
  )
}