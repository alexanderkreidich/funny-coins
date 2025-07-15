import React, { useEffect, useState } from 'react'
import LoadingSpinner from './LoadingSpinner'

export interface EnhancedInputFieldProps {
  label: string
  placeholder?: string
  value: string
  type?: 'text' | 'email' | 'password' | 'number'
  large?: boolean
  onChange: (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => void
  error?: string
  disabled?: boolean
  loading?: boolean
  className?: string
  helperText?: string
  required?: boolean
  autoComplete?: string
  maxLength?: number
  // Persistence props
  persistKey?: string
  debounceMs?: number
  onPersist?: (value: string) => void
  // Validation props
  validate?: (value: string) => string | undefined
  validateOnBlur?: boolean
  validateOnChange?: boolean
  // Loading state props
  showLoadingIcon?: boolean
  loadingText?: string
}

export default function EnhancedInputField({
  label,
  placeholder,
  value,
  type = 'text',
  large = false,
  onChange,
  error,
  disabled = false,
  loading = false,
  className = '',
  helperText,
  required = false,
  autoComplete,
  maxLength,
  persistKey,
  debounceMs = 500,
  onPersist,
  validate,
  validateOnBlur = true,
  validateOnChange = false,
  showLoadingIcon = false,
  loadingText,
}: EnhancedInputFieldProps) {
  const [validationError, setValidationError] = useState<string | undefined>()
  const [isFocused, setIsFocused] = useState(false)
  const [isValidating, setIsValidating] = useState(false)

  // Debounced persistence
  useEffect(() => {
    if (!persistKey || !onPersist) return

    const timeoutId = setTimeout(() => {
      onPersist(value)
    }, debounceMs)

    return () => clearTimeout(timeoutId)
  }, [value, persistKey, onPersist, debounceMs])

  // Validation logic
  const performValidation = async (valueToValidate: string) => {
    if (!validate) return

    setIsValidating(true)
    try {
      const result = validate(valueToValidate)
      setValidationError(result)
    } catch (err) {
      setValidationError('Validation failed')
    } finally {
      setIsValidating(false)
    }
  }

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    onChange(e)

    if (validateOnChange && validate) {
      performValidation(e.target.value)
    } else {
      // Clear validation error when user starts typing
      setValidationError(undefined)
    }
  }

  const handleBlur = () => {
    setIsFocused(false)

    if (validateOnBlur && validate) {
      performValidation(value)
    }
  }

  const handleFocus = () => {
    setIsFocused(true)
  }

  const displayError = error || validationError
  const isLoading = loading || isValidating
  const isDisabled = disabled || loading
  const ariaInvalid = !!displayError
  const sanitizedLabel = label.replace(/\s+/g, '-').toLowerCase()

  const baseClasses = `
    w-full px-3 py-2 border rounded-md shadow-sm 
    focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 
    transition-all duration-200 text-gray-900 placeholder-gray-400
    ${
      displayError
        ? 'border-red-300 focus:ring-red-500 focus:border-red-500'
        : 'border-gray-300'
    }
    ${isDisabled ? 'bg-gray-100 cursor-not-allowed text-gray-500' : 'bg-white'}
    ${isFocused ? 'ring-2 ring-blue-500 border-blue-500' : ''}
  `.trim()

  const textareaClasses = `${baseClasses} resize-none`

