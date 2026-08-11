'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase-client'
import { Mail, Lock, Loader2, ArrowLeft } from 'lucide-react'
import Link from 'next/link'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isSignUp, setIsSignUp] = useState(false)
  const [message, setMessage] = useState('')
  const router = useRouter()

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setMessage('')

    try {
      if (isSignUp) {
        const { error } = await supabase.auth.signUp({ email, password })
        if (error) throw error
        setMessage('Đăng ký thành công! Hãy kiểm tra email để xác nhận.')
        setIsLoading(false)
      } else {
        // 1. Đăng nhập qua Supabase
        const { data, error } = await supabase.auth.signInWithPassword({ 
          email: email.trim(), 
          password 
        })
        
        if (error) throw error
        
        if (data?.session) {
          // --- FIX TRIỆT ĐỂ: CẤP THẺ BÀI CHO ADMIN ---
          const userEmail = email.trim()
          
          if (userEmail === 'admin@thuvien.edu.vn') {
            const adminData = JSON.stringify({ email: userEmail, role: 'admin' })
            
            // Lưu vào LocalStorage (cho các trang Client như Settings đọc)
            localStorage.setItem('adminSession', adminData)
            
            // Lưu vào Cookie (Cho Bức tường bảo vệ Middleware đọc)
            // Hạn sử dụng 1 năm (31536000 giây)
            document.cookie = `adminSession=${encodeURIComponent(adminData)}; path=/; max-age=31536000; SameSite=Lax`
            document.cookie = `admin_token=${data.session.access_token}; path=/; max-age=31536000; SameSite=Lax`
            
            // Đợi 1 chút để trình duyệt điện thoại kịp ghi Cookie
            await new Promise(resolve => setTimeout(resolve, 500))
            
            // Dùng window.location.replace để chuyển trang thẳng tay
            window.location.replace('/admin/dashboard')
          } else {
            await new Promise(resolve => setTimeout(resolve, 500))
            window.location.replace('/')
          }
        }
      }
    } catch (error: any) {
      setMessage(error.message || 'Có lỗi xảy ra, vui lòng kiểm tra lại thông tin!')
      setIsLoading(false)
    }
  }

  const handleGoogleLogin = async () => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/`,
        },
      })
      if (error) throw error
    } catch (error: any) {
      setMessage('Lỗi đăng nhập Google: ' + error.message)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-600 via-indigo-700 to-purple-800 flex items-center justify-center p-4">
      {/* Hiệu ứng Vòng tròn trang trí */}
      <div className="absolute top-20 left-20 w-72 h-72 bg-white/10 rounded-full blur-3xl animate-pulse"></div>
      <div className="absolute bottom-20 right-20 w-96 h-96 bg-blue-400/20 rounded-full blur-3xl animate-bounce" style={{ animationDuration: '7s' }}></div>

      <div className="w-full max-w-md bg-white/10 backdrop-blur-xl border border-white/20 rounded-[2rem] shadow-2xl p-8 relative z-10">
        <Link href="/" className="inline-flex items-center gap-2 text-white/70 hover:text-white transition-colors mb-8">
          <ArrowLeft size={18} /> Về trang chủ
        </Link>

        <h2 className="text-3xl font-black text-white text-center mb-2">
          {isSignUp ? 'Tạo Tài Khoản' : 'Chào Mừng Trở Lại'}
        </h2>
        <p className="text-blue-200 text-center mb-8">
          {isSignUp ? 'Tham gia hệ sinh thái học tập ngay hôm nay' : 'Đăng nhập để lưu trữ bài văn mẫu yêu thích'}
        </p>

        {message && (
          <div className={`p-4 rounded-xl mb-6 text-sm font-semibold ${message.includes('thành công') ? 'bg-emerald-500/20 text-emerald-300' : 'bg-red-500/20 text-red-300'}`}>
            {message}
          </div>
        )}

        <form onSubmit={handleAuth} className="space-y-5">
          <div className="relative">
            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-white/50" size={20} />
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Nhập email của bạn..."
              className="w-full pl-12 pr-4 py-4 rounded-2xl bg-white/5 border border-white/10 text-white placeholder-white/50 focus:outline-none focus:bg-white/10 focus:border-white/30 transition-all"
              required
            />
          </div>
          
          <div className="relative">
            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-white/50" size={20} />
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Nhập mật khẩu..."
              className="w-full pl-12 pr-4 py-4 rounded-2xl bg-white/5 border border-white/10 text-white placeholder-white/50 focus:outline-none focus:bg-white/10 focus:border-white/30 transition-all"
              required
            />
          </div>

          <button 
            type="submit" 
            disabled={isLoading}
            className="w-full py-4 bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-400 hover:to-indigo-400 text-white font-bold rounded-2xl shadow-lg hover:shadow-blue-500/50 transition-all flex justify-center items-center gap-2"
          >
            {isLoading ? <Loader2 className="animate-spin" /> : (isSignUp ? 'Đăng ký ngay' : 'Đăng nhập')}
          </button>
        </form>

        {/* Đường phân cách */}
        <div className="flex items-center my-6">
          <div className="flex-1 border-t border-white/10"></div>
          <span className="px-3 text-white/50 text-sm font-medium">hoặc</span>
          <div className="flex-1 border-t border-white/10"></div>
        </div>

        {/* Nút Đăng nhập bằng Google */}
        <button 
          type="button" 
          onClick={handleGoogleLogin}
          className="w-full flex items-center justify-center gap-3 bg-white text-slate-700 font-bold py-3.5 px-4 rounded-2xl hover:bg-slate-50 transition-colors shadow-sm border border-slate-200"
        >
          <img src="https://www.svgrepo.com/show/475656/google-color.svg" alt="Google" className="w-5 h-5" />
          Đăng nhập bằng Google
        </button>

        <div className="mt-6 text-center text-white/60">
          {isSignUp ? 'Đã có tài khoản?' : 'Chưa có tài khoản?'}
          <button 
            type="button"
            onClick={() => { setIsSignUp(!isSignUp); setMessage(''); }}
            className="ml-2 text-white font-bold hover:underline"
          >
            {isSignUp ? 'Đăng nhập' : 'Tạo tài khoản'}
          </button>
        </div>
      </div>
    </div>
  )
}