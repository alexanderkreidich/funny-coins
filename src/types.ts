export interface UseAirdropTransactionParams {
  tokenAddress: string
  recipients: string
  amounts: string
  chainId: number
  userAddress: string
  tokenDecimals?: number
}

export interface AirdropTransactionState {
  isApproving: boolean
  isAirdropping: boolean
  isLoading: boolean
  approvalHash?: string
  airdropHash?: string
  error?: string
  step: 'idle' | 'checking' | 'approving' | 'airdropping' | 'success' | 'error'
}

export interface UseAirdropTransactionReturn {
  executeAirdrop: () => Promise<void>
  state: AirdropTransactionState
  reset: () => void
}

export interface PreparedTransactionData {
  recipients: `0x${string}`[]
  amounts: bigint[]
  totalAmount: bigint
}

export interface TokenInfo {
  name: string
  symbol: string
  decimals: number
  balance: string
}
 
export interface AirdropFormData {
  tokenAddress: string
  recipients: string
  amounts: string
  tokenInfo?: TokenInfo
}

export interface TransactionDetails {
  totalTokens: string
  totalRecipients: number
  estimatedGas?: string
}

export interface FormErrors {
  tokenAddress?: string
  recipients?: string
  amounts?: string
  general?: string
}

// ERC-20 ABI for token info
export const ERC20_ABI = [
  {
    inputs: [],
    name: 'name',
    outputs: [{ internalType: 'string', name: '', type: 'string' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'symbol',
    outputs: [{ internalType: 'string', name: '', type: 'string' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'decimals',
    outputs: [{ internalType: 'uint8', name: '', type: 'uint8' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [{ internalType: 'address', name: 'account', type: 'address' }],
    name: 'balanceOf',
    outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
  },
] as const