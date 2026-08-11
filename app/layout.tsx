import { Geist, Geist_Mono } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import type { Metadata, Viewport } from 'next'
import { AuthProvider } from '@/lib/auth-context'
import { ToastContainer } from '@/components/Toast'
import './globals.css'

const geistSans = Geist({ 
  subsets: ['latin'],
  variable: '--font-geist-sans',
})

const geistMono = Geist_Mono({ 
  subsets: ['latin'],
  variable: '--font-geist-mono',
})

export const metadata: Metadata = {
  title: 'Thư Viện Văn Mẫu THCS - Kho Bài Văn Lớp 6, 7, 8, 9',
  description: 'Thư viện văn mẫu THCS với hàng nghìn bài văn biểu cảm, tự sự, thuyết minh, nghị luận, phân tích tác phẩm cho học sinh lớp 6, 7, 8, 9. Tìm kiếm và đọc bài văn ngay.',
  generator: 'v0.app',
  keywords: 'bài văn THCS, văn mẫu, lớp 6, lớp 7, lớp 8, lớp 9, văn nghị luận, văn tự sự, văn biểu cảm',
  
  // --- CẤU HÌNH PWA (Progressive Web App) ---
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'Văn Mẫu',
  },
  
  // --- CẤU HÌNH ICON ---
  icons: {
    icon: [
      {
        url: '/icon-light-32x32.png',
        media: '(prefers-color-scheme: light)',
      },
      {
        url: '/icon-dark-32x32.png',
        media: '(prefers-color-scheme: dark)',
      },
      {
        url: '/icon.svg',
        type: 'image/svg+xml',
      },
    ],
    apple: '/apple-icon.png',
  },
}

export const viewport: Viewport = {
  colorScheme: 'light',
  themeColor: '#0066CC',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1, // Ép về 1 để chống zoom lộn xộn khi chạm đúp trên điện thoại
  userScalable: false, // Tắt chế độ zoom của web để tạo cảm giác App thật
  viewportFit: 'cover', // Giúp giao diện hiển thị tràn viền an toàn, không đè lên thanh điều hướng
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="vi" className="bg-background">
      <body className={`${geistSans.className} antialiased`}>
        <AuthProvider>
          {children}
        </AuthProvider>
        
        {/* Hiển thị thông báo (Thêm vào danh sách, Lỗi đăng nhập,...) */}
        <ToastContainer />
        
        {/* Chỉ chạy theo dõi phân tích khi đã đưa lên mạng */}
        {process.env.NODE_ENV === 'production' && <Analytics />}
      </body>
    </html>
  )
}