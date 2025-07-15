import EnhancedAirdropForm from '@/components/EnhancedAirdropForm'
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'FunnyCoins',
  description: 'Blockchain airdrop tool',
}

export default function Home() {
  return (
    <div className="min-h-screen bg-background">
      <EnhancedAirdropForm />
    </div>
  )
}
