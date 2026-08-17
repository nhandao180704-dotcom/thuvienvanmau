'use client'

import { useState, useEffect } from 'react'
import { Search, Sparkles, Star, Flame } from 'lucide-react'

// ĐÃ CẬP NHẬT: Gradient màu tươi sáng hơn, bắt mắt hơn
const RUBIK_FACES = [
  {
    title: "Khám phá kho tàng Văn Mẫu Xuất Sắc",
    subtitle: "Hệ sinh thái học tập toàn diện & thông minh nhất",
    gradient: "from-blue-500 via-indigo-500 to-cyan-500",
    icon: <Sparkles className="text-yellow-300 w-4 h-4" />
  },
  {
    title: "Chinh phục kỳ thi vào Lớp 10 dễ dàng",
    subtitle: "Trắc nghiệm & Tự luận bám sát cấu trúc đề thi thật",
    gradient: "from-emerald-400 via-teal-500 to-cyan-500",
    icon: <Star className="text-yellow-300 w-4 h-4" />
  },
  {
    title: "Nâng tầm tư duy và kỹ năng viết Văn",
    subtitle: "Hàng ngàn bài viết được chọn lọc và kiểm duyệt kỹ lưỡng",
    gradient: "from-orange-400 via-red-500 to-rose-500",
    icon: <Flame className="text-yellow-300 w-4 h-4" />
  },
  {
    title: "Góc ôn thi Ngữ Văn toàn diện THCS",
    subtitle: "Lập dàn ý, phân tích tác phẩm và bí kíp điểm cao",
    gradient: "from-fuchsia-500 via-purple-500 to-indigo-500",
    icon: <Sparkles className="text-yellow-300 w-4 h-4" />
  }
]

