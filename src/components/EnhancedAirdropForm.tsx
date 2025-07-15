'use client'

import { useEnhancedAirdropTransaction } from '@/hooks/useEnhancedAirdropTransaction'
import { useFormDataPersistence } from '@/hooks/useLocalStorage'
import {
  ERC20_ABI,
  type AirdropFormData,
  type TransactionDetails,
} from '@/types'
import { calculateTotal } from '@/utils'
import React, { useCallback, useEffect, useState } from 'react'
import { formatUnits, isAddress } from 'viem'
import { useAccount, useChainId, useReadContract } from 'wagmi'
import {
  AmountsInput,
  RecipientsInput,
  TokenAddressInput,
} from './ui/EnhancedInputField'
import ErrorRecoveryUI, { useErrorRecovery } from './ui/ErrorRecoveryUI'
import GlobalLoadingOverlay, {
  AIRDROP_TRANSACTION_STEPS,
} from './ui/GlobalLoadingOverlay'
import LoadingButton from './ui/LoadingButton'

export default function EnhancedAirdropForm() {
  const { address: userAddress, isConnected } = useAccount()
  const chainId = useChainId()
  const [mounted, setMounted] = useState(false)

  // Form data with persistence
  const {
    value: persistedFormData,
    setValue: setPersistedFormData,
    isLoading: isLoadingPersisted,
  } = useFormDataPersistence({
    tokenAddress: '',
    recipients: '',
    amounts: '',
  })

  // Local form state
  const [formData, setFormData] = useState<AirdropFormData>({
    tokenAddress: '',
    recipients: '',
    amounts: '',
  })

  // Error recovery
  const errorRecovery = useErrorRecovery()

  // Enhanced airdrop transaction hook
  const airdropTransaction = useEnhancedAirdropTransaction({
    tokenAddress: formData.tokenAddress,
    recipients: formData.recipients,
    amounts: formData.amounts,
    chainId,
    userAddress: userAddress || '',
    tokenDecimals: formData.tokenInfo?.decimals,
  })

  // Handle hydration
  useEffect(() => {
    setMounted(true)
  }, [])

  // Restore form data from persistence
  useEffect(() => {
    if (!isLoadingPersisted && persistedFormData) {
      setFormData((prev) => ({
        ...prev,
        tokenAddress: persistedFormData.tokenAddress || '',
        recipients: persistedFormData.recipients || '',
        amounts: persistedFormData.amounts || '',
      }))
    }
  }, [
    isLoadingPersisted,
    persistedFormData?.tokenAddress,
    persistedFormData?.recipients,
    persistedFormData?.amounts,
  ])

  // Persist form data changes
  const handleFormDataChange = useCallback(
    (field: keyof AirdropFormData, value: string) => {
      setFormData((prev) => ({ ...prev, [field]: value }))

      // Persist to localStorage
      setPersistedFormData((prev) => ({
        ...prev,
        [field]: value,
      }))
    },
    [setPersistedFormData]
  )

  // Token contract reads
  const { data: tokenName, isLoading: isLoadingTokenName } = useReadContract({
    address: isAddress(formData.tokenAddress)
      ? (formData.tokenAddress as `0x${string}`)
      : undefined,
    abi: ERC20_ABI,
    functionName: 'name',
    query: { enabled: isAddress(formData.tokenAddress) },
  })

  const { data: tokenSymbol, isLoading: isLoadingTokenSymbol } =
    useReadContract({
      address: isAddress(formData.tokenAddress)
        ? (formData.tokenAddress as `0x${string}`)
        : undefined,
      abi: ERC20_ABI,
      functionName: 'symbol',
      query: { enabled: isAddress(formData.tokenAddress) },
    })

  const { data: tokenDecimals, isLoading: isLoadingTokenDecimals } =
    useReadContract({
      address: isAddress(formData.tokenAddress)
        ? (formData.tokenAddress as `0x${string}`)
        : undefined,
      abi: ERC20_ABI,
      functionName: 'decimals',
      query: { enabled: isAddress(formData.tokenAddress) },
    })

  const { data: tokenBalance, isLoading: isLoadingTokenBalance } =
    useReadContract({
      address: isAddress(formData.tokenAddress)
        ? (formData.tokenAddress as `0x${string}`)
        : undefined,
      abi: ERC20_ABI,
      functionName: 'balanceOf',
      args: userAddress ? [userAddress] : undefined,
      query: { enabled: isAddress(formData.tokenAddress) && !!userAddress },
    })

  const isLoadingTokenInfo =
    isLoadingTokenName ||
    isLoadingTokenSymbol ||
    isLoadingTokenDecimals ||
    isLoadingTokenBalance

  // Update token info when contract data is available
  useEffect(() => {
    if (
      tokenName &&
      tokenSymbol &&
      tokenDecimals !== undefined &&
      tokenBalance !== undefined
    ) {
      const balance = formatUnits(tokenBalance, tokenDecimals)
      setFormData((prev) => ({
        ...prev,
        tokenInfo: {
          name: tokenName,
          symbol: tokenSymbol,
          decimals: tokenDecimals,
          balance: balance,
        },
      }))
    }
  }, [tokenName, tokenSymbol, tokenDecimals, tokenBalance])

  // Calculate transaction details
  const transactionDetails: TransactionDetails = React.useMemo(() => {
    const total = calculateTotal(formData.amounts)
    const recipientCount = formData.recipients
      .split(/[,\n]/)
      .map((addr) => addr.trim())
      .filter((addr) => addr.length > 0 && isAddress(addr)).length

    return {
      totalTokens: total.toString(),
      totalRecipients: recipientCount,
    }
  }, [formData.recipients, formData.amounts])

  // Handle transaction errors
  useEffect(() => {
    if (airdropTransaction.state.lastError) {
      errorRecovery.setError(airdropTransaction.state.lastError)
    }
  }, [airdropTransaction.state.lastError, errorRecovery.setError])

  // Form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (airdropTransaction.state.step === 'success') {
      handleReset()
      return
    }

    if (!isConnected) {
      errorRecovery.setError(
        new Error('Please connect your wallet to continue')
      )
      return
    }

    try {
      errorRecovery.clearError()
      await airdropTransaction.executeAirdrop()
    } catch (error) {
      // Error is handled by the enhanced hook
    }
  }

  // Form reset
  const handleReset = () => {
    setFormData({
      tokenAddress: '',
      recipients: '',
      amounts: '',
    })
    setPersistedFormData({
      tokenAddress: '',
      recipients: '',
      amounts: '',
      lastUpdated: Date.now(),
    })
    airdropTransaction.reset()
    errorRecovery.clearError()
  }

  // Retry transaction
  const handleRetry = async () => {
    try {
      await airdropTransaction.retry()
    } catch (error) {
      // Error is handled by the enhanced hook
    }
  }

  if (!mounted) {
    return (
      <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl mx-auto">
          <div className="bg-white rounded-lg border-2 border-blue-200 shadow-sm p-6 sm:p-8">
            <div className="animate-pulse space-y-6">
              <div className="h-8 bg-gray-200 rounded w-1/3 mx-auto"></div>
              <div className="space-y-4">
                <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                <div className="h-10 bg-gray-200 rounded"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <>
      <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl mx-auto">
          <div className="bg-white rounded-lg border-2 border-blue-200 shadow-sm p-6 sm:p-8">
            {/* Form Header */}
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 text-center">
                FunnyCoins
              </h2>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Token Address Section */}
              <TokenAddressInput
                value={formData.tokenAddress}
                onChange={(e) =>
                  handleFormDataChange('tokenAddress', e.target.value)
                }
                loading={isLoadingTokenInfo}
                showLoadingIcon={true}
                loadingText="Loading token info..."
                persistKey="tokenAddress"
              />

              {formData.tokenInfo && (
                <div className="bg-green-50 border border-green-200 rounded-md p-3">
                  <p className="text-sm text-green-800">
                    ✓ Token: {formData.tokenInfo.name} (
                    {formData.tokenInfo.symbol})
                  </p>
                  <p className="text-xs text-green-600 mt-1">
                    Balance: {formData.tokenInfo.balance}{' '}
                    {formData.tokenInfo.symbol}
                  </p>
                </div>
              )}

              {/* Recipients Section */}
              <RecipientsInput
                value={formData.recipients}
                onChange={(e) =>
                  handleFormDataChange('recipients', e.target.value)
                }
                persistKey="recipients"
                validateOnBlur={true}
              />

              {/* Amounts Section */}
              <AmountsInput
                value={formData.amounts}
                onChange={(e) =>
                  handleFormDataChange('amounts', e.target.value)
                }
                tokenSymbol={formData.tokenInfo?.symbol}
                persistKey="amounts"
                validateOnBlur={true}
              />

              {/* Transaction Details */}
              <div className="bg-gray-50 rounded-md p-4">
                <h3 className="text-sm font-medium text-gray-700 mb-3">
                  Transaction Summary
                </h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Token:</span>
                    <span className="text-gray-900">
                      {formData.tokenInfo?.name || '-'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Total Amount:</span>
                    <span className="text-gray-900">
                      {transactionDetails.totalTokens}{' '}
                      {formData.tokenInfo?.symbol || 'tokens'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Recipients:</span>
                    <span className="text-gray-900">
                      {transactionDetails.totalRecipients}
                    </span>
                  </div>
                </div>
              </div>

              {/* Error Recovery UI */}
              {errorRecovery.error && (
                <ErrorRecoveryUI
                  error={errorRecovery.error}
                  onRetry={errorRecovery.canRetry ? handleRetry : undefined}
                  onDismiss={errorRecovery.clearError}
                  showTechnicalDetails={true}
                />
              )}

              {/* Submit Button */}
              <LoadingButton
                type="submit"
                loading={airdropTransaction.state.isLoading}
                disabled={
                  !isConnected && airdropTransaction.state.step !== 'success'
                }
                variant={
                  airdropTransaction.state.step === 'success'
                    ? 'success'
                    : 'primary'
                }
                fullWidth={true}
                size="lg"
                loadingText={airdropTransaction.getCurrentStep()}
              >
                {airdropTransaction.state.step === 'success'
                  ? 'Start New Airdrop'
                  : 'Send Tokens'}
              </LoadingButton>

              {!isConnected && (
                <p className="text-center text-sm text-gray-600">
                  Please connect your wallet to send tokens
                </p>
              )}
            </form>
          </div>
        </div>
      </div>

      {/* Global Loading Overlay */}
      <GlobalLoadingOverlay
        isVisible={airdropTransaction.state.isLoading}
        title="Processing Airdrop Transaction"
        message={airdropTransaction.getCurrentStep()}
        steps={
          airdropTransaction.state.isLoading
            ? AIRDROP_TRANSACTION_STEPS.map((step) => ({
                ...step,
                status:
                  step.id === airdropTransaction.state.step
                    ? 'active'
                    : airdropTransaction.state.step === 'success' &&
                      ['checking', 'approving', 'airdropping'].includes(step.id)
                    ? 'completed'
                    : airdropTransaction.state.step === 'error' &&
                      step.id === 'checking'
                    ? 'error'
                    : 'pending',
              }))
            : undefined
        }
        currentStepId={airdropTransaction.state.step}
        cancelable={false}
      />
    </>
  )
}
