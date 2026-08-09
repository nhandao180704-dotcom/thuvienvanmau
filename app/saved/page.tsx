'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Navbar from '@/components/Navbar'
import { Bookmark, ArrowLeft, Eye, Calendar, Trash2, BookOpen } from 'lucide-react'
import { supabase } from '@/lib/supabase-client'

export default function SavedEssaysPage() {
  const [savedEssays, setSavedEssays] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  // Tải danh sách ID đã lưu từ LocalStorage và truy vấn lấy thông tin bài viết từ Supabase
  useEffect(() => {
    const fetchSavedEssays = async () => {
      setLoading(true)
      try {
        const savedIds = JSON.parse(localStorage.getItem('saved_essays_local') || '[]')
        
        if (savedIds.length === 0) {
          setSavedEssays([])
          setLoading(false)
          return
        }

        // Lấy thông tin các bài viết có ID nằm trong danh sách đã lưu
        const { data, error } = await supabase
          .from('essays')
          .select('*')
          .in('id', savedIds)

        if (error) throw error
        if (data) setSavedEssays(data)
      } catch (err) {
        console.error('Lỗi tải bài viết đã lưu:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchSavedEssays()
  }, [])

  // Xóa bài viết khỏi danh sách đã lưu
  const handleRemoveSaved = (id: string, e: React.MouseEvent) => {
    e.preventDefault() // Tránh bấm nhầm vào thẻ Link chuyển trang
    let savedIds = JSON.parse(localStorage.getItem('saved_essays_local') || '[]')
    savedIds = savedIds.filter((item: string) => item !== id)
    localStorage.setItem('saved_essays_local', JSON.stringify(savedIds))
    
    // Cập nhật lại giao diện ngay lập tức
    setSavedEssays(savedEssays.filter(item => item.id !== id))
  }

  return (
    <div className="min-h-screen bg-[#F4F7FB] text-slate-800 font-sans pb-20 selection:bg-blue-200">
      <Navbar />

      <main className="max-w-5xl mx-auto px-4 sm:px-6 py-10">
        <Link href="/" className="inline-flex items-center gap-2 text-sm font-bold text-slate-500 hover:text-blue-600 transition-colors mb-6 group">
          <div className="p-2 bg-white rounded-full shadow-sm group-hover:bg-blue-50 transition-colors">
            <ArrowLeft size={16} />
          </div>
          Về lại trang chủ
        </Link>

        {/* Tiêu đề trang */}
        <div className="flex items-center gap-4 mb-8 bg-white p-6 md:p-8 rounded-3xl shadow-sm border border-slate-100">
          <div className="w-16 h-16 bg-orange-100 text-orange-600 rounded-2xl flex items-center justify-center shadow-inner">
            <Bookmark size={32} className="fill-current" />
          </div>
          <div>
            <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Thư Viện Lưu Trữ Cá Nhân</h1>
            <p className="text-slate-500 font-medium mt-1">Bài văn đã lưu</p>
          </div>
        </div>

        {/* Nội dung danh sách */}
        {loading ? (
          <div className="text-center py-20 bg-white rounded-3xl border border-slate-200">
            <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-slate-500 font-medium">Đang tải danh sách đã lưu...</p>
          </div>
        ) : savedEssays.length === 0 ? (
          <div className="bg-white rounded-3xl shadow-sm border border-slate-100 p-16 text-center animate-in fade-in duration-500">
            <div className="w-24 h-24 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6 border border-slate-100 text-5xl shadow-inner">
              📖
            </div>
            <h3 className="text-2xl font-bold text-slate-800 mb-3">Chưa có bài viết nào được lưu</h3>
            <p className="text-slate-500 font-medium max-w-md mx-auto leading-relaxed mb-6">
              Bạn chưa lưu bài viết nào vào thư viện cá nhân. Hãy khám phá và bấm nút "Lưu bài" ở các bài văn hay nhé!
            </p>
            <Link href="/" className="inline-flex items-center justify-center px-6 py-3 bg-blue-600 text-white font-bold rounded-xl shadow hover:bg-blue-700 transition">
              Khám phá thư viện ngay
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-in fade-in slide-in-from-bottom-6 duration-500">
            {savedEssays.map((essay) => (
              <div key={essay.id} className="relative group">
                <Link href={`/essay/${essay.id}`} className="block h-full">
                  <div className="bg-white h-full rounded-3xl p-6 border border-slate-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-blue-50 to-orange-50 rounded-bl-full -z-10"></div>
                    
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex flex-wrap gap-2">
                        <span className="px-3 py-1.5 bg-blue-50 text-blue-700 rounded-full text-xs font-bold border border-blue-100">
                          {essay.grade || 'Lớp 9'}
                        </span>
                        <span className="px-3 py-1.5 bg-purple-50 text-purple-700 rounded-full text-xs font-bold border border-purple-100">
                          {essay.genre || 'Văn mẫu'}
                        </span>
                      </div>
                      
                      {/* Nút xóa bài khỏi danh sách lưu */}
                      <button 
                        onClick={(e) => handleRemoveSaved(essay.id, e)}
                        className="p-2 bg-red-50 text-red-500 hover:bg-red-100 rounded-full transition-colors z-10"
                        title="Xóa khỏi lưu trữ"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                    
                    <h3 className="text-xl font-bold text-slate-900 group-hover:text-blue-600 transition-colors mb-4 flex-1 line-clamp-3 leading-snug">
                      {essay.title}
                    </h3>
                    
                    <div className="pt-4 border-t border-slate-100 flex items-center justify-between text-slate-500 text-xs font-semibold">
                      <div className="flex items-center gap-3">
                        <span className="flex items-center gap-1.5"><Eye size={14} className="text-slate-400" /> {essay.views || 0}</span>
                        <span className="flex items-center gap-1.5"><Calendar size={14} className="text-slate-400" /> {new Date(essay.created_at || Date.now()).toLocaleDateString('vi-VN')}</span>
                      </div>
                      <span className="text-blue-600 font-bold group-hover:translate-x-1 transition-transform">
                        Đọc lại →
                      </span>
                    </div>
                  </div>
                </Link>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}