import React from 'react'

export interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg' | 'xl'
  color?: 'primary' | 'white' | 'gray' | 'success' | 'error'
  className?: string
  label?: string
}

const sizeClasses = {
  sm: 'w-4 h-4',
  md: 'w-6 h-6',
  lg: 'w-8 h-8',
  xl: 'w-12 h-12'
}

const colorClasses = {
  primary: 'text-blue-600',
  white: 'text-white',
  gray: 'text-gray-400',
  success: 'text-green-600',
  error: 'text-red-600'
}

export default function LoadingSpinner({
  size = 'md',
  color = 'primary',
  className = '',
  label
}: LoadingSpinnerProps) {
  return (
    <div className={`inline-flex items-center ${className}`} role="status" aria-label={label || 'Loading'}>
      <svg
        className={`animate-spin ${sizeClasses[size]} ${colorClasses[color]}`}
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        aria-hidden="true"
      >
        <circle
          className="opacity-25"
          cx="12"
          cy="12"
          r="10"
          stroke="currentColor"
          strokeWidth="4"
        />
        <path
          className="opacity-75"
          fill="currentColor"
          d="m4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
        />
      </svg>
      {label && (
        <span className="ml-2 text-sm font-medium text-gray-700">
          {label}
        </span>
      )}
    </div>
  )
}

// Preset spinner variants for common use cases
export const ButtonSpinner = ({ className = '' }: { className?: string }) => (
  <LoadingSpinner size="sm" color="white" className={className} />
)

export const FormSpinner = ({ className = '' }: { className?: string }) => (
  <LoadingSpinner size="md" color="primary" className={className} />
)

export const OverlaySpinner = ({ className = '' }: { className?: string }) => (
  <LoadingSpinner size="xl" color="primary" className={className} />
)