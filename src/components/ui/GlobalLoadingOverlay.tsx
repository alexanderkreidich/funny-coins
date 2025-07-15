'use client'

import React, { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import LoadingSpinner from './LoadingSpinner'

export interface TransactionStep {
  id: string
  label: string
  description?: string
  status: 'pending' | 'active' | 'completed' | 'error'
}

export interface GlobalLoadingOverlayProps {
  isVisible: boolean
  title?: string
  message?: string
  steps?: TransactionStep[]
  currentStepId?: string
  onCancel?: () => void
  cancelable?: boolean
  className?: string
}

const stepStatusIcons = {
  pending: (
    <div className="w-6 h-6 rounded-full border-2 border-gray-300 bg-white" />
  ),
  active: (
    <div className="w-6 h-6 rounded-full border-2 border-blue-500 bg-blue-50 flex items-center justify-center">
      <LoadingSpinner size="sm" color="primary" />
    </div>
  ),
  completed: (
    <div className="w-6 h-6 rounded-full bg-green-500 flex items-center justify-center">
      <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
      </svg>
    </div>
  ),
  error: (
    <div className="w-6 h-6 rounded-full bg-red-500 flex items-center justify-center">
      <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
        <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
      </svg>
    </div>
  )
}

function OverlayContent({
  title = 'Processing Transaction',
  message,
  steps,
  currentStepId,
  onCancel,
  cancelable = false,
  className = ''
}: Omit<GlobalLoadingOverlayProps, 'isVisible'>) {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) return null

  return (
    <div 
      className={`fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm ${className}`}
      role="dialog"
      aria-modal="true"
      aria-labelledby="loading-title"
      aria-describedby="loading-description"
    >
      <div className="bg-white rounded-lg shadow-xl p-6 m-4 max-w-md w-full max-h-[80vh] overflow-y-auto">
        {/* Header */}
        <div className="text-center mb-6">
          <div className="mb-4">
            <LoadingSpinner size="xl" color="primary" />
          </div>
          <h2 id="loading-title" className="text-xl font-semibold text-gray-900 mb-2">
            {title}
          </h2>
          {message && (
            <p id="loading-description" className="text-gray-600 text-sm">
              {message}
            </p>
          )}
        </div>

        {/* Progress Steps */}
        {steps && steps.length > 0 && (
          <div className="mb-6">
            <div className="space-y-4">
              {steps.map((step, index) => {
                const isActive = step.id === currentStepId
                const isCompleted = step.status === 'completed'
                const isError = step.status === 'error'
                const isPending = step.status === 'pending'

                return (
                  <div key={step.id} className="flex items-start space-x-3">
                    {/* Step Icon */}
                    <div className="flex-shrink-0 mt-0.5">
                      {stepStatusIcons[step.status]}
                    </div>

                    {/* Step Content */}
                    <div className="flex-1 min-w-0">
                      <div className={`text-sm font-medium ${
                        isActive ? 'text-blue-600' :
                        isCompleted ? 'text-green-600' :
                        isError ? 'text-red-600' :
                        'text-gray-500'
                      }`}>
                        {step.label}
                      </div>
                      {step.description && (
                        <div className={`text-xs mt-1 ${
                          isActive ? 'text-blue-500' :
                          isCompleted ? 'text-green-500' :
                          isError ? 'text-red-500' :
                          'text-gray-400'
                        }`}>
                          {step.description}
                        </div>
                      )}
                    </div>

                    {/* Connection Line */}
                    {index < steps.length - 1 && (
                      <div className="absolute left-[33px] mt-8 w-0.5 h-4 bg-gray-200" />
                    )}
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* Cancel Button */}
        {cancelable && onCancel && (
          <div className="text-center">
            <button
              onClick={onCancel}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-colors"
            >
              Cancel
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

export default function GlobalLoadingOverlay(props: GlobalLoadingOverlayProps) {
  const [portalContainer, setPortalContainer] = useState<HTMLElement | null>(null)

  useEffect(() => {
    // Create or get the portal container
    let container = document.getElementById('loading-overlay-portal')
    if (!container) {
      container = document.createElement('div')
      container.id = 'loading-overlay-portal'
      document.body.appendChild(container)
    }
    setPortalContainer(container)

    // Cleanup function
    return () => {
      // Don't remove the container on unmount as it might be used by other overlays
    }
  }, [])

  // Prevent body scroll when overlay is visible
  useEffect(() => {
    if (props.isVisible) {
      const originalStyle = window.getComputedStyle(document.body).overflow
      document.body.style.overflow = 'hidden'
      
      return () => {
        document.body.style.overflow = originalStyle
      }
    }
  }, [props.isVisible])

  if (!props.isVisible || !portalContainer) {
    return null
  }

  return createPortal(
    <OverlayContent {...props} />,
    portalContainer
  )
}

// Hook for managing global loading state
export interface UseGlobalLoadingReturn {
  showLoading: (options?: Partial<GlobalLoadingOverlayProps>) => void
  hideLoading: () => void
  updateSteps: (steps: TransactionStep[]) => void
  setCurrentStep: (stepId: string) => void
  isVisible: boolean
}

export function useGlobalLoading(): UseGlobalLoadingReturn {
  const [loadingState, setLoadingState] = useState<GlobalLoadingOverlayProps>({
    isVisible: false
  })

  const showLoading = React.useCallback((options: Partial<GlobalLoadingOverlayProps> = {}) => {
    setLoadingState(prev => ({
      ...prev,
      ...options,
      isVisible: true
    }))
  }, [])

  const hideLoading = React.useCallback(() => {
    setLoadingState(prev => ({
      ...prev,
      isVisible: false
    }))
  }, [])

  const updateSteps = React.useCallback((steps: TransactionStep[]) => {
    setLoadingState(prev => ({
      ...prev,
      steps
    }))
  }, [])

  const setCurrentStep = React.useCallback((stepId: string) => {
    setLoadingState(prev => ({
      ...prev,
      currentStepId: stepId
    }))
  }, [])

  return {
    showLoading,
    hideLoading,
    updateSteps,
    setCurrentStep,
    isVisible: loadingState.isVisible
  }
}

// Predefined transaction steps for common flows
export const AIRDROP_TRANSACTION_STEPS: TransactionStep[] = [
  {
    id: 'checking',
    label: 'Checking Allowance',
    description: 'Verifying token allowance for the contract',
    status: 'pending'
  },
  {
    id: 'approving',
    label: 'Approving Tokens',
    description: 'Approve tokens for the airdrop contract',
    status: 'pending'
  },
  {
    id: 'airdropping',
    label: 'Executing Airdrop',
    description: 'Sending tokens to all recipients',
    status: 'pending'
  },
  {
    id: 'success',
    label: 'Transaction Complete',
    description: 'Airdrop has been successfully executed',
    status: 'pending'
  }
]

export const WALLET_CONNECTION_STEPS: TransactionStep[] = [
  {
    id: 'connecting',
    label: 'Connecting Wallet',
    description: 'Opening wallet connection dialog',
    status: 'pending'
  },
  {
    id: 'authorizing',
    label: 'Authorizing Access',
    description: 'Please approve the connection in your wallet',
    status: 'pending'
  },
  {
    id: 'connected',
    label: 'Wallet Connected',
    description: 'Successfully connected to your wallet',
    status: 'pending'
  }
]