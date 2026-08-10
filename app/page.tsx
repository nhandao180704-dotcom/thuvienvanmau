'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Navbar from '@/components/Navbar'
import Sidebar from '@/components/Sidebar'
import { Search, Sparkles, BookOpen, Clock, Eye, Bookmark, Flame, ArrowRight, Star } from 'lucide-react'
import { supabase } from '@/lib/supabase-client'

const BANNERS = [
  {
    title: "Khám phá kho tàng Văn Mẫu Xuất Sắc",
    subtitle: "Hệ sinh thái học tập toàn diện & thông minh nhất",
    gradient: "from-blue-600 via-indigo-600 to-purple-700",
    icon: <Sparkles className="text-yellow-300 animate-pulse w-5 h-5" />
  },
  {
    title: "Chinh phục kỳ thi vào Lớp 10 dễ dàng",
    subtitle: "Trắc nghiệm & Tự luận bám sát cấu trúc đề thi thật",
    gradient: "from-emerald-500 via-teal-600 to-cyan-700",
    icon: <Star className="text-yellow-300 animate-bounce w-5 h-5" />
  },
  {
    title: "Nâng tầm tư duy Ngữ Văn cùng AI",
    subtitle: "Hàng ngàn bài viết được chọn lọc và kiểm duyệt kỹ lưỡng",
    gradient: "from-orange-500 via-red-500 to-rose-600",
    icon: <Flame className="text-yellow-300 animate-pulse w-5 h-5" />
  }
]

