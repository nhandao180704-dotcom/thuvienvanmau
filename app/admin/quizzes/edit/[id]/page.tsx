'use client'

import { useState, useEffect, Suspense } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { supabase } from '@/lib/supabase-client'
import AdminSidebar from '@/components/AdminSidebar'
import AdminHeader from '@/components/AdminHeader'
import { ToastContainer, useToast } from '@/components/Toast'
import { Plus, Trash2, ArrowLeft, Save, CheckCircle2, Clock, ListChecks, Type, Loader2, Calculator } from 'lucide-react'

function EditQuizForm() {
  const router = useRouter()
  const params = useParams()
  const quizId = params.id as string

  const { success, error: showError } = useToast()
  const [loading, setLoading] = useState(false)
  const [fetching, setFetching] = useState(true)
  
  // Thông tin chung
  const [title, setTitle] = useState('')
  const [grade, setGrade] = useState('Lớp 9')
  const [duration, setDuration] = useState(45)

  // Cấu hình chia điểm
  const [mcSplit, setMcSplit] = useState(7) 

  const [questions, setQuestions] = useState<any[]>([])
  const [deletedQuestionIds, setDeletedQuestionIds] = useState<string[]>([])

  useEffect(() => {
    const fetchQuizData = async () => {
      try {
        const { data: quizData, error: quizErr } = await supabase
          .from('quizzes')
          .select('*')
          .eq('id', quizId)
          .single()

        if (quizErr) throw quizErr
        setTitle(quizData.title || '')
        setGrade(quizData.grade || 'Lớp 9')
        setDuration(quizData.duration || 45)

        const { data: questionsData, error: qErr } = await supabase
          .from('questions')
          .select('*')
          .eq('quiz_id', quizId)
          .order('order_index', { ascending: true })

        if (qErr) throw qErr

        if (questionsData && questionsData.length > 0) {
          const mcQs = questionsData.filter(q => q.question_type === 'multiple_choice')
          if (mcQs.length > 0 && questionsData.length > mcQs.length) {
             const mcTotal = mcQs.reduce((sum, q) => sum + Number(q.points), 0)
             setMcSplit(Math.round(mcTotal))
          }

          const formattedQuestions = questionsData.map(q => {
            if (q.question_type === 'multiple_choice') {
              const opts = q.options || { A: '', B: '', C: '', D: '' }
              const optArr = [opts.A || '', opts.B || '', opts.C || '', opts.D || '']
              const correctIdx = ['A', 'B', 'C', 'D'].indexOf(q.correct_answer).toString()

              return {
                id: q.id,
                type: 'multiple_choice',
                content: q.content,
                points: q.points,
                options: optArr,
                correct_answer: correctIdx !== '-1' ? correctIdx : '0'
              }
            } else {
              return {
                id: q.id,
                type: 'essay',
                content: q.content,
                points: q.points,
                options: null,
                correct_answer: q.correct_answer || ''
              }
            }
          })
          setQuestions(formattedQuestions)
        } else {
           setQuestions([{ id: Date.now().toString(), type: 'multiple_choice', content: '', points: 1, options: ['', '', '', ''], correct_answer: '0' }])
        }
      } catch (error) {
        console.error("Lỗi:", error)
        showError("Không tải được dữ liệu đề thi!")
      } finally {
        setFetching(false)
      }
    }

    if (quizId) fetchQuizData()
  }, [quizId, showError])

  const mcCount = questions.filter(q => q.type === 'multiple_choice').length
  const essayCount = questions.filter(q => q.type === 'essay').length
  
  let targetMcScore = 0
  let targetEssayScore = 0

  if (mcCount > 0 && essayCount > 0) {
    targetMcScore = mcSplit
    targetEssayScore = 10 - mcSplit
  } else if (mcCount > 0) {
    targetMcScore = 10
  } else if (essayCount > 0) {
    targetEssayScore = 10
  }

  const pointPerMc = mcCount > 0 ? (targetMcScore / mcCount) : 0
  const currentEssaySum = questions.filter(q => q.type === 'essay').reduce((sum, q) => sum + (Number(q.points) || 0), 0)

  const addQuestion = (type: 'multiple_choice' | 'essay') => {
    setQuestions([...questions, {
        id: Date.now().toString(), 
        type: type,
        content: '',
        points: type === 'essay' ? 1 : 0,
        options: type === 'multiple_choice' ? ['', '', '', ''] : null,
        correct_answer: type === 'multiple_choice' ? '0' : ''
    }])
  }

  const removeQuestion = (id: string) => {
    if (questions.length === 1) {
      showError('Đề thi phải có ít nhất 1 câu hỏi!')
      return
    }
    if (id.includes('-')) {
        setDeletedQuestionIds([...deletedQuestionIds, id])
    }
    setQuestions(questions.filter(q => q.id !== id))
  }

  const updateQuestion = (id: string, field: string, value: any) => {
    setQuestions(questions.map(q => q.id === id ? { ...q, [field]: value } : q))
  }

  const updateOption = (questionId: string, optionIndex: number, value: string) => {
    setQuestions(questions.map(q => {
      if (q.id === questionId) {
        const newOptions = [...q.options]
        newOptions[optionIndex] = value
        return { ...q, options: newOptions }
      }
      return q
    }))
  }

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!title.trim()) { showError('Vui lòng nhập tiêu đề đề thi!'); return }
    if (duration < 1) { showError('Thời gian làm bài phải lớn hơn 0 phút!'); return }
    for (let i = 0; i < questions.length; i++) {
      if (!questions[i].content.trim()) { showError(`Câu hỏi số ${i + 1} chưa có nội dung!`); return }
    }

    if (essayCount > 0 && Math.abs(currentEssaySum - targetEssayScore) > 0.01) {
      showError(`Tổng điểm Tự luận phải bằng đúng ${targetEssayScore} điểm.`)
      return
    }

    setLoading(true)
    try {
      const { error: quizErr } = await supabase
        .from('quizzes')
        .update({ title, grade, duration })
        .eq('id', quizId)

      if (quizErr) throw quizErr

      if (deletedQuestionIds.length > 0) {
          await supabase.from('questions').delete().in('id', deletedQuestionIds)
      }

      const questionsToUpsert = questions.map((q, index) => {
        const dbQ: any = {
            quiz_id: quizId,
            question_type: q.type,
            content: q.content,
            points: q.type === 'multiple_choice' ? pointPerMc : q.points,
            order_index: index,
            options: q.type === 'multiple_choice' ? { 'A': q.options[0], 'B': q.options[1], 'C': q.options[2], 'D': q.options[3] } : null,
            correct_answer: q.type === 'multiple_choice' ? ['A', 'B', 'C', 'D'][parseInt(q.correct_answer)] : q.correct_answer
        }
        if (q.id.includes('-')) {
            dbQ.id = q.id
        }
        return dbQ
      })

      const { error: qErr } = await supabase.from('questions').upsert(questionsToUpsert)
      if (qErr) throw qErr

      success('Cập nhật đề thi thành công!')
      setTimeout(() => router.push('/admin/quizzes'), 1500)
    } catch (err: any) {
      console.error(err)
      showError(err.message || 'Có lỗi xảy ra khi cập nhật')
    } finally {
      setLoading(false)
    }
  }

  if (fetching) return <div className="min-h-screen flex items-center justify-center bg-slate-50"><Loader2 className="w-8 h-8 animate-spin text-blue-500" /></div>

  return (
    <div className="min-h-screen bg-slate-50">
      <AdminSidebar />
      <AdminHeader onSearch={() => {}} />

      <main className="fixed top-16 right-0 left-0 md:left-64 bottom-0 overflow-y-auto p-4 md:p-8 max-w-5xl mx-auto">
        <button onClick={() => router.back()} className="flex items-center text-slate-600 hover:text-slate-900 mb-6 transition font-medium">
          <ArrowLeft className="w-4 h-4 mr-2" /> Quay lại
        </button>

        <h1 className="text-2xl font-black text-slate-900 mb-6">Chỉnh Sửa Đề Thi</h1>

        <form onSubmit={handleUpdate} className="space-y-6 pb-20">
          
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
            <h2 className="text-lg font-bold text-slate-800 border-b border-slate-100 pb-2">1. Thông tin chung</h2>
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-1">Tiêu đề đề thi</label>
              <input type="text" value={title} onChange={e => setTitle(e.target.value)}
                className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none font-medium" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1">Khối lớp</label>
                <select value={grade} onChange={e => setGrade(e.target.value)}
                  className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none font-medium">
                  <option value="Lớp 6">Lớp 6</option><option value="Lớp 7">Lớp 7</option><option value="Lớp 8">Lớp 8</option><option value="Lớp 9">Lớp 9</option><option value="Ôn thi vào 10">Ôn thi vào 10</option>
                </select>
              </div>
              <div>
                <label className="flex items-center gap-1.5 text-sm font-bold text-slate-700 mb-1">
                  <Clock className="w-4 h-4" /> Thời gian làm bài (Phút)
                </label>
                <input type="number" min="1" value={duration} onChange={e => setDuration(parseInt(e.target.value) || 0)}
                  className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none font-medium" />
              </div>
            </div>
          </div>

          <div className="bg-indigo-50 border border-indigo-100 p-6 rounded-2xl shadow-sm">
            <h2 className="text-lg font-black text-indigo-900 flex items-center gap-2 border-b border-indigo-200 pb-2 mb-4">
              <Calculator size={20} /> 2. Cấu hình & Thống kê điểm số
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {mcCount > 0 && essayCount > 0 ? (
                <div className="bg-white p-4 rounded-xl border border-indigo-100 shadow-sm">
                  <label className="block text-sm font-bold text-slate-700 mb-3">Tỷ lệ chia điểm (Trắc nghiệm : Tự luận)</label>
                  <div className="flex items-center gap-4">
                    <div className="flex-1">
                      <span className="text-xs text-slate-500 font-bold block mb-1">Trắc nghiệm</span>
                      <input type="number" min="1" max="9" value={mcSplit} onChange={e => setMcSplit(Number(e.target.value))} className="w-full px-3 py-2 border border-slate-300 rounded-lg text-center font-black text-blue-600" />
                    </div>
                    <span className="font-black text-slate-400 pt-4">:</span>
                    <div className="flex-1">
                      <span className="text-xs text-slate-500 font-bold block mb-1">Tự luận</span>
                      <div className="w-full px-3 py-2 bg-slate-100 border border-slate-200 rounded-lg text-center font-black text-emerald-600">{10 - mcSplit}</div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="bg-white p-4 rounded-xl border border-indigo-100 shadow-sm flex items-center justify-center">
                  <p className="font-black text-indigo-600 text-lg">
                    {mcCount > 0 ? '100% ĐỀ TRẮC NGHIỆM' : '100% ĐỀ TỰ LUẬN'}
                  </p>
                </div>
              )}

              <div className="space-y-3">
                <div className="flex justify-between items-center bg-blue-50 p-3 rounded-lg border border-blue-100">
                  <span className="font-bold text-blue-800 text-sm">Phần Trắc nghiệm ({mcCount} câu)</span>
                  <div className="text-right">
                    <span className="font-black text-blue-600">{targetMcScore} điểm</span>
                    <p className="text-xs text-blue-500 mt-0.5">{mcCount > 0 ? `~ ${Number(pointPerMc.toFixed(2))} đ/câu` : '0 đ/câu'}</p>
                  </div>
                </div>
                
                <div className="flex justify-between items-center bg-emerald-50 p-3 rounded-lg border border-emerald-100">
                  <span className="font-bold text-emerald-800 text-sm">Phần Tự luận ({essayCount} câu)</span>
                  <div className="text-right">
                    <span className={`font-black ${currentEssaySum !== targetEssayScore && essayCount > 0 ? 'text-red-600' : 'text-emerald-600'}`}>
                      {currentEssaySum} / {targetEssayScore} điểm
                    </span>
                    <p className="text-xs text-emerald-500 mt-0.5">Nhập thủ công</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <h2 className="text-xl font-black text-slate-800">3. Danh sách Câu hỏi</h2>
              <div className="flex gap-2">
                <button type="button" onClick={() => addQuestion('multiple_choice')} className="flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-900 text-white font-bold text-sm rounded-lg transition-colors"><ListChecks size={16} /> Thêm Trắc nghiệm</button>
                <button type="button" onClick={() => addQuestion('essay')} className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm rounded-lg transition-colors"><Type size={16} /> Thêm Tự luận</button>
              </div>
            </div>

            {questions.map((q, index) => (
              <div key={q.id} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm relative group animate-in slide-in-from-bottom-4 duration-300">
                <button type="button" onClick={() => removeQuestion(q.id)} className="absolute top-4 right-4 text-slate-300 hover:text-red-500 hover:bg-red-50 p-2 rounded-lg transition-colors">
                  <Trash2 className="w-5 h-5" />
                </button>

                <div className="flex items-center gap-3 mb-4">
                  <span className="w-8 h-8 rounded-full bg-slate-100 text-slate-600 flex items-center justify-center font-black text-sm">{index + 1}</span>
                  <span className="font-bold text-slate-600 text-sm uppercase tracking-wider">{q.type === 'multiple_choice' ? 'Câu hỏi Trắc nghiệm' : 'Câu hỏi Tự luận'}</span>
                </div>

                <div className="space-y-4">
                  <textarea placeholder="Nhập nội dung câu hỏi tại đây..." value={q.content} onChange={e => updateQuestion(q.id, 'content', e.target.value)} className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none font-medium min-h-[100px]" required />

                  {q.type === 'multiple_choice' && (
                    <>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pl-4 border-l-2 border-blue-100">
                        {['A', 'B', 'C', 'D'].map((label, optIndex) => (
                          <div key={label} className="flex items-center gap-2">
                            <span className="font-bold text-slate-500 w-6">{label}.</span>
                            <input type="text" value={q.options[optIndex]} onChange={e => updateOption(q.id, optIndex, e.target.value)} placeholder={`Lựa chọn ${label}`} className="w-full px-3 py-2 border border-slate-200 rounded-lg outline-none text-sm focus:border-blue-500" required />
                          </div>
                        ))}
                      </div>

                      <div className="mt-4 pt-4 border-t border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div className="flex items-center gap-3">
                          <span className="text-sm font-bold text-slate-700 flex items-center gap-1"><CheckCircle2 className="w-4 h-4 text-emerald-500" /> Đáp án đúng:</span>
                          <div className="flex gap-4">
                            {['A', 'B', 'C', 'D'].map((key, optIdx) => (
                              <label key={key} className="flex items-center gap-1.5 cursor-pointer hover:bg-slate-50 px-2 py-1 rounded">
                                <input type="radio" name={`correct-${q.id}`} value={optIdx.toString()} checked={q.correct_answer === optIdx.toString()} onChange={() => updateQuestion(q.id, 'correct_answer', optIdx.toString())} className="w-4 h-4 text-emerald-600 focus:ring-emerald-500 border-slate-300 cursor-pointer" />
                                <span className={`text-sm font-bold ${q.correct_answer === optIdx.toString() ? 'text-emerald-700' : 'text-slate-600'}`}>{key}</span>
                              </label>
                            ))}
                          </div>
                        </div>
                        <div className="bg-blue-50 px-4 py-2 rounded-lg text-sm">
                          <span className="text-slate-500">Điểm: </span>
                          <span className="font-black text-blue-600">{Number(pointPerMc.toFixed(2))}</span>
                          <span className="text-slate-400 text-xs ml-1">(Tự động)</span>
                        </div>
                      </div>
                    </>
                  )}

                  {q.type === 'essay' && (
                    <div className="mt-4">
                      <label className="block text-sm font-bold text-slate-700 mb-2">Đáp án / Từ khóa tham khảo</label>
                      <textarea placeholder="Nhập các ý chính để dễ dàng chấm điểm sau này..." value={q.correct_answer} onChange={e => updateQuestion(q.id, 'correct_answer', e.target.value)} className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:border-emerald-500 outline-none min-h-[80px] text-sm" />
                      <div className="mt-4 bg-emerald-50 p-4 rounded-xl border border-emerald-100 flex items-center gap-4">
                        <label className="text-sm font-bold text-emerald-800">Điểm cho câu này:</label>
                        <input type="number" min="0.5" step="0.5" value={q.points} onChange={e => updateQuestion(q.id, 'points', parseFloat(e.target.value) || 0)} className="w-32 px-4 py-2 border-2 border-emerald-200 rounded-xl focus:border-emerald-500 outline-none font-black text-emerald-700 bg-white" />
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>

          <div className="flex justify-end pt-4">
            <button type="submit" disabled={loading}
              className="flex items-center gap-2 px-8 py-3.5 bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-400 text-white rounded-xl font-bold shadow-lg shadow-emerald-500/30 transition-all">
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
              {loading ? 'Đang cập nhật...' : 'Lưu Thay Đổi'}
            </button>
          </div>
        </form>
      </main>
      <ToastContainer />
    </div>
  )
}

export default function EditQuizPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center text-slate-500 font-medium">Đang tải dữ liệu...</div>}>
      <EditQuizForm />
    </Suspense>
  )
}