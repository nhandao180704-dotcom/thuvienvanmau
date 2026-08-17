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

  // 1. TĂNG TỐC ĐỘ: Chạy nhanh hơn (mỗi 3 giây thay vì 5 giây)
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

    // Chọn ngẫu nhiên 1 trong 4 hướng xoay
    const randomDir = DIRS[Math.floor(Math.random() * DIRS.length)];
    setDir(randomDir);
    setNextIndex(nextIdx);
    
    // Kích hoạt frame CSS
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
         setIsAnimating(true);
      });
    });
  };

  // 1. TĂNG TỐC ĐỘ: Xoay lật nhanh gọn (0.5 giây)
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

  // Xác định vị trí ẩn của mặt tiếp theo (trước khi lật)
  const getNextFaceTransform = (direction: string) => {
    switch(direction) {
      case 'left': return 'rotateY(90deg) translateZ(200px)';
      case 'right': return 'rotateY(-90deg) translateZ(200px)';
      case 'up': return 'rotateX(-90deg) translateZ(200px)';
      case 'down': return 'rotateX(90deg) translateZ(200px)';
      default: return '';
    }
  }

  // Góc xoay của toàn bộ khung Container
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

  // Hàm Render cấu trúc của 1 mặt Rubik
  const renderFace = (face: any, index: number, transformStyle: string, isInteractive: boolean) => (
    <div 
      key={index}
      className={`absolute inset-0 w-full h-full rounded-[40px] shadow-[0_30px_60px_rgba(0,0,0,0.6)] p-6 md:p-12 flex flex-col items-center justify-center text-center bg-gradient-to-br ${face.gradient} backdrop-blur-xl border border-solid border-white/20`}
      style={{ 
         transform: transformStyle, 
         backfaceVisibility: 'hidden',
         pointerEvents: isInteractive ? 'auto' : 'none'
      }}
    >
      {/* 2. CHỮ 1 DÒNG: Thêm whitespace-nowrap và text-ellipsis */}
      <div className="inline-flex items-center gap-2 px-5 py-2 rounded-full border border-solid border-white/30 bg-white/10 text-white text-xs md:text-sm font-semibold mb-6 shadow-inner max-w-full overflow-hidden">
        {face.icon}
        <span className="whitespace-nowrap overflow-hidden text-ellipsis">{face.subtitle}</span>
      </div>

      <h1 className="text-xl sm:text-2xl md:text-3xl lg:text-[2.5rem] font-black text-white tracking-tight mb-10 drop-shadow-lg w-full px-2 whitespace-nowrap overflow-hidden text-ellipsis leading-tight">
        {face.title}
      </h1>

      <div className="w-full max-w-2xl relative mt-auto mb-6" ref={isInteractive ? searchContainerRef : null}>
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
            onBlur={() => setTimeout(() => setIsPaused(false), 200)}
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
                <span className="text-slate-700 font-medium line-clamp-1">{s.title}</span>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Dấu chấm chuyển trang */}
      <div className="flex justify-center gap-2">
        {RUBIK_FACES.map((_, dotIdx) => (
          <button 
            key={dotIdx} 
            onClick={() => triggerNext(dotIdx)}
            className={`h-1.5 rounded-full transition-all duration-500 ${(isAnimating ? nextIndex : activeIndex) === dotIdx ? 'w-8 bg-white shadow-[0_0_10px_rgba(255,255,255,0.8)]' : 'w-2 bg-white/30 hover:bg-white/60'}`}
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
          {/* Mặt đang hiển thị (Mặt chính) */}
          {renderFace(RUBIK_FACES[activeIndex], activeIndex, 'rotateX(0deg) rotateY(0deg) translateZ(200px)', !isAnimating)}
          
          {/* Mặt sắp hiển thị (Chỉ nạp vào DOM khi có thao tác xoay) */}
          {nextIndex !== null && renderFace(RUBIK_FACES[nextIndex], nextIndex, getNextFaceTransform(dir), false)}
        </div>
      </div>
    </div>
  )
}