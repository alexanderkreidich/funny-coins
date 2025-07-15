export type ErrorCategory = 
  | 'network'
  | 'user_rejection' 
  | 'insufficient_funds'
  | 'validation'
  | 'contract'
  | 'unknown'

export interface CategorizedError {
  category: ErrorCategory
  message: string
  originalError: Error
  retryable: boolean
  autoRetry: boolean
  maxRetries: number
  userAction?: string
  technicalDetails?: string
}

export interface RetryConfig {
  maxRetries: number
  baseDelay: number
  maxDelay: number
  backoffFactor: number
}

const defaultRetryConfig: RetryConfig = {
  maxRetries: 3,
  baseDelay: 1000,
  maxDelay: 10000,
  backoffFactor: 2
}

// Error patterns for categorization
const errorPatterns = {
  network: [
    /network error/i,
    /fetch failed/i,
    /connection refused/i,
    /timeout/i,
    /network request failed/i,
    /failed to fetch/i
  ],
  user_rejection: [
    /user rejected/i,
    /user denied/i,
    /user cancelled/i,
    /rejected by user/i,
    /transaction was rejected/i,
    /metamask tx signature: user denied/i
  ],
  insufficient_funds: [
    /insufficient funds/i,
    /insufficient balance/i,
    /not enough/i,
    /exceeds balance/i,
    /insufficient allowance/i
  ],
  validation: [
    /invalid address/i,
    /invalid amount/i,
    /validation failed/i,
    /invalid input/i,
    /malformed/i
  ],
  contract: [
    /execution reverted/i,
    /contract call failed/i,
    /transaction failed/i,
    /revert/i,
    /out of gas/i
  ]
}

export function categorizeError(error: Error): CategorizedError {
  const message = error.message.toLowerCase()
  
  // Check each category
  for (const [category, patterns] of Object.entries(errorPatterns)) {
    if (patterns.some(pattern => pattern.test(message))) {
      return createCategorizedError(error, category as ErrorCategory)
    }
  }
  
  // Default to unknown category
  return createCategorizedError(error, 'unknown')
}

function createCategorizedError(error: Error, category: ErrorCategory): CategorizedError {
  const baseError: CategorizedError = {
    category,
    message: error.message,
    originalError: error,
    retryable: false,
    autoRetry: false,
    maxRetries: 0,
    technicalDetails: error.stack
  }

  switch (category) {
    case 'network':
      return {
        ...baseError,
        message: 'Network connection failed. Please check your internet connection.',
        retryable: true,
        autoRetry: true,
        maxRetries: 3,
        userAction: 'Check your internet connection and try again.'
      }

    case 'user_rejection':
      return {
        ...baseError,
        message: 'Transaction was rejected by user.',
        retryable: true,
        autoRetry: false,
        maxRetries: 1,
        userAction: 'Please approve the transaction in your wallet to continue.'
      }

    case 'insufficient_funds':
      return {
        ...baseError,
        message: 'Insufficient funds or token allowance.',
        retryable: false,
        autoRetry: false,
        maxRetries: 0,
        userAction: 'Please ensure you have sufficient balance and token allowance.'
      }

    case 'validation':
      return {
        ...baseError,
        message: 'Invalid input data provided.',
        retryable: false,
        autoRetry: false,
        maxRetries: 0,
        userAction: 'Please check your input and correct any errors.'
      }

    case 'contract':
      return {
        ...baseError,
        message: 'Smart contract execution failed.',
        retryable: true,
        autoRetry: false,
        maxRetries: 2,
        userAction: 'Transaction failed. You may try again or contact support.'
      }

    case 'unknown':
    default:
      return {
        ...baseError,
        message: 'An unexpected error occurred.',
        retryable: true,
        autoRetry: false,
        maxRetries: 1,
        userAction: 'Please try again. If the problem persists, contact support.'
      }
  }
}

export class RetryableError extends Error {
  public readonly category: ErrorCategory
  public readonly retryable: boolean
  public readonly autoRetry: boolean
  public readonly maxRetries: number
  public readonly userAction?: string

  constructor(categorizedError: CategorizedError) {
    super(categorizedError.message)
    this.name = 'RetryableError'
    this.category = categorizedError.category
    this.retryable = categorizedError.retryable
    this.autoRetry = categorizedError.autoRetry
    this.maxRetries = categorizedError.maxRetries
    this.userAction = categorizedError.userAction
  }
}

export async function withRetry<T>(
  operation: () => Promise<T>,
  config: Partial<RetryConfig> = {},
  onRetry?: (attempt: number, error: CategorizedError) => void
): Promise<T> {
  const retryConfig = { ...defaultRetryConfig, ...config }
  let lastError: CategorizedError

  for (let attempt = 0; attempt <= retryConfig.maxRetries; attempt++) {
    try {
      return await operation()
    } catch (error) {
      const categorizedError = categorizeError(error instanceof Error ? error : new Error(String(error)))
      lastError = categorizedError

      // Don't retry if not retryable or if we've exceeded max retries
      if (!categorizedError.retryable || attempt >= retryConfig.maxRetries) {
        throw new RetryableError(categorizedError)
      }

      // Only auto-retry for certain error types
      if (!categorizedError.autoRetry) {
        throw new RetryableError(categorizedError)
      }

      // Calculate delay with exponential backoff
      const delay = Math.min(
        retryConfig.baseDelay * Math.pow(retryConfig.backoffFactor, attempt),
        retryConfig.maxDelay
      )

      // Call retry callback if provided
      if (onRetry) {
        onRetry(attempt + 1, categorizedError)
      }

      // Wait before retrying
      await new Promise(resolve => setTimeout(resolve, delay))
    }
  }

  // This should never be reached, but TypeScript requires it
  throw new RetryableError(lastError!)
}

// Utility function to check if an error is retryable
export function isRetryableError(error: unknown): error is RetryableError {
  return error instanceof RetryableError && error.retryable
}

// Utility function to get user-friendly error message
export function getUserFriendlyErrorMessage(error: unknown): string {
  if (error instanceof RetryableError) {
    return error.message
  }
  
  if (error instanceof Error) {
    const categorized = categorizeError(error)
    return categorized.message
  }
  
  return 'An unexpected error occurred. Please try again.'
}

// Utility function to get suggested user action
export function getUserAction(error: unknown): string | undefined {
  if (error instanceof RetryableError) {
    return error.userAction
  }
  
  if (error instanceof Error) {
    const categorized = categorizeError(error)
    return categorized.userAction
  }
  
  return undefined
}