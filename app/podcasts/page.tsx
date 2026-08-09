'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Play, Pause, SkipBack, SkipForward, Volume2, Heart, Search, Library, Home, ChevronLeft, MoreHorizontal, Clock, ListMusic } from 'lucide-react'

// Dữ liệu mẫu (Sau này có thể kết nối với Supabase để lấy file audio thật)
const PLAYLIST = [
  { id: 1, title: 'Phân tích nhân vật Phương Định', author: 'Lê Minh Khuê', duration: '12:45', plays: '12.4K', cover: 'bg-gradient-to-br from-purple-500 to-indigo-700' },
  { id: 2, title: 'Vẻ đẹp người lính trong Đồng Chí', author: 'Chính Hữu', duration: '08:30', plays: '8.2K', cover: 'bg-gradient-to-br from-emerald-400 to-teal-700' },
  { id: 3, title: 'Cảm nhận về đoạn trích Kiều ở lầu Ngưng Bích', author: 'Nguyễn Du', duration: '15:20', plays: '15.1K', cover: 'bg-gradient-to-br from-rose-400 to-red-700' },
  { id: 4, title: 'Ý nghĩa nhan đề Bài thơ về tiểu đội xe không kính', author: 'Phạm Tiến Duật', duration: '05:15', plays: '5.9K', cover: 'bg-gradient-to-br from-amber-400 to-orange-700' },
  { id: 5, title: 'Nghị luận xã hội: Sức mạnh của tình yêu thương', author: 'Chuyên đề NLXH', duration: '10:05', plays: '9.3K', cover: 'bg-gradient-to-br from-blue-400 to-cyan-700' },
]

