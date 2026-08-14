'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { BookmarkPlus, PenTool, BookOpen, Menu, X, LogIn, LogOut, LayoutDashboard } from 'lucide-react'
import { supabase } from '@/lib/supabase-client'

export default function Navbar() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [user, setUser] = useState<any>(null)
  const [isAdmin, setIsAdmin] = useState(false)
  const router = useRouter()

  useEffect(() => {
    // Hàm phụ trợ để kiểm tra quyền từ DB
    const checkUserRole = async (currentUser: any) => {
      if (!currentUser) {
        setIsAdmin(false)
        return
      }
      
      try {
        const { data: profile } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', currentUser.id)
          .single()
          
        setIsAdmin(profile?.role === 'admin')
      } catch (error) {
        console.error("Lỗi khi lấy quyền người dùng:", error)
        setIsAdmin(false)
      }
    }

    // Lấy thông tin user khi load trang
    const getUser = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (session?.user) {
        setUser(session.user)
        await checkUserRole(session.user)
      }
    }
    
    getUser()

    // Lắng nghe sự kiện đăng nhập/đăng xuất
    const { data: authListener } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (session?.user) {
        setUser(session.user)
        await checkUserRole(session.user)
      } else {
        setUser(null)
        setIsAdmin(false)
      }
    })

    return () => { authListener.subscription.unsubscribe() }
  }, [])

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/')
    router.refresh()
  }

  return (
    <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-200/80 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20">
          
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-blue-500/20 group-hover:scale-105 transition-transform">
              <BookOpen size={22} className="sm:w-6 sm:h-6" />
            </div>
            <div>
              <h1 className="text-lg sm:text-xl font-extrabold text-slate-900 tracking-tight leading-none mb-0.5">Thư Viện Văn Mẫu</h1>
              <p className="text-[10px] sm:text-xs text-slate-500 font-semibold tracking-wide uppercase">THCS</p>
            </div>
          </Link>

          {/* Các nút điều hướng - Desktop */}
          <div className="hidden md:flex items-center gap-4 shrink-0">
            {isAdmin && (
              <Link 
                href="/admin/dashboard" 
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-900 text-white font-bold transition-all shadow-sm hover:scale-105"
              >
                <LayoutDashboard size={18} />
                <span>Quản trị viên</span>
              </Link>
            )}

            <Link 
              href="/saved" 
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white border border-slate-200 hover:bg-slate-50 hover:text-blue-600 hover:border-blue-300 text-slate-600 font-bold transition-all shadow-sm"
            >
              <BookmarkPlus size={18} />
              <span>Lưu trữ</span>
            </Link>
            
            {user ? (
              <button 
                onClick={handleLogout}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-red-50 hover:bg-red-100 text-red-600 font-bold transition-all"
              >
                <LogOut size={18} />
                <span>Đăng xuất</span>
              </button>
            ) : (
              <Link 
                href="/login" 
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold transition-all shadow-lg shadow-blue-500/25 active:scale-95"
              >
                <LogIn size={18} />
                <span>Đăng nhập</span>
              </Link>
            )}
          </div>

          {/* Nút Hamburger Menu - Mobile */}
          <div className="md:hidden flex items-center">
            <button 
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-2 rounded-lg bg-slate-100 text-slate-600 hover:bg-slate-200 transition-colors"
            >
              {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </div>

      {/* Menu Mobile */}
      {isMobileMenuOpen && (
        <div className="md:hidden absolute top-full left-0 w-full bg-white border-b border-slate-200 shadow-xl py-4 px-4 flex flex-col gap-3 animate-in slide-in-from-top-2 duration-200">
          {isAdmin && (
            <Link 
              href="/admin/dashboard" 
              onClick={() => setIsMobileMenuOpen(false)}
              className="flex items-center gap-3 px-4 py-3 rounded-xl bg-slate-900 text-white font-bold"
            >
              <LayoutDashboard size={20} />
              Quản trị viên
            </Link>
          )}
          <Link 
            href="/saved" 
            onClick={() => setIsMobileMenuOpen(false)}
            className="flex items-center gap-3 px-4 py-3 rounded-xl bg-slate-50 text-slate-700 font-bold"
          >
            <BookmarkPlus size={20} className="text-blue-500" />
            Lưu trữ cá nhân
          </Link>
          
          {user ? (
            <button 
              onClick={() => { handleLogout(); setIsMobileMenuOpen(false); }}
              className="flex items-center gap-3 px-4 py-3 rounded-xl bg-red-50 text-red-600 font-bold w-full text-left"
            >
              <LogOut size={20} />
              Đăng xuất
            </button>
          ) : (
            <Link 
              href="/login"
              onClick={() => setIsMobileMenuOpen(false)} 
              className="flex items-center gap-3 px-4 py-3 rounded-xl bg-blue-600 text-white font-bold shadow-md"
            >
              <LogIn size={20} />
              Đăng nhập
            </Link>
          )}
        </div>
      )}
    </nav>
  )
}