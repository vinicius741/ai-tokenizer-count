import { useCallback, useEffect, useRef } from 'react'
import { fetchEventSource } from '@microsoft/fetch-event-source'

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

    try {
      await fetchEventSource(`http://localhost:8787/api/sse/${jobId}`, {
        method: 'GET',
        signal: abortControllerRef.current.signal,

        onopen(response) {
          if (response.ok && response.headers.get('content-type') === 'text/event-stream') {
            return
          }
          throw new Error(`Unexpected response: ${response.status}`)
        },

        onmessage(msg) {
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
    }
  }, [])

  const disconnect = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort()
      abortControllerRef.current = null
    }
    callbacksRef.current = null
  }, [])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      disconnect()
    }
  }, [disconnect])

  return { connect, disconnect, isConnected: () => abortControllerRef.current !== null }
}
