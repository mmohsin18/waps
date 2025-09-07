'use client'

import { WapsButton } from '@/components/Elements/WapsButton'
import Link from 'next/link'

export default function NotFound() {
  return (
    <main className='flex min-h-screen flex-col items-center justify-center bg-[#0F0F10] p-6 text-white'>
      <h1 className='text-6xl font-bold text-[#FF4D2E] drop-shadow-lg'>404</h1>
      <p className='mt-4 text-lg text-white/70'>
        This page could not be found.
      </p>

      <div className='mt-6'>
        <Link href='/'>
          <WapsButton variant='glow'>Go Home</WapsButton>
        </Link>
      </div>
    </main>
  )
}
