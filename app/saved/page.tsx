'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Navbar from '@/components/Navbar'
import { Bookmark, ArrowLeft, Eye, Calendar, Trash2, LogIn } from 'lucide-react'
import { supabase } from '@/lib/supabase-client'

export default function SavedEssaysPage() {
  const [savedEssays, setSavedEssays] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState<any>(null)

  useEffect(() => {
    const fetchSavedEssays = async () => {
      setLoading(true)
      try {
        const { data: { session } } = await supabase.auth.getSession()
        
        if (!session) {
          setUser(null)
          setLoading(false)
          return
        }
        
        setUser(session.user)

        // Lấy danh sách bài viết từ bảng saved_essays kết hợp (join) với bảng essays
        const { data, error } = await supabase
          .from('saved_essays')
          .select(`
            essay_id,
            essays (*)
          `)
          .eq('user_id', session.user.id)
          .order('created_at', { ascending: false })

        if (error) throw error
        
        // Trích xuất mảng essays từ dữ liệu join
        if (data) {
          const essaysList = data.map(item => item.essays).filter(essay => essay !== null)
          setSavedEssays(essaysList)
        }
      } catch (err) {
        console.error('Lỗi tải bài viết đã lưu:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchSavedEssays()
  }, [])

  const handleRemoveSaved = async (id: string, e: React.MouseEvent) => {
    e.preventDefault()
    if (!user) return

    try {
      await supabase
        .from('saved_essays')
        .delete()
        .eq('user_id', user.id)
        .eq('essay_id', id)
        
      setSavedEssays(savedEssays.filter(item => item.id !== id))
    } catch (error) {
      console.error('Lỗi khi xóa bài lưu:', error)
    }
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

        <div className="flex items-center gap-4 mb-8 bg-white p-6 md:p-8 rounded-3xl shadow-sm border border-slate-100">
          <div className="w-16 h-16 bg-orange-100 text-orange-600 rounded-2xl flex items-center justify-center shadow-inner">
            <Bookmark size={32} className="fill-current" />
          </div>
          <div>
            <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Lưu Trữ Cá Nhân</h1>
            <p className="text-slate-500 font-medium mt-1">Bài văn yêu thích của bạn</p>
          </div>
        </div>

        {loading ? (
          <div className="text-center py-20 bg-white rounded-3xl border border-slate-200">
            <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-slate-500 font-medium">Đang tải danh sách đã lưu...</p>
          </div>
        ) : !user ? (
          <div className="bg-white rounded-3xl shadow-sm border border-slate-100 p-16 text-center">
            <h3 className="text-2xl font-bold text-slate-800 mb-3">Bạn chưa đăng nhập!</h3>
            <p className="text-slate-500 font-medium max-w-md mx-auto mb-6">Hãy đăng nhập để hệ thống có thể lưu lại những bài văn mẫu hay nhất dành riêng cho bạn.</p>
            <Link href="/login" className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white font-bold rounded-xl shadow hover:bg-blue-700">
              <LogIn size={20} /> Đăng nhập ngay
            </Link>
          </div>
        ) : savedEssays.length === 0 ? (
          <div className="bg-white rounded-3xl shadow-sm border border-slate-100 p-16 text-center">
            <div className="text-5xl mb-6">📖</div>
            <h3 className="text-2xl font-bold text-slate-800 mb-3">Chưa có bài viết nào</h3>
            <p className="text-slate-500 font-medium max-w-md mx-auto mb-6">Bạn chưa lưu bài viết nào vào thư viện cá nhân.</p>
            <Link href="/" className="inline-flex px-6 py-3 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700">
              Khám phá thư viện
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {savedEssays.map((essay) => (
              <div key={essay.id} className="relative group">
                <Link href={`/essay/${essay.id}`} className="block h-full">
                  <div className="bg-white h-full rounded-3xl p-6 border border-slate-100 shadow-sm hover:-translate-y-1 transition-all flex flex-col overflow-hidden">
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex flex-wrap gap-2">
                        <span className="px-3 py-1.5 bg-blue-50 text-blue-700 rounded-full text-xs font-bold border border-blue-100">Lớp {essay.class_level || 9}</span>
                        <span className="px-3 py-1.5 bg-purple-50 text-purple-700 rounded-full text-xs font-bold border border-purple-100">
                          {essay.category?.replace('văn_', '') || 'Văn mẫu'}
                        </span>
                      </div>
                      
                      <button 
                        onClick={(e) => handleRemoveSaved(essay.id, e)}
                        className="p-2 bg-red-50 text-red-500 hover:bg-red-100 rounded-full transition-colors z-10"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                    
                    <h3 className="text-xl font-bold text-slate-900 group-hover:text-blue-600 mb-4 line-clamp-3">
                      {essay.title}
                    </h3>
                    
                    <div className="pt-4 border-t border-slate-100 flex items-center justify-between text-slate-500 text-xs font-semibold">
                      <div className="flex items-center gap-3">
                        <span className="flex items-center gap-1.5"><Eye size={14} /> {essay.views || 0}</span>
                      </div>
                      <span className="text-blue-600 font-bold group-hover:translate-x-1 transition-transform">Đọc lại →</span>
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