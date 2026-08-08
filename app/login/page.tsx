'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Copy, Check, QrCode, Link as LinkIcon } from 'lucide-react'

export default function StudentLoginPage() {
  const router = useRouter()
  const [copied, setCopied] = useState(false)
  
  // Đã sửa thành đường link trang chủ Thư viện chính thức
  const targetUrl = 'https://thuvienvanmau.vercel.app/library'

  const handleEnterLibrary = (e: React.FormEvent) => {
    e.preventDefault()
    // Đổi '/' thành '/library' để vào thẳng thư viện
    router.push('/library')
  }

  const handleCopy = () => {
    navigator.clipboard.writeText(targetUrl)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="min-h-screen bg-linear-to-br from-blue-50 to-indigo-50 flex items-center justify-center p-4 md:p-8">
      
      {/* Khung chứa mở rộng tối đa (max-w-6xl), chia 3 cột trên Máy tính */}
      <div className="w-full max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6 items-stretch">
        
        {/* ================= PHẦN 1 (Chiếm 1/3): KHUNG XANH CHÀO MỪNG ================= */}
        <div className="md:col-span-1 bg-white rounded-2xl shadow-xl overflow-hidden border border-slate-100 flex flex-col">
          <div className="bg-primary p-8 text-center text-white">
            <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4 backdrop-blur-sm border border-white/30">
              <span className="text-4xl">📖</span>
            </div>
            <h1 className="text-2xl font-bold mb-1">Chào mừng đến với</h1>
            <h2 className="text-lg text-primary-foreground/80 font-medium">Thư Viện Văn Mẫu THCS</h2>
          </div>
          
          <div className="p-8 text-center flex-1 flex flex-col justify-center">
            <p className="text-slate-600 mb-8">
              Hệ thống học tập, tham khảo và ôn luyện Ngữ Văn dành riêng cho học sinh cấp Trung học Cơ sở.
            </p>

            <form onSubmit={handleEnterLibrary}>
              <button
                type="submit"
                className="w-full py-3 px-4 bg-primary hover:bg-blue-700 text-white font-bold rounded-xl transition-all transform hover:scale-[1.02] active:scale-95 shadow-md flex items-center justify-center gap-2"
              >
                <span>Vào Thư Viện Ngay</span>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                </svg>
              </button>
            </form>
            
            <div className="mt-8 text-sm text-slate-400 hidden md:block">
              <p>Học tập chăm chỉ, tương lai tươi sáng! ✨</p>
            </div>
          </div>
        </div>

        {/* ================= PHẦN 2 (Chiếm 2/3): KHUNG TRẮNG CHIA SẺ ================= */}
        <div className="md:col-span-2 bg-white rounded-2xl shadow-xl p-6 md:p-10 border border-slate-100 flex flex-col justify-center">
          
          <div className="text-center mb-8">
            <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-2">Chia sẻ cho bạn bè</h3>
            <p className="text-slate-600 font-medium text-lg">Chọn 1 trong 2 cách để truy cập nhanh</p>
          </div>

          {/* Chia đôi tiếp khung trắng để đặt QR và Link cạnh nhau cho cân đối */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
            
            {/* Cách 1: Mã QR */}
            <div className="bg-slate-50 p-6 rounded-xl border border-slate-100 flex flex-col items-center justify-center">
              <div className="flex items-center gap-2 text-primary font-bold mb-4">
                <QrCode size={20} />
                <span className="text-lg">Quét mã QR</span>
              </div>
              <div className="p-3 bg-white rounded-xl shadow-sm border border-slate-200 mb-4">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={`https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent(targetUrl)}&margin=10`}
                  alt="Mã QR Đăng nhập"
                  className="w-40 h-40 object-contain"
                />
              </div>
              <p className="text-sm text-slate-500 text-center">
                Mở Camera hoặc Zalo trên điện thoại để quét
              </p>
            </div>

            {/* Cách 2: Copy Link */}
            <div className="bg-slate-50 p-6 rounded-xl border border-slate-100 flex flex-col justify-center">
              <div className="flex items-center justify-center gap-2 text-primary font-bold mb-6">
                <LinkIcon size={20} />
                <span className="text-lg">Dùng đường dẫn trực tiếp</span>
              </div>
              <div className="flex flex-col gap-4">
                <div className="px-4 py-3 bg-white rounded-lg border border-slate-200 text-sm text-slate-600 truncate text-center font-medium shadow-sm">
                  {targetUrl}
                </div>
                <button
                  onClick={handleCopy}
                  className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-slate-200 text-slate-700 text-base font-bold rounded-lg hover:bg-slate-300 transition-colors"
                >
                  {copied ? <Check size={18} className="text-green-600" /> : <Copy size={18} />}
                  <span className={copied ? "text-green-700" : ""}>
                    {copied ? 'Đã sao chép link' : 'Sao chép link'}
                  </span>
                </button>
              </div>
            </div>

          </div>
        </div>

      </div>
    </div>
  )
}