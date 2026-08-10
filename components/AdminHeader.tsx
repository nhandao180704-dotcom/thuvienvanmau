'use client'

import { useState, useEffect } from 'react'
import { Search, Bell, User, Settings, LogOut, ChevronDown } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase-client'

interface AdminHeaderProps {
  onSearch?: (query: string) => void
}

export default function AdminHeader({ onSearch }: AdminHeaderProps) {
  const [showDropdown, setShowDropdown] = useState(false)
  const [adminEmail, setAdminEmail] = useState('Đang tải...')
  const router = useRouter()

  useEffect(() => {
    // Tự động lấy email thật của Admin từ Supabase
    const fetchAdminInfo = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (session?.user?.email) {
        setAdminEmail(session.user.email)
      }
    }
    fetchAdminInfo()
  }, [])

  const handleLogout = async () => {
    setShowDropdown(false)
    // 1. Đăng xuất an toàn khỏi hệ thống Supabase
    await supabase.auth.signOut()
    // 2. Chuyển hướng về trang chủ hoặc trang đăng nhập chung
    router.push('/login')
  }

  return (
    <header className="fixed top-0 right-0 left-64 h-16 bg-white border-b border-slate-200 shadow-sm z-30">
      <div className="h-full px-6 flex items-center justify-between gap-6">
        {/* Search Bar */}
        <div className="flex-1 max-w-xs">
          <div className="relative">
            <Search size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              placeholder="Tìm bài viết..."
              onChange={(e) => onSearch?.(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-lg border border-slate-200 bg-slate-50 text-sm placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:bg-white transition-colors"
            />
          </div>
        </div>

        {/* Right Section */}
        <div className="flex items-center gap-4">
          {/* Notification */}
          <button className="relative p-2 text-muted-foreground hover:bg-slate-50 rounded-lg transition-colors">
            <Bell size={20} />
            <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
          </button>

          {/* Admin Profile with Dropdown */}
          <div className="relative pl-4 border-l border-slate-200">
            <button
              onClick={() => setShowDropdown(!showDropdown)}
              className="flex items-center gap-3 hover:bg-slate-50 rounded-lg px-3 py-2 transition-colors"
            >
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center text-white font-bold">
                {adminEmail !== 'Đang tải...' ? adminEmail.charAt(0).toUpperCase() : 'A'}
              </div>
              <div className="hidden sm:block text-left">
                <p className="text-sm font-bold text-slate-800">Quản trị viên</p>
                <p className="text-xs text-slate-500">{adminEmail}</p>
              </div>
              <ChevronDown size={16} className={`text-slate-400 transition-transform ${showDropdown ? 'rotate-180' : ''}`} />
            </button>

            {/* Dropdown Menu */}
            {showDropdown && (
              <div className="absolute top-full right-0 mt-2 w-48 bg-white rounded-xl border border-slate-200 shadow-xl z-50 animate-in fade-in slide-in-from-top-2 duration-200 overflow-hidden">
                <div className="p-2 space-y-1">
                  <Link
                    href="/admin/profile"
                    className="w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm text-slate-700 hover:bg-slate-50 hover:text-blue-600 transition-colors font-medium"
                    onClick={() => setShowDropdown(false)}
                  >
                    <User size={18} />
                    <span>Hồ sơ Admin</span>
                  </Link>

                  <Link
                    href="/admin/settings"
                    className="w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm text-slate-700 hover:bg-slate-50 hover:text-blue-600 transition-colors font-medium"
                    onClick={() => setShowDropdown(false)}
                  >
                    <Settings size={18} />
                    <span>Cài đặt hệ thống</span>
                  </Link>
                  
                  <div className="h-px bg-slate-100 my-1"></div>

                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm text-red-600 hover:bg-red-50 transition-colors font-bold"
                  >
                    <LogOut size={18} />
                    <span>Đăng xuất</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  )
}