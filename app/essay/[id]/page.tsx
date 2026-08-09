'use client'

import { useState, useEffect, useRef } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Copy, Volume2, Bookmark, BookmarkCheck, Eye, Calendar, User, Check, Sparkles } from 'lucide-react'
import { supabase } from '@/lib/supabase-client'

export default function EssayDetailPage() {
  const { id } = useParams() as { id: string }
  const [essay, setEssay] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isSaved, setIsSaved] = useState(false)
  const [isSpeaking, setIsSpeaking] = useState(false)
  const [copied, setCopied] = useState(false)
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null)

  useEffect(() => {
    const fetchEssay = async () => {
      try {
        setLoading(true)
        const { data, error } = await supabase
          .from('essays')
          .select('*')
          .eq('id', id)
          .single()

        if (error) throw error
        setEssay(data)

        await supabase
          .from('essays')
          .update({ views: ((data as any)?.views || 0) + 1 })
          .eq('id', id)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch essay')
      } finally {
        setLoading(false)
      }
    }

    if (id) fetchEssay()
  }, [id])

  useEffect(() => {
    if (!id) return
    const savedList = JSON.parse(localStorage.getItem('saved_essays_local') || '[]')
    setIsSaved(savedList.includes(id))
  }, [id])

  const handleSaveToggle = () => {
    if (!id) return
    let savedList = JSON.parse(localStorage.getItem('saved_essays_local') || '[]')
    
    if (isSaved) {
      savedList = savedList.filter((item: string) => item !== id)
      setIsSaved(false)
      alert('Đã xóa bài viết khỏi thư viện cá nhân!')
    } else {
      savedList.push(id)
      setIsSaved(true)
      alert('Đã lưu bài viết vào thư viện cá nhân thành công!')
    }
    localStorage.setItem('saved_essays_local', JSON.stringify(savedList))
  }

  const handleSpeak = () => {
    if (!essay) return
    if (isSpeaking) {
      window.speechSynthesis.cancel()
      setIsSpeaking(false)
      return
    }
    const utterance = new SpeechSynthesisUtterance(essay.content || essay.title)
    utterance.lang = 'vi-VN'
    utterance.rate = 0.95
    utterance.pitch = 1
    utterance.onend = () => setIsSpeaking(false)
    utterance.onerror = () => setIsSpeaking(false)
    utteranceRef.current = utterance
    window.speechSynthesis.speak(utterance)
    setIsSpeaking(true)
  }

  const handleCopy = async () => {
    if (!essay) return
    try {
      await navigator.clipboard.writeText(essay.content || '')
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error('Failed to copy:', err)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="flex flex-col items-center">
          <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
          <p className="mt-4 text-slate-500 font-medium animate-pulse">Đang tải nội dung bài văn...</p>
        </div>
      </div>
    )
  }

  if (error || !essay) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="bg-white p-8 rounded-3xl shadow-lg max-w-md w-full text-center border border-slate-100">
          <h1 className="text-2xl font-bold text-slate-800 mb-2">Không tìm thấy bài viết</h1>
          <p className="text-slate-500 mb-6">Bài viết này có thể đã bị xóa hoặc đường dẫn không đúng.</p>
          <Link href="/" className="inline-flex items-center justify-center w-full py-3 px-4 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition">
            <ArrowLeft className="w-5 h-5 mr-2" /> Về lại trang chủ
          </Link>
        </div>
      </div>
    )
  }

  const categoryDisplay = essay.category || essay.genre || 'Văn mẫu'

  return (
    <div className="min-h-screen bg-[#F8FAFC] pb-20 selection:bg-blue-200">
      
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-lg border-b border-slate-200 shadow-sm transition-all duration-300">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <Link href="/" className="group flex items-center gap-2 text-slate-600 hover:text-blue-600 font-semibold transition-colors">
            <div className="p-2 bg-slate-100 group-hover:bg-blue-50 rounded-full transition-colors">
              <ArrowLeft size={18} />
            </div>
            <span>Về lại trang chủ</span>
          </Link>

          <div className="flex items-center gap-2">
            <button
              onClick={handleSpeak}
              className={`flex items-center gap-2 px-3 sm:px-4 py-2 rounded-full transition-all text-sm font-semibold shadow-sm ${
                isSpeaking ? 'bg-blue-600 text-white' : 'bg-white border border-slate-200 text-slate-700 hover:border-blue-300'
              }`}
            >
              <Volume2 size={16} />
              <span className="hidden sm:inline">{isSpeaking ? 'Dừng đọc' : 'Nghe bài'}</span>
            </button>

            <button
              onClick={handleCopy}
              className="flex items-center gap-2 px-3 sm:px-4 py-2 rounded-full bg-white border border-slate-200 text-slate-700 hover:border-slate-300 text-sm font-semibold shadow-sm"
            >
              {copied ? <Check size={16} className="text-green-500" /> : <Copy size={16} />}
              <span className="hidden sm:inline">{copied ? 'Đã sao chép' : 'Sao chép'}</span>
            </button>

            <button
              onClick={handleSaveToggle}
              className={`flex items-center gap-2 px-3 sm:px-4 py-2 rounded-full border text-sm font-semibold shadow-sm transition-all ${
                isSaved ? 'bg-orange-50 border-orange-200 text-orange-600' : 'bg-white border-slate-200 text-slate-700 hover:border-slate-300'
              }`}
            >
              {isSaved ? <BookmarkCheck size={18} className="fill-current" /> : <Bookmark size={18} />}
              <span className="hidden sm:inline">{isSaved ? 'Đã lưu bài' : 'Lưu bài'}</span>
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 mt-8 md:mt-12">
        <div className="mb-10 text-center animate-in fade-in duration-500">
          <div className="flex flex-wrap justify-center gap-3 mb-4">
            <span className="px-4 py-1.5 rounded-full bg-blue-100 text-blue-700 font-bold text-sm shadow-sm">
              {essay.grade || 'Lớp 9'}
            </span>
            <span className="px-4 py-1.5 rounded-full bg-purple-100 text-purple-700 font-bold text-sm shadow-sm flex items-center gap-1.5">
              <Sparkles size={14} /> {categoryDisplay}
            </span>
          </div>

          <h1 className="text-3xl md:text-5xl font-extrabold text-slate-900 mb-6 leading-tight max-w-3xl mx-auto">
            {essay.title}
          </h1>

          <div className="flex flex-wrap items-center justify-center gap-4 md:gap-8 text-sm font-medium text-slate-500 bg-white inline-flex px-6 py-3 rounded-full border border-slate-200 shadow-sm">
            <div className="flex items-center gap-2"><User size={16} className="text-blue-500"/> {essay.author || 'Admin'}</div>
            <div className="flex items-center gap-2"><Eye size={16} className="text-emerald-500"/> {(essay.views || 0) + 1} lượt xem</div>
            <div className="flex items-center gap-2"><Calendar size={16} className="text-orange-500"/> {new Date(essay.created_at || Date.now()).toLocaleDateString('vi-VN')}</div>
          </div>
        </div>

        {(essay.outline_intro || essay.outline_body || essay.outline_conclusion) && (
          <section className="mb-10">
            <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-3xl p-6 md:p-8 shadow-xl text-white">
              <h2 className="text-xl font-bold mb-6 flex items-center gap-3">
                <div className="p-2 bg-white/10 rounded-xl"><Bookmark size={20} /></div>
                Dàn ý chi tiết bài văn
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {essay.outline_intro && (
                  <div className="bg-white/5 border border-white/10 p-5 rounded-2xl">
                    <h3 className="text-blue-300 font-bold mb-3">1. Mở bài</h3>
                    <p className="text-slate-300 text-sm leading-relaxed whitespace-pre-wrap">{essay.outline_intro}</p>
                  </div>
                )}
                {essay.outline_body && (
                  <div className="bg-white/5 border border-white/10 p-5 rounded-2xl">
                    <h3 className="text-purple-300 font-bold mb-3">2. Thân bài</h3>
                    <p className="text-slate-300 text-sm leading-relaxed whitespace-pre-wrap">{essay.outline_body}</p>
                  </div>
                )}
                {essay.outline_conclusion && (
                  <div className="bg-white/5 border border-white/10 p-5 rounded-2xl">
                    <h3 className="text-emerald-300 font-bold mb-3">3. Kết bài</h3>
                    <p className="text-slate-300 text-sm leading-relaxed whitespace-pre-wrap">{essay.outline_conclusion}</p>
                  </div>
                )}
              </div>
            </div>
          </section>
        )}

        <article className="animate-in fade-in duration-700">
          <div className="bg-white rounded-[2.5rem] p-8 md:p-12 shadow-sm border border-slate-200">
            <div className="prose prose-lg md:prose-xl max-w-none text-slate-700 leading-[2.2] whitespace-pre-wrap font-serif
                            first-letter:text-6xl first-letter:font-bold first-letter:text-blue-600 first-letter:mr-3 first-letter:float-left">
              {essay.content || 'Nội dung bài viết đang được cập nhật...'}
            </div>
          </div>
        </article>
      </main>
    </div>
  )
}