export default function PodcastPage() {
  const [currentTrack, setCurrentTrack] = useState(PLAYLIST[0])
  const [isPlaying, setIsPlaying] = useState(false)
  const [progress, setProgress] = useState(35) // % giả lập thanh tiến độ

  const togglePlay = (track: any) => {
    if (currentTrack.id === track.id) {
      setIsPlaying(!isPlaying)
    } else {
      setCurrentTrack(track)
      setIsPlaying(true)
      setProgress(0)
    }
  }

  return (
    <div className="min-h-screen bg-[#121212] text-white flex font-sans selection:bg-emerald-500 selection:text-white">
      
      {/* Sidebar Trái */}
      <aside className="w-64 bg-black p-6 hidden md:flex flex-col gap-8 shrink-0 border-r border-white/5 z-10 relative">
        <Link href="/" className="flex items-center gap-3 hover:opacity-80 transition">
          <div className="w-10 h-10 bg-gradient-to-br from-emerald-400 to-emerald-600 rounded-full flex items-center justify-center font-black text-xl shadow-lg shadow-emerald-500/20">V</div>
          <span className="font-bold text-lg tracking-tight">Audio Văn Mẫu</span>
        </Link>

        <nav className="space-y-4 font-bold text-sm text-neutral-400">
          <Link href="/student/dashboard" className="flex items-center gap-4 hover:text-white transition"><Home className="w-6 h-6" /> Trang chủ</Link>
          <button className="flex items-center gap-4 hover:text-white transition"><Search className="w-6 h-6" /> Tìm kiếm</button>
          <button className="flex items-center gap-4 hover:text-white transition"><Library className="w-6 h-6" /> Thư viện của bạn</button>
        </nav>

        <div className="mt-4 pt-6 border-t border-white/10 flex-1">
          <h3 className="text-xs uppercase tracking-widest text-neutral-500 font-bold mb-4">Playlist Nổi Bật</h3>
          <ul className="space-y-3 text-sm text-neutral-400 font-medium">
            <li className="hover:text-white cursor-pointer transition">Chữa đề thi vào 10 (2025)</li>
            <li className="hover:text-white cursor-pointer transition">Tuyển tập Thơ Mới</li>
            <li className="hover:text-white cursor-pointer transition">Ru ngủ bằng Văn học</li>
            <li className="hover:text-white cursor-pointer transition">Nghị luận xã hội 200 chữ</li>
          </ul>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col h-screen overflow-hidden relative">
        {/* Lớp nền mờ ảo màu sắc lấy từ bài hát đang phát */}
        <div className={`absolute top-0 left-0 w-full h-96 opacity-20 ${currentTrack.cover} blur-3xl transition-colors duration-1000 -z-10`}></div>

        <header className="h-16 px-6 flex items-center justify-between z-10">
          <div className="flex gap-2">
            <Link href="/student/dashboard" className="w-8 h-8 rounded-full bg-black/40 flex items-center justify-center hover:bg-black/80 transition"><ChevronLeft className="w-5 h-5" /></Link>
          </div>
          <div className="flex items-center gap-3">
            <button className="text-sm font-bold text-neutral-300 hover:text-white px-4">Khám phá</button>
            <div className="w-8 h-8 rounded-full bg-neutral-800 flex items-center justify-center text-sm font-bold border border-white/10">HS</div>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto pb-32">
          {/* Header Playlist */}
          <div className="px-6 md:px-10 pt-4 pb-8 flex flex-col md:flex-row items-end gap-6">
            <div className={`w-48 h-48 md:w-60 md:h-60 shadow-2xl ${currentTrack.cover} rounded-sm flex items-center justify-center`}>
              <ListMusic className="w-24 h-24 text-white/50" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-bold tracking-widest text-white/80 mb-2 uppercase">Góc Nghe Văn</p>
              <h1 className="text-4xl md:text-6xl font-black mb-4 tracking-tighter leading-tight">Tuyển Tập <br/> Ngữ Văn 9</h1>
              <p className="text-neutral-300 font-medium text-sm">Lắng nghe và cảm nhận vẻ đẹp của văn học qua giọng đọc truyền cảm. Dành riêng cho học sinh ôn thi vào 10.</p>
              <div className="mt-4 text-sm font-bold flex items-center gap-2">
                <span className="text-emerald-400">Admin</span>
                <span className="text-neutral-500">•</span>
                <span className="text-neutral-400">5 bài nghe, khoảng 1 giờ</span>
              </div>
            </div>
          </div>

          {/* Nút Play to */}
          <div className="px-6 md:px-10 py-6 flex items-center gap-6">
            <button 
              onClick={() => togglePlay(currentTrack)}
              className="w-14 h-14 bg-emerald-500 rounded-full flex items-center justify-center hover:scale-105 transition hover:bg-emerald-400 shadow-xl"
            >
              {isPlaying ? <Pause className="w-7 h-7 text-black fill-black" /> : <Play className="w-7 h-7 text-black fill-black ml-1" />}
            </button>
            <button className="text-neutral-400 hover:text-white transition"><Heart className="w-8 h-8" /></button>
            <button className="text-neutral-400 hover:text-white transition"><MoreHorizontal className="w-8 h-8" /></button>
          </div>

          {/* Danh sách bài hát */}
          <div className="px-6 md:px-10 pb-10">
            <div className="grid grid-cols-[auto_1fr_auto_auto] gap-4 px-4 py-2 border-b border-white/10 text-sm font-bold text-neutral-400 mb-4">
              <div className="w-8 text-center">#</div>
              <div>TIÊU ĐỀ</div>
              <div className="hidden md:block w-24 text-right">LƯỢT NGHE</div>
              <div className="w-12 text-right"><Clock className="w-4 h-4 inline" /></div>
            </div>

            <div className="space-y-1">
              {PLAYLIST.map((track, index) => {
                const isCurrent = currentTrack.id === track.id
                return (
                  <div 
                    key={track.id} 
                    onClick={() => togglePlay(track)}
                    className={`grid grid-cols-[auto_1fr_auto_auto] gap-4 px-4 py-3 rounded-md items-center cursor-pointer group hover:bg-white/10 transition ${isCurrent ? 'bg-white/10' : ''}`}
                  >
                    <div className="w-8 text-center text-neutral-400 group-hover:text-white font-medium">
                      {isCurrent && isPlaying ? (
                        <div className="flex gap-[2px] justify-center h-4 items-end">
                           <div className="w-1 bg-emerald-500 h-2 animate-bounce" style={{animationDelay: '0ms'}}></div>
                           <div className="w-1 bg-emerald-500 h-4 animate-bounce" style={{animationDelay: '150ms'}}></div>
                           <div className="w-1 bg-emerald-500 h-3 animate-bounce" style={{animationDelay: '300ms'}}></div>
                        </div>
                      ) : (
                        <span className={isCurrent ? 'text-emerald-500 font-bold' : ''}>{index + 1}</span>
                      )}
                    </div>
                    <div>
                      <p className={`font-bold text-base truncate ${isCurrent ? 'text-emerald-500' : 'text-white'}`}>{track.title}</p>
                      <p className="text-sm text-neutral-400 group-hover:text-neutral-300">{track.author}</p>
                    </div>
                    <div className="hidden md:block w-24 text-right text-sm text-neutral-400">{track.plays}</div>
                    <div className="w-12 text-right text-sm text-neutral-400">{track.duration}</div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>

        {/* Thanh Trình Phát Dưới Cùng (Player Bar) */}
        <div className="h-24 bg-neutral-900 border-t border-neutral-800 absolute bottom-0 left-0 w-full flex items-center justify-between px-4 md:px-6 z-50">
          <div className="flex items-center gap-4 w-1/3 min-w-[200px]">
             <div className={`w-14 h-14 ${currentTrack.cover} rounded shadow flex items-center justify-center shrink-0`}>
               <ListMusic className="w-6 h-6 text-white/50" />
             </div>
             <div className="truncate">
                <p className="text-sm font-bold text-white truncate hover:underline cursor-pointer">{currentTrack.title}</p>
                <p className="text-xs text-neutral-400 truncate hover:underline cursor-pointer">{currentTrack.author}</p>
             </div>
             <button className="text-neutral-400 hover:text-emerald-500 transition hidden sm:block"><Heart className="w-4 h-4" /></button>
          </div>

          <div className="flex flex-col items-center justify-center flex-1 max-w-2xl px-4">
            <div className="flex items-center gap-6 mb-2">
              <button className="text-neutral-400 hover:text-white transition"><SkipBack className="w-5 h-5 fill-current" /></button>
              <button 
                onClick={() => setIsPlaying(!isPlaying)}
                className="w-8 h-8 bg-white rounded-full flex items-center justify-center hover:scale-105 transition text-black"
              >
                 {isPlaying ? <Pause className="w-4 h-4 fill-current" /> : <Play className="w-4 h-4 fill-current ml-1" />}
              </button>
              <button className="text-neutral-400 hover:text-white transition"><SkipForward className="w-5 h-5 fill-current" /></button>
            </div>
            <div className="w-full flex items-center gap-2 text-xs text-neutral-400 font-medium">
              <span>04:12</span>
              <div className="h-1 bg-neutral-700 rounded-full flex-1 group cursor-pointer relative flex items-center">
                <div className="h-1 bg-white group-hover:bg-emerald-500 rounded-full" style={{ width: `${progress}%` }}></div>
                <div className="w-3 h-3 bg-white rounded-full shadow absolute opacity-0 group-hover:opacity-100 transition" style={{ left: `${progress}%`, transform: 'translateX(-50%)' }}></div>
              </div>
              <span>{currentTrack.duration}</span>
            </div>
          </div>

          <div className="w-1/3 flex justify-end items-center gap-3 min-w-[120px]">
            <button className="text-neutral-400 hover:text-white transition hidden md:block"><Volume2 className="w-5 h-5" /></button>
            <div className="w-24 h-1 bg-neutral-700 rounded-full group cursor-pointer flex items-center relative hidden md:flex">
                <div className="h-1 bg-white group-hover:bg-emerald-500 rounded-full w-2/3"></div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}