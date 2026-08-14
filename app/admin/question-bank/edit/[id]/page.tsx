'use client'

import { useState, useEffect, use } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { supabase } from '@/lib/supabase-client'
import AdminSidebar from '@/components/AdminSidebar'
import AdminHeader from '@/components/AdminHeader'
import { ArrowLeft, Save, Loader2, CheckCircle2 } from 'lucide-react'

export default function EditQuestionPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter()
  const resolvedParams = use(params)
  const questionId = resolvedParams.id

  const [loading, setLoading] = useState(false)
  const [fetching, setFetching] = useState(true)

  const [formData, setFormData] = useState({
    grade: 'Lớp 9',
    content: '',
    optionA: '',
    optionB: '',
    optionC: '',
    optionD: '',
    correctAnswer: 'A',
    explanation: ''
  })

  // Tải chi tiết từ bảng question_bank
  useEffect(() => {
    const fetchQuestionDetail = async () => {
      setFetching(true)
      try {
        const { data, error } = await supabase
          .from('question_bank')
          .select('*')
          .eq('id', questionId)
          .single()

        if (error) throw error

        if (data) {
          const opts = data.options || {}
          setFormData({
            grade: data.grade || 'Lớp 9',
            content: data.content || '',
            optionA: opts.A || '',
            optionB: opts.B || '',
            optionC: opts.C || '',
            optionD: opts.D || '',
            correctAnswer: data.correct_answer || 'A',
            explanation: data.explanation || ''
          })
        }
      } catch (error) {
        console.error('Lỗi khi tải chi tiết câu hỏi:', error)
        alert('Không tìm thấy câu hỏi!')
        router.push('/admin/question-bank')
      } finally {
        setFetching(false)
      }
    }

    fetchQuestionDetail()
  }, [questionId, router])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  // Cập nhật vào bảng question_bank
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.content.trim() || !formData.optionA.trim() || !formData.optionB.trim()) {
      alert('Vui lòng nhập nội dung câu hỏi và ít nhất 2 đáp án A, B!')
      return
    }

    setLoading(true)
    try {
      const options = {
        A: formData.optionA,
        B: formData.optionB,
        C: formData.optionC,
        D: formData.optionD
      }

      const { error } = await supabase
        .from('question_bank')
        .update({
          content: formData.content,
          options: options,
          correct_answer: formData.correctAnswer,
          explanation: formData.explanation,
          grade: formData.grade
        })
        .eq('id', questionId)

      if (error) throw error

      alert('Cập nhật câu hỏi thành công!')
      router.push('/admin/question-bank')
      
    } catch (error) {
      console.error('Lỗi khi cập nhật câu hỏi:', error)
      alert('Có lỗi xảy ra, vui lòng thử lại!')
    } finally {
      setLoading(false)
    }
  }

  if (fetching) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-[#0052CC] animate-spin" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-50 flex">
      <AdminSidebar />
      <div className="flex-1 ml-0 md:ml-64 flex flex-col">
        <AdminHeader onSearch={() => {}} />
        
        <main className="flex-1 p-4 md:p-8 overflow-y-auto mt-16 max-w-4xl mx-auto w-full">
          
          <Link 
            href="/admin/question-bank" 
            className="inline-flex items-center gap-2 text-slate-500 hover:text-[#0052CC] font-medium transition-colors mb-6"
          >
            <ArrowLeft size={18} />
            <span>Quay lại kho câu hỏi</span>
          </Link>

          <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="px-8 py-6 border-b border-slate-100 bg-slate-50/50">
              <h1 className="text-2xl font-black text-slate-900">Chỉnh sửa câu hỏi</h1>
              <p className="text-slate-500 font-medium mt-1">Cập nhật thông tin và đáp án trắc nghiệm</p>
            </div>

            <form onSubmit={handleSubmit} className="p-8 space-y-8">
              
              <div className="w-1/3">
                <label className="block text-sm font-bold text-slate-700 mb-2">Khối lớp / Phân loại</label>
                <select 
                  name="grade"
                  value={formData.grade}
                  onChange={handleChange}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-[#0052CC]/20 focus:border-[#0052CC] transition-all"
                >
                  <option value="Lớp 6">Lớp 6</option>
                  <option value="Lớp 7">Lớp 7</option>
                  <option value="Lớp 8">Lớp 8</option>
                  <option value="Lớp 9">Lớp 9</option>
                  <option value="Ôn thi vào 10">Ôn thi vào 10</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">
                  Nội dung câu hỏi / Đoạn ngữ liệu <span className="text-red-500">*</span>
                </label>
                <textarea 
                  name="content"
                  value={formData.content}
                  onChange={handleChange}
                  placeholder="Nhập câu hỏi hoặc đoạn trích vào đây..."
                  className="w-full px-4 py-4 rounded-xl border border-slate-200 bg-slate-50 font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#0052CC]/20 focus:border-[#0052CC] transition-all min-h-[120px]"
                />
              </div>

              <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100 space-y-5">
                <h3 className="font-bold text-slate-800 mb-2">Các phương án trả lời:</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div className="flex items-center gap-3">
                    <span className="w-10 h-10 rounded-lg bg-white border border-slate-200 shadow-sm flex items-center justify-center font-black text-slate-700 shrink-0">A</span>
                    <input type="text" name="optionA" value={formData.optionA} onChange={handleChange} placeholder="Nội dung đáp án A" className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-[#0052CC]/20 focus:border-[#0052CC] outline-none" required />
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="w-10 h-10 rounded-lg bg-white border border-slate-200 shadow-sm flex items-center justify-center font-black text-slate-700 shrink-0">B</span>
                    <input type="text" name="optionB" value={formData.optionB} onChange={handleChange} placeholder="Nội dung đáp án B" className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-[#0052CC]/20 focus:border-[#0052CC] outline-none" required />
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="w-10 h-10 rounded-lg bg-white border border-slate-200 shadow-sm flex items-center justify-center font-black text-slate-700 shrink-0">C</span>
                    <input type="text" name="optionC" value={formData.optionC} onChange={handleChange} placeholder="Nội dung đáp án C" className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-[#0052CC]/20 focus:border-[#0052CC] outline-none" />
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="w-10 h-10 rounded-lg bg-white border border-slate-200 shadow-sm flex items-center justify-center font-black text-slate-700 shrink-0">D</span>
                    <input type="text" name="optionD" value={formData.optionD} onChange={handleChange} placeholder="Nội dung đáp án D" className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-[#0052CC]/20 focus:border-[#0052CC] outline-none" />
                  </div>
                </div>
              </div>

              <div className="w-1/3">
                <label className="block text-sm font-bold text-slate-700 mb-2 flex items-center gap-2">
                  <CheckCircle2 size={18} className="text-emerald-500" /> Chọn đáp án đúng
                </label>
                <select 
                  name="correctAnswer"
                  value={formData.correctAnswer}
                  onChange={handleChange}
                  className="w-full px-4 py-3 rounded-xl border border-emerald-200 bg-emerald-50 font-black text-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all cursor-pointer"
                >
                  <option value="A">Đáp án A</option>
                  <option value="B">Đáp án B</option>
                  <option value="C">Đáp án C</option>
                  <option value="D">Đáp án D</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">
                  Lời giải thích chi tiết
                </label>
                <textarea 
                  name="explanation"
                  value={formData.explanation}
                  onChange={handleChange}
                  placeholder="Giải thích vì sao chọn đáp án này..."
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-[#0052CC]/20 focus:border-[#0052CC] transition-all min-h-[100px]"
                />
              </div>

              <div className="pt-6 border-t border-slate-100 flex justify-end">
                <button 
                  type="submit" 
                  disabled={loading}
                  className="flex items-center gap-2 px-8 py-3.5 bg-[#0052CC] hover:bg-blue-700 text-white font-bold rounded-xl shadow-sm transition-all active:scale-95 disabled:opacity-70 disabled:cursor-not-allowed"
                >
                  {loading ? <Loader2 size={20} className="animate-spin" /> : <Save size={20} />}
                  <span>{loading ? 'Đang lưu...' : 'Lưu thay đổi'}</span>
                </button>
              </div>

            </form>
          </div>
        </main>
      </div>
    </div>
  )
}