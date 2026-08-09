'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Navbar from '@/components/Navbar'
import Sidebar from '@/components/Sidebar'
import { Search, Sparkles, BookOpen, Clock, Eye, Bookmark, Flame } from 'lucide-react'
import { supabase } from '@/lib/supabase-client'

export default function LibraryPage() {
  const [activeTab, setActiveTab] = useState('Tất cả')
  const [searchQuery, setSearchQuery] = useState('')
  const [searchTermSubmitted, setSearchTermSubmitted] = useState('')
  const [essays, setEssays] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  const TABS = ['Tất cả', 'Lớp 6', 'Lớp 7', 'Lớp 8', 'Lớp 9', 'Ôn thi vào 10']

  useEffect(() => {
    fetchEssays()
  }, [])

  const fetchEssays = async () => {
    setLoading(true)
    try {
      const { data, error } = await supabase
        .from('essays')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error
      if (data) setEssays(data)
    } catch (err) {
      console.error('Lỗi khi tải bài viết:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setSearchQuery(value)
    if (value.trim() === '') {
      setSearchTermSubmitted('')
    }
  }

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setSearchTermSubmitted(searchQuery.trim().toLowerCase())
  }

  const filteredEssays = essays.filter(essay => {
    let matchTab = true
    if (activeTab !== 'Tất cả') {
      if (activeTab === 'Ôn thi vào 10') {
        matchTab = essay.grade === 'Lớp 9' || (essay.category && essay.category.includes('10'))
      } else {
        matchTab = essay.grade === activeTab
      }
    }

    let matchSearch = true
    if (searchTermSubmitted) {
      const titleMatch = essay.title?.toLowerCase().includes(searchTermSubmitted)
      const genreMatch = essay.genre?.toLowerCase().includes(searchTermSubmitted)
      matchSearch = Boolean(titleMatch || genreMatch)
    }

    return matchTab && matchSearch
  })

  return (
    <div className="min-h-screen bg-[#F4F7FB] text-slate-800 font-sans pb-20 selection:bg-blue-200">
      <Navbar />

      {/* HERO BANNER HOÀNH TRÁNG KÈM HIỆU ỨNG */}
      <div className="relative bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-700 overflow-hidden">
        <div className="absolute inset-0 bg-[url('/grid-pattern.svg')] opacity-10"></div>
        {/* HIỆU ỨNG 1: Khối cầu phát sáng nhấp nháy (neon-pulse) */}
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-white opacity-20 rounded-full blur-3xl animate-neon-pulse"></div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24 relative z-10 text-center">
          {/* HIỆU ỨNG 2: Huy hiệu hít thở (breathe) */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-white/90 text-sm font-semibold mb-6 animate-breathe hover:animate-none cursor-default shadow-lg shadow-white/10">
            <Sparkles size={16} className="text-yellow-300 animate-pulse" /> Hệ sinh thái học tập toàn diện
          </div>
          
          <h1 className="text-4xl md:text-6xl font-extrabold text-white tracking-tight mb-6 animate-in slide-in-from-bottom-5 duration-700">
            Khám phá kho tàng <br className="hidden md:block" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 to-blue-200">Văn Mẫu Xuất Sắc</span>
          </h1>
          
          <form onSubmit={handleSearchSubmit} className="max-w-2xl mx-auto relative mt-8 animate-in slide-in-from-bottom-8 duration-1000">
            <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
              <Search className="h-6 w-6 text-slate-400" />
            </div>
            <input
              type="text"
              value={searchQuery}
              onChange={handleSearchChange}
              placeholder="Nhập tên bài văn, tác phẩm, thể loại cần tìm..."
              className="w-full pl-14 pr-36 py-4 rounded-full border-2 border-white/20 bg-white/10 backdrop-blur-lg text-white placeholder-white/70 focus:outline-none focus:bg-white focus:text-slate-900 focus:placeholder-slate-400 transition-all text-base md:text-lg shadow-2xl"
            />
            {/* HIỆU ỨNG 3: Nút tìm kiếm hít thở nhẹ */}
            <button 
              type="submit"
              className="absolute inset-y-2 right-2 bg-blue-600 hover:bg-blue-700 text-white px-6 rounded-full font-bold transition-all shadow-[0_0_15px_rgba(37,99,235,0.5)] active:scale-95 animate-breathe hover:animate-none"
            >
              Tìm kiếm
            </button>
          </form>
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-6 md:-mt-8 relative z-20">
        <div className="flex flex-col lg:flex-row gap-8">
          
          {/* CỘT TRÁI (Danh sách bài viết) */}
          <div className="flex-1 space-y-6 md:space-y-8 w-full overflow-hidden">
            <div className="bg-white p-1.5 md:p-2 rounded-xl md:rounded-2xl shadow-sm border border-slate-200 overflow-x-auto hide-scrollbar touch-pan-x">
              <div className="flex items-center w-max gap-1">
                {TABS.map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`px-4 md:px-6 py-2.5 md:py-3 rounded-lg md:rounded-xl text-xs md:text-sm font-bold transition-all whitespace-nowrap ${
                      activeTab === tab
                        ? 'bg-blue-50 text-blue-700 shadow-sm transform scale-105' // Hiệu ứng phóng to nhẹ khi chọn tab
                        : 'text-slate-500 hover:bg-slate-50 hover:text-slate-700'
                    }`}
                  >
                    {tab}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-extrabold text-slate-900 flex items-center gap-2">
                <Flame className="text-orange-500 animate-pulse" /> 
                {searchTermSubmitted ? `Kết quả tìm kiếm cho "${searchTermSubmitted}"` : 'Bài viết mới nhất'}
              </h2>
              <span className="text-sm font-medium text-slate-500 bg-white px-3 py-1 rounded-full border border-slate-200 shadow-sm">
                Tìm thấy {filteredEssays.length} bài
              </span>
            </div>

            {loading ? (
              <div className="text-center py-20 bg-white rounded-3xl border border-slate-200">
                <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                <p className="text-slate-500 font-medium">Đang tải danh sách bài văn...</p>
              </div>
            ) : filteredEssays.length === 0 ? (
              <div className="text-center py-20 bg-white rounded-3xl border border-dashed border-slate-300">
                <BookOpen size={48} className="mx-auto text-slate-300 mb-4 animate-breathe" />
                <h3 className="text-xl font-bold text-slate-700 mb-2">Không tìm thấy bài viết phù hợp</h3>
                <p className="text-slate-500 mb-6">Hãy thử từ khóa khác hoặc chọn chuyên mục khác nhé!</p>
                <button 
                  onClick={() => { setSearchQuery(''); setSearchTermSubmitted(''); setActiveTab('Tất cả'); }}
                  className="px-6 py-2.5 bg-blue-600 text-white font-bold rounded-xl shadow hover:bg-blue-700 transition"
                >
                  Xem tất cả bài viết
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {filteredEssays.map((essay) => (
                  <Link href={`/essay/${essay.id}`} key={essay.id} className="group h-full">
                    <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm hover:shadow-xl hover:-translate-y-1.5 transition-all duration-300 h-full flex flex-col relative overflow-hidden">
                      <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-blue-50 to-purple-50 rounded-bl-full -z-10 group-hover:scale-125 transition-transform duration-500"></div>
                      
                      <div className="flex justify-between items-start mb-4">
                        <div className="flex flex-wrap gap-2">
                          <span className="px-3 py-1.5 bg-blue-50 text-blue-700 rounded-full text-xs font-bold border border-blue-100">
                            {essay.grade || 'Lớp 9'}
                          </span>
                          <span className="px-3 py-1.5 bg-purple-50 text-purple-700 rounded-full text-xs font-bold border border-purple-100">
                            {essay.genre || 'Văn mẫu'}
                          </span>
                        </div>
                        <button className="p-2 rounded-full text-slate-300 hover:bg-slate-50 hover:text-blue-500 transition-colors">
                          <Bookmark size={18} />
                        </button>
                      </div>
                      
                      <h3 className="text-xl font-bold text-slate-900 group-hover:text-blue-600 transition-colors mb-4 flex-1 line-clamp-3 leading-snug">
                        {essay.title}
                      </h3>
                      
                      <div className="pt-4 border-t border-slate-100 flex items-center justify-between text-slate-500 text-xs font-semibold">
                        <div className="flex items-center gap-3">
                          <span className="flex items-center gap-1.5"><Eye size={14} className="text-slate-400" /> {essay.views || 0}</span>
                          <span className="flex items-center gap-1.5"><Clock size={14} className="text-slate-400" /> {new Date(essay.created_at).toLocaleDateString('vi-VN')}</span>
                        </div>
                        <span className="text-blue-600 font-bold group-hover:translate-x-1 transition-transform">
                          Đọc ngay →
                        </span>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>

          {/* CỘT PHẢI (SIDEBAR) */}
          <div className="lg:w-80 shrink-0">
            <div className="sticky top-24">
              <Sidebar />
            </div>
          </div>

        </div>
      </main>
    </div>
  )
}