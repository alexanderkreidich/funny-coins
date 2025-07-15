import React from 'react'
import LoadingSpinner from './LoadingSpinner'

export interface LoadingButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  loading?: boolean
  loadingText?: string
  variant?: 'primary' | 'secondary' | 'success' | 'danger' | 'ghost'
  size?: 'sm' | 'md' | 'lg'
  fullWidth?: boolean
  icon?: React.ReactNode
  iconPosition?: 'left' | 'right'
  children: React.ReactNode
}

const variantClasses = {
  primary: 'bg-blue-600 hover:bg-blue-700 focus:ring-blue-500 text-white border-transparent',
  secondary: 'bg-gray-600 hover:bg-gray-700 focus:ring-gray-500 text-white border-transparent',
  success: 'bg-green-600 hover:bg-green-700 focus:ring-green-500 text-white border-transparent',
  danger: 'bg-red-600 hover:bg-red-700 focus:ring-red-500 text-white border-transparent',
  ghost: 'bg-transparent hover:bg-gray-50 focus:ring-gray-500 text-gray-700 border-gray-300'
}

const disabledVariantClasses = {
  primary: 'bg-blue-400 text-white border-transparent cursor-not-allowed',
  secondary: 'bg-gray-400 text-white border-transparent cursor-not-allowed',
  success: 'bg-green-400 text-white border-transparent cursor-not-allowed',
  danger: 'bg-red-400 text-white border-transparent cursor-not-allowed',
  ghost: 'bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed'
}

const sizeClasses = {
  sm: 'px-3 py-1.5 text-sm',
  md: 'px-4 py-2 text-sm',
  lg: 'px-6 py-3 text-base'
}

export default function LoadingButton({
  loading = false,
  loadingText,
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  icon,
  iconPosition = 'left',
  disabled,
  className = '',
  children,
  ...props
}: LoadingButtonProps) {
  const isDisabled = disabled || loading

  const baseClasses = `
    inline-flex items-center justify-center
    border font-medium rounded-md
    focus:outline-none focus:ring-2 focus:ring-offset-2
    transition-all duration-200
    ${fullWidth ? 'w-full' : ''}
    ${sizeClasses[size]}
  `.trim()

  const variantClass = isDisabled 
    ? disabledVariantClasses[variant]
    : variantClasses[variant]

  const buttonContent = loading ? (
    <>
      <LoadingSpinner 
        size="sm" 
        color={variant === 'ghost' ? 'gray' : 'white'} 
        className="mr-2" 
      />
      {loadingText || children}
    </>
  ) : (
    <>
      {icon && iconPosition === 'left' && (
        <span className="mr-2">{icon}</span>
      )}
      {children}
      {icon && iconPosition === 'right' && (
        <span className="ml-2">{icon}</span>
      )}
    </>
  )

  return (
    <button
      {...props}
      disabled={isDisabled}
      className={`${baseClasses} ${variantClass} ${className}`}
      aria-busy={loading ? 'true' : 'false'}
      aria-disabled={isDisabled ? 'true' : 'false'}
    >
      {buttonContent}
    </button>
  )
}

// Specialized button variants for common use cases
export const SubmitButton = ({ 
  loading, 
  children = 'Submit', 
  loadingText = 'Submitting...', 
  ...props 
}: Omit<LoadingButtonProps, 'variant'>) => (
  <LoadingButton 
    variant="primary" 
    loading={loading} 
    loadingText={loadingText} 
    {...props}
  >
    {children}
  </LoadingButton>
)

export const RetryButton = ({ 
  loading, 
  children = 'Try Again', 
  loadingText = 'Retrying...', 
  ...props 
}: Omit<LoadingButtonProps, 'variant'>) => (
  <LoadingButton 
    variant="secondary" 
    loading={loading} 
    loadingText={loadingText}
    icon={
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
      </svg>
    }
    {...props}
  >
    {children}
  </LoadingButton>
)

export const ConnectWalletButton = ({ 
  loading, 
  children = 'Connect Wallet', 
  loadingText = 'Connecting...', 
  ...props 
}: Omit<LoadingButtonProps, 'variant'>) => (
  <LoadingButton 
    variant="primary" 
    loading={loading} 
    loadingText={loadingText}
    icon={
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
      </svg>
    }
    {...props}
  >
    {children}
  </LoadingButton>
)

export const TransactionButton = ({ 
  loading, 
  children = 'Send Transaction', 
  loadingText = 'Processing...', 
  ...props 
}: Omit<LoadingButtonProps, 'variant'>) => (
  <LoadingButton 
    variant="success" 
    loading={loading} 
    loadingText={loadingText}
    icon={
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
      </svg>
    }
    {...props}
  >
    {children}
  </LoadingButton>
)