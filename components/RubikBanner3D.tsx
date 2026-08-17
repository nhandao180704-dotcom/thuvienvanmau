'use client'

import { useState, useEffect } from 'react'
import { Search, Sparkles, Star, Flame } from 'lucide-react'

const RUBIK_FACES = [
  {
    title: "Khám phá kho tàng Văn Mẫu Xuất Sắc",
    subtitle: "Hệ sinh thái học tập toàn diện & thông minh nhất",
    gradient: "from-blue-900 via-indigo-900 to-slate-900",
    icon: <Sparkles className="text-yellow-400 w-4 h-4" />
  },
  {
    title: "Chinh phục kỳ thi vào Lớp 10 dễ dàng",
    subtitle: "Trắc nghiệm & Tự luận bám sát cấu trúc đề thi thật",
    gradient: "from-emerald-900 via-teal-900 to-slate-900",
    icon: <Star className="text-yellow-400 w-4 h-4" />
  },
  {
    title: "Nâng tầm tư duy và kỹ năng viết Văn",
    subtitle: "Hàng ngàn bài viết được chọn lọc và kiểm duyệt kỹ lưỡng",
    gradient: "from-rose-900 via-red-900 to-slate-900",
    icon: <Flame className="text-yellow-400 w-4 h-4" />
  },
  {
    title: "Góc ôn thi Ngữ Văn toàn diện THCS",
    subtitle: "Lập dàn ý, phân tích tác phẩm và bí kíp điểm cao",
    gradient: "from-fuchsia-900 via-purple-900 to-slate-900",
    icon: <Sparkles className="text-yellow-400 w-4 h-4" />
  }
]

export default function RubikBanner3D({
  searchQuery,
  setSearchQuery,
  handleSearchSubmit,
  showSuggestions,
  setShowSuggestions,
  searchSuggestions,
  setSearchTermSubmitted,
  searchContainerRef
}: any) {
  const [rotationIndex, setRotationIndex] = useState(0)
  const [isPaused, setIsPaused] = useState(false)

  // Tự động lộn Rubik mỗi 5 giây (sẽ dừng khi hover hoặc gõ phím)
  useEffect(() => {
    if (isPaused) return;
    const timer = setInterval(() => {
      setRotationIndex((prev) => prev + 1)
    }, 5000)
    return () => clearInterval(timer)
  }, [isPaused])

  const activeFace = ((rotationIndex % 4) + 4) % 4

  return (
    <div className="w-full flex justify-center items-center py-12 relative overflow-hidden z-20 px-4">
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes floatingSpace {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-15px); }
        }
        .animate-floating {
          animation: floatingSpace 6s ease-in-out infinite;
        }
      `}} />

      {/* Container phối cảnh 3D */}
      <div 
        className="relative w-full max-w-4xl h-[400px] animate-floating"
        style={{ perspective: '2500px' }}
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
      >
        {/* Khối Rubik quay theo trục X */}
        <div 
          className="w-full h-full relative"
          style={{
            transformStyle: 'preserve-3d',
            transform: `translateZ(-200px) rotateX(${rotationIndex * -90}deg)`,
            transition: 'transform 1s cubic-bezier(0.25, 1, 0.5, 1)'
          }}
        >
          {RUBIK_FACES.map((face, index) => {
            // Cấu hình 4 mặt của Rubik
            let faceTransform = '';
            if (index === 0) faceTransform = 'rotateX(0deg) translateZ(200px)';
            else if (index === 1) faceTransform = 'rotateX(-90deg) translateZ(200px)';
            else if (index === 2) faceTransform = 'rotateX(-180deg) translateZ(200px)';
            else if (index === 3) faceTransform = 'rotateX(90deg) translateZ(200px)';

            return (
              <div 
                key={index}
                className={`absolute inset-0 w-full h-full rounded-[40px] shadow-[0_30px_60px_rgba(0,0,0,0.6)] p-6 md:p-12 flex flex-col items-center justify-center text-center bg-gradient-to-br ${face.gradient} backdrop-blur-xl border border-solid border-white/20`}
                style={{ transform: faceTransform, backfaceVisibility: 'hidden' }}
              >
                <div className="inline-flex items-center gap-2 px-5 py-2 rounded-full border border-solid border-white/30 bg-white/10 text-white text-xs md:text-sm font-semibold mb-6 shadow-inner">
                  {face.icon}
                  {face.subtitle}
                </div>

                <h1 className="text-3xl md:text-5xl font-black text-white tracking-tight mb-10 drop-shadow-lg max-w-3xl leading-tight">
                  {face.title}
                </h1>

                {/* Khung tìm kiếm ở mỗi mặt */}
                <div className="w-full max-w-2xl relative mt-auto mb-6" ref={activeFace === index ? searchContainerRef : null}>
                  <form onSubmit={handleSearchSubmit} className="relative flex items-center w-full">
                    <div className="absolute inset-0 bg-white/10 rounded-full blur-md"></div>
                    <Search className="absolute left-6 w-5 h-5 text-white/70 z-10" />
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => {
                        setSearchQuery(e.target.value);
                        setShowSuggestions(e.target.value.trim().length > 0);
                        if (e.target.value.trim() === '') setSearchTermSubmitted('');
                      }}
                      onFocus={() => {
                        setIsPaused(true);
                        if (searchQuery.trim().length > 0) setShowSuggestions(true);
                      }}
                      placeholder="Nhập tên bài văn, tác phẩm..."
                      className="w-full pl-14 pr-[110px] py-4 rounded-full border border-solid border-white/30 bg-white/10 backdrop-blur-lg text-white placeholder-white/70 outline-none focus:bg-white/20 focus:border-white/50 transition-all shadow-inner relative z-10 font-medium text-sm md:text-base"
                    />
                    <button 
                      type="submit"
                      className="absolute right-2.5 py-2.5 px-6 bg-white text-blue-700 font-bold text-sm rounded-full shadow-lg hover:shadow-xl hover:scale-105 transition-all z-10"
                    >
                      Tìm kiếm
                    </button>
                  </form>

                  {/* Gợi ý tìm kiếm */}
                  {showSuggestions && searchSuggestions.length > 0 && activeFace === index && (
                    <div className="absolute top-full left-0 right-0 mt-3 mx-2 bg-white rounded-2xl shadow-2xl border border-solid border-slate-100 overflow-hidden z-50 text-left text-slate-800">
                      {searchSuggestions.map((s: any) => (
                        <button
                          key={s.id}
                          type="button"
                          onClick={() => {
                            setSearchQuery(s.title);
                            setSearchTermSubmitted(s.title.toLowerCase());
                            setShowSuggestions(false);
                          }}
                          className="w-full text-left px-6 py-4 hover:bg-slate-50 border-b border-solid border-slate-50 last:border-0 transition-colors flex items-center gap-3"
                        >
                          <Search className="w-4 h-4 text-slate-400 shrink-0" />
                          <span className="text-slate-700 font-medium line-clamp-1">{s.title}</span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                <div className="flex justify-center gap-2">
                  {RUBIK_FACES.map((_, dotIdx) => (
                    <button 
                      key={dotIdx} 
                      onClick={() => setRotationIndex(Math.floor(rotationIndex / 4) * 4 + dotIdx)}
                      className={`h-1.5 rounded-full transition-all duration-500 ${dotIdx === activeFace ? 'w-8 bg-white shadow-[0_0_10px_rgba(255,255,255,0.8)]' : 'w-2 bg-white/30 hover:bg-white/60'}`}
                    />
                  ))}
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}