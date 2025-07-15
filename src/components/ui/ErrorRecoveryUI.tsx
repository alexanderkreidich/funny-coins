'use client'

import React from 'react'
import { CategorizedError, getUserFriendlyErrorMessage, getUserAction } from '@/utils/errorHandler'

export interface ErrorRecoveryUIProps {
  error: Error | CategorizedError | null
  onRetry?: () => void
  onDismiss?: () => void
  onContactSupport?: () => void
  className?: string
  showTechnicalDetails?: boolean
}

const errorIcons = {
  network: (
    <svg className="w-6 h-6 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
    </svg>
  ),
  user_rejection: (
    <svg className="w-6 h-6 text-yellow-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
    </svg>
  ),
  insufficient_funds: (
    <svg className="w-6 h-6 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
    </svg>
  ),
  validation: (
    <svg className="w-6 h-6 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  ),
  contract: (
    <svg className="w-6 h-6 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
    </svg>
  ),
  unknown: (
    <svg className="w-6 h-6 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  )
}

const categoryColors = {
  network: 'border-red-200 bg-red-50',
  user_rejection: 'border-yellow-200 bg-yellow-50',
  insufficient_funds: 'border-orange-200 bg-orange-50',
  validation: 'border-blue-200 bg-blue-50',
  contract: 'border-purple-200 bg-purple-50',
  unknown: 'border-gray-200 bg-gray-50'
}

export default function ErrorRecoveryUI({
  error,
  onRetry,
  onDismiss,
  onContactSupport,
  className = '',
  showTechnicalDetails = false
}: ErrorRecoveryUIProps) {
  const [showDetails, setShowDetails] = React.useState(false)

  if (!error) return null

  const categorizedError = error as CategorizedError
  const category = categorizedError.category || 'unknown'
  const message = getUserFriendlyErrorMessage(error)
  const userAction = getUserAction(error)
  const isRetryable = categorizedError.retryable || false

  const handleCopyError = () => {
    const errorDetails = {
      message: error.message,
      category: categorizedError.category,
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent,
      url: window.location.href
    }
    
    navigator.clipboard.writeText(JSON.stringify(errorDetails, null, 2))
      .then(() => {
        // Could show a toast notification here
        console.log('Error details copied to clipboard')
      })
      .catch(err => {
        console.error('Failed to copy error details:', err)
      })
  }

  return (
    <div className={`rounded-lg border-2 p-4 ${categoryColors[category]} ${className}`}>
      <div className="flex items-start space-x-3">
        {/* Error Icon */}
        <div className="flex-shrink-0">
          {errorIcons[category]}
        </div>

        {/* Error Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h3 className="text-sm font-medium text-gray-900 mb-1">
                Transaction Error
              </h3>
              <p className="text-sm text-gray-700 mb-3">
                {message}
              </p>
              
              {userAction && (
                <div className="bg-white bg-opacity-60 rounded-md p-3 mb-3">
                  <p className="text-sm text-gray-800">
                    <span className="font-medium">Suggested action:</span> {userAction}
                  </p>
                </div>
              )}
            </div>

            {/* Dismiss Button */}
            {onDismiss && (
              <button
                onClick={onDismiss}
                className="flex-shrink-0 ml-3 text-gray-400 hover:text-gray-600 transition-colors"
                aria-label="Dismiss error"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </button>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap gap-2 mb-3">
            {isRetryable && onRetry && (
              <button
                onClick={onRetry}
                className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
              >
                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                Try Again
              </button>
            )}

            {onContactSupport && (
              <button
                onClick={onContactSupport}
                className="inline-flex items-center px-3 py-1.5 border border-gray-300 text-xs font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
              >
                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Get Help
              </button>
            )}

            <button
              onClick={handleCopyError}
              className="inline-flex items-center px-3 py-1.5 border border-gray-300 text-xs font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
            >
              <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
              Copy Details
            </button>
          </div>

          {/* Technical Details Toggle */}
          {(showTechnicalDetails || categorizedError.technicalDetails) && (
            <div>
              <button
                onClick={() => setShowDetails(!showDetails)}
                className="text-xs text-gray-600 hover:text-gray-800 underline focus:outline-none"
              >
                {showDetails ? 'Hide' : 'Show'} Technical Details
              </button>
              
              {showDetails && (
                <div className="mt-2 p-3 bg-gray-100 rounded-md">
                  <pre className="text-xs text-gray-800 whitespace-pre-wrap break-words">
                    {categorizedError.technicalDetails ||
                     (error instanceof Error ? error.stack : undefined) ||
                     error.message}
                  </pre>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

// Hook for managing error state with recovery options
export interface UseErrorRecoveryReturn {
  error: CategorizedError | null
  setError: (error: Error | CategorizedError | null) => void
  clearError: () => void
  retry: () => void
  canRetry: boolean
}

export function useErrorRecovery(
  onRetry?: () => void | Promise<void>
): UseErrorRecoveryReturn {
  const [error, setErrorState] = React.useState<CategorizedError | null>(null)

  const setError = React.useCallback((newError: Error | CategorizedError | null) => {
    if (newError === null) {
      setErrorState(null)
    } else if ('category' in newError) {
      setErrorState(newError as CategorizedError)
    } else {
      // Convert regular Error to CategorizedError
      const { categorizeError } = require('@/utils/errorHandler')
      setErrorState(categorizeError(newError))
    }
  }, [])

  const clearError = React.useCallback(() => {
    setErrorState(null)
  }, [])

  const retry = React.useCallback(async () => {
    if (onRetry) {
      try {
        clearError()
        await onRetry()
      } catch (err) {
        setError(err instanceof Error ? err : new Error(String(err)))
      }
    }
  }, [onRetry, clearError, setError])

  const canRetry = React.useMemo(() => {
    return error?.retryable === true && !!onRetry
  }, [error, onRetry])

  const memoizedReturn = React.useMemo(() => ({
    error,
    setError,
    clearError,
    retry,
    canRetry
  }), [error, setError, clearError, retry, canRetry])

  return memoizedReturn
}