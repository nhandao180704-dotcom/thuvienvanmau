'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import Navbar from '@/components/Navbar'
import Sidebar from '@/components/Sidebar'
import { Search, Sparkles, BookOpen, Clock, Eye, Bookmark, Flame, ArrowRight, Star, TrendingUp } from 'lucide-react'
import { supabase } from '@/lib/supabase-client'

interface Essay {
  id: string | number;
  title: string;
  category?: string;
  grade?: string;
  class_level?: number;
  genre?: string;
  views?: number;
  created_at: string;
  [key: string]: any;
}

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

// Dữ liệu cho các thẻ 3D chạy ngang
const SCROLLING_CARDS = [
  { title: "Văn mẫu Lớp 9", desc: "Tuyển tập 100+ bài hay xuất sắc", color: "from-blue-500 to-cyan-400" },
  { title: "Ôn thi vào 10", desc: "Bám sát cấu trúc đề thi thật", color: "from-emerald-500 to-teal-400" },
  { title: "Phân tích tác phẩm", desc: "Góc nhìn sâu sắc, đa chiều", color: "from-orange-500 to-amber-400" },
  { title: "Lập dàn ý chi tiết", desc: "Xây dựng khung bài vững chắc", color: "from-purple-500 to-fuchsia-400" },
  { title: "Bí kíp điểm cao", desc: "Mẹo làm bài thi đạt điểm tối đa", color: "from-pink-500 to-rose-400" },
  { title: "Văn mẫu Lớp 8", desc: "Nghị luận & thuyết minh hay nhất", color: "from-indigo-500 to-blue-400" },
]
// Nhân bản dữ liệu để tạo hiệu ứng vòng lặp vô tận (Seamless Loop)
const LOOPED_CARDS = [...SCROLLING_CARDS, ...SCROLLING_CARDS, ...SCROLLING_CARDS, ...SCROLLING_CARDS]

