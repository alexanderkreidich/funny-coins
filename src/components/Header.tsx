'use client'

import { ConnectButton } from '@rainbow-me/rainbowkit'
import Image from 'next/image'
import { useEffect, useState } from 'react'
import { FaGithub } from 'react-icons/fa'

export default function Header() {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  return (
    <nav className="w-full bg-white border-b border-zinc-100 px-4 sm:px-6 lg:px-8 xl:px-12">
      <div className="flex justify-between items-center h-16 lg:h-20 xl:min-h-[77px] w-full">
        {/* Left Section - Logo and GitHub */}
        <div className="flex items-center space-x-2 sm:space-x-4 flex-shrink-0">
          {/* Logo Area */}
          <div className="flex items-center space-x-2 sm:space-x-3">
            <Image
              src="/tsender-logo.svg"
              alt="TSender Logo"
              width={36}
              height={36}
              className="w-8 h-8 sm:w-9 sm:h-9"
            />
            <h1 className="hidden sm:block font-bold text-xl sm:text-2xl text-gray-900 whitespace-nowrap">
              FunnyCoins
            </h1>
          </div>

          {/* GitHub Link */}
          <a
            href="https://github.com/yourusername/tsender"
            target="_blank"
            rel="noopener noreferrer"
            className="hidden sm:flex items-center justify-center w-9 h-9 lg:w-10 lg:h-10 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-all duration-200 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
            aria-label="View TSender repository on GitHub"
          >
            <FaGithub className="w-4 h-4 lg:w-5 lg:h-5" aria-hidden="true" />
          </a>
        </div>

        {/* Center Section - Tagline */}
        <div className="hidden lg:flex flex-1 justify-center px-8">
          <p className="text-zinc-500 italic text-sm lg:text-base text-center">
            Optimizing gas efficiency for seamless transactions
          </p>
        </div>

        {/* Right Section - Connect Button */}
        <div className="flex items-center flex-shrink-0">
          {mounted ? (
            <ConnectButton />
          ) : (
            <div className="h-10 w-32 bg-gray-200 rounded-lg animate-pulse"></div>
          )}
        </div>
      </div>
    </nav>
  )
}
