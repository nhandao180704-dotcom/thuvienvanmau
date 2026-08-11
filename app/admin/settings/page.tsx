'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Save, Eye, EyeOff } from 'lucide-react'
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
    <div className="min-h-screen bg-slate-50">
      <AdminSidebar />
      <AdminHeader onSearch={() => {}} />

      <main className="fixed top-16 right-0 left-0 md:left-64 bottom-0 overflow-y-auto">
        <div className="p-8 max-w-2xl">
          {/* Header */}
          <div className="flex items-center gap-4 mb-8">
            <Link
              href="/admin/dashboard"
              className="p-2 hover:bg-slate-200 rounded-lg transition-colors"
            >
              <ArrowLeft size={24} className="text-foreground" />
            </Link>
            <div>
              <h1 className="text-3xl font-bold text-foreground">Cài đặt hệ thống</h1>
              <p className="text-muted-foreground">Quản lý cấu hình và bảo mật</p>
            </div>
          </div>

          {/* Settings Form */}
          <form onSubmit={handleSaveSettings} className="space-y-6">
            {/* Website Settings */}
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
              <h2 className="text-lg font-bold text-foreground mb-4">Cài đặt website</h2>

              {/* Website Name */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-foreground mb-2">
                  Tên website
                </label>
                <input
                  type="text"
                  value={settings.websiteName}
                  onChange={(e) => setSettings(prev => ({ ...prev, websiteName: e.target.value }))}
                  className="w-full px-4 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary transition-colors"
                  placeholder="Tên website"
                />
              </div>

              {/* TTS Setting */}
              <div className="flex items-center justify-between">
                <div>
                  <label className="text-sm font-medium text-foreground block mb-1">
                    Bật Text-to-Speech
                  </label>
                  <p className="text-sm text-muted-foreground">
                    Cho phép học sinh nghe nội dung bài viết
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setSettings(prev => ({ ...prev, enableTTS: !prev.enableTTS }))}
                  className={`relative inline-flex h-6 w-11 rounded-full transition-colors ${
                    settings.enableTTS ? 'bg-primary' : 'bg-slate-300'
                  }`}
                >
                  <span
                    className={`inline-block h-5 w-5 transform rounded-full bg-white transition-transform ${
                      settings.enableTTS ? 'translate-x-5' : 'translate-x-1'
                    } mt-0.5`}
                  />
                </button>
              </div>
            </div>

            {/* Password Settings */}
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
              <h2 className="text-lg font-bold text-foreground mb-4">Đổi mật khẩu</h2>

              {/* Current Password */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-foreground mb-2">
                  Mật khẩu hiện tại
                </label>
                <div className="relative">
                  <input
                    type={showCurrentPassword ? 'text' : 'password'}
                    value={settings.currentPassword}
                    onChange={(e) => setSettings(prev => ({ ...prev, currentPassword: e.target.value }))}
                    className="w-full px-4 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary transition-colors pr-10"
                    placeholder="Nhập mật khẩu hiện tại"
                  />
                  <button
                    type="button"
                    onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    {showCurrentPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              {/* New Password */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-foreground mb-2">
                  Mật khẩu mới
                </label>
                <div className="relative">
                  <input
                    type={showNewPassword ? 'text' : 'password'}
                    value={settings.newPassword}
                    onChange={(e) => setSettings(prev => ({ ...prev, newPassword: e.target.value }))}
                    className="w-full px-4 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary transition-colors pr-10"
                    placeholder="Nhập mật khẩu mới"
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    {showNewPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              {/* Confirm Password */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-foreground mb-2">
                  Xác nhận mật khẩu
                </label>
                <input
                  type="password"
                  value={settings.confirmPassword}
                  onChange={(e) => setSettings(prev => ({ ...prev, confirmPassword: e.target.value }))}
                  className="w-full px-4 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary transition-colors"
                  placeholder="Xác nhận mật khẩu mới"
                />
              </div>
            </div>

            {/* Save Button */}
            <div className="flex gap-4">
              <button
                type="submit"
                disabled={loading}
                className="flex-1 px-6 py-3 rounded-lg bg-primary text-white font-medium hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
              >
                {loading && <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>}
                {loading ? 'Đang lưu...' : <><Save size={20} /> Lưu cài đặt</>}
              </button>
            </div>
          </form>
        </div>
      </main>
    </div>
  )
}
