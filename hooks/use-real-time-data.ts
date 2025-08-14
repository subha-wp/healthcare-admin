"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import { useToast } from "@/hooks/use-toast"

interface UseRealTimeDataOptions {
  endpoint: string
  interval?: number
  enabled?: boolean
  onError?: (error: Error) => void
  onSuccess?: (data: any) => void
  retryAttempts?: number
  retryDelay?: number
}

interface UseRealTimeDataReturn<T> {
  data: T | null
  loading: boolean
  error: Error | null
  refetch: () => Promise<void>
  lastUpdated: Date | null
}

export function useRealTimeData<T = any>({
  endpoint,
  interval = 30000, // 30 seconds default
  enabled = true,
  onError,
  onSuccess,
  retryAttempts = 3,
  retryDelay = 1000,
}: UseRealTimeDataOptions): UseRealTimeDataReturn<T> {
  const [data, setData] = useState<T | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null)
  const { toast } = useToast()
  const intervalRef = useRef<NodeJS.Timeout>()
  const retryTimeoutRef = useRef<NodeJS.Timeout>()
  const retryCountRef = useRef(0)

  const fetchData = useCallback(async () => {
    try {
      const response = await fetch(endpoint)
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      const result = await response.json()
      setData(result)
      setError(null)
      setLastUpdated(new Date())
      retryCountRef.current = 0
      onSuccess?.(result)
    } catch (err) {
      const error = err instanceof Error ? err : new Error("Unknown error occurred")
      setError(error)
      onError?.(error)

      // Retry logic
      if (retryCountRef.current < retryAttempts) {
        retryCountRef.current++
        retryTimeoutRef.current = setTimeout(() => {
          fetchData()
        }, retryDelay * retryCountRef.current)
      } else {
        toast({
          title: "Connection Error",
          description: "Failed to fetch latest data. Please check your connection.",
          variant: "destructive",
        })
      }
    } finally {
      setLoading(false)
    }
  }, [endpoint, onError, onSuccess, retryAttempts, retryDelay, toast])

  const refetch = useCallback(async () => {
    setLoading(true)
    retryCountRef.current = 0
    await fetchData()
  }, [fetchData])

  useEffect(() => {
    if (!enabled) return

    // Initial fetch
    fetchData()

    // Set up polling
    intervalRef.current = setInterval(fetchData, interval)

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
      if (retryTimeoutRef.current) {
        clearTimeout(retryTimeoutRef.current)
      }
    }
  }, [enabled, fetchData, interval])

  return {
    data,
    loading,
    error,
    refetch,
    lastUpdated,
  }
}
