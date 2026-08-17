'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Navbar from '@/components/Navbar'
import Sidebar from '@/components/Sidebar'
import { Search, Sparkles, BookOpen, Clock, Eye, Bookmark, Flame, ArrowRight, Star, TrendingUp } from 'lucide-react'
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
    title: "Nâng tầm tư duy và kỹ năng viết Văn",
    subtitle: "Hàng ngàn bài viết được chọn lọc và kiểm duyệt kỹ lưỡng",
    gradient: "from-orange-500 via-red-500 to-rose-600",
    icon: <Flame className="text-yellow-300 animate-pulse w-5 h-5" />
  }
]

export default function LibraryPage() {
  const [activeTab, setActiveTab] = useState('Tất cả')
  const [searchQuery, setSearchQuery] = useState('')
  const [searchTermSubmitted, setSearchTermSubmitted] = useState('')
  const [showSuggestions, setShowSuggestions] = useState(false)
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
    setShowSuggestions(value.trim().length > 0)
    if (value.trim() === '') setSearchTermSubmitted('')
  }

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setSearchTermSubmitted(searchQuery.trim().toLowerCase())
    setShowSuggestions(false)
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

  // Lấy ra Top 3 bài viết nhiều view nhất
  const trendingEssays = [...essays].sort((a, b) => (b.views || 0) - (a.views || 0)).slice(0, 3)
  
  // Gợi ý tìm kiếm theo thời gian thực
  const searchSuggestions = searchQuery.trim() === '' ? [] : essays.filter(e => e.title?.toLowerCase().includes(searchQuery.trim().toLowerCase())).slice(0, 5)

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-800 font-sans selection:bg-blue-300 selection:text-blue-900 overflow-x-hidden w-full relative">
      <Navbar />

      {/* Phần Header màu xanh với hiệu ứng chuyển động */}
      <div className="relative min-h-[480px] md:h-[550px] w-full overflow-hidden flex items-center justify-center pb-8 px-4 box-border z-20">
        {BANNERS.map((banner, index) => (
          <div 
            key={index}
            className={`absolute inset-0 bg-gradient-to-br ${banner.gradient} transition-opacity duration-1000 ease-in-out ${currentBanner === index ? 'opacity-100 z-10' : 'opacity-0 z-0'}`}
          />
        ))}

        <div className="absolute inset-0 bg-[url('/grid-pattern.svg')] opacity-20 z-10 mix-blend-overlay"></div>
        <div className="absolute top-10 left-10 w-64 h-64 bg-white/20 rounded-full blur-3xl animate-bounce z-10" style={{ animationDuration: '7s' }}></div>
        <div className="absolute bottom-10 right-20 w-80 h-80 bg-white/10 rounded-full blur-3xl animate-pulse z-10" style={{ animationDuration: '5s' }}></div>

        <div className="relative z-20 w-full max-w-4xl mx-auto text-center flex flex-col items-center mt-6">
          <div className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-full bg-white/15 backdrop-blur-md border border-white/30 text-white text-xs sm:text-sm font-bold mb-6 shadow-[0_0_20px_rgba(255,255,255,0.15)] animate-in slide-in-from-top-4 duration-700 max-w-full">
            {BANNERS[currentBanner].icon} 
            <span className="transition-all duration-500 truncate tracking-wide">{BANNERS[currentBanner].subtitle}</span>
          </div>
          
          <h1 className="text-3xl sm:text-4xl lg:text-5xl md:text-6xl font-black text-white tracking-tight mb-10 leading-tight drop-shadow-2xl whitespace-normal break-words px-2 w-full animate-in fade-in zoom-in-95 duration-700 delay-150">
            {BANNERS[currentBanner].title}
          </h1>
          
          <div className="w-full max-w-2xl relative group mb-6 px-4 box-border animate-in slide-in-from-bottom-6 duration-700 delay-300">
            <div className="absolute inset-0 bg-white/20 rounded-full blur-xl group-focus-within:bg-white/40 transition-all duration-500 mx-2"></div>
            <form onSubmit={handleSearchSubmit} className="relative flex items-center w-full">
              <Search className="absolute left-6 w-5 h-5 text-slate-400 group-focus-within:text-blue-500 transition-colors" />
              <input
                type="text"
                value={searchQuery}
                onChange={handleSearchChange}
                placeholder="Nhập tên bài văn, tác phẩm..."
                className="w-full pl-14 sm:pl-16 pr-[100px] sm:pr-36 py-4 rounded-full border border-white/30 bg-white/15 backdrop-blur-xl text-white placeholder-white/80 outline-none focus:bg-white focus:text-slate-900 focus:border-white shadow-2xl transition-all duration-500 text-sm sm:text-base font-medium"
              />
              <button 
                type="submit"
                className="absolute right-2.5 py-2.5 px-5 sm:px-8 bg-white text-blue-600 hover:bg-slate-50 text-xs sm:text-sm rounded-full font-black shadow-lg hover:shadow-xl transition-all active:scale-95"
              >
                Tìm kiếm
              </button>
            </form>

            {/* Gợi ý tìm kiếm */}
            {showSuggestions && searchSuggestions.length > 0 && (
              <div className="absolute top-full mt-3 w-[calc(100%-2rem)] mx-4 bg-white rounded-2xl shadow-2xl border border-slate-100 overflow-hidden z-50 text-left animate-in fade-in slide-in-from-top-2 duration-200">
                {searchSuggestions.map(s => (
                  <button
                    key={s.id}
                    type="button"
                    onClick={() => {
                      setSearchQuery(s.title);
                      setSearchTermSubmitted(s.title.toLowerCase());
                      setShowSuggestions(false);
                    }}
                    className="w-full text-left px-6 py-4 hover:bg-slate-50 border-b border-slate-50 last:border-0 transition-colors flex items-center gap-3"
                  >
                    <Search className="w-4 h-4 text-slate-400 shrink-0" />
                    <span className="text-slate-700 font-medium line-clamp-1">{s.title}</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="flex gap-2.5 mt-4">
            {BANNERS.map((_, idx) => (
              <button 
                key={idx} 
                onClick={() => setCurrentBanner(idx)}
                className={`w-2 h-2 sm:w-2.5 sm:h-2.5 rounded-full transition-all duration-500 ${currentBanner === idx ? 'bg-white w-6 sm:w-8' : 'bg-white/40 hover:bg-white/70'}`}
              />
            ))}
          </div>
        </div>
      </div>

      {/* LỚP NỀN CỐ ĐỊNH - Đã trả lại opacity 100% cho hình nền */}
      <div className="relative w-full min-h-screen pb-20 z-10">
        <div className="fixed top-0 left-0 w-full h-full pointer-events-none z-0">
          <div className="w-full h-full bg-[url('/bg-van-hoc.jpg')] bg-cover bg-center bg-no-repeat opacity-100"></div>
        </div>

        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-10 relative z-10 w-full box-border">
          <div className="flex flex-col lg:flex-row gap-8 lg:gap-10 w-full animate-in fade-in slide-in-from-bottom-10 duration-1000">
            <div className="flex-1 space-y-8 md:space-y-10 w-full max-w-full overflow-hidden">
              
              {/* TABS NÂNG CẤP - Đã sửa lỗi thừa width */}
              <div className="bg-white/90 backdrop-blur-md p-1.5 rounded-full shadow-sm border border-slate-200/60 overflow-x-auto hide-scrollbar touch-pan-x w-fit max-w-full">
                <div className="flex items-center w-max gap-1">
                  {TABS.map((tab) => (
                    <button
                      key={tab}
                      onClick={() => setActiveTab(tab)}
                      className={`px-6 py-2.5 rounded-full text-xs sm:text-sm font-bold transition-all duration-300 ${
                        activeTab === tab
                          ? 'bg-slate-900 text-white shadow-md transform scale-100' 
                          : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                      }`}
                    >
                      {tab}
                    </button>
                  ))}
                </div>
              </div>

              {/* TOP XU HƯỚNG */}
              {activeTab === 'Tất cả' && !searchTermSubmitted && trendingEssays.length > 0 && !loading && (
                <div className="mb-10 animate-in fade-in duration-700">
                  <h2 className="text-xl sm:text-2xl font-black text-slate-900 flex items-center gap-3 mb-6">
                    <div className="p-2.5 bg-gradient-to-br from-purple-100 to-fuchsia-100 rounded-xl shrink-0 shadow-inner">
                      <TrendingUp className="text-purple-600 w-5 h-5 sm:w-6 sm:h-6" />
                    </div>
                    <span>Top Bài Viết Nổi Bật</span>
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-5 md:gap-6">
                    {trendingEssays.map(essay => (
                      <Link href={`/essay/${essay.id}`} key={`trend-${essay.id}`} className="group outline-none w-full block">
                        <div className="bg-white rounded-[24px] p-6 shadow-sm border border-slate-100 group-hover:border-purple-300/50 group-hover:shadow-[0_20px_40px_-15px_rgba(147,51,234,0.15)] group-hover:-translate-y-2 transition-all duration-500 h-full flex flex-col relative overflow-hidden">
                          <div className="absolute -top-10 -right-10 w-32 h-32 bg-gradient-to-br from-purple-50 to-fuchsia-50 rounded-full opacity-0 group-hover:opacity-100 group-hover:scale-150 transition-all duration-700"></div>
                          
                          <span className="relative z-10 inline-flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-purple-100 to-fuchsia-100 text-purple-700 rounded-xl text-[10px] font-black uppercase tracking-wider w-max mb-4">
                            <Flame size={12} className="animate-pulse" /> Nổi bật
                          </span>
                          
                          <h3 className="relative z-10 text-base sm:text-lg font-bold text-slate-800 group-hover:text-purple-700 transition-colors mb-4 line-clamp-2 leading-snug">
                            {essay.title}
                          </h3>
                          
                          <div className="relative z-10 mt-auto flex items-center gap-2 text-slate-500 text-xs font-bold">
                            <Eye size={14} className="text-purple-500" /> {essay.views || 0} lượt xem
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              )}

              {/* BÀI VIẾT MỚI NHẤT */}
              <div className="space-y-6">
                <div className="flex flex-wrap items-center justify-between gap-3 w-full">
                  <h2 className="text-xl sm:text-2xl font-black text-slate-900 flex items-center gap-3 flex-1 break-words">
                    <div className="p-2.5 bg-gradient-to-br from-orange-100 to-amber-100 rounded-xl shrink-0 shadow-inner">
                      <BookOpen className="text-orange-600 w-5 h-5 sm:w-6 sm:h-6" />
                    </div>
                    <span className="line-clamp-2">{searchTermSubmitted ? `Kết quả: "${searchTermSubmitted}"` : 'Bài viết mới nhất'}</span>
                  </h2>
                  <span className="text-xs sm:text-sm font-bold text-slate-600 bg-white px-4 py-2 rounded-full shadow-sm border border-slate-200/60 shrink-0">
                    {filteredEssays.length} Bài viết
                  </span>
                </div>

                {loading ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5 md:gap-6">
                    {[1, 2, 3, 4, 5, 6].map((i) => (
                      <div key={i} className="bg-white rounded-[24px] p-6 border border-slate-100 h-52 animate-pulse flex flex-col justify-between w-full shadow-sm">
                        <div className="flex justify-between">
                          <div className="flex gap-2">
                            <div className="w-16 h-7 bg-slate-100 rounded-lg"></div>
                            <div className="w-20 h-7 bg-slate-100 rounded-lg"></div>
                          </div>
                          <div className="w-8 h-8 bg-slate-100 rounded-full"></div>
                        </div>
                        <div className="space-y-3 mt-6">
                          <div className="w-full h-5 bg-slate-100 rounded"></div>
                          <div className="w-3/4 h-5 bg-slate-100 rounded"></div>
                        </div>
                        <div className="flex justify-between mt-8">
                          <div className="w-24 h-4 bg-slate-100 rounded"></div>
                          <div className="w-16 h-4 bg-slate-100 rounded"></div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : filteredEssays.length === 0 ? (
                  <div className="flex flex-col items-center justify-center px-4 py-16 sm:py-24 bg-white/60 backdrop-blur-md rounded-[32px] border-2 border-solid border-slate-200 w-full text-center">
                    <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mb-6">
                      <BookOpen size={40} className="text-slate-400 animate-pulse" />
                    </div>
                    <h3 className="text-xl sm:text-2xl font-black text-slate-800 mb-2">Không tìm thấy bài viết!</h3>
                    <p className="text-slate-500 mb-8 font-medium">Thử một từ khóa khác hoặc quay lại danh sách đầy đủ nhé.</p>
                    <button
                      onClick={() => { setSearchQuery(''); setSearchTermSubmitted(''); setActiveTab('Tất cả'); }}
                      className="px-8 py-3.5 bg-slate-900 text-white text-sm font-bold rounded-xl shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all"
                    >
                      Tải lại trang
                    </button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5 md:gap-6 w-full">
                    {filteredEssays.map((essay) => (
                      <Link href={`/essay/${essay.id}`} key={essay.id} className="group outline-none w-full block">
                        <div className="bg-white rounded-[24px] p-6 shadow-sm border border-slate-100 group-hover:border-blue-300/50 group-hover:shadow-[0_20px_40px_-15px_rgba(37,99,235,0.15)] group-hover:-translate-y-2 transition-all duration-500 h-full flex flex-col relative overflow-hidden">
                          
                          {/* Decorative Corner Background */}
                          <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-blue-50/50 to-indigo-50/50 rounded-bl-full -z-10 group-hover:scale-150 transition-transform duration-700"></div>
                          
                          <div className="flex justify-between items-start mb-5 relative z-10">
                            <div className="flex flex-wrap gap-2">
                              <span className="px-3 py-1.5 bg-blue-50/80 text-blue-700 rounded-lg text-[10px] sm:text-xs font-black uppercase tracking-wider">
                                {essay.class_level === 10 ? 'Ôn thi vào 10' : essay.grade || `Lớp ${essay.class_level}`}
                              </span>
                              <span className="px-3 py-1.5 bg-slate-100/80 text-slate-700 rounded-lg text-[10px] sm:text-xs font-black uppercase tracking-wider line-clamp-1">
                                {essay.genre || 'Văn mẫu'}
                              </span>
                            </div>
                            <button className="p-2 rounded-full text-slate-300 hover:bg-blue-50 hover:text-blue-600 transition-colors shrink-0">
                              <Bookmark size={18} />
                            </button>
                          </div>
                          
                          <h3 className="text-base sm:text-lg font-bold text-slate-800 group-hover:text-blue-700 transition-colors mb-6 flex-1 line-clamp-3 leading-snug relative z-10">
                            {essay.title}
                          </h3>
                          
                          <div className="pt-5 border-t border-slate-100/80 flex items-center justify-between text-slate-400 text-xs sm:text-sm font-semibold w-full relative z-10">
                            <div className="flex items-center gap-4 truncate pr-2">
                              <span className="flex items-center gap-1.5"><Eye size={16} className="text-slate-300 group-hover:text-blue-400 transition-colors" /> {essay.views || 0}</span>
                              <span className="flex items-center gap-1.5"><Clock size={16} className="text-slate-300 group-hover:text-blue-400 transition-colors" /> {new Date(essay.created_at).toLocaleDateString('vi-VN')}</span>
                            </div>
                            <div className="flex items-center gap-1 text-blue-600 font-black opacity-0 -translate-x-4 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300 shrink-0">
                              Đọc <ArrowRight size={16} />
                            </div>
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Cột Sidebar (Khối bên phải) */}
            <div className="w-full lg:w-[360px] shrink-0">
              <div className="sticky top-24 relative">
                {/* Lớp nền mờ tô điểm cho Sidebar */}
                <div className="absolute inset-0 bg-gradient-to-b from-blue-50/50 to-purple-50/50 blur-3xl -z-10 rounded-full"></div>
                <Sidebar />
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}