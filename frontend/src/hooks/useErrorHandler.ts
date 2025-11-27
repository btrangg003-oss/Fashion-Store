import { useState, useCallback } from 'react'
import { ErrorType, getErrorMessage, AppError } from '../services/errorHandler'

interface ErrorState {
  error: string | null
  type: ErrorType | null
  isLoading: boolean
}

interface UseErrorHandlerReturn {
  error: string | null
  errorType: ErrorType | null
  isLoading: boolean
  setError: (error: string | Error | null, type?: ErrorType) => void
  clearError: () => void
  handleAsync: <T>(
    asyncFn: () => Promise<T>,
    onSuccess?: (result: T) => void,
    onError?: (error: Error) => void
  ) => Promise<T | null>
  withLoading: <T>(asyncFn: () => Promise<T>) => Promise<T | null>
}

export const useErrorHandler = (): UseErrorHandlerReturn => {
  const [state, setState] = useState<ErrorState>({
    error: null,
    type: null,
    isLoading: false
  })

  const setError = useCallback((error: string | Error | null, type?: ErrorType) => {
    if (!error) {
      setState(prev => ({ ...prev, error: null, type: null }))
      return
    }

    if (typeof error === 'string') {
      setState(prev => ({ 
        ...prev, 
        error, 
        type: type || ErrorType.INTERNAL_ERROR 
      }))
    } else if (error instanceof AppError) {
      setState(prev => ({ 
        ...prev, 
        error: getErrorMessage(error), 
        type: error.type 
      }))
    } else {
      setState(prev => ({ 
        ...prev, 
        error: getErrorMessage(error), 
        type: type || ErrorType.INTERNAL_ERROR 
      }))
    }
  }, [])

  const clearError = useCallback(() => {
    setState(prev => ({ ...prev, error: null, type: null }))
  }, [])

  const handleAsync = useCallback(async <T>(
    asyncFn: () => Promise<T>,
    onSuccess?: (result: T) => void,
    onError?: (error: Error) => void
  ): Promise<T | null> => {
    try {
      setState(prev => ({ ...prev, isLoading: true, error: null }))
      const result = await asyncFn()
      
      setState(prev => ({ ...prev, isLoading: false }))
      onSuccess?.(result)
      return result
    } catch (error) {
      const err = error as Error
      setState(prev => ({ ...prev, isLoading: false }))
      setError(err)
      onError?.(err)
      return null
    }
  }, [setError])

  const withLoading = useCallback(async <T>(
    asyncFn: () => Promise<T>
  ): Promise<T | null> => {
    try {
      setState(prev => ({ ...prev, isLoading: true }))
      const result = await asyncFn()
      setState(prev => ({ ...prev, isLoading: false }))
      return result
    } catch (error) {
      setState(prev => ({ ...prev, isLoading: false }))
      setError(error as Error)
      return null
    }
  }, [setError])

  return {
    error: state.error,
    errorType: state.type,
    isLoading: state.isLoading,
    setError,
    clearError,
    handleAsync,
    withLoading
  }
}

// Hook for API calls with automatic error handling
export const useApiCall = () => {
  const { handleAsync, ...errorState } = useErrorHandler()

  const apiCall = useCallback(async <T>(
    url: string,
    options?: RequestInit
  ): Promise<T | null> => {
    return handleAsync(async () => {
      const response = await fetch(url, {
        headers: {
          'Content-Type': 'application/json',
          ...options?.headers
        },
        ...options
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new AppError(
          errorData.message || `HTTP ${response.status}`,
          errorData.code || ErrorType.NETWORK_ERROR,
          response.status
        )
      }

      return response.json()
    })
  }, [handleAsync])

  return {
    ...errorState,
    apiCall
  }
}

// Hook for form validation errors
export const useFormErrors = () => {
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})

  const setFieldError = useCallback((field: string, error: string) => {
    setFieldErrors(prev => ({ ...prev, [field]: error }))
  }, [])

  const clearFieldError = useCallback((field: string) => {
    setFieldErrors(prev => {
      const newErrors = { ...prev }
      delete newErrors[field]
      return newErrors
    })
  }, [])

  const clearAllErrors = useCallback(() => {
    setFieldErrors({})
  }, [])

  const hasErrors = Object.keys(fieldErrors).length > 0

  return {
    fieldErrors,
    setFieldError,
    clearFieldError,
    clearAllErrors,
    hasErrors
  }
}