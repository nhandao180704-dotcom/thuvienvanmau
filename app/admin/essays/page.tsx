'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { supabase } from '@/lib/supabase-client'
import AdminSidebar from '@/components/AdminSidebar'
import AdminHeader from '@/components/AdminHeader'
import { Plus, Search, Edit, Trash2, Eye, Loader2 } from 'lucide-react'

export default function AdminEssaysPage() {
  const router = useRouter()
  const [essays, setEssays] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')

  // Gọi dữ liệu bài viết từ Supabase
  const fetchEssays = async () => {
    setLoading(true)
    try {
      const { data, error } = await supabase
        .from('essays')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error
      if (data) setEssays(data)
    } catch (error) {
      console.error("Lỗi khi tải danh sách bài viết:", error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchEssays()
  }, [])

  // Tính năng Xóa bài viết
  const handleDelete = async (id: string, title: string) => {
    if (!window.confirm(`Bạn có chắc chắn muốn xóa bài viết "${title}" không? Hành động này không thể hoàn tác.`)) {
      return
    }

    try {
      const { error } = await supabase
        .from('essays')
        .delete()
        .eq('id', id)

      if (error) throw error
      
      alert('Đã xóa bài viết thành công!')
      fetchEssays() // Tải lại danh sách sau khi xóa
    } catch (error) {
      console.error("Lỗi khi xóa bài:", error)
      alert('Có lỗi xảy ra khi xóa bài viết.')
    }
  }

  // Lọc bài viết theo từ khóa tìm kiếm (Tiêu đề hoặc Thể loại)
  const filteredEssays = essays.filter(essay => 
    essay.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (essay.genre && essay.genre.toLowerCase().includes(searchQuery.toLowerCase()))
  )

  return (
    <div className="min-h-screen bg-slate-50 flex">
      <AdminSidebar />
      <div className="flex-1 ml-0 md:ml-64 flex flex-col">
        <AdminHeader onSearch={() => {}} />

        <main className="flex-1 p-4 md:p-8 overflow-y-auto mt-16 max-w-7xl mx-auto w-full">
          <div className="space-y-6">
            
            {/* Header & Nút Thêm mới */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h1 className="text-2xl md:text-3xl font-black text-slate-800">Quản lý Bài viết</h1>
                <p className="text-slate-500 mt-1 font-medium">Tổng số: <span className="text-blue-600 font-bold">{essays.length}</span> bài viết đã đăng</p>
              </div>
              
              <Link 
                href="/admin/essays/new" 
                className="flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-md transition-all active:scale-95 shrink-0"
              >
                <Plus size={18} />
                <span>Thêm bài viết mới</span>
              </Link>
            </div>

            {/* Thanh tìm kiếm */}
            <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-200 flex items-center gap-3">
              <Search className="text-slate-400 w-5 h-5 ml-2" />
              <input 
                type="text" 
                placeholder="Tìm kiếm bài viết theo tiêu đề hoặc thể loại..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-transparent border-none outline-none text-slate-700 font-medium placeholder:text-slate-400"
              />
            </div>

            {/* Bảng dữ liệu */}
            <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden">
              <div className="overflow-x-auto hide-scrollbar">
                <table className="w-full text-left border-collapse min-w-[900px]">
                  <thead>
                    <tr className="bg-slate-50/80 border-b border-slate-200 text-sm text-slate-500 font-bold uppercase tracking-wider">
                      <th className="p-5 pl-6 w-[35%]">Tiêu đề bài viết</th>
                      <th className="p-5 text-center">Khối Lớp</th>
                      <th className="p-5 text-center">Thể loại</th>
                      <th className="p-5 text-center">Lượt xem</th>
                      <th className="p-5 text-center">Ngày đăng</th>
                      <th className="p-5 pr-6 text-right">Thao tác</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-sm font-medium">
                    {loading ? (
                      <tr>
                        <td colSpan={6} className="p-12 text-center">
                          <Loader2 className="w-8 h-8 text-blue-500 animate-spin mx-auto mb-3" />
                          <p className="text-slate-500 font-bold">Đang tải dữ liệu...</p>
                        </td>
                      </tr>
                    ) : filteredEssays.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="p-12 text-center text-slate-500 font-medium">
                          Không tìm thấy bài viết nào.
                        </td>
                      </tr>
                    ) : (
                      filteredEssays.map((essay) => (
                        <tr key={essay.id} className="hover:bg-slate-50 transition-colors group">
                          <td className="p-5 pl-6">
                            <div className="font-bold text-slate-800 line-clamp-2 leading-snug group-hover:text-blue-600 transition-colors">{essay.title}</div>
                          </td>
                          <td className="p-5 text-center">
                            <span className="px-3 py-1.5 bg-blue-50 text-blue-600 rounded-lg text-xs font-black uppercase tracking-wider whitespace-nowrap">
                              {essay.grade || '---'}
                            </span>
                          </td>
                          <td className="p-5 text-center">
                            <span className="px-3 py-1.5 bg-purple-50 text-purple-600 rounded-lg text-xs font-black uppercase tracking-wider whitespace-nowrap">
                              {essay.genre || '---'}
                            </span>
                          </td>
                          <td className="p-5 text-center text-slate-600 font-bold">
                            <span className="inline-flex items-center gap-1.5">
                              <Eye size={16} className="text-emerald-500" /> {essay.views || 0}
                            </span>
                          </td>
                          <td className="p-5 text-center text-slate-500 font-semibold">
                            {new Date(essay.created_at).toLocaleDateString('vi-VN')}
                          </td>
                          <td className="p-5 pr-6 text-right whitespace-nowrap">
                            <div className="flex items-center justify-end gap-2">
                              {/* Nút Xem bài trên web */}
                              <Link 
                                href={`/essay/${essay.id}`} 
                                target="_blank"
                                className="p-2 text-slate-400 hover:text-emerald-500 hover:bg-emerald-50 rounded-lg transition-colors"
                                title="Xem trên trang chủ"
                              >
                                <Eye size={18} />
                              </Link>
                              {/* Nút Sửa */}
                              <Link 
                                href={`/admin/essays/edit/${essay.id}`}
                                className="p-2 text-slate-400 hover:text-blue-500 hover:bg-blue-50 rounded-lg transition-colors"
                                title="Chỉnh sửa bài viết"
                              >
                                <Edit size={18} />
                              </Link>
                              {/* Nút Xóa */}
                              <button 
                                onClick={() => handleDelete(essay.id, essay.title)}
                                className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                                title="Xóa bài viết"
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