export default function LibraryPage() {
  const [activeTab, setActiveTab] = useState('Tất cả')
  const [searchQuery, setSearchQuery] = useState('')
  const [searchTermSubmitted, setSearchTermSubmitted] = useState('')
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [essays, setEssays] = useState<Essay[]>([])
  const [loading, setLoading] = useState(true)
  const [currentBanner, setCurrentBanner] = useState(0)
  
  const [isHoveringBanner, setIsHoveringBanner] = useState(false)
  const searchContainerRef = useRef<HTMLDivElement>(null)

  const TABS = ['Tất cả', 'Lớp 6', 'Lớp 7', 'Lớp 8', 'Lớp 9', 'Ôn thi vào 10']

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(event.target as Node)) {
        setShowSuggestions(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  useEffect(() => {
    if (isHoveringBanner) return;
    const timer = setInterval(() => {
      setCurrentBanner((prev) => (prev + 1) % BANNERS.length)
    }, 5000)
    return () => clearInterval(timer)
  }, [isHoveringBanner])

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
      if (data) setEssays(data as Essay[])
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
        matchTab = essay.class_level === 10 || essay.grade === 'Lớp 9' || Boolean(essay.category && essay.category.includes('10'))
      } else {
        const tabLevel = parseInt(activeTab.replace(/\D/g, ''), 10);
        matchTab = essay.class_level === tabLevel || essay.grade === activeTab;
      }
    }
    let matchSearch = true
    if (searchTermSubmitted) {
      matchSearch = Boolean(essay.title?.toLowerCase().includes(searchTermSubmitted) || essay.genre?.toLowerCase().includes(searchTermSubmitted))
    }
    return matchTab && matchSearch
  })

  const trendingEssays = [...essays].sort((a, b) => (b.views || 0) - (a.views || 0)).slice(0, 3)
  const searchSuggestions = searchQuery.trim() === '' ? [] : essays.filter(e => e.title?.toLowerCase().includes(searchQuery.trim().toLowerCase())).slice(0, 5)

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-800 font-sans selection:bg-blue-300 selection:text-blue-900 overflow-x-hidden w-full relative">
      
      {/* KHAI BÁO ANIMATION 3D TRỰC TIẾP VÀO FILE */}
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes marquee3d {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        .perspective-container {
          perspective: 1500px;
          transform-style: preserve-3d;
          overflow: hidden;
        }
        .animate-marquee-3d {
          display: flex;
          width: max-content;
          animation: marquee3d 50s linear infinite;
          transform-style: preserve-3d;
          will-change: transform;
        }
        .animate-marquee-3d:hover {
          animation-play-state: paused;
        }
        .card-3d {
          transform: rotateY(-22deg) rotateX(10deg) rotateZ(-1deg);
          box-shadow: -20px 20px 35px rgba(0,0,0,0.4);
          transition: all 0.5s cubic-bezier(0.2, 0.8, 0.2, 1);
        }
        .card-3d:hover {
          transform: rotateY(-5deg) rotateX(5deg) rotateZ(0deg) scale(1.08) translateZ(40px);
          box-shadow: -10px 15px 40px rgba(0,0,0,0.5);
          border-color: rgba(255,255,255,0.7);
          z-index: 50;
        }
      `}} />

      <Navbar />

      {/* PHẦN BANNER 3D XỊN XÒ MỚI CỦA BẠN */}
      <div className="relative min-h-[580px] md:h-[680px] w-full flex items-center justify-center pb-8 px-4 box-border z-20 perspective-container bg-slate-900">
        
        {/* Nền gradient thay đổi linh hoạt theo BANNERS */}
        {BANNERS.map((banner, index) => (
          <div 
            key={index}
            className={`absolute inset-0 bg-gradient-to-br ${banner.gradient} transition-opacity duration-1000 ease-in-out ${currentBanner === index ? 'opacity-100 z-0' : 'opacity-0 z-0'}`}
          />
        ))}

        {/* Các lớp phủ làm nền chìm xuống để tôn vinh thẻ 3D */}
        <div className="absolute inset-0 bg-black/20 z-0 mix-blend-multiply pointer-events-none"></div>
        <div className="absolute inset-0 bg-[url('/grid-pattern.svg')] opacity-30 z-0 mix-blend-overlay pointer-events-none"></div>

        {/* KHỐI 3D THẺ BÀI DI CHUYỂN BÊN DƯỚI */}
        <div className="absolute top-[40%] md:top-1/2 -translate-y-1/2 left-0 z-10 pt-10 pointer-events-auto">
          <div className="animate-marquee-3d gap-8 md:gap-12 pl-8 md:pl-12">
            {LOOPED_CARDS.map((card, idx) => (
              <div 
                key={idx} 
                className="card-3d relative w-[240px] h-[320px] md:w-[280px] md:h-[380px] rounded-[32px] shrink-0 border-2 border-white/20 cursor-pointer group bg-white/10 backdrop-blur-md flex flex-col justify-end p-6 md:p-8 overflow-hidden"
              >
                <div className={`absolute inset-0 bg-gradient-to-br ${card.color} opacity-40 mix-blend-overlay group-hover:opacity-70 transition-opacity duration-500`}></div>
                <div className="absolute -top-10 -right-10 w-32 h-32 bg-white/30 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-500"></div>
                
                <div className="relative z-10 translate-y-6 group-hover:translate-y-0 transition-transform duration-500">
                  <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-md mb-4 flex items-center justify-center border border-white/30 shadow-inner">
                    <BookOpen className="text-white w-6 h-6" />
                  </div>
                  <h3 className="text-xl md:text-2xl font-black text-white mb-2 leading-tight drop-shadow-md">{card.title}</h3>
                  <p className="text-white/90 text-sm font-medium opacity-0 group-hover:opacity-100 transition-opacity duration-500 delay-100 drop-shadow-sm">{card.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* KHỐI LỒNG KÍNH CHỨA SEARCH BAR TRUNG TÂM */}
        <div 
          className="relative z-30 w-full max-w-3xl mx-auto text-center flex flex-col items-center mt-12 md:mt-24 p-8 md:p-12 rounded-[40px] bg-slate-900/30 backdrop-blur-2xl border border-white/20 shadow-[0_30px_60px_rgba(0,0,0,0.5)]"
          onMouseEnter={() => setIsHoveringBanner(true)}
          onMouseLeave={() => setIsHoveringBanner(false)}
        >
          <div className="inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-full bg-white/10 border border-white/20 text-white text-xs sm:text-sm font-bold mb-6 shadow-inner animate-in slide-in-from-top-4 duration-700">
            {BANNERS[currentBanner].icon} 
            <span className="transition-all duration-500 truncate tracking-wide">{BANNERS[currentBanner].subtitle}</span>
          </div>
          
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight mb-8 md:mb-10 leading-tight drop-shadow-2xl whitespace-normal break-words px-2 w-full animate-in fade-in zoom-in-95 duration-700">
            {BANNERS[currentBanner].title}
          </h1>
          
          <div ref={searchContainerRef} className="w-full relative group mb-4 px-2 box-border animate-in slide-in-from-bottom-6 duration-700 delay-150">
            <div className="absolute inset-0 bg-white/20 rounded-full blur-xl group-focus-within:bg-white/40 transition-all duration-500 mx-2"></div>
            <form onSubmit={handleSearchSubmit} className="relative flex items-center w-full">
              <Search className="absolute left-6 w-5 h-5 text-slate-300 group-focus-within:text-blue-500 transition-colors" />
              <input
                type="text"
                value={searchQuery}
                onChange={handleSearchChange}
                onClick={() => searchQuery.trim().length > 0 && setShowSuggestions(true)}
                placeholder="Nhập tên bài văn, tác phẩm..."
                className="w-full pl-14 sm:pl-16 pr-[100px] sm:pr-36 py-4 md:py-5 rounded-full border border-white/30 bg-white/10 backdrop-blur-md text-white placeholder-white/70 outline-none focus:bg-white focus:text-slate-900 focus:border-white shadow-2xl transition-all duration-500 text-sm sm:text-base font-medium"
              />
              <button 
                type="submit"
                className="absolute right-2.5 py-2.5 md:py-3 px-5 sm:px-8 bg-white text-blue-600 hover:bg-slate-50 text-xs sm:text-base rounded-full font-black shadow-lg hover:shadow-xl transition-all active:scale-95"
              >
                Tìm kiếm
              </button>
            </form>

            {/* Gợi ý tìm kiếm */}
            {showSuggestions && searchSuggestions.length > 0 && (
              <div className="absolute top-full mt-3 w-[calc(100%-1rem)] mx-2 bg-white rounded-2xl shadow-2xl border border-slate-100 overflow-hidden z-50 text-left animate-in fade-in slide-in-from-top-2 duration-200">
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
                className={`w-2 h-2 sm:w-2.5 sm:h-2.5 rounded-full transition-all duration-500 ${currentBanner === idx ? 'bg-white w-6 sm:w-8' : 'bg-white/30 hover:bg-white/60'}`}
              />
            ))}
          </div>
        </div>
      </div>

      {/* LỚP NỀN CỐ ĐỊNH - Phần thân trang */}
      <div className="relative w-full min-h-screen pb-20 z-10">
        <div className="fixed top-0 left-0 w-full h-full pointer-events-none z-0">
          <div className="w-full h-full bg-[url('/bg-van-hoc.jpg')] bg-cover bg-center bg-no-repeat opacity-100"></div>
        </div>

        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-10 relative z-10 w-full box-border">
          <div className="flex flex-col lg:flex-row gap-8 lg:gap-10 w-full animate-in fade-in slide-in-from-bottom-10 duration-1000">
            <div className="flex-1 space-y-8 md:space-y-10 w-full max-w-full overflow-hidden">
              
              <div className="bg-white/90 backdrop-blur-md p-1.5 rounded-full shadow-sm border border-solid border-slate-200/60 overflow-x-auto hide-scrollbar touch-pan-x w-fit max-w-full">
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
                        <div className="bg-white rounded-[24px] p-6 shadow-sm border border-solid border-slate-100 group-hover:border-purple-300/50 group-hover:shadow-[0_20px_40px_-15px_rgba(147,51,234,0.15)] group-hover:-translate-y-2 transition-all duration-500 h-full flex flex-col relative overflow-hidden">
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

              <div className="space-y-6">
                <div className="flex flex-wrap items-center justify-between gap-3 w-full">
                  <h2 className="text-xl sm:text-2xl font-black text-slate-900 flex items-center gap-3 flex-1 break-words">
                    <div className="p-2.5 bg-gradient-to-br from-orange-100 to-amber-100 rounded-xl shrink-0 shadow-inner">
                      <BookOpen className="text-orange-600 w-5 h-5 sm:w-6 sm:h-6" />
                    </div>
                    <span className="line-clamp-2">{searchTermSubmitted ? `Kết quả: "${searchTermSubmitted}"` : 'Bài viết mới nhất'}</span>
                  </h2>
                  <span className="text-xs sm:text-sm font-bold text-slate-600 bg-white px-4 py-2 rounded-full shadow-sm border border-solid border-slate-200/60 shrink-0">
                    {filteredEssays.length} Bài viết
                  </span>
                </div>

                {loading ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5 md:gap-6">
                    {[1, 2, 3, 4, 5, 6].map((i) => (
                      <div key={i} className="bg-white rounded-[24px] p-6 border border-solid border-slate-100 h-52 animate-pulse flex flex-col justify-between w-full shadow-sm">
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
                        <div className="bg-white rounded-[24px] p-6 shadow-sm border border-solid border-slate-100 group-hover:border-blue-300/50 group-hover:shadow-[0_20px_40px_-15px_rgba(37,99,235,0.15)] group-hover:-translate-y-2 transition-all duration-500 h-full flex flex-col relative overflow-hidden">
                          
                          <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-blue-50/50 to-indigo-50/50 rounded-bl-full -z-10 group-hover:scale-150 transition-transform duration-700"></div>
                          
                          <div className="flex justify-between items-start mb-5 relative z-10">
                            <div className="flex flex-wrap gap-2">
                              <span className="px-3 py-1.5 bg-blue-50/80 text-blue-700 rounded-lg text-[10px] sm:text-xs font-black uppercase tracking-wider">
                                {essay.class_level === 10 ? 'Ôn thi vào 10' : essay.class_level === 0 ? 'Văn mẫu chung' : essay.grade || `Lớp ${essay.class_level}`}
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
                          
                          <div className="pt-5 border-t border-solid border-slate-100/80 flex items-center justify-between text-slate-400 text-xs sm:text-sm font-semibold w-full relative z-10">
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

            <div className="w-full lg:w-[360px] shrink-0">
              <div className="sticky top-24 relative">
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