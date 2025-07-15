'use client'
import { getDefaultConfig } from '@rainbow-me/rainbowkit'
import { anvil, zksync } from 'wagmi/chains'

export default getDefaultConfig({
  appName: 'Tsender',
  projectId:
    process.env.WALLETCONNECT_PROJECT_ID! || '0dd0c329025f3325f1a87ad911c92ced',
  chains: [anvil, zksync],
  ssr: true, // Enable SSR support
})
