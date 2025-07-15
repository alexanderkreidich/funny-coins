import { useState, useCallback, useEffect } from 'react'
import { useWriteContract, useConfig } from 'wagmi'
import { readContract } from '@wagmi/core'
import { parseUnits, isAddress } from 'viem'
import { chainsToTSender, erc20Abi, tsenderAbi } from '@/constants'
import { withRetry, categorizeError, CategorizedError } from '@/utils/errorHandler'
import type {
  UseAirdropTransactionParams,
  AirdropTransactionState,
  PreparedTransactionData
} from '../types'

export interface EnhancedAirdropTransactionState extends AirdropTransactionState {
  retryCount: number
  lastError?: CategorizedError
  canRetry: boolean
}

export interface UseEnhancedAirdropTransactionReturn {
  executeAirdrop: () => Promise<void>
  state: EnhancedAirdropTransactionState
  reset: () => void
  retry: () => Promise<void>
  getCurrentStep: () => string
  getStepProgress: () => { current: number; total: number }
}

export function useEnhancedAirdropTransaction(
  params: UseAirdropTransactionParams
): UseEnhancedAirdropTransactionReturn {
  const config = useConfig()
  const { writeContract } = useWriteContract()
  
  const [state, setState] = useState<EnhancedAirdropTransactionState>({
    isApproving: false,
    isAirdropping: false,
    isLoading: false,
    step: 'idle',
    retryCount: 0,
    canRetry: false
  })

  // Store the last operation for retry functionality
  const [lastOperation, setLastOperation] = useState<(() => Promise<void>) | null>(null)

  // Prepare transaction data from form inputs
  const prepareTransactionData = useCallback((recipients: string, amounts: string): PreparedTransactionData => {
    const recipientAddresses = recipients
      .split(/[,\n]/)
      .map((addr) => addr.trim())
      .filter((addr) => addr.length > 0 && isAddress(addr)) as `0x${string}`[]

    const decimals = params.tokenDecimals || 18
    const amountValues = amounts
      .split(/[,\n]/)
      .map((amount) => amount.trim())
      .filter((amount) => amount.length > 0)
      .map((amount) => parseUnits(amount, decimals))

    const totalAmount = amountValues.reduce((sum, amount) => sum + amount, BigInt(0))

    return {
      recipients: recipientAddresses,
      amounts: amountValues,
      totalAmount
    }
  }, [params.tokenDecimals])

  // Enhanced error handling wrapper
  const handleError = useCallback((error: unknown, operation: () => Promise<void>) => {
    const categorized = categorizeError(error instanceof Error ? error : new Error(String(error)))
    
    setState(prev => ({
      ...prev,
      error: categorized.message,
      lastError: categorized,
      isApproving: false,
      isAirdropping: false,
      isLoading: false,
      step: 'error',
      canRetry: categorized.retryable
    }))

    // Store operation for potential retry
    if (categorized.retryable) {
      setLastOperation(() => operation)
    }
  }, [])

  // Check current allowance with retry logic
  const getApprovedAmount = useCallback(async (tsenderAddress: string): Promise<bigint> => {
    return withRetry(
      async () => {
        if (!params.tokenAddress || !isAddress(params.tokenAddress)) {
          throw new Error('Valid token address is required')
        }
        if (!params.userAddress) {
          throw new Error('User wallet address is required')
        }

        const allowance = (await readContract(config, {
          address: params.tokenAddress as `0x${string}`,
          abi: erc20Abi,
          functionName: 'allowance',
          args: [params.userAddress as `0x${string}`, tsenderAddress as `0x${string}`],
        })) as bigint

        return allowance
      },
      { maxRetries: 3 },
      (attempt, error) => {
        console.log(`Allowance check retry attempt ${attempt}:`, error.message)
      }
    )
  }, [config, params.tokenAddress, params.userAddress])

  // Execute approval transaction with retry logic
  const executeApproval = useCallback(async (amount: bigint): Promise<string> => {
    return withRetry(
      () => new Promise<string>((resolve, reject) => {
        writeContract(
          {
            address: params.tokenAddress as `0x${string}`,
            abi: erc20Abi,
            functionName: 'approve',
            args: [chainsToTSender[params.chainId]['tsender'] as `0x${string}`, amount],
          },
          {
            onSuccess: (hash) => resolve(hash),
            onError: (error) => reject(error)
          }
        )
      }),
      { maxRetries: 2 },
      (attempt, error) => {
        console.log(`Approval retry attempt ${attempt}:`, error.message)
      }
    )
  }, [writeContract, params.tokenAddress, params.chainId])

  // Execute airdrop transaction with retry logic
  const executeAirdropTransaction = useCallback(async (transactionData: PreparedTransactionData): Promise<string> => {
    return withRetry(
      () => new Promise<string>((resolve, reject) => {
        writeContract(
          {
            address: chainsToTSender[params.chainId]['tsender'] as `0x${string}`,
            abi: tsenderAbi,
            functionName: 'airdropERC20',
            args: [
              params.tokenAddress as `0x${string}`,
              transactionData.recipients,
              transactionData.amounts,
              transactionData.totalAmount
            ],
          },
          {
            onSuccess: (hash) => resolve(hash),
            onError: (error) => reject(error)
          }
        )
      }),
      { maxRetries: 2 },
      (attempt, error) => {
        console.log(`Airdrop retry attempt ${attempt}:`, error.message)
      }
    )
  }, [writeContract, params.tokenAddress, params.chainId])

  // Main execution function
  const executeAirdrop = useCallback(async (): Promise<void> => {
    const operation = async () => {
      setState(prev => ({ 
        ...prev, 
        isLoading: true, 
        step: 'checking', 
        error: undefined,
        lastError: undefined,
        canRetry: false
      }))

      // Prepare transaction data
      const transactionData = prepareTransactionData(params.recipients, params.amounts)
      
      if (transactionData.recipients.length === 0 || transactionData.amounts.length === 0) {
        throw new Error('No valid recipients or amounts provided')
      }

      if (transactionData.recipients.length !== transactionData.amounts.length) {
        throw new Error('Number of recipients must match number of amounts')
      }

      // Get TSender contract address
      const chainConfig = chainsToTSender[params.chainId]
      if (!chainConfig) {
        throw new Error(`TSender contract not found for chain ${params.chainId}`)
      }
      const tSenderAddress = chainConfig.tsender
      if (!tSenderAddress) {
        throw new Error(`TSender contract not found for chain ${params.chainId}`)
      }

      // Check current allowance
      const approvedAmount = await getApprovedAmount(tSenderAddress)
      
      // If insufficient allowance, approve first
      if (approvedAmount < transactionData.totalAmount) {
        setState(prev => ({ ...prev, isApproving: true, step: 'approving' }))
        
        const approvalHash = await executeApproval(transactionData.totalAmount)
        setState(prev => ({ ...prev, approvalHash }))
      }

      // Execute airdrop transaction
      setState(prev => ({
        ...prev,
        isApproving: false,
        isAirdropping: true,
        step: 'airdropping'
      }))

      const airdropHash = await executeAirdropTransaction(transactionData)
      
      setState(prev => ({
        ...prev,
        airdropHash,
        isAirdropping: false,
        isLoading: false,
        step: 'success',
        retryCount: 0
      }))
    }

    try {
      await operation()
    } catch (error) {
      handleError(error, operation)
    }
  }, [
    params.recipients, 
    params.amounts, 
    params.chainId,
    prepareTransactionData,
    getApprovedAmount,
    executeApproval,
    executeAirdropTransaction,
    handleError
  ])

  // Retry function
  const retry = useCallback(async (): Promise<void> => {
    if (!state.canRetry || !lastOperation) {
      throw new Error('Cannot retry this operation')
    }

    setState(prev => ({ 
      ...prev, 
      retryCount: prev.retryCount + 1,
      error: undefined,
      lastError: undefined
    }))

    try {
      await lastOperation()
    } catch (error) {
      handleError(error, lastOperation)
    }
  }, [state.canRetry, lastOperation, handleError])

  // Reset function
  const reset = useCallback(() => {
    setState({
      isApproving: false,
      isAirdropping: false,
      isLoading: false,
      step: 'idle',
      approvalHash: undefined,
      airdropHash: undefined,
      error: undefined,
      retryCount: 0,
      lastError: undefined,
      canRetry: false
    })
    setLastOperation(null)
  }, [])

  // Get current step for progress tracking
  const getCurrentStep = useCallback((): string => {
    switch (state.step) {
      case 'checking': return 'Checking allowance...'
      case 'approving': return 'Approving tokens...'
      case 'airdropping': return 'Executing airdrop...'
      case 'success': return 'Transaction complete!'
      case 'error': return 'Transaction failed'
      default: return 'Ready'
    }
  }, [state.step])

  // Get step progress for progress bars
  const getStepProgress = useCallback((): { current: number; total: number } => {
    const stepOrder = ['idle', 'checking', 'approving', 'airdropping', 'success']
    const currentIndex = stepOrder.indexOf(state.step)
    return {
      current: Math.max(0, currentIndex),
      total: stepOrder.length - 1
    }
  }, [state.step])

  return {
    executeAirdrop,
    state,
    reset,
    retry,
    getCurrentStep,
    getStepProgress
  }
}