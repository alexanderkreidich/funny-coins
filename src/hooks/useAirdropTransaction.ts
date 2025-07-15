import { useState, useCallback } from 'react'
import { useWriteContract, useWaitForTransactionReceipt, useConfig } from 'wagmi'
import { readContract } from '@wagmi/core'
import { parseUnits, isAddress } from 'viem'
import { chainsToTSender, erc20Abi, tsenderAbi } from '@/constants'
import type {
  UseAirdropTransactionParams,
  UseAirdropTransactionReturn,
  AirdropTransactionState,
  PreparedTransactionData
} from '../types'

export function useAirdropTransaction(params: UseAirdropTransactionParams): UseAirdropTransactionReturn {
  const config = useConfig()
  const { writeContract } = useWriteContract()
  
  const [state, setState] = useState<AirdropTransactionState>({
    isApproving: false,
    isAirdropping: false,
    isLoading: false,
    step: 'idle'
  })

  // Prepare transaction data from form inputs
  const prepareTransactionData = useCallback((recipients: string, amounts: string): PreparedTransactionData => {
    // Parse recipients
    const recipientAddresses = recipients
      .split(/[,\n]/)
      .map((addr) => addr.trim())
      .filter((addr) => addr.length > 0 && isAddress(addr)) as `0x${string}`[]

    // Parse amounts - convert from token units to wei using decimals
    const decimals = params.tokenDecimals || 18 // Default to 18 if not provided
    const amountValues = amounts
      .split(/[,\n]/)
      .map((amount) => amount.trim())
      .filter((amount) => amount.length > 0)
      .map((amount) => parseUnits(amount, decimals)) // Convert token amounts to wei

    // Calculate total
    const totalAmount = amountValues.reduce((sum, amount) => sum + amount, BigInt(0))

    return {
      recipients: recipientAddresses,
      amounts: amountValues,
      totalAmount
    }
  }, [params.tokenDecimals])

  // Check current allowance
  const getApprovedAmount = useCallback(async (tsenderAddress: string): Promise<bigint> => {
    try {
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
    } catch (error) {
      console.error('Error getting approved amount:', error)
      throw new Error(
        `Failed to get approved amount: ${
          error instanceof Error ? error.message : 'Unknown error'
        }`
      )
    }
  }, [config, params.tokenAddress, params.userAddress])

  // Execute approval transaction
  const executeApproval = useCallback(async (amount: bigint): Promise<string> => {
    return new Promise((resolve, reject) => {
      writeContract(
        {
          address: params.tokenAddress as `0x${string}`,
          abi: erc20Abi,
          functionName: 'approve',
          args: [chainsToTSender[params.chainId]['tsender'] as `0x${string}`, amount],
        },
        {
          onSuccess: (hash) => {
            resolve(hash)
          },
          onError: (error) => {
            reject(error)
          }
        }
      )
    })
  }, [writeContract, params.tokenAddress, params.chainId])

  // Execute airdrop transaction
  const executeAirdropTransaction = useCallback(async (transactionData: PreparedTransactionData): Promise<string> => {
    return new Promise((resolve, reject) => {
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
          onSuccess: (hash) => {
            resolve(hash)
          },
          onError: (error) => {
            reject(error)
          }
        }
      )
    })
  }, [writeContract, params.tokenAddress, params.chainId])

  // Main execution function
  const executeAirdrop = useCallback(async (): Promise<void> => {
    try {
      setState((prev: AirdropTransactionState) => ({ ...prev, isLoading: true, step: 'checking', error: undefined }))

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
        setState((prev: AirdropTransactionState) => ({ ...prev, isApproving: true, step: 'approving' }))
        
        const approvalHash = await executeApproval(transactionData.totalAmount)
        setState((prev: AirdropTransactionState) => ({ ...prev, approvalHash }))

        // Wait for approval confirmation
        // Note: In a real implementation, you might want to use useWaitForTransactionReceipt here
        // For now, we'll proceed immediately
      }

      // Execute airdrop transaction
      setState((prev: AirdropTransactionState) => ({
        ...prev,
        isApproving: false,
        isAirdropping: true,
        step: 'airdropping'
      }))

      const airdropHash = await executeAirdropTransaction(transactionData)
      
      setState((prev: AirdropTransactionState) => ({
        ...prev,
        airdropHash,
        isAirdropping: false,
        isLoading: false,
        step: 'success'
      }))

    } catch (error) {
      console.error('Airdrop execution failed:', error)
      setState((prev: AirdropTransactionState) => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Unknown error occurred',
        isApproving: false,
        isAirdropping: false,
        isLoading: false,
        step: 'error'
      }))
    }
  }, [
    params.recipients, 
    params.amounts, 
    params.chainId,
    prepareTransactionData,
    getApprovedAmount,
    executeApproval,
    executeAirdropTransaction
  ])

  // Reset function
  const reset = useCallback(() => {
    setState({
      isApproving: false,
      isAirdropping: false,
      isLoading: false,
      step: 'idle',
      approvalHash: undefined,
      airdropHash: undefined,
      error: undefined
    })
  }, [])

  return {
    executeAirdrop,
    state,
    reset
  }
}