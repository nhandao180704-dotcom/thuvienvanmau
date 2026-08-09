'use client'

import { useState } from 'react'
import Link from 'next/link'
import Navbar from '@/components/Navbar'
import { ArrowLeft, PenTool, Send, AlertCircle } from 'lucide-react'
import { supabase } from '@/lib/supabase-client'

export default function ContributePage() {
  const [title, setTitle] = useState('')
  const [author, setAuthor] = useState('') // Đã bổ sung biến lưu Tên học sinh
  const [grade, setGrade] = useState('')
  const [genre, setGenre] = useState('')
  const [content, setContent] = useState('')

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showSuccess, setShowSuccess] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setErrorMsg('')

    try {
      // Đã bổ sung truyền dữ liệu cột 'author' lên cơ sở dữ liệu
      const { error } = await supabase.from('essays').insert([
        {
          title: title,
          author: author,
          grade: grade,
          genre: genre,
          content: content
        }
      ])

      if (error) throw error

      setShowSuccess(true)
      setTitle('')
      setAuthor('')
      setGrade('')
      setGenre('')
      setContent('')
    } catch (error: any) {
      console.error('Lỗi chi tiết:', error)
      const errorDetails = typeof error === 'object' ? JSON.stringify(error, null, 2) : String(error)
      setErrorMsg('Chi tiết lỗi Supabase: ' + errorDetails)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-slate-50/50 text-slate-800 font-sans pb-20">
      <Navbar />

      <main className="max-w-3xl mx-auto px-4 sm:px-6 py-10">
        <Link href="/" className="inline-flex items-center gap-2 text-sm font-bold text-slate-500 hover:text-teal-600 transition-colors mb-6">
          <ArrowLeft size={16} /> Về lại trang chủ
        </Link>

        <div className="bg-white rounded-3xl shadow-lg shadow-teal-500/5 border border-slate-100 overflow-hidden">
          <div className="bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-600 p-8 text-white text-center">
            <div className="w-16 h-16 bg-white/25 backdrop-blur-md rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-inner border border-white/30">
              <PenTool size={32} />
            </div>
            <h1 className="text-3xl font-extrabold tracking-tight mb-2">Đóng góp bài viết</h1>
            <p className="text-teal-50 font-medium">Chia sẻ bài văn hay của bạn để làm phong phú thêm thư viện.</p>
          </div>

          <div className="p-8 sm:p-10">
            {showSuccess ? (
              <div className="text-center py-8 animate-in zoom-in duration-300">
                <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6 text-4xl shadow-sm border border-green-200">🎉</div>
                <h3 className="text-2xl font-bold text-slate-900 mb-2">Gửi bài thành công!</h3>
                <p className="text-slate-500 mb-8 font-medium">Cảm ơn bạn đã đóng góp. Bài viết của bạn đã được đưa lên hệ thống thư viện cùng với tên tác giả.</p>
                <button 
                  onClick={() => setShowSuccess(false)} 
                  className="px-6 py-3 bg-slate-100 text-slate-600 font-bold rounded-xl hover:bg-slate-200 transition-colors"
                >
                  Gửi thêm bài khác
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6">
                
                {errorMsg && (
                  <div className="p-4 bg-red-50 text-red-600 border border-red-200 rounded-xl text-sm font-medium whitespace-pre-wrap">
                    {errorMsg}
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Ô nhập Họ và tên Học sinh */}
                  <div className="md:col-span-1">
                    <label className="block text-sm font-bold text-slate-700 mb-2">Họ và tên học sinh <span className="text-red-500">*</span></label>
                    <input 
                      required 
                      type="text" 
                      value={author}
                      onChange={(e) => setAuthor(e.target.value)}
                      placeholder="VD: Nguyễn Văn A" 
                      className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:ring-4 focus:ring-teal-500/10 focus:border-teal-500 transition-all font-medium" 
                    />
                  </div>

                  {/* Ô nhập Tiêu đề bài văn */}
                  <div className="md:col-span-1">
                    <label className="block text-sm font-bold text-slate-700 mb-2">Tiêu đề bài văn <span className="text-red-500">*</span></label>
                    <input 
                      required 
                      type="text" 
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      placeholder="VD: Phân tích Lão Hạc..." 
                      className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:ring-4 focus:ring-teal-500/10 focus:border-teal-500 transition-all font-medium" 
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">Khối lớp <span className="text-red-500">*</span></label>
                    <select 
                      required 
                      value={grade}
                      onChange={(e) => setGrade(e.target.value)}
                      className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:ring-4 focus:ring-teal-500/10 focus:border-teal-500 transition-all font-medium text-slate-600"
                    >
                      <option value="">Chọn khối lớp...</option>
                      <option value="Lớp 6">Lớp 6</option>
                      <option value="Lớp 7">Lớp 7</option>
                      <option value="Lớp 8">Lớp 8</option>
                      <option value="Lớp 9">Lớp 9</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">Thể loại <span className="text-red-500">*</span></label>
                    <select 
                      required 
                      value={genre}
                      onChange={(e) => setGenre(e.target.value)}
                      className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:ring-4 focus:ring-teal-500/10 focus:border-teal-500 transition-all font-medium text-slate-600"
                    >
                      <option value="">Chọn thể loại...</option>
                      <option value="Văn biểu cảm">Văn biểu cảm</option>
                      <option value="Văn tự sự">Văn tự sự</option>
                      <option value="Văn thuyết minh">Văn thuyết minh</option>
                      <option value="Văn nghị luận">Văn nghị luận</option>
                      <option value="Phân tích">Phân tích</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">Nội dung bài viết <span className="text-red-500">*</span></label>
                  <textarea 
                    required 
                    rows={12} 
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    placeholder="Nhập nội dung bài văn của bạn vào đây..."
                    className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:ring-4 focus:ring-teal-500/10 focus:border-teal-500 transition-all font-medium resize-y"
                  ></textarea>
                </div>

                <div className="bg-blue-50 text-blue-700 p-4 rounded-xl flex items-start gap-3 text-sm font-medium">
                  <AlertCircle size={18} className="shrink-0 mt-0.5" />
                  <p>Vui lòng kiểm tra kỹ lỗi chính tả trước khi gửi. Đảm bảo bài viết là do bạn tự viết hoặc có trích dẫn nguồn rõ ràng.</p>
                </div>

                <button 
                  type="submit" 
                  disabled={isSubmitting} 
                  className="w-full py-4 rounded-xl bg-teal-600 text-white font-extrabold flex items-center justify-center gap-2 hover:bg-teal-700 transition-all shadow-lg shadow-teal-500/25 active:scale-95 disabled:opacity-70"
                >
                  {isSubmitting ? (
                    <div className="w-6 h-6 border-4 border-white/30 border-t-white rounded-full animate-spin"></div>
                  ) : (
                    <><Send size={18} /> Gửi bài viết lên thư viện</>
                  )}
                </button>
              </form>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}