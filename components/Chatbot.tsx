'use client'

import { useState, useRef, useEffect } from 'react'
import { usePathname } from 'next/navigation'
import { MessageCircle, X, Send, Bot, User, Sparkles, Copy, Trash2, Check } from 'lucide-react'
import ReactMarkdown from 'react-markdown'

export default function Chatbot() {
  const pathname = usePathname()
  const [isOpen, setIsOpen] = useState(false)
  const [copiedId, setCopiedId] = useState<string | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const [input, setInput] = useState('')
  const [messages, setMessages] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    try {
      const saved = localStorage.getItem('chat_history')
      if (saved) {
        const parsed = JSON.parse(saved)
        if (Array.isArray(parsed) && parsed.length > 0) {
          setMessages(parsed)
        }
      }
    } catch (e) {
      localStorage.removeItem('chat_history')
    }
  }, [])

  useEffect(() => {
    if (messages.length > 0) {
      localStorage.setItem('chat_history', JSON.stringify(messages))
    }
  }, [messages])

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' })
    }
  }, [messages, isOpen])

  const clearChat = () => {
    if (confirm('Bạn có chắc muốn xóa toàn bộ lịch sử trò chuyện?')) {
      setMessages([])
      localStorage.removeItem('chat_history')
    }
  }

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text)
    setCopiedId(id)
    setTimeout(() => setCopiedId(null), 2000)
  }

  const isTakingQuiz = pathname?.startsWith('/practice/') && pathname !== '/practice'
  if (isTakingQuiz) return null

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault()
    const textToSend = input.trim()
    if (!textToSend || isLoading) return

    const userMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: textToSend
    }

    const updatedMessages = [...messages, userMessage]
    setMessages(updatedMessages)
    setInput('')
    setIsLoading(true)

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: updatedMessages.map(m => ({ role: m.role, content: m.content }))
        })
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Lỗi kết nối từ server AI')
      }

      const aiMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: data.text || 'Không có phản hồi từ AI.'
      }

      setMessages(prev => [...prev, aiMessage])
    } catch (error) {
      console.error('Lỗi chat:', error)
      setMessages(prev => [
        ...prev, 
        { 
          id: Date.now().toString(), 
          role: 'assistant', 
          content: 'Xin lỗi, hiện tại hệ thống AI đang gặp chút sự cố kết nối. Bạn vui lòng thử lại sau nhé!' 
        }
      ])
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className={`fixed bottom-6 right-6 lg:bottom-8 lg:right-8 w-14 h-14 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-full flex items-center justify-center shadow-[0_0_20px_rgba(37,99,235,0.5)] hover:scale-110 transition-all duration-300 z-50 ${isOpen ? 'scale-0 opacity-0 pointer-events-none' : 'scale-100 opacity-100'}`}
      >
        <MessageCircle size={28} />
      </button>

      <div className={`fixed bottom-6 right-6 lg:bottom-8 lg:right-8 w-[calc(100vw-3rem)] sm:w-[450px] h-[600px] max-h-[85vh] bg-white rounded-3xl shadow-2xl flex flex-col overflow-hidden transition-all duration-300 transform origin-bottom-right z-50 border border-slate-200 ${isOpen ? 'scale-100 opacity-100' : 'scale-0 opacity-0 pointer-events-none'}`}>
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-4 flex items-center justify-between text-white shrink-0 shadow-md z-10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm border border-white/30">
              <Bot size={24} />
            </div>
            <div>
              <h3 className="font-bold text-base leading-tight">AI Trợ Giảng Ngữ Văn</h3>
              <p className="text-[11px] text-blue-100 flex items-center gap-1 mt-0.5">
                <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse"></span> Trực tuyến
              </p>
            </div>
          </div>
          <div className="flex gap-2">
            <button onClick={clearChat} title="Xóa lịch sử" className="p-2 hover:bg-white/20 rounded-full transition-colors">
              <Trash2 size={18} />
            </button>
            <button onClick={() => setIsOpen(false)} className="p-2 hover:bg-white/20 rounded-full transition-colors active:scale-90">
              <X size={20} />
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-5 bg-[#F4F7FB]">
          {messages.length === 0 && (
            <div className="flex gap-3">
              <div className="w-8 h-8 rounded-full flex items-center justify-center shrink-0 shadow-sm bg-blue-600 text-white">
                <Sparkles size={16} />
              </div>
              <div className="relative px-4 py-3 rounded-2xl max-w-[85%] text-sm leading-relaxed shadow-sm bg-white border border-slate-200 text-slate-700 rounded-tl-sm">
                Chào bạn! Mình là Trợ lý AI của Thư Viện Văn Mẫu. Bạn cần hỗ trợ gì nào?
              </div>
            </div>
          )}

          {messages.map((msg: any) => {
            const messageText = msg.content || '';
            if (!messageText) return null;

            return (
              <div key={msg.id} className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : 'group'}`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 shadow-sm ${msg.role === 'user' ? 'bg-indigo-100 text-indigo-600' : 'bg-blue-600 text-white'}`}>
                  {msg.role === 'user' ? <User size={16} /> : <Sparkles size={16} />}
                </div>

                <div className={`relative px-4 py-3 rounded-2xl max-w-[85%] text-sm leading-relaxed shadow-sm ${msg.role === 'user' ? 'bg-indigo-600 text-white rounded-tr-sm whitespace-pre-wrap' : 'bg-white border border-slate-200 text-slate-700 rounded-tl-sm'}`}>
                  {msg.role === 'user' ? (
                    messageText
                  ) : (
                    <>
                      <div className="prose prose-sm max-w-none prose-p:my-1 prose-headings:my-2 prose-ul:my-1 prose-li:my-0">
                        <ReactMarkdown>{messageText}</ReactMarkdown>
                      </div>
                      <button
                        onClick={() => copyToClipboard(messageText, msg.id)}
                        className="absolute -right-10 top-0 p-2 text-slate-400 hover:text-blue-600 opacity-0 group-hover:opacity-100 transition-opacity bg-white/80 rounded-full shadow-sm"
                        title="Copy"
                      >
                        {copiedId === msg.id ? <Check size={16} className="text-green-500" /> : <Copy size={16} />}
                      </button>
                    </>
                  )}
                </div>
              </div>
            )
          })}

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

        <form onSubmit={handleSendMessage} className="p-3 bg-white border-t border-slate-100 shrink-0">
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