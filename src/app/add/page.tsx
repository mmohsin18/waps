// File: app/(app)/add/page.tsx

import AddWapClient from '@/components/Layout/AddWapClient'
import { Suspense } from 'react'

export const dynamic = 'force-dynamic'
export const revalidate = 0

export default function Page() {
  return (
    <Suspense
      fallback={
        <main className='min-h-dvh px-4 py-6 text-white'>
          <div className='mx-auto w-full max-w-screen-sm'>
            <div className='rounded-2xl border border-zinc-800 bg-zinc-900/60 p-4 backdrop-blur-xl'>
              Loading…
            </div>
          </div>
        </main>
      }
    >
      <AddWapClient />
    </Suspense>
  )
}