  return (
    <div className={`space-y-2 ${className}`}>
      {/* Label */}
      <div className="flex items-center justify-between">
        <label className="block text-sm font-medium text-gray-700">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>

        {/* Loading indicator in label area */}
        {isLoading && showLoadingIcon && (
          <div className="flex items-center text-xs text-gray-500">
            <LoadingSpinner size="sm" className="mr-1" />
            {loadingText || 'Loading...'}
          </div>
        )}
      </div>

      {/* Input wrapper with loading state */}
      <div className="relative">
        {large ? (
          <textarea
            value={value}
            onChange={handleChange}
            onBlur={handleBlur}
            onFocus={handleFocus}
            placeholder={placeholder}
            disabled={isDisabled}
            required={required}
            maxLength={maxLength}
            rows={4}
            className={textareaClasses}
            aria-invalid={ariaInvalid}
            aria-describedby={
              displayError
                ? `${sanitizedLabel}-error`
                : helperText
                ? `${sanitizedLabel}-helper`
                : undefined
            }
          />
        ) : (
          <input
            type={type}
            value={value}
            onChange={handleChange}
            onBlur={handleBlur}
            onFocus={handleFocus}
            placeholder={placeholder}
            disabled={isDisabled}
            required={required}
            autoComplete={autoComplete}
            maxLength={maxLength}
            className={baseClasses}
            aria-invalid={displayError ? 'true' : 'false'}
            aria-describedby={
              displayError
                ? `${sanitizedLabel}-error`
                : helperText
                ? `${sanitizedLabel}-helper`
                : undefined
            }
          />
        )}

        {/* Loading spinner overlay */}
        {isLoading && !showLoadingIcon && (
          <div className="absolute inset-y-0 right-0 flex items-center pr-3">
            <LoadingSpinner size="sm" />
          </div>
        )}
      </div>

      {/* Helper text */}
      {helperText && !displayError && (
        <p id={`${sanitizedLabel}-helper`} className="text-sm text-gray-600">
          {helperText}
        </p>
      )}

      {/* Error message */}
      {displayError && (
        <p
          id={`${sanitizedLabel}-error`}
          className="text-sm text-red-600 flex items-center"
        >
          <svg
            className="w-4 h-4 mr-1 flex-shrink-0"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path
              fillRule="evenodd"
              d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
              clipRule="evenodd"
            />
          </svg>
          {displayError}
        </p>
      )}

      {/* Character count for text areas */}
      {large && maxLength && (
        <div className="flex justify-end">
          <span
            className={`text-xs ${
              value.length > maxLength * 0.9 ? 'text-red-500' : 'text-gray-400'
            }`}
          >
            {value.length}/{maxLength}
          </span>
        </div>
      )}
    </div>
  )
}

// Specialized input components for common use cases
export const TokenAddressInput = ({
  value,
  onChange,
  error,
  loading,
  ...props
}: Omit<EnhancedInputFieldProps, 'label' | 'type'>) => (
  <EnhancedInputField
    label="Token Address"
    type="text"
    placeholder="0x..."
    value={value}
    onChange={onChange}
    error={error}
    loading={loading}
    helperText="Enter the contract address of the ERC-20 token"
    validate={(addr) => {
      if (!addr) return 'Token address is required'
      if (!addr.startsWith('0x')) return 'Address must start with 0x'
      if (addr.length !== 42) return 'Address must be 42 characters long'
      return undefined
    }}
    {...props}
  />
)

export const RecipientsInput = ({
  value,
  onChange,
  error,
  loading,
  ...props
}: Omit<EnhancedInputFieldProps, 'label' | 'large'>) => (
  <EnhancedInputField
    label="Recipients"
    large={true}
    placeholder="0x123..., 0x456..."
    value={value}
    onChange={onChange}
    error={error}
    loading={loading}
    helperText="Enter wallet addresses separated by commas or new lines"
    validate={(recipients) => {
      if (!recipients.trim()) return 'At least one recipient is required'
      const addresses = recipients
        .split(/[,\n]/)
        .map((addr) => addr.trim())
        .filter(Boolean)
      const invalidAddresses = addresses.filter(
        (addr) => !addr.match(/^0x[a-fA-F0-9]{40}$/)
      )
      if (invalidAddresses.length > 0) {
        return `Invalid addresses: ${invalidAddresses.slice(0, 3).join(', ')}`
      }
      return undefined
    }}
    {...props}
  />
)

export const AmountsInput = ({
  value,
  onChange,
  error,
  loading,
  tokenSymbol = 'tokens',
  ...props
}: Omit<EnhancedInputFieldProps, 'label' | 'large'> & {
  tokenSymbol?: string
}) => (
  <EnhancedInputField
    label={`Amounts (${tokenSymbol})`}
    large={true}
    placeholder="1.5, 2.0, 0.5..."
    value={value}
    onChange={onChange}
    error={error}
    loading={loading}
    helperText="Enter token amounts separated by commas or new lines"
    validate={(amounts) => {
      if (!amounts.trim()) return 'At least one amount is required'
      const values = amounts
        .split(/[,\n]/)
        .map((amt) => amt.trim())
        .filter(Boolean)
      const invalidAmounts = values.filter(
        (amt) => isNaN(parseFloat(amt)) || parseFloat(amt) <= 0
      )
      if (invalidAmounts.length > 0) {
        return `Invalid amounts: ${invalidAmounts.slice(0, 3).join(', ')}`
      }
      return undefined
    }}
    {...props}
  />
)