export default function LibraryPage() {
  const [activeTab, setActiveTab] = useState('Tất cả')
  const [searchQuery, setSearchQuery] = useState('')
  const [searchTermSubmitted, setSearchTermSubmitted] = useState('')
  const [essays, setEssays] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [currentBanner, setCurrentBanner] = useState(0)

  const TABS = ['Tất cả', 'Lớp 6', 'Lớp 7', 'Lớp 8', 'Lớp 9', 'Ôn thi vào 10']

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentBanner((prev) => (prev + 1) % BANNERS.length)
    }, 5000)
    return () => clearInterval(timer)
  }, [])

  useEffect(() => {
    fetchEssays()
  }, [])

  const fetchEssays = async () => {
    setLoading(true)
    try {
      const { data, error } = await supabase
        .from('essays')
        .select('*')
        .eq('status', 'published')
        .order('created_at', { ascending: false })

      if (error) throw error
      if (data) setEssays(data)
    } catch (err) {
      console.error('Lỗi tải bài viết:', err)
    } finally {
      setTimeout(() => setLoading(false), 500)
    }
  }

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setSearchQuery(value)
    if (value.trim() === '') setSearchTermSubmitted('')
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
      } else matchTab = essay.grade === activeTab
    }
    let matchSearch = true
    if (searchTermSubmitted) {
      matchSearch = Boolean(essay.title?.toLowerCase().includes(searchTermSubmitted) || essay.genre?.toLowerCase().includes(searchTermSubmitted))
    }
    return matchTab && matchSearch
  })

  return (
    <div className="min-h-screen bg-[#F4F7FB] text-slate-800 font-sans pb-20 selection:bg-blue-300 selection:text-blue-900 overflow-x-hidden">
      <Navbar />

      <div className="relative min-h-[550px] md:h-[600px] w-full overflow-hidden flex items-center justify-center pb-8">
        {BANNERS.map((banner, index) => (
          <div 
            key={index}
            className={`absolute inset-0 bg-gradient-to-br ${banner.gradient} transition-opacity duration-1000 ease-in-out ${currentBanner === index ? 'opacity-100 z-10' : 'opacity-0 z-0'}`}
          />
        ))}

        <div className="absolute inset-0 bg-[url('/grid-pattern.svg')] opacity-20 z-10 mix-blend-overlay"></div>
        <div className="absolute top-10 left-10 w-64 h-64 bg-white/20 rounded-full blur-3xl animate-bounce z-10" style={{ animationDuration: '7s' }}></div>
        <div className="absolute bottom-10 right-20 w-80 h-80 bg-white/10 rounded-full blur-3xl animate-pulse z-10" style={{ animationDuration: '5s' }}></div>

        <div className="relative z-20 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center flex flex-col items-center mt-10">
          <div className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-white/10 backdrop-blur-md border border-white/30 text-white font-bold mb-8 shadow-[0_0_20px_rgba(255,255,255,0.2)] animate-in slide-in-from-top-4 duration-700">
            {BANNERS[currentBanner].icon} 
            <span className="transition-all duration-500">{BANNERS[currentBanner].subtitle}</span>
          </div>
          
          {/* Ép toàn bộ chữ nằm trên 1 hàng ngang duy nhất bằng whitespace-nowrap */}
          <h1 className="text-2xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight mb-10 leading-tight drop-shadow-2xl whitespace-nowrap">
            {BANNERS[currentBanner].title}
          </h1>
          
          <form onSubmit={handleSearchSubmit} className="w-full max-w-3xl relative group mb-6">
            <div className="absolute inset-0 bg-white/20 rounded-full blur-xl group-focus-within:bg-white/40 transition-all duration-500"></div>
            <div className="relative flex items-center">
              <Search className="absolute left-6 w-6 h-6 text-slate-400 group-focus-within:text-blue-500 transition-colors" />
              <input
                type="text"
                value={searchQuery}
                onChange={handleSearchChange}
                placeholder="Nhập tên bài văn, tác phẩm bạn cần tìm..."
                className="w-full pl-16 pr-40 py-5 rounded-full border-2 border-white/20 bg-white/10 backdrop-blur-xl text-white placeholder-white/70 outline-none focus:bg-white focus:text-slate-900 focus:border-white shadow-2xl transition-all duration-500 text-lg font-medium"
              />
              <button 
                type="submit"
                className="absolute right-2 py-3 px-8 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white rounded-full font-bold shadow-lg hover:shadow-blue-500/50 transition-all active:scale-95"
              >
                Khám phá
              </button>
            </div>
          </form>

          <div className="flex gap-2 mt-6">
            {BANNERS.map((_, idx) => (
              <button 
                key={idx} 
                onClick={() => setCurrentBanner(idx)}
                className={`w-3 h-3 rounded-full transition-all duration-500 ${currentBanner === idx ? 'bg-white w-8' : 'bg-white/40 hover:bg-white/70'}`}
              />
            ))}
          </div>
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8 relative z-30">
        <div className="flex flex-col lg:flex-row gap-10">
          <div className="flex-1 space-y-8 w-full">
            <div className="bg-white/80 backdrop-blur-xl p-2 rounded-2xl shadow-sm border border-slate-200 overflow-x-auto hide-scrollbar touch-pan-x">
              <div className="flex items-center w-max gap-2">
                {TABS.map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`px-6 py-3 rounded-xl text-sm font-black transition-all duration-300 ${
                      activeTab === tab
                        ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md transform scale-105' 
                        : 'text-slate-500 hover:bg-slate-100 hover:text-slate-800'
                    }`}
                  >
                    {tab}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-black text-slate-900 flex items-center gap-3">
                <div className="p-2 bg-orange-100 rounded-lg"><Flame className="text-orange-600 animate-pulse" /></div>
                {searchTermSubmitted ? `Kết quả: "${searchTermSubmitted}"` : 'Bài viết mới nhất'}
              </h2>
              <span className="text-sm font-bold text-slate-500 bg-white px-4 py-1.5 rounded-xl shadow-sm border border-slate-200">
                {filteredEssays.length} Bài viết
              </span>
            </div>

            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <div key={i} className="bg-white rounded-3xl p-6 border border-slate-100 h-48 animate-pulse flex flex-col justify-between">
                    <div className="flex justify-between">
                      <div className="flex gap-2">
                        <div className="w-16 h-6 bg-slate-200 rounded-full"></div>
                        <div className="w-20 h-6 bg-slate-200 rounded-full"></div>
                      </div>
                      <div className="w-8 h-8 bg-slate-200 rounded-full"></div>
                    </div>
                    <div className="space-y-3 mt-4">
                      <div className="w-full h-5 bg-slate-200 rounded"></div>
                      <div className="w-3/4 h-5 bg-slate-200 rounded"></div>
                    </div>
                    <div className="flex justify-between mt-6">
                      <div className="w-24 h-4 bg-slate-200 rounded"></div>
                      <div className="w-16 h-4 bg-slate-200 rounded"></div>
                    </div>
                  </div>
                ))}
              </div>
            ) : filteredEssays.length === 0 ? (
              <div className="text-center py-24 bg-white/50 backdrop-blur-sm rounded-[2rem] border-2 border-dashed border-slate-300">
                <BookOpen size={64} className="mx-auto text-slate-300 mb-6 animate-bounce" />
                <h3 className="text-2xl font-black text-slate-700 mb-2">Không tìm thấy bài viết!</h3>
                <p className="text-slate-500 mb-8 text-lg">Thử một từ khóa khác xem sao nhé.</p>
                <button 
                  onClick={() => { setSearchQuery(''); setSearchTermSubmitted(''); setActiveTab('Tất cả'); }}
                  className="px-8 py-4 bg-slate-900 text-white font-bold rounded-2xl shadow-xl hover:bg-blue-600 transition-all hover:scale-105"
                >
                  Tải lại trang
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {filteredEssays.map((essay) => (
                  <Link href={`/essay/${essay.id}`} key={essay.id} className="group h-full outline-none">
                    <div className="bg-white rounded-3xl p-6 shadow-sm border-2 border-transparent group-hover:border-blue-100 group-hover:shadow-2xl group-hover:-translate-y-2 group-focus:-translate-y-2 transition-all duration-500 h-full flex flex-col relative overflow-hidden">
                      <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-blue-50 to-purple-50 rounded-bl-full -z-10 group-hover:scale-[2] transition-transform duration-700"></div>
                      
                      <div className="flex justify-between items-start mb-5">
                        <div className="flex flex-wrap gap-2">
                          <span className="px-3 py-1 bg-blue-50 text-blue-600 rounded-lg text-xs font-black uppercase tracking-wider">
                            {essay.grade || 'Lớp 9'}
                          </span>
                          <span className="px-3 py-1 bg-purple-50 text-purple-600 rounded-lg text-xs font-black uppercase tracking-wider">
                            {essay.genre || 'Văn mẫu'}
                          </span>
                        </div>
                        <button className="p-2 rounded-xl text-slate-300 bg-slate-50 hover:bg-blue-100 hover:text-blue-600 transition-colors">
                          <Bookmark size={18} />
                        </button>
                      </div>
                      
                      <h3 className="text-xl font-bold text-slate-800 group-hover:text-blue-700 transition-colors mb-4 flex-1 line-clamp-3 leading-snug">
                        {essay.title}
                      </h3>
                      
                      <div className="pt-5 border-t border-slate-100 flex items-center justify-between text-slate-400 text-sm font-semibold">
                        <div className="flex items-center gap-4">
                          <span className="flex items-center gap-1.5 hover:text-blue-500 transition-colors"><Eye size={16} /> {essay.views || 0}</span>
                          <span className="flex items-center gap-1.5"><Clock size={16} /> {new Date(essay.created_at).toLocaleDateString('vi-VN')}</span>
                        </div>
                        <div className="flex items-center gap-1 text-blue-600 font-black opacity-0 -translate-x-4 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300">
                          Đọc <ArrowRight size={18} />
                        </div>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>

          <div className="w-full lg:w-[340px] shrink-0">
            <div className="sticky top-24">
              <Sidebar />
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}