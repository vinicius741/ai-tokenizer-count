import { useCallback, useEffect, useRef, useState } from 'react'
import { fetchEventSource } from '@microsoft/fetch-event-source'
import { toast } from 'sonner'

export interface ProgressData {
  current: number
  total: number
  filename: string
  timestamp: string
}

export interface SseCallbacks {
  onProgress: (data: ProgressData) => void
  onComplete: (results: unknown) => void
  onError: (error: string) => void
}

export function useSseConnection() {
  const abortControllerRef = useRef<AbortController | null>(null)
  const callbacksRef = useRef<SseCallbacks | null>(null)
  const [lastMessage, setLastMessage] = useState<number>(Date.now())
  const timeoutIdRef = useRef<NodeJS.Timeout | null>(null)

  // Clear timeout helper
  const clearTimeoutRef = useCallback(() => {
    if (timeoutIdRef.current) {
      clearTimeout(timeoutIdRef.current)
      timeoutIdRef.current = null
    }
  }, [])

  // Set timeout helper
  const setTimeoutRef = useCallback(() => {
    clearTimeoutRef()
    timeoutIdRef.current = setTimeout(() => {
      toast.error('Connection timeout', {
        description: 'No response received after 30 seconds. Please try again.',
        duration: 30000,
        action: {
          label: 'Retry',
          onClick: () => window.location.reload()
        }
      })
    }, 30000)
  }, [clearTimeoutRef])

  const connect = useCallback(async (
    jobId: string,
    callbacks: SseCallbacks
  ) => {
    // Abort any existing connection
    if (abortControllerRef.current) {
      abortControllerRef.current.abort()
    }

    abortControllerRef.current = new AbortController()
    callbacksRef.current = callbacks

    const { onProgress, onComplete, onError } = callbacks

    // Start 30-second timeout when connection opens
    setTimeoutRef()
    setLastMessage(Date.now())

    try {
      await fetchEventSource(`http://localhost:8787/api/sse/${jobId}`, {
        method: 'GET',
        signal: abortControllerRef.current.signal,

        onopen(response) {
          if (response.ok && response.headers.get('content-type') === 'text/event-stream') {
            // Reset timeout on successful connection
            setTimeoutRef()
            setLastMessage(Date.now())
            return Promise.resolve()
          }
          throw new Error(`Unexpected response: ${response.status}`)
        },

        onmessage(msg) {
          // Reset timeout on every message
          setTimeoutRef()
          setLastMessage(Date.now())

          if (msg.event === 'progress') {
            const data = JSON.parse(msg.data) as ProgressData
            onProgress(data)
          } else if (msg.event === 'completed') {
            const results = JSON.parse(msg.data)
            onComplete(results)
          } else if (msg.event === 'error') {
            const error = JSON.parse(msg.data) as { message: string }
            onError(error.message)
          }
        },

        onerror(err) {
          onError(err.message)
          throw err
        },
      })
    } catch (error) {
      if (error instanceof Error && error.name !== 'AbortError') {
        onError(error.message)
      }
    } finally {
      // Clear timeout when connection closes
      clearTimeoutRef()
    }
  }, [setTimeoutRef, clearTimeoutRef])

  const disconnect = useCallback(() => {
    clearTimeoutRef()
    if (abortControllerRef.current) {
      abortControllerRef.current.abort()
      abortControllerRef.current = null
    }
    callbacksRef.current = null
  }, [clearTimeoutRef])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      disconnect()
    }
  }, [disconnect])

  return { connect, disconnect, isConnected: () => abortControllerRef.current !== null }
}
