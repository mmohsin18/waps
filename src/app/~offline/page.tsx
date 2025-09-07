'use client'

import { WapsButton } from '@/components/Elements/WapsButton'
import { WifiOff } from 'lucide-react'
import Link from 'next/link'

export default function Offline() {
  return (
    <main className='flex min-h-screen flex-col items-center justify-center bg-[#0F0F10] p-6 text-center text-white'>
      <WifiOff className='mb-4 h-16 w-16 text-[#FF4D2E]' />
      <h1 className='text-2xl font-bold'>You’re Offline</h1>
      <p className='mt-2 max-w-sm text-white/70'>
        Looks like you lost your internet connection. Don’t worry, you can still
        explore your saved waps once you’re back online.
      </p>

      <div className='mt-6 flex gap-3'>
        <Link href='/'>
          <WapsButton variant='default'>Try Again</WapsButton>
        </Link>
        <Link href='/saved'>
          <WapsButton variant='outline'>My Waps</WapsButton>
        </Link>
      </div>
    </main>
  )
}
