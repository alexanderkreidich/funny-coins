import { useState, useEffect, useCallback, useRef } from 'react'

export interface UseLocalStorageOptions {
  debounceMs?: number
  serialize?: (value: any) => string
  deserialize?: (value: string) => any
  onError?: (error: Error) => void
}

export interface UseLocalStorageReturn<T> {
  value: T
  setValue: (value: T | ((prev: T) => T)) => void
  isLoading: boolean
  error: Error | null
  clearValue: () => void
  isSupported: boolean
}

const defaultOptions: Required<UseLocalStorageOptions> = {
  debounceMs: 500,
  serialize: JSON.stringify,
  deserialize: JSON.parse,
  onError: (error) => console.warn('LocalStorage error:', error)
}

export function useLocalStorage<T>(
  key: string,
  initialValue: T,
  options: UseLocalStorageOptions = {}
): UseLocalStorageReturn<T> {
  const opts = { ...defaultOptions, ...options }
  
  // Check if localStorage is supported
  const [isSupported] = useState(() => {
    try {
      if (typeof window === 'undefined') return false
      const testKey = '__localStorage_test__'
      window.localStorage.setItem(testKey, 'test')
      window.localStorage.removeItem(testKey)
      return true
    } catch {
      return false
    }
  })

  const [value, setValue] = useState<T>(initialValue)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)
  
  // Refs for debouncing
  const timeoutRef = useRef<NodeJS.Timeout | undefined>(undefined)
  const pendingValueRef = useRef<T | undefined>(undefined)

  // Load initial value from localStorage
  useEffect(() => {
    if (!isSupported) {
      setIsLoading(false)
      return
    }

    try {
      const item = window.localStorage.getItem(key)
      if (item !== null) {
        const parsedValue = opts.deserialize(item)
        setValue(parsedValue)
      }
      setError(null)
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to load from localStorage')
      setError(error)
      opts.onError(error)
    } finally {
      setIsLoading(false)
    }
  }, [key, isSupported])

  // Debounced save function
  const debouncedSave = useCallback((valueToSave: T) => {
    if (!isSupported) return

    // Clear existing timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
    }

    // Store the pending value
    pendingValueRef.current = valueToSave

    // Set new timeout
    timeoutRef.current = setTimeout(() => {
      try {
        const serializedValue = opts.serialize(valueToSave)
        window.localStorage.setItem(key, serializedValue)
        setError(null)
      } catch (err) {
        const error = err instanceof Error ? err : new Error('Failed to save to localStorage')
        setError(error)
        opts.onError(error)
      }
    }, opts.debounceMs)
  }, [key, isSupported])

  // Update value function
  const updateValue = useCallback((newValue: T | ((prev: T) => T)) => {
    setValue(prevValue => {
      const nextValue = typeof newValue === 'function' 
        ? (newValue as (prev: T) => T)(prevValue)
        : newValue
      
      // Debounce the save operation
      debouncedSave(nextValue)
      
      return nextValue
    })
  }, [debouncedSave])

  // Clear value function
  const clearValue = useCallback(() => {
    if (!isSupported) return

    try {
      window.localStorage.removeItem(key)
      setValue(initialValue)
      setError(null)
      
      // Clear any pending saves
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to clear localStorage')
      setError(error)
      opts.onError(error)
    }
  }, [key, initialValue, isSupported])

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
    }
  }, [])

  // Force save any pending value before unmount
  useEffect(() => {
    return () => {
      if (pendingValueRef.current !== undefined && isSupported) {
        try {
          const serializedValue = opts.serialize(pendingValueRef.current)
          window.localStorage.setItem(key, serializedValue)
        } catch (err) {
          opts.onError(err instanceof Error ? err : new Error('Failed to save pending value'))
        }
      }
    }
  }, [key, isSupported])

  return {
    value,
    setValue: updateValue,
    isLoading,
    error,
    clearValue,
    isSupported
  }
}

// Specialized hook for form data persistence
export interface FormDataPersistence {
  tokenAddress: string
  recipients: string
  amounts: string
  lastUpdated: number
}

export function useFormDataPersistence(initialData: Omit<FormDataPersistence, 'lastUpdated'>) {
  const defaultFormData: FormDataPersistence = {
    ...initialData,
    lastUpdated: Date.now()
  }

  return useLocalStorage('tsender-form-data', defaultFormData, {
    debounceMs: 500,
    serialize: (data) => {
      return JSON.stringify({
        ...data,
        lastUpdated: Date.now()
      })
    },
    onError: (error) => {
      console.warn('Form data persistence error:', error)
    }
  })
}

// Hook for user preferences
export interface UserPreferences {
  preferredNetwork?: number
  recentTokens: string[]
  theme?: 'light' | 'dark'
  autoSaveEnabled: boolean
}

export function useUserPreferences() {
  const defaultPreferences: UserPreferences = {
    recentTokens: [],
    autoSaveEnabled: true
  }

  return useLocalStorage('tsender-user-preferences', defaultPreferences, {
    debounceMs: 1000, // Longer debounce for preferences
    onError: (error) => {
      console.warn('User preferences error:', error)
    }
  })
}