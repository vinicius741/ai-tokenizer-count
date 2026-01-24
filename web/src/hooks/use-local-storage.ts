import { useState, useCallback } from 'react'
import { toast } from 'sonner'
import { saveToLocalStorage, loadFromLocalStorage, clearLocalStorageKey } from '@/lib/storage-utils'

export function useLocalStorage<T>(key: string, initialValue: T) {
  // Get stored value or use initial
  const [storedValue, setStoredValue] = useState<T>(() => {
    if (typeof window === 'undefined') return initialValue
    return loadFromLocalStorage<T>(key) ?? initialValue
  })

  // Update localStorage when state changes
  const setValue = useCallback((value: T | ((val: T) => T)) => {
    const valueToStore = value instanceof Function ? value(storedValue) : value

    // Use saveToLocalStorage with quota detection
    const success = saveToLocalStorage(key, valueToStore, {
      quotaMB: 5,
      onError: (error) => {
        toast.error(`Storage quota exceeded: ${error.message}`, {
          duration: 30000,
          id: `quota-error-${key}`, // Prevent duplicate toasts
        })
      },
    })

    // Only update state if save succeeded
    if (success) {
      setStoredValue(valueToStore)
    }
  }, [key, storedValue])

  // Clear value from localStorage and reset state
  const clearValue = useCallback(() => {
    clearLocalStorageKey(key)
    setStoredValue(initialValue)
  }, [key, initialValue])

  return [storedValue, setValue, clearValue] as const
}
