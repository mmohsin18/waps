// File: app/(app)/waps/page.tsx
'use client'

import { WapCard } from '@/components/Layout/WapCard'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu'
import { Input } from '@/components/ui/input'
import { Separator } from '@/components/ui/separator'
import clsx from 'clsx'
import { useQuery } from 'convex/react'
import { Loader2, SlidersHorizontal, Tag } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { api } from '../../../convex/_generated/api'

function useOwnerKey() {
  const [ownerKey, setOwnerKey] = useState<string | null>(null)
  useEffect(() => {
    try {
      const k =
        localStorage.getItem('wapsOwnerKey') ||
        localStorage.getItem('wapsOwnerKey')
      if (k) setOwnerKey(k)
    } catch {}
  }, [])
  return ownerKey
}

export default function WapsPage() {
  const ownerKey = useOwnerKey()
  const [search, setSearch] = useState('')
  const [sort, setSort] = useState<'recent' | 'az' | 'popular'>('recent')
  const [selectedTag, setSelectedTag] = useState<string | undefined>()
  const [cursor, setCursor] = useState<string | undefined>(undefined)

  const data = useQuery(
    api.waps.listUserWaps, // always pass the function ref
    ownerKey
      ? {
          ownerKey,
          search: search || undefined,
          sort,
          tag: selectedTag,
          limit: 24,
          cursor // string | undefined is OK
        }
      : 'skip' // disable the query when ownerKey missing
  )

  const items = data?.items ?? []
  const pageInfo = data?.pageInfo ?? {
    hasMore: false,
    cursor: null as string | null
  }

  const visibleTags = useMemo(() => {
    const all = new Set<string>()
    items.forEach((i: any) =>
      (i.website.categories ?? []).forEach((t: string) => all.add(t))
    )
    return Array.from(all).slice(0, 12)
  }, [items])

  if (!ownerKey) {
    return (
      <div
        className={clsx('waps-bg min-h-screen px-4 py-10 text-white md:px-8')}
      >
        <header className='mb-6'>
          <h1 className='text-3xl font-semibold tracking-tight'>Your Waps</h1>
          <p className='mt-2 text-sm opacity-70'>
            No owner key found. Set{' '}
            <code className='opacity-90'>waps.ownerKey</code> (or{' '}
            <code className='opacity-90'>ownerKey</code>) in localStorage.
          </p>
        </header>
      </div>
    )
  }

  return (
    <div className={clsx('waps-bg min-h-screen px-4 py-8 text-white md:px-8')}>
      {/* Top bar */}
      <div className='flex flex-col gap-4 md:flex-row md:items-center'>
        <div>
          <h1 className='text-3xl font-semibold tracking-tight'>Your Waps</h1>
          <p className='text-sm opacity-70'>
            All your saved websites, neatly organized.
          </p>
        </div>
        <div className='flex-1' />
        <div className='flex gap-2'>
          <div className='relative w-[min(520px,90vw)]'>
            <Input
              placeholder='Search title or URL…'
              value={search}
              onChange={e => {
                setCursor(undefined)
                setSearch(e.target.value)
              }}
              className='waps-input h-10 rounded-xl pl-3 pr-3'
            />
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant='outline'
                className='rounded-xl border border-[var(--waps-border)] bg-transparent text-white hover:bg-white/10'
              >
                <SlidersHorizontal className='mr-2 h-4 w-4' />
                Sort: {labelForSort(sort)}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align='end' className='waps-card rounded-xl'>
              <DropdownMenuLabel className='opacity-80'>
                Sort by
              </DropdownMenuLabel>
              {(['recent', 'az', 'popular'] as const).map(s => (
                <DropdownMenuItem
                  key={s}
                  onClick={() => {
                    setSort(s)
                    setCursor(undefined)
                  }}
                  className='focus:bg-white/10'
                >
                  {labelForSort(s)}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Tag chips */}
      <div className='mt-5 flex flex-wrap items-center gap-2'>
        <button
          className={clsx(
            'waps-chip',
            selectedTag
              ? 'opacity-70 hover:opacity-100'
              : 'border-transparent bg-[var(--waps-brand)]'
          )}
          onClick={() => {
            setSelectedTag(undefined)
            setCursor(undefined)
          }}
        >
          All tags
        </button>
        {visibleTags.map(t => (
          <button
            key={t}
            className={clsx(
              'waps-chip hover:opacity-100',
              selectedTag === t
                ? 'border-transparent bg-[var(--waps-brand)]'
                : 'opacity-80'
            )}
            onClick={() => {
              setSelectedTag(t)
              setCursor(undefined)
            }}
          >
            <Tag className='mr-1 h-3 w-3' /> {t}
          </button>
        ))}
      </div>

      <Separator className='my-5 bg-white/10' />

      {/* Loading */}
      {!data && (
        <div className='flex items-center gap-2 text-white/80'>
          <Loader2 className='h-4 w-4 animate-spin' /> Loading…
        </div>
      )}

      {/* Grid */}
      <div className='grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'>
        {items.map((item: any) => (
          <WapCard key={item._id} item={item} />
        ))}
      </div>

      {/* Pager */}
      <div className='flex justify-center py-8'>
        {pageInfo?.hasMore ? (
          <Button
            variant='outline'
            onClick={() => setCursor(pageInfo.cursor)}
            className='rounded-xl border border-[var(--waps-border)] bg-transparent text-white hover:bg-white/10'
          >
            Load more
          </Button>
        ) : (
          <p className='text-sm opacity-70'>
            {items?.length
              ? 'That’s all for now'
              : 'No waps yet. Save your first one!'}
          </p>
        )}
      </div>
    </div>
  )
}

function labelForSort(s: 'recent' | 'az' | 'popular') {
  switch (s) {
    case 'recent':
      return 'Most Recent'
    case 'az':
      return 'A → Z'
    case 'popular':
      return 'Most Saved'
  }
}
