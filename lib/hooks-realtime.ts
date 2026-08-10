'use client'

import { useEffect, useState, useCallback } from 'react'
import { supabase, type Essay } from './supabase-client'
import type { RealtimePostgresChangesPayload } from '@supabase/supabase-js'

export function useEssaysRealtime(filters?: { classLevel?: number; category?: string }) {
  const [essays, setEssays] = useState<Essay[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    const fetchAndSubscribe = async () => {
      try {
        setLoading(true)

        // Initial fetch
        let query = supabase.from('essays').select('*').eq('status', 'published')

        if (filters?.classLevel) {
          query = query.eq('class_level', filters.classLevel)
        }

        if (filters?.category) {
          query = query.eq('category', filters.category)
        }

        const { data, error: fetchError } = await query.order('created_at', { ascending: false })

        if (fetchError) throw fetchError
        setEssays(data || [])

        // Subscribe to real-time changes
        const channel = supabase
          .channel('essays_changes')
          .on(
            'postgres_changes',
            {
              event: '*',
              schema: 'public',
              table: 'essays',
            },
            (payload: RealtimePostgresChangesPayload<Essay>) => {
              if (payload.eventType === 'INSERT') {
                const newEssay = payload.new
                if (newEssay.status === 'published') {
                  setEssays(prev => [newEssay, ...prev])
                }
              } else if (payload.eventType === 'UPDATE') {
                const updatedEssay = payload.new
                setEssays(prev =>
                  prev.map(e => (e.id === updatedEssay.id ? updatedEssay : e))
                )
              } else if (payload.eventType === 'DELETE') {
                setEssays(prev => prev.filter(e => e.id !== payload.old.id))
              }
            }
          )
          .subscribe()

        return () => {
          supabase.removeChannel(channel)
        }
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Failed to fetch essays'))
      } finally {
        setLoading(false)
      }
    }

    fetchAndSubscribe()
  }, [filters?.classLevel, filters?.category])

  return { essays, loading, error }
}

export function useEssayDetailRealtime(essayId: string) {
  const [essay, setEssay] = useState<Essay | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    if (!essayId) return

    const fetchAndSubscribe = async () => {
      try {
        setLoading(true)

        // Initial fetch
        const { data, error: fetchError } = await supabase
          .from('essays')
          .select('*')
          .eq('id', essayId)
          .eq('status', 'published')
          .maybeSingle()

        if (fetchError) throw fetchError
        setEssay(data)

        // Subscribe to real-time changes for this essay
        const channel = supabase
          .channel(`essay_${essayId}`)
          .on(
            'postgres_changes',
            {
              event: 'UPDATE',
              schema: 'public',
              table: 'essays',
              filter: `id=eq.${essayId}`,
            },
            (payload: RealtimePostgresChangesPayload<Essay>) => {
              if (payload.eventType === 'UPDATE') {
                if (payload.new.status === 'published') {
                  setEssay(payload.new as Essay)
                } else {
                  setEssay(null)
                }
              }
            }
          )
          .on(
            'postgres_changes',
            {
              event: 'DELETE',
              schema: 'public',
              table: 'essays',
              filter: `id=eq.${essayId}`,
            },
            () => {
              setEssay(null)
            }
          )
          .subscribe()

        return () => {
          supabase.removeChannel(channel)
        }
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Failed to fetch essay'))
      } finally {
        setLoading(false)
      }
    }

    fetchAndSubscribe()
  }, [essayId])

  return { essay, loading, error }
}