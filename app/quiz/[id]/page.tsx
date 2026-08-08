'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase-client'
import { ArrowLeft, CheckCircle2, XCircle, RefreshCw } from 'lucide-react'

export default function StudentQuizPage() {
  const params = useParams()
  const router = useRouter()
  const quizId = params.id as string

  const [quiz, setQuiz] = useState<any>(null)
  const [questions, setQuestions] = useState<any[]>([])
  const [userAnswers, setUserAnswers] = useState<Record<string, string>>({})
  const [submitted, setSubmitted] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchQuizData()
  }, [quizId])

  const fetchQuizData = async () => {
    try {
      setLoading(true)
      const { data: quizData } = await supabase.from('quizzes').select('*').eq('id', quizId).single()
      const { data: qData } = await supabase
        .from('questions')
        .select('*, options(*)')
        .eq('quiz_id', quizId)

      setQuiz(quizData)
      setQuestions(qData || [])
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const handleSelect = (questionId: string, optionId: string) => {
    if (submitted) return
    setUserAnswers(prev => ({ ...prev, [questionId]: optionId }))
  }

  const calculateScore = () => {
    let correct = 0
    questions.forEach(q => {
      const selectedOptId = userAnswers[q.id]
      const correctOpt = q.options.find((o: any) => o.is_correct)
      if (selectedOptId && correctOpt && selectedOptId === correctOpt.id) {
        correct++
      }
    })
    return correct
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="animate-spin w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full"></div>
      </div>
    )
  }

  const score = calculateScore()

  return (
    <div className="min-h-screen bg-slate-50 py-10 px-4">
      <div className="max-w-3xl mx-auto space-y-6">
        <button
          onClick={() => router.push('/category/trac-nghiem-10')}
          className="flex items-center text-slate-600 hover:text-slate-900 transition"
        >
          <ArrowLeft className="w-4 h-4 mr-2" /> Quay lại
        </button>

        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <h1 className="text-2xl font-bold text-slate-900 mb-2">{quiz?.title}</h1>
          <p className="text-slate-600">{quiz?.description}</p>
        </div>

        {/* Danh sách câu hỏi */}
        <div className="space-y-6">
          {questions.map((q, idx) => (
            <div key={q.id} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
              <h3 className="font-bold text-slate-900 mb-4">
                Câu {idx + 1}: {q.question_text}
              </h3>

              <div className="space-y-2">
                {q.options?.map((opt: any, oIdx: number) => {
                  const isSelected = userAnswers[q.id] === opt.id
                  const isCorrect = opt.is_correct

                  let optionStyle = 'border-slate-200 hover:border-blue-300'
                  if (isSelected) optionStyle = 'border-blue-600 bg-blue-50 text-blue-900 font-medium'

                  if (submitted) {
                    if (isCorrect) optionStyle = 'border-green-500 bg-green-50 text-green-900 font-medium'
                    else if (isSelected && !isCorrect) optionStyle = 'border-red-500 bg-red-50 text-red-900'
                  }

                  return (
                    <div
                      key={opt.id}
                      onClick={() => handleSelect(q.id, opt.id)}
                      className={`p-4 rounded-xl border flex items-center justify-between cursor-pointer transition ${optionStyle}`}
                    >
                      <div className="flex items-center gap-3">
                        <span className="font-bold">{String.fromCharCode(65 + oIdx)}.</span>
                        <span>{opt.option_text}</span>
                      </div>
                      {submitted && isCorrect && <CheckCircle2 className="w-5 h-5 text-green-600" />}
                      {submitted && isSelected && !isCorrect && <XCircle className="w-5 h-5 text-red-600" />}
                    </div>
                  )
                })}
              </div>

              {submitted && q.explanation && (
                <div className="mt-4 p-4 bg-amber-50 border border-amber-200 rounded-xl text-amber-900 text-sm">
                  <strong>Giải thích:</strong> {q.explanation}
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Nút nộp bài / kết quả */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm text-center">
          {!submitted ? (
            <button
              onClick={() => setSubmitted(true)}
              className="px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-lg transition"
            >
              Nộp Bài Lấy Điểm
            </button>
          ) : (
            <div className="space-y-4">
              <h2 className="text-2xl font-bold text-slate-900">
                Kết quả: <span className="text-blue-600">{score}</span> / {questions.length} câu đúng
              </h2>
              <button
                onClick={() => {
                  setSubmitted(false)
                  setUserAnswers({})
                }}
                className="inline-flex items-center gap-2 px-6 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium rounded-xl transition"
              >
                <RefreshCw className="w-4 h-4" /> Làm lại bài thi
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}