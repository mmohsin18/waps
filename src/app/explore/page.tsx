'use client'

import WapCardSquare from '@/components/Layout/WapCardSquare'
import { Input } from '@/components/ui/input'
import { useQuery } from 'convex/react'
import { Search } from 'lucide-react'
import { useMemo, useState } from 'react'
import { api } from '../../../convex/_generated/api'

// 1) Explicit type matching your query's return objects
type ExploreItem = {
  _id: string
  slug: string
  title: string
  description: string
  origin: string
  categories: string[]
  faviconUrl?: string
  canonicalUrl?: string
  publicSaveCount: number
}

export default function ExplorePage() {
  const [query, setQuery] = useState('')

  // 2) Tell TS what we expect back (array or undefined)
  const items = useQuery(api.websites.listAll, {
    q: query || undefined,
    limit: 120,
    sort: 'popular', // or "recent"
    minSaveCount: 0 // show everything
  })

  // 3) Group by first category, sort by publicSaveCount desc
  const grouped = useMemo(() => {
    if (!Array.isArray(items)) return undefined

    // Important: type the map so [] doesn’t become never[]
    const map = new Map<string, ExploreItem[]>()

    for (const it of items) {
      const cat = it.categories?.[0] || 'Tools'
      if (!map.has(cat)) map.set(cat, [] as ExploreItem[])
      map.get(cat)!.push(it)
    }

    return Array.from(map.entries())
      .map(
        ([cat, arr]) =>
          [
            cat,
            arr.slice().sort((a, b) => b.publicSaveCount - a.publicSaveCount)
          ] as const
      )
      .sort(([a], [b]) => a.localeCompare(b))
  }, [items])

  const ambientBg =
    'radial-gradient(1000px 600px at 10% -10%, rgba(255,107,87,0.14), transparent 60%), ' +
    'radial-gradient(900px 600px at 110% 10%, rgba(255,176,87,0.10), transparent 50%), #0B0B10'

  return (
    <div
      className='relative min-h-screen space-y-5 px-4 pb-6 pt-6 text-white'
      style={{ background: ambientBg }}
    >
      {/* Sticky search */}
      <div className='sticky top-2 z-10'>
        <div className='flex items-center gap-2 rounded-2xl border border-zinc-800 bg-zinc-900/70 px-3 py-2 backdrop-blur-xl'>
          <Search className='h-4 w-4 text-zinc-400' />
          <Input
            value={query}
            onChange={e => setQuery(e.currentTarget.value)}
            placeholder='Search public Waps'
            className='h-8 border-0 bg-transparent px-0 text-white placeholder:text-zinc-400 focus-visible:ring-0'
          />
        </div>
      </div>

      {/* Sections */}
      <div className='space-y-6'>
        {items === undefined ? (
          <SkeletonList />
        ) : !grouped || grouped.length === 0 ? (
          <EmptyState />
        ) : (
          grouped.map(([category, rows]) => (
            <section key={category} className='space-y-2'>
              <div className='flex items-center justify-between px-1'>
                <h2 className='text-sm font-semibold'>{category}</h2>
                <span className='text-xs text-zinc-400'>
                  {rows.length} apps
                </span>
              </div>

              <div className='snap-x snap-mandatory overflow-x-auto rounded-2xl border border-zinc-800 bg-zinc-900/60 p-3 backdrop-blur-xl [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden'>
                <div className='flex gap-4'>
                  {rows.map(w => (
                    <WapCardSquare
                      key={`${category}-${w.origin}-${w.slug}`}
                      href={`/explore/${w.slug}`}
                      title={w.title}
                      subtitle={w.description}
                      origin={w.origin}
                      category={w.categories?.[0] ?? 'Tools'}
                      countLeftNum={String(w.publicSaveCount)}
                      countLeftLabel='Waps'
                      className='w-[150px] shrink-0 snap-start'
                    />
                  ))}
                </div>
              </div>
            </section>
          ))
        )}
      </div>
    </div>
  )
}

function EmptyState() {
  return (
    <div className='rounded-2xl border border-zinc-800 bg-zinc-900/70 p-6 text-center text-zinc-300 backdrop-blur-xl'>
      Nothing to explore yet. Try adjusting your search or check back soon.
    </div>
  )
}

function SkeletonList() {
  return (
    <div className='space-y-6'>
      {Array.from({ length: 2 }).map((_, i) => (
        <div key={i} className='space-y-2'>
          <div className='h-4 w-40 rounded bg-white/10' />
          <div className='overflow-x-hidden rounded-2xl border border-zinc-800 bg-zinc-900/60 p-3'>
            <div className='flex gap-4'>
              {Array.from({ length: 6 }).map((_, j) => (
                <div
                  key={j}
                  className='aspect-square w-[150px] rounded-3xl border border-zinc-800 bg-zinc-900/70'
                />
              ))}
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}
