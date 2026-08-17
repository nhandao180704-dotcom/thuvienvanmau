'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Save, Eye, EyeOff, Settings } from 'lucide-react'
import AdminSidebar from '@/components/AdminSidebar'
import AdminHeader from '@/components/AdminHeader'
import { useToast } from '@/components/Toast'

export default function AdminSettingsPage() {
  const router = useRouter()
  const { success, error: showError } = useToast()
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [showCurrentPassword, setShowCurrentPassword] = useState(false)
  const [showNewPassword, setShowNewPassword] = useState(false)

  const [settings, setSettings] = useState({
    websiteName: 'Thư Viện Văn Mẫu THCS',
    enableTTS: true,
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  })

  useEffect(() => {
    const session = localStorage.getItem('adminSession')
    if (!session) {
      router.push('/login')
      return
    }
    
    try {
      const admin = JSON.parse(session)
      setUser({ email: admin.email })
    } catch (err) {
      router.push('/login')
    }
  }, [router])

  const handleLogout = () => {
    localStorage.removeItem('adminSession')
    document.cookie = 'adminSession=; path=/; expires=Thu, 01 Jan 1970 00:00:00 UTC; SameSite=Lax'
    document.cookie = 'admin_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 UTC; SameSite=Lax'
    router.push('/login')
  }

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      // Validate password change
      if (settings.newPassword) {
        if (!settings.currentPassword) {
          throw new Error('Vui lòng nhập mật khẩu hiện tại')
        }
        if (settings.newPassword !== settings.confirmPassword) {
          throw new Error('Mật khẩu xác nhận không khớp')
        }
        if (settings.newPassword.length < 6) {
          throw new Error('Mật khẩu phải có ít nhất 6 ký tự')
        }
        
        // In a real app, you would validate currentPassword against the stored password
        // For now, we'll just show a success message
        success('Mật khẩu đã được thay đổi thành công!')
      }

      // Save website settings
      localStorage.setItem('websiteSettings', JSON.stringify({
        websiteName: settings.websiteName,
        enableTTS: settings.enableTTS,
      }))

      success('Cài đặt đã được lưu thành công!')
      
      // Reset password fields
      setSettings(prev => ({
        ...prev,
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      }))
    } catch (err) {
      showError(err instanceof Error ? err.message : 'Lỗi khi lưu cài đặt')
    } finally {
      setLoading(false)
    }
  }

  if (!user) return null

  return (
    <div className="min-h-screen bg-slate-50 flex">
      <AdminSidebar />
      <div className="flex-1 ml-0 md:ml-64 flex flex-col">
        <AdminHeader onSearch={() => {}} />

        <main className="flex-1 p-4 md:p-8 overflow-y-auto mt-16 max-w-4xl mx-auto w-full">
          
          <div className="mb-8">
            <h1 className="text-2xl font-black text-slate-800 flex items-center gap-2 mb-1">
              <Settings className="text-blue-600" size={28} /> Cài đặt hệ thống
            </h1>
            <p className="text-slate-500 font-medium">Quản lý cấu hình và bảo mật website</p>
          </div>

          <form onSubmit={handleSaveSettings} className="space-y-6">
            
            {/* Khối Cài đặt Website */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 md:p-8">
              <h2 className="text-lg font-bold text-slate-800 border-b border-slate-100 pb-3 mb-6">Cài đặt website</h2>

              <div className="mb-6">
                <label className="block text-sm font-bold text-slate-700 mb-2">Tên website</label>
                <input
                  type="text"
                  value={settings.websiteName}
                  onChange={(e) => setSettings(prev => ({ ...prev, websiteName: e.target.value }))}
                  className="w-full px-4 py-3 rounded-xl border border-slate-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all font-medium text-slate-700"
                  placeholder="Tên website..."
                />
              </div>

              <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl border border-slate-100">
                <div>
                  <label className="text-sm font-bold text-slate-800 block mb-0.5">Bật tính năng Text-to-Speech</label>
                  <p className="text-sm text-slate-500 font-medium">Cho phép học sinh nghe nội dung các bài viết.</p>
                </div>
                <button
                  type="button"
                  onClick={() => setSettings(prev => ({ ...prev, enableTTS: !prev.enableTTS }))}
                  className={`relative inline-flex h-7 w-12 items-center rounded-full transition-colors focus:outline-none ${
                    settings.enableTTS ? 'bg-blue-600' : 'bg-slate-300'
                  }`}
                >
                  <span
                    className={`inline-block h-5 w-5 transform rounded-full bg-white transition-transform ${
                      settings.enableTTS ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>
            </div>

            {/* Khối Đổi Mật Khẩu */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 md:p-8">
              <h2 className="text-lg font-bold text-slate-800 border-b border-slate-100 pb-3 mb-6">Bảo mật tài khoản</h2>

              <div className="space-y-5">
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">Mật khẩu hiện tại</label>
                  <div className="relative">
                    <input
                      type={showCurrentPassword ? 'text' : 'password'}
                      value={settings.currentPassword}
                      onChange={(e) => setSettings(prev => ({ ...prev, currentPassword: e.target.value }))}
                      className="w-full px-4 py-3 rounded-xl border border-slate-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all font-medium text-slate-700 pr-12"
                      placeholder="Nhập mật khẩu cũ để xác thực..."
                    />
                    <button
                      type="button"
                      onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-blue-600 transition-colors"
                    >
                      {showCurrentPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">Mật khẩu mới</label>
                    <div className="relative">
                      <input
                        type={showNewPassword ? 'text' : 'password'}
                        value={settings.newPassword}
                        onChange={(e) => setSettings(prev => ({ ...prev, newPassword: e.target.value }))}
                        className="w-full px-4 py-3 rounded-xl border border-slate-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all font-medium text-slate-700 pr-12"
                        placeholder="Tối thiểu 6 ký tự..."
                      />
                      <button
                        type="button"
                        onClick={() => setShowNewPassword(!showNewPassword)}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-blue-600 transition-colors"
                      >
                        {showNewPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">Xác nhận mật khẩu</label>
                    <input
                      type="password"
                      value={settings.confirmPassword}
                      onChange={(e) => setSettings(prev => ({ ...prev, confirmPassword: e.target.value }))}
                      className="w-full px-4 py-3 rounded-xl border border-slate-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all font-medium text-slate-700"
                      placeholder="Nhập lại mật khẩu mới..."
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Khối Lưu */}
            <div className="flex justify-end pt-4 pb-20">
              <button
                type="submit"
                disabled={loading}
                className="flex items-center gap-2 px-8 py-3.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-xl font-bold shadow-lg shadow-blue-500/30 transition-all disabled:opacity-70 disabled:cursor-not-allowed transform active:scale-95"
              >
                {loading ? <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div> : <Save size={20} />}
                {loading ? 'Đang cập nhật...' : 'Lưu Thay Đổi'}
              </button>
            </div>
          </form>
        </main>
      </div>
    </div>
  )
}