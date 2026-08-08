'use client'

import { useState, useCallback, useEffect } from 'react'
import { Check, AlertCircle, X } from 'lucide-react'

export type ToastType = 'success' | 'error' | 'info'

interface Toast {
  id: string
  message: string
  type: ToastType
}

const toastStore: {
  listeners: Set<(toasts: Toast[]) => void>
  toasts: Toast[]
  showToast: (message: string, type: ToastType) => void
} = {
  listeners: new Set(),
  toasts: [],
  showToast: (message: string, type: ToastType) => {
    const id = Date.now().toString()
    const toast = { id, message, type }
    toastStore.toasts.push(toast)
    toastStore.listeners.forEach(listener => listener([...toastStore.toasts]))
    setTimeout(() => {
      toastStore.toasts = toastStore.toasts.filter(t => t.id !== id)
      toastStore.listeners.forEach(listener => listener([...toastStore.toasts]))
    }, 3000)
  },
}

export const useToast = () => {
  return {
    success: (message: string) => toastStore.showToast(message, 'success'),
    error: (message: string) => toastStore.showToast(message, 'error'),
    info: (message: string) => toastStore.showToast(message, 'info'),
  }
}

export function ToastContainer() {
  const [toasts, setToasts] = useState<Toast[]>([])

  useEffect(() => {
    toastStore.listeners.add(setToasts)
    return () => {
      toastStore.listeners.delete(setToasts)
    }
  }, [])

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-3 pointer-events-none">
      {toasts.map(toast => (
        <Toast key={toast.id} {...toast} />
      ))}
    </div>
  )
}

function Toast({ message, type }: Omit<Toast, 'id'>) {
  const bgColor = {
    success: 'bg-green-500',
    error: 'bg-red-500',
    info: 'bg-blue-500',
  }[type]

  const Icon = {
    success: Check,
    error: AlertCircle,
    info: AlertCircle,
  }[type]

  return (
    <div
      className={`${bgColor} text-white px-6 py-3 rounded-lg shadow-lg font-medium flex items-center gap-3 animate-in fade-in slide-in-from-bottom-4 duration-300 pointer-events-auto`}
    >
      <Icon size={20} />
      <span>{message}</span>
    </div>
  )
}
