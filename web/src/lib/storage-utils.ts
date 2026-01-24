/**
 * Safe localStorage operations with quota detection and error handling
 * Source: Phase 09 Research - localStorage QuotaExceededError handling patterns
 */

export interface StorageOptions {
  /** Maximum size in MB before throwing error (default: 5) */
  quotaMB?: number
  /** Error callback for quota exceeded errors */
  onError?: (error: Error) => void
}

/**
 * Safely saves data to localStorage with quota detection
 * @param key - Storage key
 * @param value - Value to store (will be JSON stringified)
 * @param options - Storage options including quota limit and error handler
 * @returns true if save succeeded, false if failed
 */
export function saveToLocalStorage<T>(
  key: string,
  value: T,
  options: StorageOptions = {}
): boolean {
  const { quotaMB = 5, onError } = options

  try {
    // Stringify value to JSON
    const serialized = JSON.stringify(value)

    // Calculate size using Blob API for accurate byte count
    const size = new Blob([serialized]).size
    const sizeMB = size / (1024 * 1024)

    // Check if size exceeds quota before attempting save
    if (sizeMB > quotaMB) {
      throw new Error(
        `Data size (${sizeMB.toFixed(2)}MB) exceeds quota (${quotaMB}MB)`
      )
    }

    // Attempt to save to localStorage
    localStorage.setItem(key, serialized)
    return true
  } catch (error) {
    // Handle QuotaExceededError specifically
    if (
      error instanceof Error &&
      (error.name === 'QuotaExceededError' ||
        error.message.includes('quota') ||
        error.message.includes('exceeds'))
    ) {
      onError?.(error)
      return false
    }

    // Log other errors but don't crash
    console.error(`Error saving ${key} to localStorage:`, error)
    return false
  }
}

/**
 * Safely loads data from localStorage
 * @param key - Storage key
 * @returns Parsed value or null if not found or error occurred
 */
export function loadFromLocalStorage<T>(key: string): T | null {
  try {
    const item = localStorage.getItem(key)
    return item ? (JSON.parse(item) as T) : null
  } catch (error) {
    console.error(`Error loading ${key} from localStorage:`, error)
    return null
  }
}

/**
 * Safely removes a key from localStorage
 * @param key - Storage key to remove
 */
export function clearLocalStorageKey(key: string): void {
  try {
    localStorage.removeItem(key)
  } catch (error) {
    console.error(`Error clearing ${key} from localStorage:`, error)
  }
}
