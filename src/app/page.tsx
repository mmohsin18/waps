// app/(marketing)/page.tsx
'use client'

import {
  Ghost,
  Globe,
  Link2,
  Search,
  ShieldCheck,
  Sparkles
} from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useEffect, useMemo, useState } from 'react'

// --- tiny parallax hook ---
function useParallax() {
  const [y, setY] = useState(0)
  useEffect(() => {
    const onScroll = () => setY(window.scrollY || 0)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])
  return { far: y * 0.15, mid: y * 0.3, near: y * 0.45 }
}

export default function LandingPage() {
  const router = useRouter()

  // ⬇️ Lazy-import the util so it never runs during SSG/analyze
  useEffect(() => {
    let mounted = true
    ;(async () => {
      const mod = await import('utils/isPwaInstalled')
      if (!mounted) return
      if (mod.isPwaInstalled()) router.replace('/explore')
    })()
    return () => {
      mounted = false
    }
  }, [router])

  const p = useParallax()

  const bg =
    'radial-gradient(1200px 700px at 10% -10%, rgba(255,107,87,0.22), transparent 55%), ' +
    'radial-gradient(1100px 700px at 110% 10%, rgba(255,176,87,0.16), transparent 50%), #0B0B10'

  const features = useMemo(
    () => [
      {
        icon: <Globe className='h-5 w-5' />,
        title: 'Explore (Play Store vibes)',
        desc: 'See websites shared from public boards—auto-deduped and organized. Discover like an app store, but for the web.'
      },
      {
        icon: <Search className='h-5 w-5' />,
        title: 'Smart ‘Scan’',
        desc: 'Paste a link. Waps checks its database; if new, it scans the site to suggest title, category, and a rich description.'
      },
      {
        icon: <Link2 className='h-5 w-5' />,
        title: 'Boards & Sharing',
        desc: 'Create boards and keep a default one. On the free plan, you can share one board publicly for people to explore.'
      },
      {
        icon: <ShieldCheck className='h-5 w-5' />,
        title: 'No duplicates',
        desc: 'Websites are stored canonically. One site can belong to multiple users/boards without duplicate records.'
      },
      {
        icon: <Sparkles className='h-5 w-5' />,
        title: 'Offline-friendly',
        desc: 'Your Waps are also stored locally for offline access. Sync kicks in when you’re back online.'
      },
      {
        icon: <Ghost className='h-5 w-5' />,
        title: 'Install Anywhere',
        desc: 'Use as a PWA or get the Android APK. Designed mobile-first with a clean, glassy UI.'
      }
    ],
    []
  )

  return (
    <main className='min-h-dvh text-white' style={{ background: bg }}>
      {/* …the rest of your existing JSX unchanged… */}
    </main>
  )
}
