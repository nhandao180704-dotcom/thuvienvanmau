'use client'

import { useState, useRef, useEffect } from 'react'
import { Bell, MessageSquare, FileText, Sparkles, Check, CheckCircle2 } from 'lucide-react'

export default function NotificationBell() {
  const [isOpen, setIsOpen] = useState(false)
  
  // Dữ liệu mẫu (sau này bạn có thể fetch từ Supabase)
  const [notifications, setNotifications] = useState([
    {
      id: 1,
      title: 'Có bình luận mới',
      message: 'Một học sinh vừa bình luận vào bài "Dàn ý Đề thi thử vào 10".',
      time: 'Vài giây trước',
      read: false,
      icon: MessageSquare,
      color: 'text-blue-500',
      bgColor: 'bg-blue-100'
    },
    {
      id: 2,
      title: 'Hệ thống tối ưu',
      message: 'Giao diện Premium đã được cập nhật thành công.',
      time: '1 giờ trước',
      read: false,
      icon: Sparkles,
      color: 'text-amber-500',
      bgColor: 'bg-amber-100'
    },
    {
      id: 3,
      title: 'Báo cáo tuần',
      message: 'Lưu lượng truy cập tuần này tăng 25% so với tuần trước.',
      time: '1 ngày trước',
      read: true,
      icon: FileText,
      color: 'text-emerald-500',
      bgColor: 'bg-emerald-100'
    }
  ])

  const dropdownRef = useRef<HTMLDivElement>(null)
  
  const unreadCount = notifications.filter(n => !n.read).length

  // Tự động đóng dropdown khi click ra ngoài vùng thông báo
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const markAllAsRead = () => {
    setNotifications(notifications.map(n => ({ ...n, read: true })))
  }

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Nút Chuông */}
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className={`relative p-2.5 rounded-xl transition-all duration-300 focus:outline-none ${isOpen ? 'bg-blue-50 text-blue-600' : 'text-slate-500 hover:bg-slate-100'}`}
      >
        <Bell size={22} className={isOpen ? "fill-blue-100" : ""} />
        {unreadCount > 0 && (
          <span className="absolute top-2 right-2 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white animate-pulse"></span>
        )}
      </button>

      {/* Panel Dropdown Menu */}
      {isOpen && (
        <div className="absolute right-0 mt-3 w-[320px] sm:w-[380px] bg-white rounded-[24px] shadow-2xl shadow-slate-200/60 border border-slate-100 overflow-hidden z-50 origin-top-right animate-in fade-in zoom-in-95 duration-200">
          
          {/* Header Thông báo */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-slate-50 bg-slate-50/50">
            <h3 className="font-bold text-slate-800 text-base">Thông báo</h3>
            {unreadCount > 0 && (
              <button 
                onClick={markAllAsRead}
                className="flex items-center gap-1.5 text-[13px] font-semibold text-blue-600 hover:text-blue-700 transition-colors bg-blue-50 hover:bg-blue-100 px-3 py-1.5 rounded-lg"
              >
                <Check size={14} strokeWidth={2.5} />
                Đánh dấu đã đọc
              </button>
            )}
          </div>

          {/* Danh sách List */}
          <div className="max-h-[360px] overflow-y-auto overscroll-contain scrollbar-hide">
            {notifications.length > 0 ? (
              <div className="flex flex-col">
                {notifications.map((notification) => {
                  const Icon = notification.icon
                  return (
                    <div 
                      key={notification.id} 
                      className={`flex gap-4 p-5 border-b border-slate-50 transition-colors hover:bg-slate-50 cursor-pointer ${!notification.read ? 'bg-blue-50/20' : ''}`}
                    >
                      <div className={`shrink-0 w-11 h-11 flex items-center justify-center rounded-full ${notification.bgColor}`}>
                        <Icon size={20} className={notification.color} />
                      </div>
                      <div className="flex-1 space-y-1">
                        <div className="flex items-start justify-between gap-2">
                          <h4 className={`text-sm font-bold ${!notification.read ? 'text-slate-800' : 'text-slate-600'}`}>
                            {notification.title}
                          </h4>
                          {!notification.read && <span className="shrink-0 w-2 h-2 mt-1.5 bg-blue-500 rounded-full"></span>}
                        </div>
                        <p className="text-[13px] text-slate-500 leading-relaxed line-clamp-2">
                          {notification.message}
                        </p>
                        <span className="text-[11px] font-bold text-slate-400 block mt-2">
                          {notification.time}
                        </span>
                      </div>
                    </div>
                  )
                })}
              </div>
            ) : (
              <div className="p-10 text-center flex flex-col items-center justify-center">
                <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-4">
                  <CheckCircle2 size={32} className="text-slate-300" />
                </div>
                <p className="text-slate-500 font-bold">Bạn đã xem hết thông báo!</p>
                <p className="text-sm text-slate-400 mt-1">Hiện không có hoạt động nào mới.</p>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="p-2 border-t border-slate-50 bg-slate-50/50">
            <button className="w-full py-2.5 text-sm font-bold text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-colors">
              Xem toàn bộ thông báo
            </button>
          </div>
        </div>
      )}
    </div>
  )
}