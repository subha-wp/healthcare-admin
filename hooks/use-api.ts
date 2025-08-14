"use client"

import { useState, useCallback } from "react"
import { useToast } from "@/hooks/use-toast"

interface ApiOptions {
  onSuccess?: (data: any) => void
  onError?: (error: Error) => void
  showSuccessToast?: boolean
  showErrorToast?: boolean
  successMessage?: string
  errorMessage?: string
}

interface ApiState {
  loading: boolean
  error: Error | null
}

export function useApi() {
  const [state, setState] = useState<ApiState>({
    loading: false,
    error: null,
  })
  const { toast } = useToast()

  const execute = useCallback(
    async <T = any>(apiCall: () => Promise<Response>, options: ApiOptions = {}): Promise<T | null> => {
      const {
        onSuccess,
        onError,
        showSuccessToast = false,
        showErrorToast = true,
        successMessage = "Operation completed successfully",
        errorMessage = "An error occurred. Please try again.",
      } = options

      setState({ loading: true, error: null })

      try {
        const response = await apiCall()

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}))
          throw new Error(errorData.error || `HTTP error! status: ${response.status}`)
        }

        const data = await response.json()

        setState({ loading: false, error: null })

        if (showSuccessToast) {
          toast({
            title: "Success",
            description: successMessage,
          })
        }

        onSuccess?.(data)
        return data
      } catch (err) {
        const error = err instanceof Error ? err : new Error("Unknown error occurred")
        setState({ loading: false, error })

        if (showErrorToast) {
          toast({
            title: "Error",
            description: error.message || errorMessage,
            variant: "destructive",
          })
        }

        onError?.(error)
        return null
      }
    },
    [toast],
  )

  const get = useCallback(
    <T = any>(url: string, options?: ApiOptions): Promise<T | null> => {
      return execute<T>(() => fetch(url), options)
    },
    [execute],
  )

  const post = useCallback(
    <T = any>(url: string, data?: any, options?: ApiOptions): Promise<T | null> => {
      return execute<T>(
        () =>
          fetch(url, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: data ? JSON.stringify(data) : undefined,
          }),
        options,
      )
    },
    [execute],
  )

  const put = useCallback(
    <T = any>(url: string, data?: any, options?: ApiOptions): Promise<T | null> => {
      return execute<T>(
        () =>
          fetch(url, {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
            },
            body: data ? JSON.stringify(data) : undefined,
          }),
        options,
      )
    },
    [execute],
  )

  const del = useCallback(
    <T = any>(url: string, options?: ApiOptions): Promise<T | null> => {
      return execute<T>(
        () =>
          fetch(url, {
            method: "DELETE",
          }),
        options,
      )
    },
    [execute],
  )

  return {
    ...state,
    get,
    post,
    put,
    delete: del,
    execute,
  }
}
