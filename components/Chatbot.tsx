'use client'

import { useState, useRef, useEffect } from 'react'
import { usePathname } from 'next/navigation' // Thêm hook lấy đường dẫn
import { MessageCircle, X, Send, Bot, User, Sparkles } from 'lucide-react'

export default function Chatbot() {
  const pathname = usePathname()
  const [isOpen, setIsOpen] = useState(false)
  const [messages, setMessages] = useState<{role: 'user' | 'ai', content: string}[]>([
    { role: 'ai', content: 'Chào bạn! Mình là Trợ lý AI của Thư Viện Văn Mẫu. Mình có thể giúp bạn lập dàn ý, giải đáp thắc mắc tác phẩm, hoặc ôn thi Ngữ Văn. Bạn cần hỗ trợ gì nào?' }
  ])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // Tự động cuộn xuống tin nhắn mới nhất
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages, isOpen])

  // KIỂM TRA ĐIỀU KIỆN ẨN CHATBOT (CHỐNG GIAN LẬN)
  // Nếu đang ở đường dẫn /practice/... (ví dụ /practice/123) thì ẩn Chatbot
  // Nhưng nếu đang ở trang danh sách đề /practice thì vẫn cho hiển thị
  const isTakingQuiz = pathname?.startsWith('/practice/') && pathname !== '/practice'
  
  if (isTakingQuiz) {
    return null // Ẩn hoàn toàn Chatbot khỏi màn hình làm bài
  }

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim() || isLoading) return

    const userMsg = input.trim()
    setInput('')
    setMessages(prev => [...prev, { role: 'user', content: userMsg }])
    setIsLoading(true)

    try {
      const history = messages.slice(1).map(m => ({ role: m.role, content: m.content }))

      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: userMsg, history })
      })

      const data = await res.json()

      if (res.ok) {
        setMessages(prev => [...prev, { role: 'ai', content: data.reply }])
      } else {
        setMessages(prev => [...prev, { role: 'ai', content: data.reply || 'Có lỗi xảy ra.' }])
      }
    } catch (error) {
      setMessages(prev => [...prev, { role: 'ai', content: 'Lỗi kết nối đến máy chủ AI.' }])
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <>
      {/* Nút bong bóng nổi bật */}
      <button
        onClick={() => setIsOpen(true)}
        className={`fixed bottom-6 right-6 lg:bottom-8 lg:right-8 w-14 h-14 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-full flex items-center justify-center shadow-[0_0_20px_rgba(37,99,235,0.5)] hover:scale-110 transition-all duration-300 z-50 ${isOpen ? 'scale-0 opacity-0 pointer-events-none' : 'scale-100 opacity-100'}`}
      >
        <MessageCircle size={28} />
        <span className="absolute -top-1 -right-1 flex h-4 w-4">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-4 w-4 bg-red-500 border-2 border-white"></span>
        </span>
      </button>

      {/* Cửa sổ Chat Box */}
      <div className={`fixed bottom-6 right-6 lg:bottom-8 lg:right-8 w-[calc(100vw-3rem)] sm:w-[400px] h-[550px] max-h-[80vh] bg-white rounded-3xl shadow-2xl flex flex-col overflow-hidden transition-all duration-300 transform origin-bottom-right z-50 border border-slate-200 ${isOpen ? 'scale-100 opacity-100' : 'scale-0 opacity-0 pointer-events-none'}`}>
        
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-4 flex items-center justify-between text-white shrink-0 shadow-md z-10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm border border-white/30">
              <Bot size={24} className="text-white" />
            </div>
            <div>
              <h3 className="font-bold text-base leading-tight">AI Trợ Giảng Ngữ Văn</h3>
              <p className="text-[11px] text-blue-100 flex items-center gap-1 mt-0.5">
                <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse"></span> Đang trực tuyến
              </p>
            </div>
          </div>
          <button onClick={() => setIsOpen(false)} className="p-2 hover:bg-white/20 rounded-full transition-colors active:scale-90">
            <X size={20} />
          </button>
        </div>

        {/* Khu vực tin nhắn */}
        <div className="flex-1 overflow-y-auto p-4 space-y-5 bg-[#F4F7FB]">
          {messages.map((msg, idx) => (
            <div key={idx} className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 shadow-sm ${msg.role === 'user' ? 'bg-indigo-100 text-indigo-600' : 'bg-blue-600 text-white'}`}>
                {msg.role === 'user' ? <User size={16} /> : <Sparkles size={16} />}
              </div>
              <div className={`px-4 py-3 rounded-2xl max-w-[75%] text-sm leading-relaxed whitespace-pre-wrap shadow-sm ${msg.role === 'user' ? 'bg-indigo-600 text-white rounded-tr-sm' : 'bg-white border border-slate-200 text-slate-700 rounded-tl-sm'}`}>
                {msg.content}
              </div>
            </div>
          ))}
          
          {/* Hiệu ứng AI đang gõ */}
          {isLoading && (
            <div className="flex gap-3">
              <div className="w-8 h-8 rounded-full flex items-center justify-center shrink-0 bg-blue-600 text-white shadow-sm">
                <Bot size={16} />
              </div>
              <div className="px-4 py-4 rounded-2xl bg-white border border-slate-200 rounded-tl-sm shadow-sm flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-slate-400 animate-bounce"></span>
                <span className="w-2 h-2 rounded-full bg-slate-400 animate-bounce" style={{ animationDelay: '0.2s' }}></span>
                <span className="w-2 h-2 rounded-full bg-slate-400 animate-bounce" style={{ animationDelay: '0.4s' }}></span>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Thanh nhập tin nhắn */}
        <form onSubmit={sendMessage} className="p-3 bg-white border-t border-slate-100 shrink-0">
          <div className="relative flex items-center">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Nhập câu hỏi của bạn..."
              className="w-full pl-4 pr-12 py-3.5 bg-slate-50 border border-slate-200 rounded-full focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all text-sm font-medium"
              disabled={isLoading}
            />
            <button
              type="submit"
              disabled={!input.trim() || isLoading}
              className="absolute right-1.5 p-2.5 bg-blue-600 text-white rounded-full hover:bg-blue-700 disabled:opacity-50 disabled:hover:bg-blue-600 transition-all active:scale-90"
            >
              <Send size={16} className={input.trim() && !isLoading ? 'translate-x-0.5 -translate-y-0.5' : ''} />
            </button>
          </div>
        </form>
      </div>
    </>
  )
}