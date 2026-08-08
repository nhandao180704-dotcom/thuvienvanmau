import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co'
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder-key'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

export type Essay = {
  id: string
  title: string
  class_level: number
  category: 'văn_biểu_cảm' | 'văn_tự_sự' | 'văn_thuyết_minh' | 'văn_nghị_luận' | 'phân_tích_tác_phẩm'
  author: string
  content: string
  outline_intro?: string
  outline_body?: string
  outline_conclusion?: string
  status: 'published' | 'draft' | 'hidden'
  views: number
  created_at: string
  updated_at: string
  created_by?: string
}

export type SavedEssay = {
  id: string
  user_id: string
  essay_id: string
  created_at: string
}

export type Quiz = {
  id: string
  title: string
  description?: string
  category_slug: string
  grade?: number
  time_limit_minutes?: number
  status: 'published' | 'draft' | 'hidden'
  total_attempts: number
  created_at: string
  updated_at: string
  question_count?: number
}

export type Question = {
  id: string
  quiz_id: string
  question_text: string
  explanation?: string
  order_index: number
  created_at: string
  options?: Option[]
}

export type Option = {
  id: string
  question_id: string
  option_label: 'A' | 'B' | 'C' | 'D'
  option_text: string
  is_correct: boolean
  created_at: string
}

export type QuizWithQuestions = Quiz & {
  questions: (Question & { options: Option[] })[]
}