// 4 Hướng xoay của Rubik
const DIRS = ['up', 'down', 'left', 'right']

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
  const [activeIndex, setActiveIndex] = useState(0)
  const [nextIndex, setNextIndex] = useState<number | null>(null)
  const [dir, setDir] = useState('up')
  const [isAnimating, setIsAnimating] = useState(false)
  const [isPaused, setIsPaused] = useState(false)

  // Tốc độ lật 3 giây
  useEffect(() => {
    if (isPaused || isAnimating) return;
    const timer = setInterval(() => {
      triggerNext();
    }, 3000); 
    return () => clearInterval(timer);
  }, [isPaused, isAnimating, activeIndex]);

  // Logic xoay tứ phía ngẫu nhiên
  const triggerNext = (specificIndex: number | null = null) => {
    if (isAnimating) return;
    const nextIdx = specificIndex !== null ? specificIndex : (activeIndex + 1) % RUBIK_FACES.length;
    if (nextIdx === activeIndex) return;

    const randomDir = DIRS[Math.floor(Math.random() * DIRS.length)];
    setDir(randomDir);
    setNextIndex(nextIdx);
    
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
         setIsAnimating(true);
      });
    });
  };

  useEffect(() => {
    if (isAnimating) {
      const timer = setTimeout(() => {
        setIsAnimating(false);
        setActiveIndex(nextIndex!);
        setNextIndex(null);
      }, 500); 
      return () => clearTimeout(timer);
    }
  }, [isAnimating, nextIndex]);

  const getNextFaceTransform = (direction: string) => {
    switch(direction) {
      case 'left': return 'rotateY(90deg) translateZ(200px)';
      case 'right': return 'rotateY(-90deg) translateZ(200px)';
      case 'up': return 'rotateX(-90deg) translateZ(200px)';
      case 'down': return 'rotateX(90deg) translateZ(200px)';
      default: return '';
    }
  }

  const getContainerTransform = () => {
    if (!isAnimating) return 'rotateX(0deg) rotateY(0deg)';
    switch(dir) {
      case 'left': return 'rotateY(-90deg)';
      case 'right': return 'rotateY(90deg)';
      case 'up': return 'rotateX(90deg)';
      case 'down': return 'rotateX(-90deg)';
      default: return 'rotateX(0deg) rotateY(0deg)';
    }
  }

  // Cấu trúc 1 mặt Rubik
  const renderFace = (face: any, index: number, transformStyle: string, isInteractive: boolean) => (
    <div 
      key={index}
      // NÂNG CẤP BÓNG ĐỔ: Giảm shadow đen, thêm viền trắng mờ để khối rubik trông sáng và nổi lên
      className={`absolute inset-0 w-full h-full rounded-[40px] shadow-[0_25px_50px_rgba(0,0,0,0.15),inset_0_2px_4px_rgba(255,255,255,0.4)] p-6 md:p-12 flex flex-col items-center justify-center text-center bg-gradient-to-br ${face.gradient} backdrop-blur-xl border border-solid border-white/40`}
      style={{ 
         transform: transformStyle, 
         backfaceVisibility: 'hidden',
         pointerEvents: isInteractive ? 'auto' : 'none'
      }}
    >
      {/* Huy hiệu (Badge) sáng sủa */}
      <div className="inline-flex items-center gap-2 px-5 py-2 rounded-full border border-solid border-white/50 bg-white/25 text-white text-xs md:text-sm font-extrabold mb-6 shadow-sm max-w-full overflow-hidden backdrop-blur-md">
        {face.icon}
        <span className="whitespace-nowrap overflow-hidden text-ellipsis drop-shadow-sm">{face.subtitle}</span>
      </div>

      <h1 className="text-xl sm:text-2xl md:text-3xl lg:text-[2.5rem] font-black text-white tracking-tight mb-10 drop-shadow-lg w-full px-2 whitespace-nowrap overflow-hidden text-ellipsis leading-tight">
        {face.title}
      </h1>

      <div className="w-full max-w-2xl relative mt-auto mb-6" ref={isInteractive ? searchContainerRef : null}>
        <form onSubmit={handleSearchSubmit} className="relative flex items-center w-full group">
          <div className="absolute inset-0 bg-white/30 rounded-full blur-md group-hover:bg-white/40 transition-colors"></div>
          <Search className="absolute left-6 w-5 h-5 text-white/90 z-10" />
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
            onBlur={() => setTimeout(() => setIsPaused(false), 200)}
            placeholder="Nhập tên bài văn, tác phẩm..."
            className="w-full pl-14 pr-[110px] py-4 rounded-full border border-solid border-white/50 bg-white/20 backdrop-blur-lg text-white placeholder-white/80 outline-none focus:bg-white/30 focus:border-white transition-all shadow-[inset_0_2px_4px_rgba(0,0,0,0.1)] relative z-10 font-bold text-sm md:text-base"
          />
          <button 
            type="submit"
            className="absolute right-2.5 py-2.5 px-6 bg-white text-blue-700 font-extrabold text-sm rounded-full shadow-lg hover:shadow-xl hover:scale-105 transition-all z-10"
          >
            Tìm kiếm
          </button>
        </form>

        {showSuggestions && searchSuggestions.length > 0 && isInteractive && (
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
                <span className="text-slate-700 font-bold line-clamp-1">{s.title}</span>
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="flex justify-center gap-2">
        {RUBIK_FACES.map((_, dotIdx) => (
          <button 
            key={dotIdx} 
            onClick={() => triggerNext(dotIdx)}
            className={`h-1.5 rounded-full transition-all duration-500 ${(isAnimating ? nextIndex : activeIndex) === dotIdx ? 'w-8 bg-white shadow-[0_0_10px_rgba(255,255,255,0.9)]' : 'w-2 bg-white/40 hover:bg-white/80'}`}
          />
        ))}
      </div>
    </div>
  )

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

      <div 
        className="relative w-full max-w-4xl h-[400px] animate-floating"
        style={{ perspective: '2500px' }}
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
      >
        <div 
          className={`w-full h-full relative ${isAnimating ? 'transition-transform duration-500 ease-[cubic-bezier(0.25,1,0.5,1)]' : ''}`}
          style={{
            transformStyle: 'preserve-3d',
            transform: `translateZ(-200px) ${getContainerTransform()}`
          }}
        >
          {renderFace(RUBIK_FACES[activeIndex], activeIndex, 'rotateX(0deg) rotateY(0deg) translateZ(200px)', !isAnimating)}
          {nextIndex !== null && renderFace(RUBIK_FACES[nextIndex], nextIndex, getNextFaceTransform(dir), false)}
        </div>
      </div>
    </div>
  )
}