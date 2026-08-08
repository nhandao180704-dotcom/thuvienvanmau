'use client'

import { useEffect, useState } from 'react'
import { supabase, type Essay } from './supabase-client'

export function useEssays(filters?: { classLevel?: number; category?: string }) {
  const [essays, setEssays] = useState<Essay[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    const fetchEssays = async () => {
      try {
        setLoading(true)
        let query = supabase.from('essays').select('*').eq('status', 'published')

        if (filters?.classLevel) {
          query = query.eq('class_level', filters.classLevel)
        }

        if (filters?.category) {
          query = query.eq('category', filters.category)
        }

        const { data, error } = await query.order('created_at', { ascending: false })

        if (error) throw error
        setEssays(data || [])
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Failed to fetch essays'))
      } finally {
        setLoading(false)
      }
    }

    fetchEssays()
  }, [filters?.classLevel, filters?.category])

  return { essays, loading, error }
}

export function useEssayDetail(essayId: string) {
  const [essay, setEssay] = useState<Essay | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    if (!essayId) return

    const fetchEssay = async () => {
      try {
        setLoading(true)
        const { data, error } = await supabase
          .from('essays')
          .select('*')
          .eq('id', essayId)
          .eq('status', 'published')
          .single()

        if (error) throw error
        setEssay(data)
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Failed to fetch essay'))
      } finally {
        setLoading(false)
      }
    }

    fetchEssay()
  }, [essayId])

  return { essay, loading, error }
}

export function useSavedEssays(userId: string | null) {
  const [savedIds, setSavedIds] = useState<Set<string>>(new Set())
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!userId) {
      setLoading(false)
      return
    }

    const fetchSavedEssays = async () => {
      try {
        const { data, error } = await supabase
          .from('saved_essays')
          .select('essay_id')
          .eq('user_id', userId)

        if (error) throw error
        setSavedIds(new Set(data?.map(item => item.essay_id) || []))
      } catch (err) {
        console.error('Failed to fetch saved essays:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchSavedEssays()
  }, [userId])

  const toggleSave = async (essayId: string) => {
    if (!userId) return

    const isSaved = savedIds.has(essayId)

    try {
      if (isSaved) {
        const { error } = await supabase
          .from('saved_essays')
          .delete()
          .eq('user_id', userId)
          .eq('essay_id', essayId)

        if (error) throw error
        setSavedIds(prev => {
          const next = new Set(prev)
          next.delete(essayId)
          return next
        })
      } else {
        const { error } = await supabase
          .from('saved_essays')
          .insert({ user_id: userId, essay_id: essayId })

        if (error) throw error
        setSavedIds(prev => new Set(prev).add(essayId))
      }
    } catch (err) {
      console.error('Failed to toggle save:', err)
    }
  }

  return { savedIds, loading, toggleSave }
}
